import { Scene } from "phaser";
import GameObjects = Phaser.GameObjects;
import { COLOR_CONTRAST, COLOR_PRIMARY } from "../style";
import { easeOutElastic } from "../util";


export const FONT_STYLE_BUTTON: Phaser.Types.GameObjects.Text.TextStyle = { fontFamily: 'Comfortaa', fontSize: 32, color: '#73c8e4', align: 'center' }
export const FONT_STYLE_BUTTON_DOWN: Phaser.Types.GameObjects.Text.TextStyle = { fontFamily: 'Comfortaa', fontSize: 32, color: '#ffffff', align: 'center' }
const MAX_HOVER_TIMER = 4;
export class AzNopolyButton {

    private x: number;
    private y: number;
    private buttonText!: GameObjects.Text;
    private outlineWidth: number;
    private outlinePadding: number;
    private graphic!: Phaser.GameObjects.Graphics;
    
    private isDown: boolean = false;
    private isHovered: boolean = false;
    private hoverTimer: number = 0;
    
    constructor(scene: Scene, title: string, x: number, y: number, onClick: () => void, outlineWidth: number = 3, outlinePadding: number = 10) {
        this.x = x;
        this.y = y;
        this.outlineWidth = outlineWidth;
        this.outlinePadding = outlinePadding;

        this.graphic = scene.add.graphics();
        this.buttonText = scene.add.text(x, y, title, FONT_STYLE_BUTTON);
        this.buttonText.setOrigin(0.5, 0.5);
        this.buttonText.setInteractive();

        this.buttonText.on('pointerdown', this.onClick.bind(this));
        this.buttonText.on('pointerup', this.onPointerUp.bind(this));
        this.buttonText.on('pointerover', this.onHover.bind(this));
        this.buttonText.on('pointerout', this.onHoverOut.bind(this));

        this.updateButtonShape(this.outlineWidth, this.outlinePadding);
    }

    public update(time: number, delta: number) {
        if (this.isHovered) {
            if (this.isDown) {
                this.hoverTimer += delta / 1000 * 5;
            } else {
                this.hoverTimer += delta / 1000;
            }
            this.hoverTimer = Math.min(this.hoverTimer, MAX_HOVER_TIMER);
            const t = Math.min(Math.max(this.hoverTimer / MAX_HOVER_TIMER, 0), 1);
            const padding = Phaser.Math.Linear(this.outlinePadding, this.outlinePadding + 15, t)
            this.updateButtonShape(this.outlineWidth, padding);
        } else if (this.hoverTimer > 0) {
            this.hoverTimer -= delta / 1000 * 5;
            this.hoverTimer = Math.max(this.hoverTimer, 0);
            const t = Math.min(Math.max(this.hoverTimer / MAX_HOVER_TIMER, 0), 1);
            const padding = Phaser.Math.Linear(this.outlinePadding + 15, this.outlinePadding, easeOutElastic(1-t))
            this.updateButtonShape(this.outlineWidth, padding);
        }
    }

    private onClick() {
        console.log('clicked');
        this.isDown = true;
        this.isHovered = true;
    }

    private onPointerUp() {
        this.isDown = false;
        this.isHovered = false;
    }

    private onHover() {
        this.isHovered = true;
        console.log('hovered');
    }

    private onHoverOut() {
        this.isHovered = false;
        this.hoverTimer = MAX_HOVER_TIMER;
        this.isDown = false;
    }

    private updateButtonShape(outlineWidth: number, outlinePadding: number) {
        const outlineColor = COLOR_PRIMARY;
        const fillColor = COLOR_CONTRAST;

        const outlineRadius = (this.buttonText.height + 2 * outlinePadding) * 0.5;
        const paddingH = outlinePadding + outlineRadius * 0.5;
        const paddingV = outlinePadding;

        const outlineX = this.buttonText.x - this.buttonText.originX * this.buttonText.width - paddingH;
        const outlineY = this.buttonText.y - this.buttonText.originY * this.buttonText.height - paddingV;

        this.graphic.clear();
        if (this.isDown) {
            this.buttonText.setStyle(FONT_STYLE_BUTTON_DOWN);
            this.graphic.fillStyle(outlineColor, 1);
        } else {
            this.buttonText.setStyle(FONT_STYLE_BUTTON);
            this.graphic.fillStyle(fillColor, 1);
        }
        this.graphic.fillRoundedRect(outlineX, outlineY, this.buttonText.width + paddingH * 2, this.buttonText.height + paddingV * 2, outlineRadius);
        
        this.graphic.lineStyle(outlineWidth, outlineColor, 1);
        this.graphic.strokeRoundedRect(outlineX, outlineY, this.buttonText.width + paddingH * 2, this.buttonText.height + paddingV * 2, outlineRadius);
    }

}