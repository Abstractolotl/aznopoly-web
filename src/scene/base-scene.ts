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

    init(data: any) {
        if(!this.aznopoly.client) return;
        const launchMethod = (data || {}).launchMethod;
        
        if (this.sync) {
            if (this.aznopoly.isHost) {
                SceneSwitcher.waitForPlayers(this.aznopoly, this.scene.key, launchMethod).then(() => {
                    this.onAllPlayerReady();
                });
            }
        } 
        this.addPacketListener(PacketType.SCENE_CHANGE, this.onChangeScene.bind(this));
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.cleanPacketListeners();
        });
    }

    create() {
        SceneSwitcher.updateScene(this.aznopoly, this.scene.key);
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

    private cleanPacketListeners() {
        this.packetListener.forEach(([type, listener]) => {
            this.aznopoly.client.removeEventListener(type, listener);
        });
    }

    private onChangeScene(packet: SceneChangePacket) {
        if (!this.aznopoly.isPlayerHost(packet.sender)) return;

        console.log("launching scene", packet.data.scene, "from", this.scene.key)
        if (packet.data.launchMethod == "launch") {
            this.scene.launch(packet.data.scene, { previousScene: this.scene.key});
        } else {
            this.scene.start(packet.data.scene, { previousScene: this.scene.key});
        }
    }

}