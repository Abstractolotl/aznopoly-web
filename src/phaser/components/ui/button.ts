import { COLOR_BUTTON_PRIMARY, FONT_STYLE_BUTTON, FONT_STYLE_BUTTON_HOVER, toHex } from "@/style";

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
    private enabled: boolean = true;
    private audioButtonSound?: Audio;
    private playSoundEnabled: boolean = true;
    private onClick?: () => void;
    private image?: Phaser.GameObjects.Image;

    private alphaBackground: number = 0.0;

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

        this.setInteractive();

        this.on('pointerdown', this.onPointerDown.bind(this));
        this.on('pointerup', this.onPointerUp.bind(this));
        this.on('pointerover', this.onHoverIn.bind(this));
        this.on('pointerout', this.onHoverOut.bind(this));

        this.updateButtonShape();
        this.add(this.graphic);
        this.add(this.buttonText);
    }

    public setImage(image: string) {
        if (!this.image) {
            this.image = new Phaser.GameObjects.Image(this.scene, 0, 0, image);
            this.image.setOrigin(0.5, 0.5);
            this.add(this.image);
        } else {
            this.image.setTexture(image);
        }
    }

    public setOnClick(onClick: () => void) {
        this.onClick = onClick;
    }

    public setOnHover(hoverIn: () => void, hoverOut: () => void) {
        this.on('pointerover', hoverIn);
        this.on('pointerout', hoverOut);
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
        this.alpha = 1;
    }

    public disable() {
        this.disableInteractive();
        this.buttonText.setAlpha(0);
        this.alpha = 0;

        this.enabled = false;

        this.isDown = false;
    }

    private onPointerDown() {
        if (!this.enabled) return;

        this.isDown = true;
        this.updateButtonShape();
    }

    private onPointerUp() {
        if (!this.enabled) return;

        this.isDown = false;
        this.isHovered = false;
        this.updateButtonShape();

        if (this.playSoundEnabled) {
            this.playButtonSound();
        }
        this.onClick?.();
    }

    private onHoverIn() {
        if (!this.enabled) return;

        this.scene.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 100,
            onUpdate: (tween) => {
                this.alphaBackground = tween.getValue() * 0.8;
                this.setScale(1 + tween.getValue() * 0.15);
                this.updateButtonShape();
                let c = FONT_STYLE_BUTTON.color as string;
                const colorStart = Phaser.Display.Color.ValueToColor(c);

                let c2 = FONT_STYLE_BUTTON_HOVER.color as string;
                const colorEnd = Phaser.Display.Color.ValueToColor(c2);
                
                const color = Phaser.Display.Color.Interpolate.ColorWithColor(colorStart, colorEnd, 1, tween.getValue());
                const hex = Phaser.Display.Color.RGBToString(color.r, color.g, color.b, color.a);
                this.buttonText.setColor(hex);
            },
        })
    }

    private onHoverOut() {
        if (!this.enabled) return;
        this.isDown = false;

        this.scene.tweens.addCounter({
            from: 1,
            to: 0,
            duration: 100,
            onUpdate: (tween) => {
                this.alphaBackground = tween.getValue() * 0.8;
                this.setScale(1 + tween.getValue() * 0.15);
                this.updateButtonShape();

                let c = FONT_STYLE_BUTTON.color as string;
                const colorStart = Phaser.Display.Color.ValueToColor(c);

                let c2 = FONT_STYLE_BUTTON_HOVER.color as string;
                const colorEnd = Phaser.Display.Color.ValueToColor(c2);
                const color = Phaser.Display.Color.Interpolate.ColorWithColor(colorStart, colorEnd, 1, tween.getValue());
                const hex = Phaser.Display.Color.RGBToString(color.r, color.g, color.b, color.a);
                this.buttonText.setColor(hex);
            },
            onComplete: () => {
            }
        
        })

        this.updateButtonShape();
    }

    private updateButtonShape() {
        this.graphic.clear();
        this.buttonText.setStyle(FONT_STYLE_BUTTON);


        this.graphic.fillStyle(COLOR_BUTTON_PRIMARY, this.alphaBackground);
        this.graphic.fillRoundedRect(-this.width*0.5, -this.height*0.5, this.width, this.height, this.height*0.5);

        this.graphic.lineStyle(OUTLINE_WIDTH, COLOR_BUTTON_PRIMARY, 1);
        this.graphic.strokeRoundedRect(-this.width*0.5, -this.height*0.5, this.width, this.height, this.height*0.5);
    }

    private playButtonSound() {
        this.audioButtonSound?.play();
    }

}