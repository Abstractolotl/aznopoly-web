import { SETTINGS } from "@/settings";
import AzNopolyPanel from "../panel";
import { FONT_STYLE_EYECATCHER } from "@/style";
import { AzNopolyButton } from "../button";
import AzNopolyInput from "../input-field";

const WIDTH = 650;
const HEIGHT = 300;
export default class TitlePanel extends AzNopolyPanel {

    static preload(scene: Phaser.Scene) {
        scene.load.image('icon_group', 'assets/icons/icon_group.svg');
        scene.load.image("icon_crown", "assets/icons/icon_crown.png");
    }

    private onJoin?: (code: string) => void;
    private onCreate?: () => void;

    constructor(scene: Phaser.Scene) {
        super(scene, (SETTINGS.DISPLAY_WIDTH - WIDTH) * 0.5, (SETTINGS.DISPLAY_HEIGHT - HEIGHT) * 0.5, WIDTH, HEIGHT, "LOBBY");
        this.initLeft();
        this.initRight();
    }

    public setOnJoin(onJoin: (code: string) => void) {
        this.onJoin = onJoin;
    }

    public setOnCreate(onCreate: () => void) {
        this.onCreate = onCreate;
    }

    private initLeft() {
        const bounds = new Phaser.Geom.Rectangle(this.contentRect.x, this.contentRect.y, this.contentRect.width * 0.5, this.contentRect.height);

        const headline = new Phaser.GameObjects.Text(this.scene, bounds.x, bounds.y, "Create your own\nLobby", FONT_STYLE_EYECATCHER);
        headline.setPosition(bounds.x + bounds.width * 0.5 - headline.width * 0.5, bounds.y + 20);
        this.add(headline);

        const icon = new Phaser.GameObjects.Image(this.scene, bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5, 'icon_crown');
        icon.setOrigin(0.5, 0.5);
        this.add(icon);

        const button = new AzNopolyButton(this.scene, "CREATE", bounds.x + bounds.width * 0.5, bounds.y + bounds.height - 50);
        button.setOnClick(() => this.onCreate?.());
        this.add(button);
    }



    private initRight() {
        const bounds = new Phaser.Geom.Rectangle(this.contentRect.x + this.contentRect.width * 0.5, this.contentRect.y, this.contentRect.width * 0.5, this.contentRect.height);

        const headline = new Phaser.GameObjects.Text(this.scene, bounds.x, bounds.y, "Join your friends!", FONT_STYLE_EYECATCHER);
        headline.setPosition(bounds.x + bounds.width * 0.5 - headline.width * 0.5, bounds.y + 35);
        this.add(headline);

        const icon = new Phaser.GameObjects.Image(this.scene, bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5, 'icon_group');
        icon.setOrigin(0.5, 0.5);
        this.add(icon);


        const input = new AzNopolyInput(this.scene, bounds.x + 50, bounds.y + bounds.height - 50, bounds.width * 0.5, 40, "code");
        input.setPosition(input.x, input.y - input.height * 0.5);
        this.add(input);

        const button = new AzNopolyButton(this.scene, "JOIN", bounds.x + bounds.width * 0.75, bounds.y + bounds.height - 50);
        button.setOnClick(() => {
            if (input.getValue().length === 6) {
                this.onJoin?.(input.getValue());
            }
        });
        this.add(button);
    }

}