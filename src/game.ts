import AzNopolyClient from "./client";
import Room from "./room";
import { Player } from "./types";
import { PacketType, RoomInitPacket, RoomNamePacket } from "./types/client";

export default class AzNopolyGame {

    private _room: Room;
    private _client: AzNopolyClient;
    private _name: string;

    constructor(room: string, name: string) {
        this._client = new AzNopolyClient();
        this._room = new Room(room, this, this.client)
        this._name = name;

        this._client.connect(room);
        
        (window as any)["game"] = this;
    }

    public get player(): Player {
        return {
            uuid: this.client.id,
            name: this._name,
        }
    }
    
    public get client(): AzNopolyClient {
        return this._client;
    }

    public get room(): Room {
        return this._room;
    }

    public get isHost(): boolean {
        return this.client.id == this.room.host;
    }

    public isPlayerHost(uuid: string) {
        console.log("IS HOST", this.room.host, uuid, this.room.host == uuid)
        return this.room.host == uuid;
    }

}