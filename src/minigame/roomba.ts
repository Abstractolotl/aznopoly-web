import { HEIGHT, WIDTH } from "../main";

const SIZE = 60;
const ARROW_COLOR = 0x00ff00;
export interface RoombaConfig {
    id: string;
    x: number;
    y: number;
    angle: number; 
    color: number; 
    paintColor: number;
    speed: number
}


export class Roomba extends Phaser.GameObjects.Container {
    static SIZE = SIZE;

    private graphics: Phaser.GameObjects.Image;
    private arrow: Phaser.GameObjects.Graphics;

    private lastPaintPosition: Phaser.Math.Vector2;

    private color: number;
    private paintColor: number;
    private speed: number;

    private stopped = false;

    public readonly id: string;

    static preload(scene: Phaser.Scene) {
        scene.load.image('roomba', 'assets/roomba.png');
    }

    constructor(scene: Phaser.Scene, { id, x, y, angle, color, paintColor, speed} : RoombaConfig) {
        super(scene, x, y);

        this.id = id;
        this.color = color;
        this.paintColor = paintColor;
        this.speed = speed;

        this.graphics = new Phaser.GameObjects.Image(scene, 0, 0, 'roomba');
        this.graphics.setScale(SIZE / this.graphics.width);

        this.arrow = new Phaser.GameObjects.Graphics(scene);
        this.lastPaintPosition = new Phaser.Math.Vector2(x, y);

        scene.physics.world.enable(this);
        const body = this.body! as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true)
        body.setOffset(-SIZE / 2, -SIZE / 2);
        body.setCircle(SIZE/2);

        this.add(this.arrow);
        this.add(this.graphics);

        this.updateDirection(new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)));

        this.initDragEvents();
    }

    public stop() {
        const body = this.body! as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);
        this.arrow.clear();
        this.arrow.setVisible(false);
    }

    private initDragEvents() {
        this.setInteractive({
            hitArea: new Phaser.Geom.Circle(0, 0, SIZE / 2),
            hitAreaCallback: Phaser.Geom.Circle.Contains,
            useHandCursor: false,
            draggable: true
        }, Phaser.Geom.Circle.Contains);

        this.on('dragstart', () => {
            if (this.stopped) return;

            this.arrow.visible = true;
        });

        this.on('drag', (event: any) => {
            if (this.stopped) return;

            const dragOffset = new Phaser.Math.Vector2(event.x - this.x, event.y - this.y);
            this.drawArrow(Phaser.Math.Vector2.ZERO, dragOffset);
        });

        this.on('dragend', (event: any) => {
            if (this.stopped) return;

            const dragOffset = new Phaser.Math.Vector2(event.x - this.x, event.y - this.y);
            this.scene.events.emit('roomba-dragged', { id: this.id, offset: dragOffset});
            this.drawArrow(new Phaser.Math.Vector2(0, 0), new Phaser.Math.Vector2(0, 0));
            this.arrow.visible = false;
        });
    }

    private drawArrow(start: Phaser.Math.Vector2, end: Phaser.Math.Vector2) {
        const arrow = this.arrow;
        arrow.clear();

        arrow.lineStyle(5, ARROW_COLOR);
        arrow.fillStyle(ARROW_COLOR);

        this.arrow.lineBetween(start.x, start.y, end.x, end.y);

        const arrowAngle = Math.atan2(end.y - start.y, end.x - start.x);
        const arrowAngleNormal = arrowAngle + Math.PI/2;
        const arrowHeadLength = 10;
        const arrowHeadWidth = 10;

        this.arrow.fillTriangle(
            end.x + Math.cos(arrowAngleNormal) * arrowHeadWidth,
            end.y + Math.sin(arrowAngleNormal) * arrowHeadWidth,
            end.x + Math.cos(arrowAngle) * arrowHeadLength,
            end.y + Math.sin(arrowAngle) * arrowHeadLength,
            end.x - Math.cos(arrowAngleNormal) * arrowHeadWidth,
            end.y - Math.sin(arrowAngleNormal) * arrowHeadWidth,
        );
    }

    public updateDirection(direction: Phaser.Math.Vector2) {
        this.graphics.rotation = direction.angle();

        const normalized = direction.normalize();
        const body = this.body! as Phaser.Physics.Arcade.Body;
        body.setVelocity(normalized.x * this.speed, normalized.y * this.speed);
    }


    public paintPath(graphic: Phaser.GameObjects.Graphics) {
        graphic.lineStyle(SIZE, this.paintColor);
        graphic.lineBetween(this.lastPaintPosition.x, this.lastPaintPosition.y, this.x, this.y);
        graphic.fillStyle(this.paintColor)
        graphic.fillCircle(this.x, this.y, SIZE/2);
        this.lastPaintPosition = new Phaser.Math.Vector2(this.x, this.y);
    }

}