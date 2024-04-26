export enum TextAnimationType {
    NONE,
    SHAKE,
    GRAVITY_FALL,
    FALL_INTO,
    SIDE
}

export interface TextAnimationConfig {
    duration?: number;
    textDelayed?: boolean;
    altText?: string;
    altTextStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    altTextVisible?: boolean;
}

export default class AnimatedText extends Phaser.GameObjects.Container {

    private static CONFIGS: { [key in TextAnimationType]: TextAnimationConfig } = {
        [TextAnimationType.NONE]: {},
        [TextAnimationType.SHAKE]: {
            duration: 1000,
        },
        [TextAnimationType.GRAVITY_FALL]: {
            duration: 1500,
            altTextVisible: true,
        },
        [TextAnimationType.FALL_INTO]: {
            duration: 1500,
            altTextVisible: true,
            textDelayed: true,
        },
        [TextAnimationType.SIDE]: {
            duration: 1000,
            altTextVisible: true,
            textDelayed: true,
        }
    }

    private nextText: string;

    private text: Phaser.GameObjects.Text;
    private altText: Phaser.GameObjects.Text;

    private animationType: TextAnimationType = TextAnimationType.NONE;

    private animationTimer: number = 0;
    private animationDuration: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
        super(scene, x, y);
        this.nextText = text;
        
        this.text = new Phaser.GameObjects.Text(scene, 0, 0, text, style);
        this.text.setOrigin(0.5, 0.5);
        this.text.setPosition(this.text.width / 2, this.text.height / 2);

        this.altText = new Phaser.GameObjects.Text(scene, 0, 0, text, style);
        this.altText.setOrigin(0.5, 0.5);
        this.altText.setPosition(this.altText.width / 2, this.altText.height / 2);
        this.altText.visible = false;

        this.add(this.altText);
        this.add(this.text);
    }

    preUpdate(time: number, delta: number) {
        switch (this.animationType) {
            case TextAnimationType.NONE:
                break;
            case TextAnimationType.SHAKE:
                this.shakeUpdate(time, delta);
                break;
            case TextAnimationType.GRAVITY_FALL:
                this.gravityFallUpdate(time, delta);
                break;
            case TextAnimationType.FALL_INTO:
                this.fallIntoUpdate(time, delta);
                break;
        }
    }

    private reset() {
        this.animationTimer = 0;
        this.animationType = TextAnimationType.NONE;
        this.text.setPosition(this.text.width / 2, this.text.height / 2);
        this.text.setScale(1);
        this.altText.setVisible(false);
    }

    private shakeUpdate(time: number, delta: number) {
        this.animationTimer += delta;
        if (this.animationTimer >= this.animationDuration) {
            this.reset();
        } else {
            this.text.setPosition(this.text.width / 2 + Phaser.Math.Between(-5, 5), this.text.height / 2 + Phaser.Math.Between(-5, 5));
        }
    }

    private gravityFallUpdate(time: number, delta: number) {
        this.animationTimer += delta;
        if (this.animationTimer >= this.animationDuration) {
            this.reset();
        } else {
            const t = this.animationTimer / this.animationDuration;

            const x = (this.text.x + this.text.width - this.altText.width);
            const y = Phaser.Math.Easing.Back.In(t) * 250;
            this.altText.setPosition(x, this.altText.height / 2 + y);
            this.altText.setAlpha(0.8 - t * 0.8);
            this.altText.setRotation( 15 / 180 * Math.PI * (t));
        }
    }

    private fallIntoUpdate(time: number, delta: number) {
        this.animationTimer += delta;
        if (this.animationTimer >= this.animationDuration) {
            this.reset();
        } else {
            const t = this.animationTimer / this.animationDuration;
            const t2 = Math.max(t - 0.45, 0);

            const y = Phaser.Math.Easing.Back.Out(t, 1.1) * 250;
            
            this.altText.setAlpha(0.5 - t * 0.25);
            this.altText.setPosition(this.altText.width / 2, this.altText.height / 2 + y - 250);
            if (t >= 0.5) {
                this.text.setPosition(this.text.width / 2, this.text.height / 2 + y - 250);
                this.text.setScale(1 + t2 * 0.15);
            }
            if (t >= 0.9) {
                this.text.setText(this.nextText);
            }
        }
    }

    public setText(text: string) {
        this.text.setText(text);
        this.text.setPosition(this.text.width / 2, this.text.height / 2);
        this.text.setAlpha(1);
        this.text.setRotation(0);
    }

    public setTextAnimated(text: string, animationType: TextAnimationType, config?: TextAnimationConfig) {
        config = Object.assign({}, AnimatedText.CONFIGS[animationType], config);

        if (!config.textDelayed) {
            this.setText(text);
        }
        this.nextText = text;

        this.altText.setText(config.altText || this.text.text);
        this.altText.setPosition(0, 0);
        this.altText.setStyle(config.altTextStyle || this.text.style);
        this.altText.setVisible(config.altTextVisible !== undefined ? config.altTextVisible : false);

        this.animationType = animationType;
        this.animationDuration = config.duration || 0;

        switch (animationType) {
            case TextAnimationType.SIDE:
                this.setSide();
                break;
        }
    }

    private setSide() {
        this.altText.x = this.text.x + this.text.width + 10;
        this.altText.y = this.text.y;
        
        const startX = this.text.x + this.text.width + 10;
        const endX  = this.text.x;
        setTimeout(() => {
            this.scene.tweens.addCounter({
                from: 0,
                to: 1,
                duration: this.animationDuration * 0.25,
                onUpdate: (tween) => {
                    this.altText.x = tween.getValue() * (endX - startX) + startX;
                    this.altText.alpha = 1 - tween.getValue();
                },
                onComplete: () => {
                    this.text.setText(this.nextText);
                }
            })
        }, this.animationDuration * 0.75);
    }

}