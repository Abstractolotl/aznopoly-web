import { FONT_STYLE_BUTTON } from "../style";

export default class GameScene extends Phaser.Scene {
    name!: string;

    init(data: any) {
        this.name = data.name;
    }

    create() {

        this.add.text(100, 100, 'Game Scene', FONT_STYLE_BUTTON);
        this.add.text(100, 200, 'Hello ' + this.name, FONT_STYLE_BUTTON);
    }
}