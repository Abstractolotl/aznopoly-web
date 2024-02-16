import { WIDTH } from "@/main";
import { COLOR_PRIMARY, FONT_STYLE_HEADLINE, FRAME_PADDING } from "@/style";
import AzNopolyPanel from "./panel";

const BAR_HEIGHT = 100;
export default class AzNopolyBar extends Phaser.GameObjects.Container {
    static HEIGHT = BAR_HEIGHT;

    constructor(scene: Phaser.Scene, title: string) {
        super(scene, 0, FRAME_PADDING);

        const width = WIDTH * 0.75;
        this.add(new AzNopolyPanel(scene, WIDTH / 2 - width / 2, 0, width, BAR_HEIGHT));

        this.add(new Phaser.GameObjects.Text(scene, WIDTH / 2, BAR_HEIGHT / 2, title, FONT_STYLE_HEADLINE).setOrigin(0.5, 0.5));
    }

}