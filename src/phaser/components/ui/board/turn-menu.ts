import { FONT_STYLE_BODY, FONT_STYLE_EYECATCHER } from "@/style";
import { AzNopolyButton } from "../button";
import AzNopolyPanel from "../panel";


const WIDTH = 300;
const HEIGHT = 125;
export default class TurnMenu extends Phaser.GameObjects.Container {
    static WIDTH = WIDTH;
    static HEIGHT = HEIGHT;

    private panel: AzNopolyPanel;
    private rollButton: AzNopolyButton;
    private panelText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x - WIDTH * 0.5, y - HEIGHT * 0.5);
        this.setSize(WIDTH, HEIGHT);

        this.panel = new AzNopolyPanel(scene, 0, 0, WIDTH, HEIGHT, "Your Turn");
        this.rollButton = new AzNopolyButton(scene, "Roll Dice", WIDTH * 0.5, this.panel.contentRect.y + this.panel.contentRect.height * 0.5);
        this.panelText = new Phaser.GameObjects.Text(scene, WIDTH * 0.5, this.panel.contentRect.y + this.panel.contentRect.height * 0.5, "Your Turn", FONT_STYLE_BODY);
        this.panelText.setOrigin(0.5);

        this.add(this.panel);
        this.add(this.rollButton);
        this.add(this.panelText);

        this.setVisible(false);
    }

    public getRollButton() {
        return this.rollButton;
    }

    public showWaitingForPlayer(playerName: string) {
        this.setVisible(true);
        this.panel.setHeadline(`${playerName}'s Turn`);
        this.rollButton.setVisible(false);

        this.panelText.setText(`Waiting for other Player`);
        this.panelText.setVisible(true);
    }

    public showRollDialog() {
        this.setVisible(true);
        this.panel.setHeadline("Your Turn");
        this.rollButton.setVisible(true);
        this.panelText.setVisible(false);
    }

    public hide() {
        this.setVisible(false);
    }

}