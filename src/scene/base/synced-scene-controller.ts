import AzNopolyGame from "../../game";
import { SceneSwitcher } from "../../scene-switcher";
import NetworkSceneController from "./base-scene-controller";


export default abstract class SyncedSceneController extends NetworkSceneController {

    private launchMethod: "launch" | "start" | "wake";

    constructor(scene: Phaser.Scene, aznopoly: AzNopolyGame, launchMethod: "launch" | "start" | "wake") {
        super(scene, aznopoly);
        this.launchMethod = launchMethod;

        this.registerSyncedMethod(this.onAllPlayersReady, true);
        this.registerSyncedMethod(this.onAllPlayersWake, true);
        SceneSwitcher.listen(scene, aznopoly)

        const listener = this.onSceneWake.bind(this);
        scene.events.on(Phaser.Scenes.Events.WAKE, listener);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.WAKE, listener));
    }

    onSceneCreate(): void {
        if (this.aznopoly.isHost) {
            SceneSwitcher.waitForPlayers(this.aznopoly, this.scene.scene.key + "_CREATE", this.launchMethod, this.onAllPlayersJoined.bind(this));
        }
        SceneSwitcher.broadcastSceneReady(this.aznopoly, this.scene.scene.key + "_CREATE")
    }

    onSceneWake(sys: Phaser.Scenes.Systems, data: any): void {
        if (this.aznopoly.isHost) {
            SceneSwitcher.waitForPlayers(this.aznopoly, this.scene.scene.key + "_WAKE", "wake", this.onAllPlayersRejoined.bind(this));
        }
        SceneSwitcher.broadcastSceneReady(this.aznopoly, this.scene.scene.key + "_WAKE")
    }

    /**
     * Will be called after all the host as acknowledged that that all players have joined the scene
     */
    abstract onAllPlayersReady(): void;
    /**
     * Will be called after all the host as acknowledged that that all players have waked the scene and is ready
     */
    onAllPlayersWake(): void {

    }

    private onAllPlayersJoined() {
        this.syncProxy.onAllPlayersReady();
    }

    private onAllPlayersRejoined() {
        this.syncProxy.onAllPlayersWake();
    }

}