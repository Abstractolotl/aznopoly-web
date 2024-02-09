import AzNopolyGame from "../../game";
import MinigameScene from "./minigame-scene";
import SyncedSceneController from "./synced-scene-controller";


export default abstract class MinigameSceneController extends SyncedSceneController {
    
    declare protected scene: MinigameScene<MinigameSceneController>;
    private previousScene: string;

    constructor(scene: Phaser.Scene, aznopoly: AzNopolyGame, /*previousScene: string */) {
        super(scene, aznopoly);
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
        setTimeout(() => {
            this.onGameOver();
        }, 3000);
    }

    abstract onMiniGameStart() : void;

    private onGameOver() {
        this.scene.scene.stop();
        this.scene.scene.wake(this.previousScene);
    }

}