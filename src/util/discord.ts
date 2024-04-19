import {DiscordSDK, DiscordSDKMock} from '@discord/embedded-app-sdk';

const queryParams = new URLSearchParams(window.location.search);

export class DiscordClient {
    private discordSdk: DiscordSDK | DiscordSDKMock;

    constructor() {
        console.log(import.meta.env.VITE_CLIENT_ID)
        if(import.meta.env.VITE_CLIENT_ID === undefined) {
            throw new Error('Client ID is not defined');
        }

        this.discordSdk = new DiscordSDK(import.meta.env.VITE_CLIENT_ID);
    }


    async handleAuthentication() {
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