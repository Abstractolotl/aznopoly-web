import { DrawArrow } from "@/util/graphics-util";


const SIZE = 25 ;
const SPEED = 100;
const ATTRACT_TIME = 800;
const IDLE_TIME = 750;
export default class LoveGoomba extends Phaser.GameObjects.Container {

    public static preload(scene: Phaser.Scene) {
        scene.load.image('heart', 'assets/symbol/heart.png');
        //scene.load.image('goomba', 'assets/shitty-shooter/goomba.png');
    }

    private arrow: Phaser.GameObjects.Graphics;
    private emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private timeout?: NodeJS.Timeout;
    
    private lastIdleMoveTime: number = 0;
    private inLove: boolean;

    private stopped = false;
    private autonom: boolean;
    private id: string;

    constructor(scene: Phaser.Scene, id: string, x: number, y: number, autonom: boolean) {
        super(scene, x, y);
        this.autonom = autonom;
        this.inLove = false;
        this.id = id;

        const emitSize = SIZE / 2;
        this.emitter = new Phaser.GameObjects.Particles.ParticleEmitter(scene, 0, 0, "heart", {
            //@ts-ignore Phaser Types seem to be outdated / broken
            emitZone: {
                type: "random",
                source: new Phaser.Geom.Circle(-emitSize * 0.5, -emitSize * 0.5, emitSize ),
            },
            alpha: { ease: 'Sine.easeInOut', start: 1, end: 0 },
            frequency: 150,
            lifespan: 800,
            radial: true,
            follow: {x: 0, y: 0},
            followOffset: { x: -12, y: -12 },
            speed: { min: 50, max: 100 },
            tint: 0xff0000,
            active: true,
        });

        scene.physics.world.enable(this);
        const body = this.body! as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true)
        body.setOffset(-SIZE*1.5, -SIZE * 1.5);
        body.setCircle(SIZE);

        this.arrow = new Phaser.GameObjects.Graphics(scene);

        const graphics = new Phaser.GameObjects.Graphics(scene);
        graphics.fillStyle(0x888888);
        graphics.fillCircle(0, 0, SIZE);

        this.add(this.emitter);
        this.add(this.arrow);
        this.add(graphics);
        //this.add(new Phaser.GameObjects.Image(scene, 0, 0, 'goomba').setDisplaySize(SIZE*2, SIZE*2));

        this.setInLove(false);
    }

    preUpdate(time: number, delta: number) {
        if (!this.autonom || this.inLove || this.stopped) return;

        this.lastIdleMoveTime += delta;
        if (this.lastIdleMoveTime >= IDLE_TIME) {
            const randomX = Math.random() * SPEED - SPEED / 2;
            const randomY = Math.random() * SPEED - SPEED / 2;
            this.scene.events.emit('goombaDirection', this.id, this.x, this.y, {x: randomX, y: randomY});
            this.lastIdleMoveTime = 0;
        }
    }

    public stop() {
        this.stopped = true;
        const body = this.body! as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);
        this.setInLove(false);
    }

    public updateMovement(direction: Phaser.Math.Vector2) {
        if (this.stopped) return;
        const body = this.body! as Phaser.Physics.Arcade.Body;
        body.setVelocity(direction.x, direction.y);
    }

    public attractToPosition(color: number, x: number, y: number) {
        if (this.stopped) return;
        const body = this.body! as Phaser.Physics.Arcade.Body;
        const target = new Phaser.Math.Vector2(x, y).subtract({x: this.x, y: this.y}).normalize();

        body.setVelocity(target.x * SPEED * 2, target.y * SPEED * 2);
        this.emitter.particleTint = color;
        this.setInLove(true);

        const start = new Phaser.Math.Vector2(0, 0);
        DrawArrow(this.arrow, color, start, target.scale(35));
        
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            body.setVelocity(0, 0);
            this.setInLove(false);
        }, ATTRACT_TIME);
    }

    private setInLove(inLove: boolean) {
        this.inLove = inLove;

        if (inLove) {
            this.emitter.start();
        } else {
            this.emitter.stop();
            this.arrow.clear();
        }
    }

}