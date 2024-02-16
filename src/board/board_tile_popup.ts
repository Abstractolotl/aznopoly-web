import {TileType} from "@/types/board.ts";
import {COLOR_PRIMARY, COLOR_PRIMARY_2, FONT_STYLE_BODY} from "@/style.ts";
import BoardTile from "@/board/board-tile.ts";
import {AzNopolyButton} from "@/ui/button.ts";

const PADDING = 10;
const TIMEOUT = 3000;
const DEFAULT_PRICE = 100;

export default class BoardTilePopUp extends Phaser.GameObjects.Container {

    private graphics!: Phaser.GameObjects.Graphics;
    private titleText!: Phaser.GameObjects.Text;
    private priceText!: Phaser.GameObjects.Text;

    private submitButton!: AzNopolyButton;
    private cancelButton!: AzNopolyButton;

    constructor(scene: Phaser.Scene, x: number, y: number, bounds = {width: 300, height: 200}, onCancel: () => void, onSubmit: () => void) {
        super(scene, x - (bounds.width / 2), y - (bounds.height / 2));

        this.width = bounds.width;
        this.height = bounds.height;

        this.graphics = new Phaser.GameObjects.Graphics(scene);

        this.titleText = new Phaser.GameObjects.Text(scene, this.width*0.5, -PADDING - 45, "PLACEHOLDER", FONT_STYLE_BODY);
        this.titleText.setOrigin(0.5, 0);

        this.priceText = new Phaser.GameObjects.Text(scene, this.width*0.5, this.height*0.5, "Price: " + DEFAULT_PRICE, FONT_STYLE_BODY);
        this.priceText.setOrigin(0.5, 0.5);

        this.submitButton = new AzNopolyButton(scene, "Accept", this.width - 100, this.height - 50, 0, 0, onSubmit);
        this.cancelButton = new AzNopolyButton(scene, "Cancel", 50, this.height - 50, 0, 0, onCancel);

        this.add(this.graphics);
        this.add(this.priceText)
        this.add(this.titleText);
        this.add(this.submitButton);
        this.add(this.cancelButton);
    }

    show(upgrade: boolean, price: number) {
        this.setVisible(true);
        this.redrawUi()

        if (!upgrade) {
            this.titleText.setText("Buy Property");
        } else {
            this.titleText.setText("Upgrade Property");
        }

        this.priceText.setText("Price: " + price);
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