import {COLOR_CONTRAST, COLOR_PRIMARY} from "@/style.ts";
import {FONT_STYLE_BUTTON} from "@/phaser/components/ui/button.ts";

export class AzNopolySlider extends Phaser.GameObjects.Container {

    public static preload(scene: Phaser.Scene) {
    }

    private max: number;
    private value = 10;
    private graphic!: Phaser.GameObjects.Graphics;

    private disabled = false;
    private dragging = false;

    private onChange: (value: number) => void;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, max: number, onChange: (value: number) => void) {
        super(scene, x + width/2, y + height/2);

        this.height = height;
        this.width = width;

        this.max = max
        this.onChange = onChange;

        this.graphic = new Phaser.GameObjects.Graphics(scene);

        // background
        this.graphic.fillStyle(COLOR_PRIMARY);
        this.graphic.fillRect(-width/2, -height/2, width, height);

        // fill
        this.graphic.fillStyle(COLOR_CONTRAST);
        this.graphic.fillRect(-width/2 + 5, -height/2 + 5, this.value * (width / this.max) -10, height - 10);

        const text = new Phaser.GameObjects.Text(scene, 0, 0, "Refill", FONT_STYLE_BUTTON);
        text.setOrigin(0.5, 0.5);

        this.add(this.graphic);
        this.add(text);

        this.setSize(width, height);

        this.initDrag()
    }

    preUpdate(time: number, delta: number) {
        this.graphic.clear()

        this.graphic.fillStyle(COLOR_PRIMARY);
        this.graphic.fillRect(-this.width/2, -this.height/2, this.width, this.height);

        // fill
        this.graphic.fillStyle(COLOR_CONTRAST);
        this.graphic.fillRect(-this.width/2 + 5, -this.height/2 + 5, this.value * (this.width / this.max) -10, this.height - 10);

    }

    reset(){
        this.value = 10;
    }

    public changeMax(max: number){
        this.max = max;
    }

    public getMax(){
        return this.max;
    }

    public disable(){
        this.value = 10;
        this.disabled = true;
        this.dragging = false;
    }

    public enable() {
        this.disabled = false;
    }

    private initDrag() {
        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(0, 0, this.height, this.width),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true,
            draggable: true
        }, Phaser.Geom.Rectangle.Contains);

        this.on('dragstart', (event: any) => {
            if (this.disabled) return;

            this.dragging = true;
        });

        this.on('drag', (event: any) => {
            if (this.disabled) return;
            if (!this.dragging) return;

            const dragOffset = new Phaser.Math.Vector2((event.x * 1.5) - this.x, event.y - this.y);
            this.value = Math.max(10, Math.min(this.max, dragOffset.x / (this.width - 10) * this.max));

            this.onChange(this.value);
            if (this.value === this.max) {
                this.dragging = false;
            }
        });
    }


}