import { HEIGHT, WIDTH } from "../main";
import { PacketType, PlayerPacket } from "../types/client";
import { BaseScene } from "./base-scene";


export interface MinigameResultPacket extends PlayerPacket {
    type: PacketType.MINIGAME_RESULT,
    data: {
        playerWon: string[],
        sorted: boolean,
    }
}

export default abstract class MinigameScene extends BaseScene {

    private previousScene!: string;

    private overlay!: Phaser.GameObjects.Image;

    preload() {
        this.load.image('minigame_won', 'assets/crown.png');
        this.load.image('minigame_lost', 'assets/crown.png');
        this.load.image('minigame_start', 'assets/start.png');
        this.load.image('minigame_ready', 'assets/ready.png');
    }

    init() {
        super.init();
        this.addPacketListener(PacketType.MINIGAME_RESULT, this.onResultPacket);
    }

    create() {
        this.overlay = this.add.image(WIDTH/2, HEIGHT/2, 'minigame_ready').setOrigin(0, 0);
        this.overlay.setOrigin(0.5, 0.5);
        this.overlay.setDepth(1000);
    }

    protected onAllPlayerReady(): void {
        this.overlay.setTexture('minigame_start');
        setTimeout(() => {
            this.overlay.setVisible(false);
            this.onMinigameStart();
        }, 500);
    }

    abstract onMinigameStart(): void;

    private onResultPacket(packet: MinigameResultPacket) {
        if (packet.data.playerWon.includes(this.aznopoly.client.id)) {
            this.showGameWon();
        } else {
            this.showGameLost();
        }
        setTimeout(() => {
            this.onGameOver();
        }, 1000)
    }

    private showGameWon() {
        this.overlay.setTexture('minigame_won');
        this.overlay.setVisible(true);
    }

    private showGameLost() {
        this.overlay.setTexture('minigame_lost');
        this.overlay.setVisible(true);
    }

    private onGameOver() {
        this.scene.stop();
        this.scene.resume(this.previousScene);
    }

    protected endGame() {
        if (!this.aznopoly.isHost) return;
        const packet: MinigameResultPacket = {
            type: PacketType.MINIGAME_RESULT,
            sender: this.aznopoly.client.id,
            data: {
                playerWon: [],
                sorted: true,
            }
        };

        this.aznopoly.client.sendPacket(packet);
        this.onResultPacket(packet);
    }

}