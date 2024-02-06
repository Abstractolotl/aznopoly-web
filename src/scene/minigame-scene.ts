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

export interface MinigameReadyPacket extends PlayerPacket {
    type: PacketType.MINIGAME_READY,
    data: { }
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

    init(data: any) {
        super.init(data);
        this.addPacketListener(PacketType.MINIGAME_READY, this.onMiniGameReady.bind(this));
        this.addPacketListener(PacketType.MINIGAME_RESULT, this.onResultPacket.bind(this));
        
        console.log("Iniated", data)
        this.previousScene = data.previousScene;
    }

    create() {
        this.overlay = this.add.image(WIDTH/2, HEIGHT/2, 'minigame_ready').setOrigin(0, 0);
        this.overlay.setOrigin(0.5, 0.5);
        this.overlay.setDepth(1000);

        super.create();
    }

    protected onAllPlayerReady(): void {
        setTimeout(() => {
            this.overlay.setVisible(false);
            this.startMiniGame();
        }, 1500);
    }

    private startMiniGame() {
        const packet: MinigameReadyPacket = {
            type: PacketType.MINIGAME_READY,
            sender: this.aznopoly.client.id,
            data: {}
        };

        this.aznopoly.client.sendPacket(packet);
        setTimeout(() => {
            this.onMinigameStart();
        }, 50) // simulate network delay
    }

    abstract onMinigameStart(): void;

    private onMiniGameReady(_: MinigameReadyPacket) {
        this.overlay.setVisible(false);
    }

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
        this.scene.wake(this.previousScene);
    }

    protected endGame(playerWon: string[], sorted: boolean) {
        if (!this.aznopoly.isHost) return;
        const packet: MinigameResultPacket = {
            type: PacketType.MINIGAME_RESULT,
            sender: this.aznopoly.client.id,
            data: {
                playerWon,
                sorted,
            }
        };

        this.aznopoly.client.sendPacket(packet);
        this.onResultPacket(packet);
    }

}