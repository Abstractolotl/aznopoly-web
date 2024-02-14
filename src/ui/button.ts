    import { COLOR_CONTRAST, COLOR_PRIMARY } from "../style";
import { easeOutElastic } from "../util";

type Audio = Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound

export const FONT_STYLE_BUTTON: Phaser.Types.GameObjects.Text.TextStyle = { font: '600 32px Comfortaa', color: '#ffffff', align: 'center' }
export const FONT_STYLE_BUTTON_DOWN: Phaser.Types.GameObjects.Text.TextStyle = { font: '600 32px Comfortaa', color: '#ffffff', align: 'center' }

const MAX_HOVER_TIMER = 0.05;
const HOVER_SCALE = 1.15
const HOVER_SCALE_PIXEL = 5
export class AzNopolyButton extends Phaser.GameObjects.Container {

    public static preload(scene: Phaser.Scene) {
    }

    private buttonText!: Phaser.GameObjects.Text;
    private graphic!: Phaser.GameObjects.Graphics;

    private isDown: boolean = false;
    private isHovered: boolean = false;
    private hoverTimer: number = 0;
    private enabled: boolean = true;

    private onClick: () => void;

    constructor(scene: Phaser.Scene, title: string, x: number, y: number, width: number, height: number, onClick: () => void) {
        super(scene, x + width/2, y + height/2);
        this.onClick = onClick;

        this.graphic = new Phaser.GameObjects.Graphics(scene);
        
        this.buttonText = new Phaser.GameObjects.Text(scene, 0, 0, title, FONT_STYLE_BUTTON);
        this.buttonText.setOrigin(0.5, 0.5);

        this.setSize(width, height);
        this.setInteractive()

        this.on('pointerdown', this.onPointerDown.bind(this));
        this.on('pointerup', this.onPointerUp.bind(this));
        this.on('pointerover', this.onHover.bind(this));
        this.on('pointerout', this.onHoverOut.bind(this));

        this.updateButtonShape();
        this.add(this.graphic);
        this.add(this.buttonText);

    }

    preUpdate(time: number, delta: number) {
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
        this.updateButtonShape();

        //this.audioOver.stop();
    }

    private onPointerUp() {
        if (!this.enabled) return;

        this.isDown = false;
        this.isHovered = false;
        this.hoverTimer = MAX_HOVER_TIMER;
        this.updateButtonShape();

        //this.audioDown.play();
        this.onClick();
    }

    private onHover() {
        if (!this.enabled) return;

        this.isHovered = true;
    }

    private onHoverOut() {
        if (!this.enabled) return;

        this.isHovered = false;
        this.hoverTimer = MAX_HOVER_TIMER;
        this.isDown = false;
    }

    private updateButtonShape() {
        const outlineColor = COLOR_PRIMARY;
        const fillColor = COLOR_CONTRAST;

        this.graphic.clear();
        if (this.isDown) {
            this.buttonText.setStyle(FONT_STYLE_BUTTON_DOWN);
            this.graphic.fillStyle(outlineColor, 1);
        } else {
            this.buttonText.setStyle(FONT_STYLE_BUTTON);
            this.graphic.fillStyle(fillColor, 1);
        }
        this.graphic.fillRect(-this.width*0.5, -this.height*0.5, this.width, this.height);
        
        this.graphic.lineStyle(5, fillColor, 1);
        this.graphic.strokeRect(-this.width*0.5, -this.height*0.5, this.width, this.height);
    }

}