import AzNopolyClient from "./client";
import Room from "./room";
import { Player } from "./types";

export default class AzNopolyGame {

    private _room!: Room;
    private _client!: AzNopolyClient;
    private _name!: string;

    constructor() {
        (window as any)["aznopoly"] = this;
    }

    public init(roomId: string) {
        this._client = new AzNopolyClient();
        this._room = new Room(roomId, this, this.client);
        this._name = this.getPlayerName();

        this._client.connect(roomId);
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