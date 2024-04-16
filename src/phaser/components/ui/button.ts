import { COLOR_BUTTON_PRIMARY, FONT_STYLE_BUTTON, FONT_STYLE_BUTTON_HOVER } from "@/style";

type Audio = Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound

const MAX_HOVER_TIMER = 0.05;
const OUTLINE_WIDTH = 2;
const OUTLINE_VERT_SPACING = 50;
const OUTLINE_HOR_SPACING = 20;
export class AzNopolyButton extends Phaser.GameObjects.Container {

    static preload(scene: Phaser.Scene) {
        scene.load.audio("soundEffect", "assets/audio/button_press_sound1.mp3");
    }

    private buttonText!: Phaser.GameObjects.Text;
    private graphic!: Phaser.GameObjects.Graphics;

    private isDown: boolean = false;
    private isHovered: boolean = false;
    private hoverTimer: number = 0;
    private enabled: boolean = true;
    private audioButtonSound?: Audio;
    private playSoundEnabled: boolean = true;
    private onClick?: () => void;

    constructor(scene: Phaser.Scene, title: string, x: number, y: number, width?: number) {
        super(scene);

        this.buttonText = new Phaser.GameObjects.Text(scene, 0, 0, title, FONT_STYLE_BUTTON);
        this.buttonText.setOrigin(0.5, 0.5);

        if (width === undefined) {
            this.setSize(this.buttonText.width + OUTLINE_VERT_SPACING, this.buttonText.height + OUTLINE_HOR_SPACING);
            this.setPosition(x, y);
        } else {
            this.setSize(width, this.buttonText.height + OUTLINE_HOR_SPACING);
            this.setPosition(x + width * 0.5, y + this.height * 0.5)
        }

        //this.audioButtonSound = scene.sound.add("soundEffect");
        this.graphic = new Phaser.GameObjects.Graphics(scene);

        this.setInteractive()

        this.on('pointerdown', this.onPointerDown.bind(this));
        this.on('pointerup', this.onPointerUp.bind(this));
        this.on('pointerover', this.onHover.bind(this));
        this.on('pointerout', this.onHoverOut.bind(this));

        this.updateButtonShape();
        this.add(this.graphic);
        this.add(this.buttonText);

    }

    public setOnClick(onClick: () => void) {
        this.onClick = onClick;
    }

    preUpdate(time: number, delta: number) {
        /*
        if (this.isHovered) {
            this.hoverTimer += delta / 1000;
            this.hoverTimer = Math.min(MAX_HOVER_TIMER, this.hoverTimer);

        } else {
            this.hoverTimer -= delta / 1000;
            this.hoverTimer = Math.max(0, this.hoverTimer);
        }

        const t = Math.min(1, this.hoverTimer / MAX_HOVER_TIMER);
        const targetScale = HOVER_SCALE + (2 * HOVER_SCALE_PIXEL / this.width);
        this.graphic.scale = t * (targetScale - 1) + 1;
        */
    }

    public enable() {
        this.setInteractive();
        this.buttonText.setAlpha(1);
        this.enabled = true;
    }

    public disable() {
        this.disableInteractive();
        this.buttonText.setAlpha(0);

        this.enabled = false;

        this.isDown = false;
        this.isHovered = false;
    }

    private onPointerDown() {
        if (!this.enabled) return;

        this.isDown = true;
        this.isHovered = true;
        this.updateButtonShape();

        //this.audioOver.stop();
    }

    private onPointerUp() {
        if (!this.enabled) return;

        this.isDown = false;
        this.isHovered = false;
        this.hoverTimer = MAX_HOVER_TIMER;
        this.updateButtonShape();

        if (this.playSoundEnabled) {
            this.playButtonSound();
        }
        this.onClick?.();
    }

    private onHover() {
        if (!this.enabled) return;

        this.isHovered = true;
        this.updateButtonShape();
    }

    private onHoverOut() {
        if (!this.enabled) return;

        this.isHovered = false;
        this.hoverTimer = MAX_HOVER_TIMER;
        this.isDown = false;

        this.updateButtonShape();
    }

    private updateButtonShape() {
        const outlineColor = COLOR_BUTTON_PRIMARY;
        //const fillColor = COLOR_BUTTON_PRIMARY;

        this.graphic.clear();
        this.buttonText.setStyle(FONT_STYLE_BUTTON);
        if (this.isHovered) {

            if (this.isDown) {
                this.graphic.fillStyle(COLOR_BUTTON_PRIMARY, 1);
            } else {
                this.graphic.fillStyle(COLOR_BUTTON_PRIMARY, 0.8);
            }
            
            this.graphic.fillRoundedRect(-this.width*0.5, -this.height*0.5, this.width, this.height, this.height*0.5);
            this.buttonText.setStyle(FONT_STYLE_BUTTON_HOVER);
        }

        // if (this.isDown) {
        //     this.buttonText.setStyle(FONT_STYLE_BUTTON_DOWN);
        //     this.graphic.fillStyle(outlineColor, 1);
        // } else {
        //     this.buttonText.setStyle(FONT_STYLE_BUTTON);
        //     this.graphic.fillStyle(fillColor, 1);
        // }

        //this.graphic.fillStyle(fillColor, 1);
        //this.graphic.fillRect(-this.width*0.5, -this.height*0.5, this.width, this.height);
        
        this.graphic.lineStyle(OUTLINE_WIDTH, COLOR_BUTTON_PRIMARY, 1);
        this.graphic.strokeRoundedRect(-this.width*0.5, -this.height*0.5, this.width, this.height, this.height*0.5);
        //this.graphic.strokeRect(-this.width*0.5, -this.height*0.5, this.width, this.height);
    }

    private playButtonSound() {
        this.audioButtonSound?.play();
    }

}