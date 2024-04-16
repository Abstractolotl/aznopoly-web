import { COLOR_BACKGROUND_LIGHT, COLOR_FRAME_BACKGROUND, COLOR_FRAME_BACKGROUND_TRANSPARENCY, COLOR_FRAME_DECORATION, COLOR_PRIMARY, FONT_STYLE_HEADLINE, FONT_STYLE_HEADLINE_SIZE, FRAME_BORDER_RADIUS, FRAME_BORDER_WIDTH, FRAME_PADDING } from "@/style";

export default class AzNopolyPanel extends Phaser.GameObjects.Container {

    private headline?: Phaser.GameObjects.Text;
    protected graphics: Phaser.GameObjects.Graphics;
    protected contentRect: Phaser.Geom.Rectangle;
    protected topbarRect: Phaser.Geom.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, headline?: string) {
        super(scene, x, y);
        this.setSize(width, height)
        
        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.graphics.fillStyle(COLOR_FRAME_BACKGROUND, COLOR_FRAME_BACKGROUND_TRANSPARENCY);
        this.graphics.fillRoundedRect(0, 0, width, height, FRAME_BORDER_RADIUS);
        this.graphics.lineStyle(FRAME_BORDER_WIDTH, COLOR_PRIMARY, 1);
        this.graphics.strokeRoundedRect(0, 0, width, height, FRAME_BORDER_RADIUS);

        this.add(this.graphics);

        if (headline) { 
            this.topbarRect = new Phaser.Geom.Rectangle(FRAME_PADDING, 0, width - FRAME_PADDING * 2, FONT_STYLE_HEADLINE_SIZE + FRAME_PADDING * 1.5);
            this.contentRect = new Phaser.Geom.Rectangle(FRAME_PADDING, this.topbarRect.height + FRAME_PADDING, this.topbarRect.width, height - this.topbarRect.height - FRAME_PADDING * 2);

            this.headline = new Phaser.GameObjects.Text(scene, this.topbarRect.x, this.topbarRect.y + this.topbarRect.height * 0.55, headline, FONT_STYLE_HEADLINE);
            this.headline.setOrigin(0, 0.5);

            this.add(this.headline);

            this.graphics.fillStyle(COLOR_FRAME_DECORATION, 0.75);
            this.graphics.fillRect(this.topbarRect.x, this.topbarRect.y + this.topbarRect.height, this.topbarRect.width, 1);
        } else {
            this.topbarRect = new Phaser.Geom.Rectangle(0, 0, width, 0);
            this.contentRect = new Phaser.Geom.Rectangle(FRAME_PADDING, FRAME_PADDING, width - FRAME_PADDING * 2, height - FRAME_PADDING * 2);
        }
    }

}