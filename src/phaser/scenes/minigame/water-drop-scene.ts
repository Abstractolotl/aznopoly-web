import AzNopolyBar from "@/phaser/components/ui/bar";
import MinigameScene from "../base/minigame-scene";
import WaterDropSceneController from "./water-drop-scene-controller";
import AzNopolyPanel from "@/phaser/components/ui/panel";
import Glass from "@/phaser/components/minigame/water-drop/gfass";


export default class WaterDropScene extends MinigameScene<WaterDropSceneController> {
    preload() {
        super.preload();
    }

    private graphics!: Phaser.GameObjects.Graphics;

    init() {
        this.controller = new WaterDropSceneController(this, this.aznopoly);
    }

    create() {
        this.graphics = this.add.graphics();
        super.create();

        const rectangle = this.add.rectangle(0, 0, 100, 100, 0x6666ff);

        rectangle.setInteractive();
        rectangle.on('pointerdown', () => {
            console.log('clicked');
        });
    }

    public initGameObjects(){
        this.add.existing(new Glass(this, 100, 100));
    }

    protected drawSceneLayout(): void {
        this.add.existing(new AzNopolyPanel(this, 0, 0, 800, 600));
    }

}