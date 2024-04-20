import {COLOR_PRIMARY, COLOR_PRIMARY_2, FONT_STYLE_BODY, FONT_STYLE_BUTTON, FRAME_PADDING} from "@/style.ts";
import { AzNopolyButton } from "./ui/button";
import { TimeBar } from "./ui/time-bar";
import AzNopolyPanel from "./ui/panel";
import { TileType } from "@/types/board";

interface TileInfo {
    name: string;
    price: number;
    upgradeLevel: number;
    tileType: TileType;
}

const WIDTH = 450;
const HEIGHT = 250;
export default class BoardTilePopUp extends Phaser.GameObjects.Container {
    static WIDTH = WIDTH;
    static HEIGHT = HEIGHT;

    private panel: AzNopolyPanel;
    private priceText: Phaser.GameObjects.Text;

    private submitButton: AzNopolyButton;
    private cancelButton: AzNopolyButton;

    private timer: TimeBar;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x - (WIDTH / 2), y - (HEIGHT / 2));
        this.setSize(WIDTH, HEIGHT);

        this.panel = new AzNopolyPanel(scene, 0, 0, WIDTH, HEIGHT, "Buy Property");

        this.priceText = new Phaser.GameObjects.Text(scene, this.width*0.5, this.height - 150, "Price: ???", FONT_STYLE_BODY);
        this.priceText.setOrigin(0.5, 0.5);


        this.cancelButton = new AzNopolyButton(
            scene, 
            "Cancel", 
            this.panel.contentRect.x + this.panel.contentRect.width * 0.25, 
            this.panel.contentRect.y + this.panel.contentRect.height - 50
        );
        this.submitButton = new AzNopolyButton(
            scene, 
            "Accept", 
            this.panel.contentRect.x + this.panel.contentRect.width * 0.75, 
            this.panel.contentRect.y + this.panel.contentRect.height - 50
        );

        this.timer = new TimeBar(
            scene, 
            this.panel.contentRect.x, 
            this.panel.contentRect.y, 
            this.panel.contentRect.width, 
            10, 
            1
        );

        this.add(this.panel);
        this.add(this.priceText)
        this.add(this.submitButton);
        this.add(this.cancelButton);
        this.add(this.timer);

        this.setVisible(false);
    }

    public setSubmitButtonOnClick(callback: () => void) {
        this.submitButton.setOnClick(callback);
    }

    public setCancelButtonOnClick(callback: () => void) {
        this.cancelButton.setOnClick(callback);
    }

    show(tileInfo: TileInfo) {
        this.timer.resetTime(3000);
        this.setVisible(true);

        if (tileInfo.upgradeLevel == 0) {
            this.panel.setHeadline("Buy Property");
            this.priceText.setText("Do you want to buy " + tileInfo.name + "?\nPrice: " + tileInfo.price);
        } else {
            this.panel.setHeadline("Upgrade Property to Level " + tileInfo.upgradeLevel);
            this.priceText.setText("Do you want to upgrade " + tileInfo.name + " to Level " + tileInfo.upgradeLevel + "?\nPrice: " + tileInfo.price);
        }
    }

    preUpdate(time: number, delta: number) {
        this.timer.preUpdate(time, delta);
    }

    hide() {
        this.setVisible(false);
    }

}