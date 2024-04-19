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
    private playerPoints: number[] = [];

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

    initiateOddOne(id: number, x: number, y: number, isOdd: boolean) {
        let oddOne = this.add.existing(new oddOneAsset(this, id, x, y, isOdd));
        oddOne.setInteractive()
        oddOne.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => this.onClicked(oddOne));
    }

    onClicked(oddOne: oddOneAsset) {
        console.log("clicked" + oddOne.id);
        //oddOne.destroy();
    }

}