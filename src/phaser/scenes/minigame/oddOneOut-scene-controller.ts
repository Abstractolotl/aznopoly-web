import MinigameSceneController from "@/phaser/scenes/base/minigame-scene-controller.ts";
import {OddOneOutScene} from "@/phaser/scenes/minigame/oddOneOut-scene.ts";
import AzNopolyGame from "@/game.ts";
import {oddOneAsset} from "@/phaser/components/minigame/oddOneAsset.ts";

const MAX_GAME_TIME = 30000;
export class OddOneOutSceneController extends MinigameSceneController {

    declare protected scene: OddOneOutScene;
    private oddTries: number = 0;

    constructor(scene: OddOneOutScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly);

        this.registerSyncedProp("scene");

        this.registerSyncedMethod(this.scene.initiateOddOnesInGrid, true);
        this.registerSyncedMethod(this.scene.initiateOddOne, true);
    }

    onMiniGameStart() {
        if (!this.aznopoly.isHost) {
            return;
        }

        //this.syncProxy.scene.initiateOddOnesInGrid();
        const gridSizeX = 5; // Number of assets in a row
        const gridSizeY = 5; // Number of assets in a column
        const spacingX = 100; // Horizontal spacing between assets
        const spacingY = 100; // Vertical spacing between assets
        const offSetX = 375;
        const offSetY = 100;

        for (let i = 0; i < gridSizeX; i++) {
            for (let j = 0; j < gridSizeY; j++) {
                const x = i * spacingX + spacingX / 2 + offSetX; // Calculate x position
                const y = j * spacingY + spacingY / 2 + offSetY; // Calculate y position
                this.syncProxy.scene.initiateOddOne(x, y, this.isOdd()) // Add to the array
            }
        }

        setTimeout(() => {
            //this.scene.stopMusic();
            this.syncProxy.endGame({playerWon: [], sorted: false});
        }, MAX_GAME_TIME);
    }

    private isOdd(): boolean {
        this.oddTries++;
        return Math.random() < 0.1;
    }
}