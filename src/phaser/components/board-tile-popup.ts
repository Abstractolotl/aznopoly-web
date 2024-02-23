import {COLOR_PRIMARY, COLOR_PRIMARY_2, FONT_STYLE_BODY, FONT_STYLE_BUTTON, FRAME_PADDING} from "@/style.ts";
import { AzNopolyButton } from "./ui/button";

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

        this.titleText = new Phaser.GameObjects.Text(scene, this.width*0.5, -FRAME_PADDING - 45, "PLACEHOLDER", FONT_STYLE_BUTTON);
        this.titleText.setOrigin(0.5, 0);

        this.priceText = new Phaser.GameObjects.Text(scene, this.width*0.5, this.height - 150, "Price: ???", FONT_STYLE_BODY);
        this.priceText.setOrigin(0.5, 0.5);

        this.cancelButton = new AzNopolyButton(scene, "Cancel", 0, this.height - 50, this.width, 50, onCancel);
        this.submitButton = new AzNopolyButton(scene, "Accept", 0, this.height - 100, this.width, 50, onSubmit);

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
        this.graphics.fillRect(-FRAME_PADDING, -FRAME_PADDING - 50, this.width + FRAME_PADDING * 2, this.height + FRAME_PADDING * 2 + 50);

        this.graphics.fillStyle(COLOR_PRIMARY);
        this.graphics.fillRect(-FRAME_PADDING + 5, -FRAME_PADDING - 50 + 5, this.width + FRAME_PADDING * 2 - 10, 45);
    }
}