import AzNopolyClient from "./client";
import AzNopolyGame from "./game";
import { PacketType, SceneChangePacket, SceneReadyPacket } from "./types/client";

/**
 * Waits for every player to send a "Ready" packet
 */
export class SceneReadyListener {

    private aznopoly: AzNopolyGame;

    private sceneName: string;
    private callback: () => void;

    constructor(aznopoly: AzNopolyGame, sceneName: string, callback: () => void) {
        this.aznopoly = aznopoly;
        this.sceneName = sceneName;
        this.callback = callback;

        this.startListening();
    }

    private startListening() {
        const readyList = new Set([this.aznopoly.client.id]);

        const sceneReadyListener = ((packet: CustomEvent<SceneReadyPacket>) => {
            if (packet.detail.data.scene == this.sceneName) {
                readyList.add(packet.detail.sender);
                if (readyList.size == this.aznopoly.room.connectedPlayerIds.length) {
                    this.callback();
                    this.aznopoly.client.removeEventListener(PacketType.SCEEN_READY, sceneReadyListener);
                }
            }
        }) as EventListener;

        // Register the event listener
        this.aznopoly.client.addEventListener(PacketType.SCEEN_READY, sceneReadyListener);
    }

}

export function sendSceneReadyPacket(aznopoly: AzNopolyGame, sceneName: string) {
    const packet: SceneReadyPacket = {
        type: PacketType.SCEEN_READY,
        sender: aznopoly.client.id,
        data: {
            scene: sceneName,
        }
    }
    aznopoly.client.sendPacket(packet);
}

export function sendSceneChangePacket(aznopoly: AzNopolyGame, sceneName: string) {
    const packet: SceneChangePacket = {
        type: PacketType.SCENE_CHANGE,
        sender: aznopoly.client.id,
        data: {
            scene: sceneName,
        }
    }
    aznopoly.client.sendPacket(packet);
}