import AzNopolyGame from "../../game";
import { DynamicPacket } from "../../types/client";


/**
 * A base class for scene controllers that use networking.
 * Should be only created with a already initialized & booted scene.
 * Would be best to create this class in the scene's init method.
 */
export default abstract class NetworkSceneController {

    protected aznopoly: AzNopolyGame;
    protected scene: Phaser.Scene;
    private packetType: string;

    private registeredMethods: {method: string, hostOnly: boolean}[] = [];

    /**
     * A proxy object that allows for calling methods on the controller.
     * Functions called on the proxy will be sent to all clients and executed asynchonously
     * Functions must be registered with registerSyncedMethod
     */
    public syncProxy = new Proxy(this, {
        get: (_, prop) => {
            return this.onProxyCall(prop);
        },
    });

    constructor(scene: Phaser.Scene, aznopoly: AzNopolyGame) {
        this.scene = scene;
        this.aznopoly = aznopoly;
        this.packetType = "CLIENT_" + this.constructor.name.toUpperCase();
        
        scene.events.once(Phaser.Scenes.Events.CREATE, () => {
            this.registerPacketListener();
            this.onSceneCreate();
        });
    }

    /**
     * Will be called after the scene was created and all ui elements are ready
     */
    abstract onSceneCreate(): void;

    public registerPacketListener() {
        const listener = this.aznopoly.addPacketListener(this.packetType, this.onPacket.bind(this) as EventListener);
        this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.aznopoly.removePacketListener(this.packetType, listener));
    }

    /**
     * Registers a method to be allowed to be called with syncProxy
     * @param method The method to be registered
     * @param hostOnly Wether or not the method should only be called by the host
     */
    public registerSyncedMethod(method: Function, hostOnly: boolean) {
        const name = method.name;
        if (this.registeredMethods.find(m => m.method === name)) {
            throw new Error(`Packet executor with name ${name} already exists`);
        }
        this.registeredMethods.push({method: name, hostOnly});
    }

    private isMethodAllowed(method: string, isCallerHost: boolean) {
        return this.registeredMethods.find(m => m.method === method && (!m.hostOnly || isCallerHost));
    }

    private onProxyCall(prop: symbol | string) {
        if (!this.isMethodAllowed(String(prop), this.aznopoly.isHost)) {
            throw new Error(`This method was not registered for sync: ${String(prop)}`);
        }
        
        return (...args: any[]) => {
            const packet = this.sendExecPacket(String(prop), ...args); 
            this.executePacket(packet);
        }
    }

    private onPacket(event: CustomEvent<DynamicPacket<{method: string, arguments: any[]}>>) {
        const packet = event.detail;
        this.executePacket(packet);
    }

    private sendExecPacket(method: string, ...args: any[]) {
        const packet = {
            type: this.packetType,
            sender: this.aznopoly.uuid,
            data: {
                method,
                arguments: args
            }
        }

        this.aznopoly.broadcastPacket(packet);
        return packet;
    }

    private executePacket(packet: DynamicPacket<{method: string, arguments: any[]}>) {    
        if (packet.type !== this.packetType) {
            console.error(`Packet type ${packet.type} does not match expected type ${this.packetType}`);
            return;
        }
        
        if (!this.isMethodAllowed(packet.data.method, this.aznopoly.isPlayerHost(packet.sender))) {
            console.error(`Method ${packet.data.method} is not allowed`);
            return;
        }
        
        const method = (this as any)[packet.data.method];
        if (typeof method !== "function") {
            console.error(`Method ${packet.data.method} is not a function`);
            return;
        }
        (method).apply(this, [...packet.data.arguments, packet.sender]);
    }

}