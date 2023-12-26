import { Scene } from "phaser";
import GameObjects = Phaser.GameObjects;
import { COLOR_CONTRAST, COLOR_PRIMARY, FONT_STYLE_BUTTON, FONT_STYLE_BUTTON_HOVER } from "../style";
import { easeOutElastic } from "../util";


const MAX_HOVER_TIMER = 4;
export class AzNopolyButton {

    private x: number;
    private y: number;
    private button!: GameObjects.Text;
    private outlineWidth: number;
    private outlinePadding: number;
    private graphic!: Phaser.GameObjects.Graphics;
    
    private isHovered: boolean = false;
    private hoverTimer: number = 0;
    
    constructor(scene: Scene, title: string, x: number, y: number, onClick: () => void, outlineWidth: number = 3, outlinePadding: number = 10) {
        this.x = x;
        this.y = y;
        this.outlineWidth = outlineWidth;
        this.outlinePadding = outlinePadding;

        this.graphic = scene.add.graphics();
        this.button = scene.add.text(x, y, title, FONT_STYLE_BUTTON);
        this.button.setOrigin(0.5, 0.5);
        this.button.setInteractive();
        this.button.on('pointerdown', this.onClick.bind(this));
        this.button.on('pointerover', this.onHover.bind(this));
        this.button.on('pointerout', this.onHoverOut.bind(this));

        this.updateOutline(this.outlineWidth, this.outlinePadding);
    }

    private onClick() {
        console.log('clicked');
    }

    public update(time: number, delta: number) {
        if (this.isHovered) {
            this.hoverTimer += delta / 1000;
            this.hoverTimer = Math.min(this.hoverTimer, MAX_HOVER_TIMER);
            const t = Math.min(Math.max(this.hoverTimer / MAX_HOVER_TIMER, 0), 1);
            const padding = Phaser.Math.Linear(this.outlinePadding, this.outlinePadding + 15, t)
            this.updateOutline(this.outlineWidth, padding);
        } else if (this.hoverTimer > 0) {
            this.hoverTimer -= delta / 1000 * 5;
            this.hoverTimer = Math.max(this.hoverTimer, 0);
            const t = Math.min(Math.max(this.hoverTimer / MAX_HOVER_TIMER, 0), 1);
            const padding = Phaser.Math.Linear(this.outlinePadding + 15, this.outlinePadding, easeOutElastic(1-t))
            this.updateOutline(this.outlineWidth, padding);
        }
    }

    private onHover() {
        this.isHovered = true;
    }

    private onHoverOut() {
        this.isHovered = false;
        this.hoverTimer = MAX_HOVER_TIMER;
    }

    private updateOutline(outlineWidth: number, outlinePadding: number) {
        const outlineColor = COLOR_PRIMARY;
        const fillColor = COLOR_CONTRAST;

        const outlineRadius = (this.button.height + 2 * outlinePadding) * 0.5;
        const paddingH = outlinePadding + outlineRadius * 0.5;
        const paddingV = outlinePadding;

        const outlineX = this.button.x - this.button.originX * this.button.width - paddingH;
        const outlineY = this.button.y - this.button.originY * this.button.height - paddingV;

        this.graphic.clear(); // Clear the graphics object
        this.graphic.fillStyle(fillColor, 1);
        this.graphic.fillRoundedRect(outlineX, outlineY, this.button.width + paddingH * 2, this.button.height + paddingV * 2, outlineRadius);
        
        this.graphic.lineStyle(outlineWidth, outlineColor, 1);
        this.graphic.strokeRoundedRect(outlineX, outlineY, this.button.width + paddingH * 2, this.button.height + paddingV * 2, outlineRadius);
    }

}