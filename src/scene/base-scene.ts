import { Scene } from "phaser";
import AzNopolyGame from "../game";
import { SceneSwitcher } from "../scene-switcher";
import { PacketType, PlayerPacket, SceneChangePacket } from "../types/client";


export class BaseScene extends Phaser.Scene {

    protected aznopoly: AzNopolyGame;
    private packetListener: [string, EventListener][] = [];
    private sync: boolean;

    constructor(aznopoly: AzNopolyGame, synced: boolean = true) {
        super();
        this.aznopoly = aznopoly;
        this.sync = synced;
    }

    init() {
        if(!this.aznopoly.client) return;
        
        if (this.sync) {
            if (!this.aznopoly.isHost) {
                SceneSwitcher.updateScene(this.aznopoly, this.scene.key);
            } else {
                SceneSwitcher.waitForPlayers(this.aznopoly, this.scene.key).then(() => {
                    this.onAllPlayerReady();
                });
            }
        } 
        this.addPacketListener(PacketType.SCENE_CHANGE, this.onChangeScene.bind(this));
    }

    protected onAllPlayerReady() {

    }

    protected addPacketListener<T extends PlayerPacket>(type: string, callback: (packet: T) => void) {
        const listener: EventListener = (event: Event) => {
            const packet = (event as CustomEvent<T>).detail;
            callback(packet);
        };
        this.packetListener.push([type, listener]);
        this.aznopoly.client.addEventListener(type, listener);
    }

    protected cleanPacketListeners() {
        this.packetListener.forEach(([type, listener]) => {
            this.aznopoly.client.removeEventListener(type, listener);
        });
    }

    private onChangeScene(packet: SceneChangePacket) {
        if (!this.aznopoly.isPlayerHost(packet.sender)) return;
        this.scene.start(packet.data.scene);
    }

}