import AzNopolyGame from "../../game";
import { SceneSwitcher } from "../../scene-switcher";
import MinigameScene from "./minigame-scene";
import SyncedSceneController from "./synced-scene-controller";

const RESULT_DISPLAY_TIME = 2000;
export default abstract class MinigameSceneController extends SyncedSceneController {
    
    declare protected scene: MinigameScene<MinigameSceneController>;
    private previousScene: string;

    constructor(scene: Phaser.Scene, aznopoly: AzNopolyGame, /*previousScene: string */) {
        super(scene, aznopoly, "launch");
        this.previousScene = "game";

        this.registerSyncedMethod(this.showReady, true);
        this.registerSyncedMethod(this.showStart, true);
        this.registerSyncedMethod(this.endGame, true);
    }
    
    onAllPlayersReady(): void {
        console.log("onAllPlayersReady")
        if (!this.aznopoly.isHost) {
            return;
        }

        this.syncProxy.showReady();
        setTimeout(() => this.syncProxy.showStart(), 1500);
    }

    private showReady() {
        this.scene.showReadyOverlay();
    }

    private showStart() {
        this.scene.showStartOverlay();
    }

    protected endGame(playerWon: string[], sorted: boolean) {
        this.scene.showResultOverlay(playerWon);
        setTimeout(() => this.onGameOver(), RESULT_DISPLAY_TIME);
    }

    abstract onMiniGameStart() : void;

    private onGameOver() {
        if (!this.aznopoly.isHost) {
            return;
        }
        this.scene.scene.stop();
        this.scene.scene.wake(this.previousScene);
    }

}