

export default class WaterDrop extends Phaser.GameObjects.Container {

    private graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, size: number) {
        super(scene, x, y);
        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.graphics.fillStyle(0x0000ff, 1);
        
        const aa = 0.12;
        this.graphics.beginPath();
        this.graphics.arc(0, size * 2.2, size, Math.PI * (1 + aa), Math.PI * (2 - aa), true);
        this.graphics.lineTo(0, 0);
        this.graphics.closePath();
        this.graphics.fillPath();

        scene.physics.world.enable(this);
        const body = this.body! as Phaser.Physics.Arcade.Body;
        body.setOffset(-size, size * 1.2);
        body.setCircle(size);

        this.add(this.graphics);
    }

}