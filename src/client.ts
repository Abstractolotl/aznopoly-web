const BASE_URL = "aznopoly.abstractolotl.de/server";

export type ClientEvent = RoomWelcomeEvent | ExampleEvent;

export interface ClientPacket {
    type: string;
}

export interface RoomWelcomeEvent extends ClientPacket {
    type: "ROOM_WELCOME";
    data: string;
}

export interface ExampleEvent extends ClientPacket {
    type: "EXAMPLE";
    data: any;
}

export default class AzNopolyClient {

    private socket: WebSocket | undefined;
    private debugMode: boolean = true;
    private eventListeners: Map<string, ((event: ClientEvent) => void)[]> = new Map<string, ((event: ClientEvent) => void)[]>();

    public constructor(roomId: string) {
        this.connect(roomId)
    }

    public addClientEventListener(event: string, callback: (event: ClientEvent) => void) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event)!.push(callback)
        } else {
            this.eventListeners.set(event, [callback])
        }
    }

    public isConnected() : boolean {
        return this.socket!.readyState === WebSocket.OPEN
    }

    private connect(roomId: string) {
        this.socket = new WebSocket("wss://" + BASE_URL + "/room/" + roomId)

        this.socket.addEventListener("close", this.onClose.bind(this))
        this.socket.addEventListener("message", this.onMessage.bind(this))
    }

    private publishClientEvent(event: string, data: ClientEvent) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event)!.forEach((callback) => {
                callback(data)
            })
        } else {
            if (this.debugMode) console.log("No event listeners for event " + event)
        }
    }

    private onMessage(event: MessageEvent) {
        if (this.debugMode) console.log("Received message: " + event.data)

        let packet;
        try {
            packet = JSON.parse(event.data);
        } catch (e) {
            if (this.debugMode) console.log("Error parsing packet: " + e)
            return;
        }

        if (packet.type === "ROOM_WELCOME") {
            this.publishClientEvent(packet.type, packet as RoomWelcomeEvent);
        } else {
            if (this.debugMode) console.log("Unknown packet type: " + packet.type)
        }
    }

    private onClose() {
        if (this.debugMode) {
            console.log("Connection closed. Trying reconnect...")
        }

        try {
            //this.tryReconnect()
        } catch (e) {
            // TODO do something
        }
    }

    /* private onReconnect() {

    }

    private tryReconnect() {
        let attempts = 0;
        //idk problem für später
    } */

    public sendPacket(data: string) {
        this.socket!.send(data)
    }
}