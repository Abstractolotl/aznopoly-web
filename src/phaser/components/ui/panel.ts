import { COLOR_BACKGROUND_LIGHT, COLOR_PRIMARY, FRAME_BORDER_RADIUS } from "@/style";

export default class AzNopolyPanel extends Phaser.GameObjects.Container {

    private graphics!: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        
        this.setSize(width, height)
        this.graphics = scene.add.graphics();
        this.graphics.fillStyle(COLOR_BACKGROUND_LIGHT, 0.9);
        this.graphics.fillRoundedRect(0, 0, width, height, FRAME_BORDER_RADIUS);
        this.graphics.lineStyle(5, COLOR_PRIMARY, 1);
        this.graphics.strokeRoundedRect(0, 0, width, height, FRAME_BORDER_RADIUS);

        this.add(this.graphics);
    }

}