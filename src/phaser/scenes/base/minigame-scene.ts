import AzNopolyBar from "@/phaser/components/ui/bar";
import { FONT_STYLE_HEADLINE, FRAME_PADDING } from "../../../style";
import { BaseScene } from "./base-scene";
import MinigameSceneController, { ResultData } from "./minigame-scene-controller";
import AzNopolyPanel from "@/phaser/components/ui/panel";
import { SETTINGS } from "@/settings";

const START_TIME = 500;
export default abstract class MinigameScene<T extends MinigameSceneController> extends BaseScene<T> {

    public static getGameBounds() {
        const panelHeight = SETTINGS.DISPLAY_HEIGHT - FRAME_PADDING * 3 - AzNopolyBar.HEIGHT;
        const panelWidth = SETTINGS.DISPLAY_WIDTH - 400;
        return new Phaser.Geom.Rectangle(FRAME_PADDING, AzNopolyBar.HEIGHT + FRAME_PADDING * 2, panelWidth, panelHeight);
    }

    static getRightBounds() {
        const left = this.getGameBounds();

        const panelHeight = SETTINGS.DISPLAY_HEIGHT - FRAME_PADDING * 3 - AzNopolyBar.HEIGHT;
        const panelWidth = SETTINGS.DISPLAY_WIDTH - (left.x + left.width + FRAME_PADDING * 2);
        return new Phaser.Geom.Rectangle(left.x + left.width + FRAME_PADDING, AzNopolyBar.HEIGHT + FRAME_PADDING * 2, panelWidth, panelHeight);
    }

    private overlay!: Phaser.GameObjects.Image;
    private centerText!: Phaser.GameObjects.Text;

    private startTimer = 0;

    preload() {
        this.load.image('minigame_won', 'assets/crown.png');
        this.load.image('minigame_lost', 'assets/crown.png');
        this.load.image('minigame_start', 'assets/start.png');
        this.load.image('minigame_ready', 'assets/ready.png');
    }

    create() {
        this.overlay = this.add.image(SETTINGS.DISPLAY_WIDTH/2, SETTINGS.DISPLAY_HEIGHT/2, 'minigame_ready').setOrigin(0, 0);
        this.overlay.setOrigin(0.5, 0.5);
        this.overlay.setDepth(1000);
        this.overlay.setVisible(false);

        this.centerText = this.add.text(SETTINGS.DISPLAY_WIDTH/2, SETTINGS.DISPLAY_HEIGHT/2, 'Waiting for players...', FONT_STYLE_HEADLINE);
        this.centerText.setOrigin(0.5, 0.5);
        this.centerText.setDepth(1000);

        this.drawSceneLayout();
    }

    protected drawSceneLayout() {
        this.add.existing(new AzNopolyBar(this, "Minigame"))

        const gameBounds = MinigameScene.getGameBounds();
        const gamePanel = new AzNopolyPanel(this, gameBounds.x, gameBounds.y, gameBounds.width, gameBounds.height);
        this.add.existing(gamePanel);

        const rightBounds = MinigameScene.getRightBounds();
        const rightPanel = new AzNopolyPanel(this, rightBounds.x, rightBounds.y, rightBounds.width, rightBounds.height);
        this.add.existing(rightPanel);
    }

    update(time: number, delta: number) {
        if (this.startTimer > 0) {
            this.startTimer -= delta;

            this.overlay.alpha = Math.max(0, this.startTimer / START_TIME);
            this.overlay.scale = Math.max(1, 1 + ((START_TIME - this.startTimer) / START_TIME) * 0.25)
            if (this.startTimer <= 0) {
                this.hideOverlay();
                this.controller.onMiniGameStart();
            }
        }
    }

    public showReadyOverlay() {
        this.overlay.setTexture('minigame_ready');
        this.overlay.setVisible(true);
        this.centerText.setVisible(false);
    }

    public showStartOverlay() {
        this.overlay.setTexture('minigame_start');
        this.overlay.setVisible(true);

        this.startTimer = START_TIME;
    }

    public hideOverlay() {
        this.overlay.setVisible(false);
    }

    public showResultOverlay({playerWon}: ResultData) {
        const won = playerWon.includes(this.aznopoly.uuid);
        this.overlay.setVisible(false);
        this.overlay.alpha = 1;
        this.overlay.scale = 1;
        this.overlay.y -= 100;

        const names = playerWon.map(uuid => this.aznopoly.room.getPlayerName(uuid) + " won");
        this.centerText.setText(names.join("\n"))
        this.centerText.setVisible(true);

        if (won) {
            this.showGameWon();
        } else {
            this.showGameLost();
        }
    }

    private showGameWon() {
        this.overlay.setTexture('minigame_won');
        this.overlay.setVisible(true);
        this.overlay.alpha = 1;
    }

    private showGameLost() {
        this.overlay.setTexture('minigame_lost');
        this.overlay.setVisible(true);
    }

}