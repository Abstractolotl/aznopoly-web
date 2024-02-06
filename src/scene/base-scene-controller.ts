import AzNopolyGame from "../game";


export default class BaseSceneController {

    protected aznopoly: AzNopolyGame;
    
    private _scene: Phaser.Scene;
    private packetType: string;

    private registeredMethods: string[] = [];

    /**
     * A proxy object that allows for calling methods on the controller.
     * Functions called on the proxy will be sent to all clients and executed asynchonously
     * Functions must be registered with registerSyncedMethod
     */
    protected syncProxy = new Proxy(this, {
        get: (_, prop) => {
            return this.onProxyCall(prop);
        },
    });

    constructor(scene: Phaser.Scene, aznopoly: AzNopolyGame) {
        this._scene = scene;
        this.aznopoly = aznopoly;
        this.packetType = "CLIENT_MINIGAME_" + this.constructor.name.toUpperCase();
    }

    /**
     * Should be called when the scene has initialized all of it's state
     * and is ready to start receiving packets
     */
    public onSceneReady() {
        const listener = this.aznopoly.addPacketListener(this.packetType, this.onPacket.bind(this) as EventListener);
        this._scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.aznopoly.removePacketListener(this.packetType, listener));
    }

    /**
     * Registers a method to be allowed to be called with syncProxy
     * @param method The method to be registered
     */
    public registerSyncedMethod(method: Function) {
        const name = method.name;
        if (this.registeredMethods.includes(name)) {
            throw new Error(`Packet executor with name ${name} already exists`);
        }
        this.registeredMethods.push(name);
    }

    private isMethodAllowed(method: string) {
        return this.registeredMethods.includes(method);
    }

    private onProxyCall(prop: symbol | string) {
        if (!this.isMethodAllowed(String(prop))) {
            throw new Error(`This method was not registered for sync: ${String(prop)}`);
        }
        
        return (...args: any[]) => {
            const packet = this.sendExecPacket(String(prop), ...args); 
            this.executePacket(packet);
        }
    }

    private onPacket(event: CustomEvent<{type: string, data: any}>) {
        const packet = event.detail;
        this.executePacket(packet);
    }

    private sendExecPacket(method: string, ...args: any[]) {
        const packet = {
            type: this.packetType,
            data: {
                method,
                arguments: args
            }
        }

        this.aznopoly.broadcastPacket(packet);
        return packet;
    }

    private executePacket(packet: {type: string, data: {method: string, arguments: any[]}}) {    
        if (packet.type !== this.packetType) {
            console.error(`Packet type ${packet.type} does not match expected type ${this.packetType}`);
            return;
        }
        
        if (!this.isMethodAllowed(packet.data.method)) {
            console.error(`Method ${packet.data.method} is not allowed`);
            return;
        }
        
        const method = (this as any)[packet.data.method];
        if (typeof method !== "function") {
            console.error(`Method ${packet.data.method} is not a function`);
            return;
        }
        (method).apply(this, packet.data.arguments);
    }

}