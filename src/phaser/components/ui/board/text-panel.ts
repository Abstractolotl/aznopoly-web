import { FONT_STYLE_BODY, FONT_STYLE_EYECATCHER } from "@/style";
import AzNopolyPanel from "../panel";
import { AzNopolyButton } from "../button";


const HEIGHT = 30;
export default class TextPanel extends Phaser.GameObjects.Container {

    static preload(scene: Phaser.Scene) {
        scene.load.image("icon-zoom-in", "assets/icons/icon_zoom_in.svg");
        scene.load.image("icon-zoom-out", "assets/icons/icon_zoom_out.svg");
    }
    
    private panel: AzNopolyPanel;
    private title: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, title: string) {
        super(scene, x - width * 0.5, y);
        this.setSize(width, HEIGHT);

        this.panel = new AzNopolyPanel(scene, 0, 0, width, HEIGHT);
        this.title = new Phaser.GameObjects.Text(scene, this.width * 0.5, this.height * 0.5, title, FONT_STYLE_BODY);
        this.title.setOrigin(0.5, 0.5);


        this.add(this.panel);
        this.add(this.title);
    }

}