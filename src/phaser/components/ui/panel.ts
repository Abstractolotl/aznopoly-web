import { COLOR_BACKGROUND_LIGHT, COLOR_FRAME_BACKGROUND, COLOR_FRAME_BACKGROUND_TRANSPARENCY, COLOR_FRAME_DECORATION, COLOR_PRIMARY, FONT_STYLE_PANEL_HEADLINE, FONT_STYLE_HEADLINE_PANEL_SIZE, FRAME_BORDER_RADIUS, FRAME_BORDER_WIDTH, FRAME_PADDING } from "@/style";

export interface PanelOptions {
    headline?: string;
    origin?: Phaser.Math.Vector2;
    alive?: boolean;
}

export default class AzNopolyPanel extends Phaser.GameObjects.Container {

    private headline?: Phaser.GameObjects.Text;
    protected graphics: Phaser.GameObjects.Graphics;
    public contentRect: Phaser.Geom.Rectangle;
    protected topbarRect: Phaser.Geom.Rectangle;

    private origin: Phaser.Math.Vector2;
    private alive: boolean = false;

    private _hover: boolean = false;
    private forceHover: boolean = false;
    private _bounds: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle();

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, { headline, origin, alive }: PanelOptions = {}) {
        super(scene, x, y);
        this.setSize(width, height)
        this.origin = origin || new Phaser.Math.Vector2(0, 0);
        this.alive = alive || false;
        
        this.graphics = new Phaser.GameObjects.Graphics(scene);
        //this.graphics.setPosition(-origin.x, -origin.y);

        this.add(this.graphics);
        if (headline) { 
            this.topbarRect = new Phaser.Geom.Rectangle(-this.origin.x + FRAME_PADDING, -this.origin.y , width - FRAME_PADDING * 2, FONT_STYLE_HEADLINE_PANEL_SIZE + FRAME_PADDING * 1.5);
            this.contentRect = new Phaser.Geom.Rectangle(-this.origin.x + FRAME_PADDING, -this.origin.y + this.topbarRect.height + FRAME_PADDING, this.topbarRect.width, height - this.topbarRect.height - FRAME_PADDING * 2);
            this.headline = new Phaser.GameObjects.Text(scene, this.topbarRect.x, this.topbarRect.y + this.topbarRect.height * 0.55, headline, FONT_STYLE_PANEL_HEADLINE);
            this.headline.setOrigin(0, 0.5);
            this.add(this.headline);
        } else {
            this.topbarRect = new Phaser.Geom.Rectangle(-this.origin.x , -this.origin.y, width, 0);
            this.contentRect = new Phaser.Geom.Rectangle(-this.origin.x + FRAME_PADDING, -this.origin.y + FRAME_PADDING, width - FRAME_PADDING * 2, height - FRAME_PADDING * 2);
        }

        this.drawPanel();

        if (this.alive) {
            this.setInteractive({
                hitArea: new Phaser.Geom.Rectangle(0, 0, width, height),
                hitAreaCallback: Phaser.Geom.Rectangle.Contains
            });
            this.scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove.bind(this), this);
        }
    }

    preUpdate(time: number, delta: number): void {
        if (!this.forceHover && (!this.alive || !this._hover)) {
            return;
        }
        const size = 0.005;
        this.graphics.setScale(Math.sin(time / 150) * size + size + 1);
    }

    public setForceHover(hover: boolean) {
        this.forceHover = hover;
    }

    private drawPanel() {
        this.graphics.clear();
        this.graphics.fillStyle(COLOR_FRAME_BACKGROUND, COLOR_FRAME_BACKGROUND_TRANSPARENCY * 0.75);
        this.graphics.fillRoundedRect(-this.origin.x, -this.origin.y, this.width, this.height, FRAME_BORDER_RADIUS);
        this.graphics.lineStyle(FRAME_BORDER_WIDTH, COLOR_FRAME_BACKGROUND, COLOR_FRAME_BACKGROUND_TRANSPARENCY);
        this.graphics.strokeRoundedRect(-this.origin.x - FRAME_BORDER_WIDTH * 0.5, -this.origin.y - FRAME_BORDER_WIDTH * 0.5, this.width + FRAME_BORDER_WIDTH, this.height + FRAME_BORDER_WIDTH, FRAME_BORDER_RADIUS + FRAME_BORDER_WIDTH * 0.5);

        if (this.headline) {
            this.graphics.fillStyle(COLOR_FRAME_DECORATION);
            this.graphics.fillRect(-this.origin.x + this.topbarRect.x, -this.origin.y + this.topbarRect.y + this.topbarRect.height - 1, this.topbarRect.width, 1);
        }
    }

    private onPointerMove(pointer: Phaser.Input.Pointer) {
        const matrix = this.getBoundsTransformMatrix();
        this._bounds.setPosition(matrix.getX(0, 0) - this.origin.x, matrix.getY(0, 0) - this.origin.y);
        this._bounds.setSize(this.width, this.height);
        if (this._bounds.contains(pointer.x, pointer.y)) {
            if (!this._hover) {
                this._hover = true;
                this.onHoverIn();
            }
            if (this.forceHover) {
                this.forceHover = false;
            }
        } else {
            if (this._hover) {
                this._hover = false;
                this.onHoverOut();
            }
        }
    }

    private onHoverIn() {
        this.scene.tweens.addCounter({
            from: 1,
            to: 1.05,
            duration: 100,
            onUpdate: (tween) => {
                this.setScale(tween.getValue());
            }
        });
    }

    private onHoverOut() {
        this.scene.tweens.addCounter({
            from: 1.05,
            to: 1,
            duration: 100,
            onUpdate: (tween) => {
                this.setScale(tween.getValue());
            }
        });
    }

    public setHeadline(headline: string) {
        if (this.headline) {
            this.headline.text = headline;
        }
    }

    public setBorder(color: number, width: number = 4) {
        this.drawPanel();
        this.graphics.lineStyle(width, color, 1);
        this.graphics.strokeRoundedRect(0, 0, this.width, this.height, FRAME_BORDER_RADIUS);
    }

}