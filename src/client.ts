import { ClientPacket, ClientPacketHandler, BasePacket, ClientState, PacketType, RoomInitPacket, RoomNamePacket } from "./types/client";

const BASE_URL = "aznopoly.abstractolotl.de/server";

export default class AzNopolyClient extends EventTarget {
    
    public debugMode: boolean = true;
    private socket?: WebSocket;

    private state: ClientState = ClientState.DISCONNECTED;
    private _id!: string;

    public constructor() {
        super();
        if (this.debugMode) {
            (window as any)["client"] = this;
        }
    }

    public connect(roomId: string) {
        if (this.debugMode) {
            console.log("Connecting to room " + roomId)
        }

        this.state = ClientState.CONNECTING;
        this.socket = new WebSocket("wss://" + BASE_URL + "/room/" + roomId)

        this.socket.addEventListener("open", this.onOpen.bind(this))
        this.socket.addEventListener("close", this.onClose.bind(this))
        this.socket.addEventListener("message", this.onMessage.bind(this))
    }

    private publishClientEvent(event: PacketType, data: ClientPacket) {
        this.dispatchEvent(new CustomEvent(event, { detail: data }));
    }

    private onMessage(event: MessageEvent) {
        if (this.debugMode) console.log("Received message", event.type, ":\n", event.data)

        let packet;
        try {
            packet = JSON.parse(event.data);

            if (packet.type === PacketType.ROOM_INIT) {
                this._id = packet.data.uuid;
            }
        } catch (e) {
            if (this.debugMode) console.log("Error parsing packet: " + e)
            return;
        }

        this.publishClientEvent(packet.type, packet);
    }

    private onOpen() {
        if (this.debugMode) {
            console.log("Connection established.")
        }
        this.state = ClientState.CONNECTED;
    }

    private onClose(reason: any) {
        if (this.debugMode) {
            console.log("Connection closed: ", reason)
        }

        this.state = ClientState.DISCONNECTED;
    }

    public sendPacket(data: BasePacket) {
        this.socket!.send(JSON.stringify(data))
    }

    public get isConnected() : ClientState {
        return this.state;
    }

    public get id() : string {
        return this._id;
    }

}