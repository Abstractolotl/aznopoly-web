import {DiscordSDK} from '@discord/embedded-app-sdk';


export class DiscordClient {
    discordSdk: DiscordSDK;

    constructor() {
        if(import.meta.env.VITE_CLIENT_ID === undefined) {
            throw new Error('Client ID is not defined');
        }

        this.discordSdk = new DiscordSDK(import.meta.env.VITE_CLIENT_ID);
    }

    async handleAuthentication() {
        await this.discordSdk.ready()

        const {code} = await this.discordSdk.commands.authorize({
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
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code,
            }),
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

}