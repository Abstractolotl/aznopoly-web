import AzNopolyGame from "@/game";
import MinigameScene from "@/phaser/scenes/base/minigame-scene";
import SyncedSceneController from "@/phaser/scenes/base/synced-scene-controller";

export interface ResultData {
    playerWon: string[];
    sorted: boolean;
}

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

    /**
     * Called after every player joined the scene and the "Ready, Start" overlay has finished animation.
     */
    abstract onMiniGameStart() : void;
    
    onAllPlayersReady(): void {
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

    protected endGame(result: ResultData) {
        this.scene.showResultOverlay(result);
        setTimeout(() => this.onGameOver(result), RESULT_DISPLAY_TIME);
    }

    private onGameOver(result: ResultData) {
        if (!this.aznopoly.isHost) {
            return;
        }
        this.scene.scene.stop();
        this.scene.scene.wake(this.previousScene, result);
    }

}