import {DiscordSDK, DiscordSDKMock} from '@discord/embedded-app-sdk';

const queryParams = new URLSearchParams(window.location.search);
const isEmbedded = queryParams.get('frame_id') != null;

export class DiscordClient {
    private discordSdk: DiscordSDK | DiscordSDKMock;
    private mockUserId: string | undefined;

    constructor() {
        console.log(import.meta.env.VITE_CLIENT_ID)
        if(import.meta.env.VITE_CLIENT_ID === undefined) {
            throw new Error('Client ID is not defined');
        }

        if (isEmbedded) {
            this.discordSdk = new DiscordSDK(import.meta.env.VITE_CLIENT_ID);
        } else {
            this.mockUserId = this.getOverrideOrRandomSessionValue('user_id');
            const mockGuildId = this.getOverrideOrRandomSessionValue('guild_id');
            const mockChannelId = this.getOverrideOrRandomSessionValue('channel_id');

            this.discordSdk = new DiscordSDKMock(import.meta.env.VITE_CLIENT_ID, mockGuildId, mockChannelId)
        }
    }

    async initMocks() {
        const discriminator = String(this.mockUserId!.charCodeAt(0) % 5);

        this.discordSdk._updateCommandMocks({
            authenticate: async () => {
                return await {
                    access_token: 'mock_token',
                    user: {
                        username: this.mockUserId!,
                        discriminator,
                        id: this.mockUserId!,
                        avatar: null,
                        public_flags: 1,
                    },
                    scopes: [],
                    expires: new Date(2112, 1, 1).toString(),
                    application: {
                        description: 'mock_app_description',
                        icon: 'mock_app_icon',
                        id: 'mock_app_id',
                        name: 'mock_app_name',
                    },
                };
            },
        });
    }

    async handleAuthentication() {
        if (!isEmbedded) {
            await this.initMocks();
        }

        await this.discordSdk.ready()

        const { code} = await this.discordSdk.commands.authorize({
            client_id: import.meta.env.VITE_CLIENT_ID,
            response_type: 'code',
            state: '',
            prompt: 'none',
            scope: [
                // "applications.builds.upload",
                // "applications.builds.read",
                // "applications.store.update",
                // "applications.entitlements",
                // "bot",
                'identify',
                // "connections",
                // "email",
                // "gdm.join",
                'guilds',
                // "guilds.join",
                // "guilds.members.read",
                // "messages.read",
                // "relationships.read",
                // 'rpc.activities.write',
                // "rpc.notifications.read",
                // "rpc.voice.write",
                'rpc.voice.read',
                // "webhook.incoming",
            ],
        });

        const response = await fetch('https://aznopoly.abstractolotl.de/server/token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({code}),
        });
        const {access_token} = await response.json();

        let auth = await this.discordSdk.commands.authenticate({
            access_token,
        });

        if (auth === null) {
            throw new Error('Authentication failed');
        }
    }

    async getChannelName() {
        let activityChannel = 'unknown';

        if (this.discordSdk.channelId != null && this.discordSdk.guildId != null) {
            const channel = await this.discordSdk.commands.getChannel({channel_id: this.discordSdk.channelId});
            if (channel.name != null) {
                activityChannel = channel.name;
            }
        }

        return activityChannel;
    }

    private getOverrideOrRandomSessionValue(queryParam: `${SessionStorageQueryParam}`) {
        const overrideValue = queryParams.get(queryParam);
        if (overrideValue != null) {
            return overrideValue;
        }

        const currentStoredValue = sessionStorage.getItem(queryParam);
        if (currentStoredValue != null) {
            return currentStoredValue;
        }

        // Set queryParam to a random 8-character string
        const randomString = Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem(queryParam, randomString);
        return randomString;
    }
}

enum SessionStorageQueryParam {
    user_id = 'user_id',
    guild_id = 'guild_id',
    channel_id = 'channel_id',
}