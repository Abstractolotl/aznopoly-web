import AzNopolyGame from "./game";
import { PacketType, SceneChangePacket, SceneReadyPacket } from "./types/client";


let switcher: any[] = []
export const SceneSwitcher = {
    waitForPlayers: (aznopoly: AzNopolyGame, sceneKey: string, launchMethod: string) => {
        sendSceneChangePacket(aznopoly, sceneKey, launchMethod);
        return new Promise<void>((resolve) => {
            switcher.push(new SceneReadyListener(aznopoly, sceneKey, () => {
                resolve();
            }));
        });
    },
    updateScene: sendSceneReadyPacket
}

/**
 * Waits for every player to send a "Ready" packet
 */
class SceneReadyListener {

    private aznopoly: AzNopolyGame;

    private sceneName: string;
    private callback: () => void;
    private listener?: EventListener;
    private readyList: Set<string> = new Set();

    constructor(aznopoly: AzNopolyGame, sceneName: string, callback: () => void) {
        this.aznopoly = aznopoly;
        this.sceneName = sceneName;
        this.callback = callback;

        this.startListening();
    }

    private sceneReadyListener(packet: CustomEvent<SceneReadyPacket>) {
        if (packet.detail.data.scene == this.sceneName) {
            this.readyList.add(packet.detail.sender);
            if (this.readyList.size == this.aznopoly.room.connectedPlayerIds.length) {
                this.callback();
                this.aznopoly.client.removeEventListener(PacketType.SCEEN_READY, this.listener!);
                switcher = switcher.filter((listener) => listener != this);
            }
        }
    }

    private startListening() {
        this.listener = this.sceneReadyListener.bind(this) as EventListener;
        this.aznopoly.client.addEventListener(PacketType.SCEEN_READY, this.listener);
    }

}

function sendSceneReadyPacket(aznopoly: AzNopolyGame, sceneName: string) {
    const packet: SceneReadyPacket = {
        type: PacketType.SCEEN_READY,
        sender: aznopoly.client.id,
        data: {
            scene: sceneName,
        }
    }

    if (aznopoly.isHost) {
        switcher.find(l => l.sceneName == sceneName)?.listener({detail: packet})        
    } else {
        aznopoly.client.sendPacket(packet);
    }
}

function sendSceneChangePacket(aznopoly: AzNopolyGame, sceneName: string, launchMethod: string) {
    const packet: SceneChangePacket = {
        type: PacketType.SCENE_CHANGE,
        sender: aznopoly.client.id,
        data: {
            scene: sceneName,
            launchMethod,
        }
    }
    aznopoly.client.sendPacket(packet);
}