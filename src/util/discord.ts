import {DiscordSDK, DiscordSDKMock, Types} from '@discord/embedded-app-sdk';

const queryParams = new URLSearchParams(window.location.search);

export class DiscordClient {
    private discordSdk: DiscordSDK | DiscordSDKMock;

    constructor() {
        if(import.meta.env.VITE_DISCORD_CLIENT_ID === undefined) {
            throw new Error('Client ID is not defined');
        }

        this.discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
    }

    async handleAuthentication() {
        await this.discordSdk.ready()

        const { code} = await this.discordSdk.commands.authorize({
            client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
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
                "guilds.members.read",
                // "messages.read",
                // "relationships.read",
                // 'rpc.activities.write',
                // "rpc.notifications.read",
                // "rpc.voice.write",
                'rpc.voice.read',
                // "webhook.incoming",
            ],
        });

        const response = await fetch('/server/token', {
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

        const guildMember: IGuildsMembersRead | null = await fetch(
            `/discord/api/users/@me/guilds/${this.discordSdk.guildId}/member`,
            {
                method: 'get',
                headers: {Authorization: `Bearer ${access_token}`},
            },
        )
            .then((j) => j.json())
            .catch(() => {
                return null;
            });

        sessionStorage.setItem('discordName', this.getUsername({guildMember: guildMember, user: auth.user}))
        sessionStorage.setItem('discordAvatar', this.getAvatar({guildMember: guildMember, user: auth.user}))
    }

    public getRoomId() {
        return this.discordSdk.instanceId.slice(2, 8)
    }

    private getAvatar({guildMember, user}: GetUserDisplayNameArgs) {
        let guildAvatarSrc = '';
        if (guildMember?.avatar) {
            guildAvatarSrc = `https://cdn.discordapp.com/guilds/${this.discordSdk.guildId}/users/${user.id}/avatars/${guildMember.avatar}.png?size=256`;
        } else if (user.avatar) {
            guildAvatarSrc = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
        } else {
            const defaultAvatarIndex = Math.abs(Number(user.id) >> 22) % 6;
            guildAvatarSrc = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
        }
        return guildAvatarSrc;
    }

    private getUsername({guildMember, user}: GetUserDisplayNameArgs) {
        if (guildMember?.nick != null && guildMember.nick !== '') return guildMember.nick;

        if (user.discriminator !== '0') return `${user.username}#${user.discriminator}`;

        if (user.global_name != null && user.global_name !== '') return user.global_name;

        return user.username ?? 'Player';
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

interface GetUserDisplayNameArgs {
    guildMember: IGuildsMembersRead | null;
    user: Partial<Types.User>;
}

export interface IGuildsMembersRead {
    roles: string[];
    nick: string | null;
    avatar: string | null;
    premium_since: string | null;
    joined_at: string;
    is_pending: boolean;
    pending: boolean;
    communication_disabled_until: string | null;
    user: {
        id: string;
        username: string;
        avatar: string | null;
        discriminator: string;
        public_flags: number;
    };
    mute: boolean;
    deaf: boolean;
}