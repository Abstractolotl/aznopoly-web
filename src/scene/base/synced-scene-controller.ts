import AzNopolyGame from "../../game";
import { SceneSwitcher } from "../../scene-switcher";
import NetworkSceneController from "./base-scene-controller";


export default abstract class SyncedSceneController extends NetworkSceneController {

    constructor(scene: Phaser.Scene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly);

        this.registerSyncedMethod(this.onAllPlayersReady, true);
        SceneSwitcher.listen(scene, aznopoly)
    }

    onSceneCreate(): void {
        this.updateSceneSwitcher();
    }

    private updateSceneSwitcher() {
        if (this.aznopoly.isHost) {
            SceneSwitcher.waitForPlayers(this.aznopoly, this.scene.scene.key, this.onAllPlayersJoined.bind(this));
        }
        SceneSwitcher.updateScene(this.aznopoly, this.scene.scene.key)
    }

    /**
     * Will be called after all the host as acknowledged that that all players have joined the scene
     */
    abstract onAllPlayersReady(): void;

    private onAllPlayersJoined() {
        this.syncProxy.onAllPlayersReady();
    }

}