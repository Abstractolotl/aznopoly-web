import AzNopolyClient from "./client";
import Room from "./room";
import { Player } from "./types";
import { Avatars } from "./phaser/components/ui/avatar";
import { PlayerProfile } from "./phaser/components/ui/player-info";
import { PacketType, RoomInitPacket } from "./types/client";

export default class AzNopolyGame {

    private _room!: Room;
    private _client!: AzNopolyClient;
    private _name!: string;

    private profiles: {[uuid: string]: PlayerProfile} = {};

    constructor() {
        (window as any)["aznopoly"] = this;
    }

    public init(roomId: string) {
        this._client = new AzNopolyClient();
        this._room = new Room(roomId, this, this.client);
        this._name = this.getPlayerName();

        this._client.addEventListener(PacketType.ROOM_INIT, ((event: CustomEvent<RoomInitPacket>) => {
            const uuid = event.detail.data.uuid;
            let userName = localStorage.getItem("playerName");
            if (sessionStorage.getItem('discordName') !== null) {
                userName = sessionStorage.getItem('discordName');
            }
            this.setProfile(uuid, {
                name: userName || "Player",
                colorIndex: parseInt(localStorage.getItem("playerColor") || "0"),
                avatar: localStorage.getItem("playerAvatar") as Avatars || Avatars.AXOLOTL,
                host: uuid === event.detail.data.room.host,
            });
        }) as EventListener);

        this._client.connect(roomId);
    }

    public get player(): Player {
        return {
            uuid: this.client.id,
            name: this._name,
        }
    }

    public hasProfile(uuid: string): boolean {
        return this.profiles[uuid] !== undefined;
    }

    public getProfile(uuid: string): PlayerProfile {
        if (this.profiles[uuid]) {
            return this.profiles[uuid];
        } else {
            throw new Error(`No profile found for ${uuid}`);
        }
    }

    public setProfile(uuid: string, profile: PlayerProfile) {
        this.profiles[uuid] = profile;
    }

    public get uuid(): string {
        return this.client.id;
    }
    
    public get client(): AzNopolyClient {
        return this._client;
    }

    public get room(): Room {
        return this._room;
    }

    public get connectedUuids(): string[] {
        return this.room.connectedPlayerIds;
    }

    public get isHost(): boolean {
        return this.client.id == this.room.host;
    }

    public broadcastPacket(packet: {type: string, data: any}) {
        this.client.sendPacket(packet);
    }

    public addPacketListener(type: string, listener: EventListener) {
        this.client.addEventListener(type, listener);
        return listener;
    }

    public removePacketListener(type: string, listener: EventListener) {
        this.client.removeEventListener(type, listener);
    }

    public isPlayerHost(uuid: string) {
        return this.room.host == uuid;
    }

    public updatePlayerName(name: string) {
        this._name = name;
    }

    private getPlayerName() {
        const names = ["Bob", "Bebb", "Steve", "Michael", "John", "Doe", "Wurstbrigand"];
        return names[Math.floor(Math.random() * names.length)];
    }

}