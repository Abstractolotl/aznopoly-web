import AzNopolyGame from "./game";
import { PacketType, SceneChangePacket, SceneReadyPacket } from "./types/client";


let switcher: any[] = []
export const SceneSwitcher = {
    waitForPlayers: (aznopoly: AzNopolyGame, sceneKey: string, launchMethod: "launch" | "start" | "wake", callback: () => void) => {
        switcher.push(new SceneReadyListener(aznopoly, sceneKey, callback));
        sendSceneChangePacket(aznopoly, sceneKey.split("_")[0], launchMethod);
    },
    broadcastSceneReady: sendSceneReadyPacket,
    listen: listenForSceneSwitch,
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

    private id = Math.random();

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
                console.log("Removing listener", this.id)
                this.aznopoly.client.removeEventListener(PacketType.SCEEN_READY, this.listener!);
                switcher = switcher.filter((listener) => listener != this);
            }
        }
    }

    private startListening() {
        console.log("Starting listener", this.id)
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

    console.log("Sending scene ready packet", packet);
    if (aznopoly.isHost) {
        const ss = switcher.find(l => l.sceneName == sceneName);
        ss?.listener({detail: packet})        
    } else {
        aznopoly.client.sendPacket(packet);
    }
}

function sendSceneChangePacket(aznopoly: AzNopolyGame, sceneName: string, launchMethod: "start" | "launch" | "wake") {
    const packet: SceneChangePacket = {
        type: PacketType.SCENE_CHANGE,
        sender: aznopoly.client.id,
        data: {
            scene: sceneName,
            launchMethod,
        }
    }
    console.log("Sending scene change packet", packet);
    aznopoly.client.sendPacket(packet);
}

function listenForSceneSwitch(scene: Phaser.Scene, aznopoly: AzNopolyGame) {
    const id = Math.random();

    console.log("Listening for scene switch", id, scene.scene.key)
    const packetListener = aznopoly.addPacketListener(PacketType.SCENE_CHANGE, ((event: CustomEvent<SceneChangePacket>) => {
        if (!scene.scene.isActive(scene.scene.key ) || scene.scene.isSleeping(scene.scene.key)) {
            console.warn("Received scene change packet for inactive scene", id, scene.scene.key, scene.scene.isActive(scene.scene.key ), scene.scene.isSleeping(scene.scene.key ))
            return;
        }
        
        const packet = event.detail
        if (!aznopoly.isPlayerHost(packet.sender)) {
            console.warn("Received scene change packet from non-host player");
            return;
        }
    
        if (packet.data.launchMethod == "launch") {
            console.log("Sleeping scene", id, scene.scene.key)
            scene.scene.sleep();
            scene.scene.launch(packet.data.scene, { returnScene: scene.scene.key});
        } else if (packet.data.launchMethod == "wake") {
            console.trace("Waking scene", id, scene, packet.data.scene)
            scene.scene.stop();
            scene.scene.wake(packet.data.scene);
        } else if (packet.data.launchMethod == "start")  {
            console.log("Starting scene", id, packet.data.scene)
            scene.scene.start(packet.data.scene);
        } else {
            console.error("Unknown launch method", packet.data.launchMethod);
        }
    }) as EventListener);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        console.log("Removing scene switch listener", id)
        aznopoly.removePacketListener(PacketType.SCENE_CHANGE, packetListener)
    });
}