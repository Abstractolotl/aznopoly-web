import {TileType} from "@/types/board.ts";
import {COLOR_PRIMARY, COLOR_PRIMARY_2, FONT_STYLE_BODY} from "@/style.ts";
import BoardTile from "@/board/board-tile.ts";

const PADDING = 10;
export default class BoardTilePopUp extends Phaser.GameObjects.Container {

    private graphics!: Phaser.GameObjects.Graphics;
    private titleText!: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, bounds = {width: 300, height: 200}) {
        super(scene, x - (bounds.width / 2), y - (bounds.height / 2));

        this.width = bounds.width;
        this.height = bounds.height;

        this.graphics = new Phaser.GameObjects.Graphics(scene);

        this.titleText = new Phaser.GameObjects.Text(scene, this.width*0.5, -PADDING - 45, "PLACEHOLDER", FONT_STYLE_BODY);
        this.titleText.setOrigin(0.5, 0);

        this.add(this.graphics);
        this.add(this.titleText);
    }

    show(color: BoardTile, level: number) {
        this.setVisible(true);
        this.redrawUi()

        if(level === 0) {
            this.titleText.setText("Buy Property");
        } else if(level > 1) {
            this.titleText.setText("Upgrade Property");
        }
    }

    hide() {
        this.setVisible(false);
    }

    private redrawUi() {
        this.graphics.clear();
        this.graphics.fillStyle(COLOR_PRIMARY_2);
        this.graphics.fillRect(-PADDING, -PADDING - 50, this.width + PADDING * 2, this.height + PADDING * 2 + 50);

        this.graphics.fillStyle(COLOR_PRIMARY);
        this.graphics.fillRect(-PADDING + 5, -PADDING - 50 + 5, this.width + PADDING * 2 - 10, 45);
    }
}