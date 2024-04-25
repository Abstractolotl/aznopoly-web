import WaterDropSceneController from "@/phaser/scenes/minigame/water-drop-scene-controller";

const STROKE = 5;
const SHAKE_INTENSITY = 5;
export default class Glass extends Phaser.GameObjects.Container {

    private graphics!: Phaser.GameObjects.Graphics;
    private shakeTimer: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        scene.physics.world.enable(this);
        const body = this.body! as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.drawGlass(0);

        this.add(this.graphics);
    }

    preUpdate(time: number, delta: number) {
        if (this.shakeTimer > 0) {
            this.shakeTimer -= delta;
            this.graphics.x = Math.random() * SHAKE_INTENSITY - SHAKE_INTENSITY / 2;
            this.graphics.y = Math.random() * SHAKE_INTENSITY - SHAKE_INTENSITY / 2;
            this.graphics.rotation = Math.random() * SHAKE_INTENSITY / 100 - SHAKE_INTENSITY / 200;

            if (this.shakeTimer <= 0) {
                this.graphics.x = 0;
                this.graphics.y = 0;
                this.graphics.rotation = 0;
            }
        }
    }

    public shake(shakeTime: number) {
        this.shakeTimer = shakeTime;
    }

    public setSize(width: number, height: number) {
        super.setSize(width, height);

        const body = this.body! as Phaser.Physics.Arcade.Body;
        body.setOffset(0, this.height)
        body.setSize(this.width + STROKE, 25);
        return this;
    }

    
    private drawGlass(fillPercent: number) {
        this.graphics.clear();

        // Outline
        this.graphics.fillStyle(0xaaaaaa, 1);
        this.graphics.fillRect(-this.width / 2, -this.height / 2, STROKE, this.height);
        this.graphics.fillRect(this.width / 2, -this.height / 2, STROKE, this.height);
        this.graphics.fillRect(-this.width / 2, this.height / 2, this.width + STROKE, STROKE);
        
        // Fill
        this.graphics.fillStyle(0x0000ff, 1);
        this.graphics.fillRect(-this.width / 2 + STROKE, -this.height / 2 + this.height * (1 - fillPercent), this.width - STROKE, this.height * fillPercent);

        // Minimum Fill Marker
        this.graphics.fillStyle(0xff0000, 1);
        const markerX = this.width / 2 + STROKE;
        const markerY = -this.height / 2 + this.height * (1 - WaterDropSceneController.MIN_FILL_THRESHOLD);
        this.graphics.fillTriangle(markerX, markerY, markerX + 10, markerY - 10, markerX + 10, markerY + 10);
    }

    public setFillPercent(fillPercent: number) {
        this.drawGlass(fillPercent);
    }

}