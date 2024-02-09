import { COLOR_CONTRAST, COLOR_PRIMARY } from "../style";
import { easeOutElastic } from "../util";

type Audio = Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound

export const FONT_STYLE_BUTTON: Phaser.Types.GameObjects.Text.TextStyle = { fontFamily: 'Comfortaa', fontSize: 32, color: '#73c8e4', align: 'center' }
export const FONT_STYLE_BUTTON_DOWN: Phaser.Types.GameObjects.Text.TextStyle = { fontFamily: 'Comfortaa', fontSize: 32, color: '#ffffff', align: 'center' }
const MAX_HOVER_TIMER = 4;
export class AzNopolyButton extends Phaser.GameObjects.Container {

    public static preload(scene: Phaser.Scene) {
        scene.load.audio('button-over', 'assets/button_over.mp3');
        scene.load.audio('button-out', 'assets/button_out.mp3');
        scene.load.audio('button-down', 'assets/button_down.mp3');
    }

    private buttonText!: Phaser.GameObjects.Text;
    private outlineWidth: number = 3;
    private outlinePadding: number = 10;
    private graphic!: Phaser.GameObjects.Graphics;

    private audioOver!: Audio;
    private audioOut!: Audio;
    private audioDown!: Audio;
    
    private isDown: boolean = false;
    private isHovered: boolean = false;
    private hoverTimer: number = 0;
    private enabled: boolean = true;

    private onClick: () => void;

    constructor(scene: Phaser.Scene, title: string, x: number, y: number, onClick: () => void) {
        super(scene);
        this.onClick = onClick;

        this.graphic = new Phaser.GameObjects.Graphics(scene);
        this.add(this.graphic);

        this.buttonText = new Phaser.GameObjects.Text(scene, x, y, title, FONT_STYLE_BUTTON);
        this.add(this.buttonText);

        this.buttonText.setOrigin(0.5, 0.5);
        this.buttonText.setInteractive();

        this.buttonText.on('pointerdown', this.onPointerDown.bind(this));
        this.buttonText.on('pointerup', this.onPointerUp.bind(this));
        this.buttonText.on('pointerover', this.onHover.bind(this));
        this.buttonText.on('pointerout', this.onHoverOut.bind(this));

        this.audioOver = scene.sound.add('button-over');
        this.audioOut = scene.sound.add('button-out');
        this.audioOut.volume = 0.5;
        this.audioDown = scene.sound.add('button-down');

        this.updateButtonShape(this.outlineWidth, this.outlinePadding);
    }

    preUpdate(time: number, delta: number) {
        if (this.isHovered) {
            if (this.isDown) {
                this.hoverTimer += delta / 1000 * 20;
            } else {
                this.hoverTimer += delta / 1000 * 10;
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

    public enable() {
        this.buttonText.setInteractive();
        this.buttonText.setAlpha(1);
        this.enabled = true;
    }

    public disable() {
        this.buttonText.disableInteractive();
        this.buttonText.setAlpha(0);

        this.enabled = false;

        this.isDown = false;
        this.isHovered = false;
    }

    private onPointerDown() {
        if (!this.enabled) return;

        this.isDown = true;
        this.isHovered = true;

        //this.audioOver.stop();
    }

    private onPointerUp() {
        if (!this.enabled) return;

        this.isDown = false;
        this.isHovered = false;
        this.hoverTimer = MAX_HOVER_TIMER;

        //this.audioDown.play();
        this.onClick();
    }

    private onHover() {
        if (!this.enabled) return;

        this.isHovered = true;

        //this.audioOver.play();
        //this.audioOver.seek = 1; // cheat
    }

    private onHoverOut() {
        if (!this.enabled) return;

        this.isHovered = false;
        this.hoverTimer = MAX_HOVER_TIMER;
        this.isDown = false;

        //this.audioOver.stop();
        //this.audioOut.play();
        //this.audioOut.seek = 0.25; // cheat
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
            this.graphic.fillStyle(fillColor, 0);
        }
        this.graphic.fillRoundedRect(outlineX, outlineY, this.buttonText.width + paddingH * 2, this.buttonText.height + paddingV * 2, outlineRadius);
        
        this.graphic.lineStyle(outlineWidth, outlineColor, 1);
        this.graphic.strokeRoundedRect(outlineX, outlineY, this.buttonText.width + paddingH * 2, this.buttonText.height + paddingV * 2, outlineRadius);
    }

}