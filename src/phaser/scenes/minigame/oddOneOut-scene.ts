import MinigameScene from "../base/minigame-scene";

import {FRAME_PADDING, PLAYER_COLORS} from "@/style";
import {SETTINGS} from "@/settings";

import {oddOneAsset} from "@/phaser/components/minigame/oddOneAsset.ts";
import {OddOneOutSceneController} from "@/phaser/scenes/minigame/oddOneOut-scene-controller.ts";
import AzNopolyPanel from "@/phaser/components/ui/panel.ts";

const WORLD_BOUNDS = (() => {
    const size = SETTINGS.DISPLAY_HEIGHT - FRAME_PADDING * 2;
    return new Phaser.Geom.Rectangle(SETTINGS.DISPLAY_WIDTH / 2 - size / 2, 0 + FRAME_PADDING * 1, size, size);
})();

export class OddOneOutScene extends MinigameScene<OddOneOutSceneController> {

    private oddOneAssets: oddOneAsset[] = [];
    private graphics!: Phaser.GameObjects.Graphics;

    private oddTries: number = 0;

    preload() {
        super.preload();
        oddOneAsset.preload(this);
    }

    init() {
        this.controller = new OddOneOutSceneController(this, this.aznopoly);
        this.oddOneAssets = [];
    }

    create() {
        super.create();

        this.graphics = this.add.graphics();

    }

    protected drawSceneLayout(): void {
        this.add.existing(new AzNopolyPanel(this, 230, 50, 800, 600));
    }

    initiateOddOne(x: number, y: number, isOdd: boolean) {
        const oddOne = this.add.existing(new oddOneAsset(this, x, y, isOdd));
    }
    initiateOddOnesInGrid() {
        // const oddTries: number = 0;
        // const gridSizeX = 5; // Number of assets in a row
        // const gridSizeY = 5; // Number of assets in a column
        // const spacingX = 100; // Horizontal spacing between assets
        // const spacingY = 100; // Vertical spacing between assets
        //
        // for (let i = 0; i < gridSizeX; i++) {
        //     for (let j = 0; j < gridSizeY; j++) {
        //         const x = i * spacingX + spacingX / 2; // Calculate x position
        //         const y = j * spacingY + spacingY / 2; // Calculate y position
        //         const asset = new oddOneAsset(this, x, y); // Create new instance of oddOneAsset
        //         this.oddOneAssets.push(asset); // Add to the array
        //     }
        // }
    }

    //returns 1 10% of the time and increments oddTries when 1

}