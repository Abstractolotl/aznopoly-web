import { COLOR_PRIMARY, FONT_STYLE_PANEL_HEADLINE, FRAME_PADDING } from "@/style";
import AzNopolyPanel from "./panel";
import { SETTINGS } from "@/settings";

const BAR_HEIGHT = 100;
export default class AzNopolyBar extends Phaser.GameObjects.Container {
    static HEIGHT = BAR_HEIGHT;

    constructor(scene: Phaser.Scene, title: string) {
        super(scene, 0, FRAME_PADDING);

        const width = SETTINGS.DISPLAY_WIDTH * 0.75;
        this.add(new AzNopolyPanel(scene, SETTINGS.DISPLAY_WIDTH / 2 - width / 2, 0, width, BAR_HEIGHT));

        this.add(new Phaser.GameObjects.Text(scene, SETTINGS.DISPLAY_WIDTH / 2, BAR_HEIGHT / 2, title, FONT_STYLE_PANEL_HEADLINE).setOrigin(0.5, 0.5));
    }

}