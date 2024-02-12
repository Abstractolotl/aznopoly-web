import { HEIGHT, WIDTH } from "../../main";
import { FONT_STYLE_HEADLINE } from "../../style";
import { BaseScene } from "./base-scene";
import MinigameSceneController from "./minigame-scene-controller";

const START_TIME = 500;
export default abstract class MinigameScene<T extends MinigameSceneController> extends BaseScene<T> {

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
        this.overlay = this.add.image(WIDTH/2, HEIGHT/2, 'minigame_ready').setOrigin(0, 0);
        this.overlay.setOrigin(0.5, 0.5);
        this.overlay.setDepth(1000);
        this.overlay.setVisible(false);

        this.centerText = this.add.text(WIDTH/2, HEIGHT/2, 'Waiting for players...', FONT_STYLE_HEADLINE);
        this.centerText.setOrigin(0.5, 0.5);
        this.centerText.setDepth(1000);
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

    public showResultOverlay(playerWon: string[]) {
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