import AzNopolyClient from "./client";
import AzNopolyGame from "./game";
import { PacketType, RoomInitPacket, RoomJoinPacket, RoomLeavePacket, RoomNamePacket } from "./types/client";

interface Player {
    uuid: string;
    name: string;
}

export enum RoomEvent {
    READY = "READY",
    JOIN = "JOIN",
    LEAVE = "LEAVE",
    UPDATE = "UPDATE",
}

export default class Room extends EventTarget {

    private _id: string;
    private _connectedIds: Set<string> = new Set();
    private _playerNames: Map<string, string> = new Map();
    private _host!: string;
    private client: AzNopolyClient;
    private aznopoly: AzNopolyGame;

    private locked: boolean = false;

    constructor(roomId: string, aznopoly: AzNopolyGame, client: AzNopolyClient) {
        super();

        this._id = roomId;
        this.aznopoly = aznopoly;
        this.client = client;

        this.client.addEventListener(PacketType.ROOM_INIT, this.onRoomInit.bind(this) as EventListener);
        this.client.addEventListener(PacketType.ROOM_JOIN, this.onRoomJoin.bind(this) as EventListener);
        this.client.addEventListener(PacketType.ROOM_LEAVE, this.onRoomLeave.bind(this) as EventListener);
        this.client.addEventListener(PacketType.ROOM_NAME, this.onNameChange.bind(this) as EventListener);
    }

    public lockRoom() {
        this.locked = true;
    }

    private onRoomInit(event: CustomEvent<RoomInitPacket>) {
        const packet = event.detail;

        this._host = packet.data.room.host;
        packet.data.room.clients.forEach(client => {
            this._connectedIds.add(client);
        });

        this._playerNames.set(this.aznopoly.player.uuid, this.aznopoly.player.name);
        this.broadcastName(this.aznopoly.player.uuid, this.aznopoly.player.name);

        this.dispatchEvent(new Event(RoomEvent.READY));
    }

    private broadcastName(id: string, name: string) {
        // if (this.client.debugMode) {
        //     console.log("Broadcasting name", id, name)
        // }

        const namePacket: RoomNamePacket = {
            type: PacketType.ROOM_NAME,
            sender: id,
            data: {
                name
            }
        }
        this.client.sendPacket(namePacket)
    }

    private onRoomJoin(event: CustomEvent<RoomJoinPacket>) {
        const packet = event.detail;

        if (this.locked) {
            console.warn("Player " + packet.data.uuid + " tried to join, but the room is locked!");
        }

        this._connectedIds.add(packet.data.uuid);
        this.dispatchEvent(new CustomEvent(RoomEvent.JOIN, { detail: packet.data.uuid }));

        if (this.aznopoly.isHost) {
            this._playerNames.forEach((name, id) => {
                this.broadcastName(id, name);
            })
        }
    }

    private onRoomLeave(event: CustomEvent<RoomLeavePacket>) {
        const packet = event.detail;

        this._connectedIds.delete(packet.data.uuid);
        this.dispatchEvent(new CustomEvent(RoomEvent.LEAVE, { detail: packet.data.uuid }));
    }

    private onNameChange(event: CustomEvent<RoomNamePacket>) {
        const packet = event.detail;

        if (this.locked) {
            console.warn("Player " + packet.sender + " tried to change their name, but the room is locked!");
        }

        this._playerNames.set(packet.sender, packet.data.name);
        this.dispatchEvent(new Event(RoomEvent.UPDATE));
    }

    public getPlayerName(uuid: string): string {
        return this._playerNames.get(uuid) || "Unknown";
    }

    public get id() {
        return this._id;
    }

    public get connectedPlayerIds() {
        return [...this._connectedIds];
    }

    public get host() {
        return this._host;
    }

}