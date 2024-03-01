

export default class Glass extends Phaser.GameObjects.Container {

    private graphics!: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        this.graphics = new Phaser.GameObjects.Graphics(scene);

        this.graphics.fillStyle(0xff0000, 1);
        this.graphics.fillRect(100, 100, 10, 100);
        this.graphics.fillRect(200, 110, 10, 100);
        this.graphics.fillRect(100, 200, 100, 10);

        this.add(this.graphics);
    }

}