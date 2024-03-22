const BULLET_SIZE = 15;
const SPEED = 750;
export default class Bullet extends Phaser.GameObjects.Container {
    public static BULLET_SIZE = BULLET_SIZE;

    public originSource: Phaser.Math.Vector2;
    public readonly originUuid: string;
    
    public static preload(scene: Phaser.Scene) {
        //scene.load.image('bullet', 'assets/shitty-shooter/bullet.png');
    }
    
    private reflected = false;

    constructor(scene: Phaser.Scene, uuid: string, x: number, y: number, direction: Phaser.Math.Vector2) {
        super(scene);
        this.setPosition(x, y);
        
        this.originSource = new Phaser.Math.Vector2(x, y);
        this.originUuid = uuid;
        
        const graphics = new Phaser.GameObjects.Graphics(scene);
        graphics.fillStyle(0x000000);
        graphics.fillCircle(0, 0, BULLET_SIZE / 2);

        scene.physics.world.enable(this);
        const body = this.body! as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true, 1, 1)
        body.setOffset(-BULLET_SIZE / 2, -BULLET_SIZE / 2);
        body.setCircle(BULLET_SIZE/2);
        body.onWorldBounds = true;

        direction = direction.normalize();
        body.setVelocity(direction.x * SPEED, direction.y * SPEED);

        this.add(graphics);
    }

    public onReflect() {
        if (this.reflected) {
            this.destroy();
            return;
        }
        this.reflected = true;
        this.originSource = new Phaser.Math.Vector2(this.x, this.y);
    }

}