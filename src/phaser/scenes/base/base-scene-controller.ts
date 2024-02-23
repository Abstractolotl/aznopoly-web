import AzNopolyGame from "../../../game";
import { DynamicPacket } from "../../../types/client";


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
    private registeredProps: { [key: string]: any } = {};

    /**
     * A proxy object that allows for calling methods on the controller.
     * Functions called on the proxy will be sent to all clients and executed asynchonously
     * Functions must be registered with registerSyncedMethod
     */
    public syncProxy = new Proxy(this, {
        get: (_, prop) => {
            return this.onProxyGet(this, prop);
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

    public registerSyncedProp(prop: string) {
        if (this.registeredProps[prop]) {
            throw new Error(`Prop ${prop} already registered`);
        }
        const proxiedObject = (this as any)[prop];
        this.registeredProps[prop] = new Proxy(proxiedObject, {
            get: (_, p) => {
                return this.onProxyGet(proxiedObject, p);
            },
        });
    }

    private isMethodAllowed(method: string, isCallerHost: boolean) {
        return this.registeredMethods.find(m => m.method === method && (!m.hostOnly || isCallerHost));
    }

    private onProxyGet(proxyObject: any, prop: symbol | string) {
        if (proxyObject[prop] instanceof Function) {
            return this.onProxyCall(proxyObject, prop);
        } else {
            return this.registeredProps[String(prop)];
        }
    }

    private onProxyCall(proxiedObject: string, prop: symbol | string) {
        if (!this.isMethodAllowed(String(prop), this.aznopoly.isHost)) {
            throw new Error(`This method was not registered for sync: ${String(prop)}`);
        }
        
        const proxyPropName = Object.keys(this).find(k => (this as any)[k] === proxiedObject);
        return (...args: any[]) => {
            const packet = this.sendExecPacket(proxyPropName!, String(prop), ...args); 
            this.executePacket(packet);
        }
    }

    private onPacket(event: CustomEvent<DynamicPacket<{prop: string, method: string, arguments: any[]}>>) {
        const packet = event.detail;
        this.executePacket(packet);
    }

    private sendExecPacket(propName: string, method: string, ...args: any[]) {
        const packet = {
            type: this.packetType,
            sender: this.aznopoly.uuid,
            data: {
                prop: propName,
                method,
                arguments: args
            }
        }

        this.aznopoly.broadcastPacket(packet);
        return packet;
    }

    private executePacket(packet: DynamicPacket<{prop: string, method: string, arguments: any[]}>) {    
        if (packet.type !== this.packetType) {
            console.error(`Packet type ${packet.type} does not match expected type ${this.packetType}`);
            return;
        }
        
        if (!this.isMethodAllowed(packet.data.method, this.aznopoly.isPlayerHost(packet.sender))) {
            console.error(`Method ${packet.data.method} is not allowed`);
            return;
        }
        
        const proxied = packet.data.prop ? (this as any)[packet.data.prop] : this;
        if (!proxied) {
            console.error(`Prop ${packet.data.prop} is not registered`);
            return;
        }

        const method = proxied[packet.data.method];
        if (typeof method !== "function") {
            console.error(`Method ${packet.data.method} is not a function`);
            return;
        }
        (method).apply(proxied, [...packet.data.arguments, packet.sender]);
    }

}