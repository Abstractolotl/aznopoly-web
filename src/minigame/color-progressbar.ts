import { FRAME_BORDER_RADIUS } from "@/style";


export default class ColorProgressBar extends Phaser.GameObjects.Container {

    private graphics: Phaser.GameObjects.Graphics;

    private colors: Map<number, number> = new Map();
    private barWidth: number;
    private barHeight: number;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.barWidth = width;
        this.barHeight = height;

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.drawBar();

        this.add(this.graphics);
    }

    public setColors(colors: Map<number, number>) {
        this.colors = colors;
        this.drawBar();
    }

    private drawBar() {
        this.graphics.clear();

        let progress = 0;
        for (const[color, percentage] of this.colors.entries()) {
            this.graphics.fillStyle(color);
            this.graphics.fillRect(this.barWidth * progress, 0, this.barWidth * percentage, this.barHeight);
            progress += percentage;
        }
        this.graphics.fillStyle(0x000000);
        this.graphics.fillRect(this.barWidth * progress, 0, this.barWidth * (1 - progress), this.barHeight);
        
        this.graphics.lineStyle(2, 0xffffff);
        this.graphics.strokeRoundedRect(-1, -1, this.barWidth+2, this.barHeight+2, FRAME_BORDER_RADIUS);
        this.graphics.lineStyle(1, 0x000000);
        this.graphics.strokeRoundedRect(-3, -3, this.barWidth+6, this.barHeight+6, FRAME_BORDER_RADIUS);
    }

}