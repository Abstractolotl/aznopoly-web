import { HEIGHT, WIDTH } from "../main";


const ARROW_SIZE = 5;
const SPEED = 25;
export class Roomba extends Phaser.GameObjects.Container {
    
    static SIZE = 35;

    private graphics: Phaser.GameObjects.Graphics;
    private arrow: Phaser.GameObjects.Graphics;
    
    private direction: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);
    private _color: number;
    private lastPaintPosition: Phaser.Math.Vector2;
    private dragging: boolean = false;
    
    public get color() : number {
        return this._color
    }
    

    constructor(scene: Phaser.Scene, x: number, y: number, angle: number, color: "red" | "green" | "blue" | "yellow" ) {
        super(scene, x, y);
        this._color = {
            red: 0xFF0000,
            green: 0x00FF00,
            blue: 0x0000FF,
            yellow: 0xFFFF00
        }[color];
        this.lastPaintPosition = new Phaser.Math.Vector2(x, y);

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.direction = new Phaser.Math.Vector2(1, 0).setAngle(angle);
        this.graphics.rotation = this.direction.angle();

        this.graphics.fillStyle(this._color, 1);
        
        this.graphics.fillCircle(0, 0, Roomba.SIZE);
        this.graphics.fillCircle(Roomba.SIZE - Roomba.SIZE/4, 0, Roomba.SIZE/2);

        this.graphics.setInteractive({
            hitArea: new Phaser.Geom.Circle(0, 0, Roomba.SIZE),
            hitAreaCallback: Phaser.Geom.Circle.Contains,
            draggable: true
        }, () => true);
        
        this.arrow = new Phaser.GameObjects.Graphics(scene);
        this.graphics.on('dragstart', () => {
            this.setArrowEnabled(true);
            this.dragging = true;
        });

        this.graphics.on('drag', (event: any) => {
            const x = event.x - this.x;
            const y = event.y - this.y;

            this.updateArrow(x, y);
            this.updateDirection(x, y);
        });

        this.graphics.on('dragend', () => {
            this.setArrowEnabled(false);
            this.dragging = false;
        });
        
        this.add(this.arrow);
        this.add(this.graphics);
    }

    preUpdate(delta: number, time: number) {
        const newX = this.x + this.direction.x * SPEED * time / 1000;
        const newY = this.y + this.direction.y * SPEED * time / 1000;

        if ( !(newX < Roomba.SIZE || newX > WIDTH - Roomba.SIZE || newY < Roomba.SIZE || newY > HEIGHT - Roomba.SIZE) ) {
            this.x = newX;
            this.y = newY;
        }
    }

    public paintPath(graphic: Phaser.GameObjects.Graphics) {
        graphic.lineStyle(Roomba.SIZE * 2, this._color * 0.9 + 0xffffff * 0.1);
        graphic.lineBetween(this.lastPaintPosition.x, this.lastPaintPosition.y, this.x, this.y);
        graphic.fillStyle(this._color * 0.9 + 0xffffff * 0.1)
        graphic.fillCircle(this.x, this.y, Roomba.SIZE);
        this.lastPaintPosition = new Phaser.Math.Vector2(this.x, this.y);
    }

    private updateDirection(x: number, y: number) {
        this.direction = new Phaser.Math.Vector2(x, y).normalize();
        this.graphics.rotation = this.direction.angle();
    }

    private updateArrow(x: number, y: number) {
        this.arrow.clear();
        this.arrow.lineStyle(ARROW_SIZE, 0x00ff00, 1);
        this.arrow.fillStyle(0x00ff00);

        this.arrow.lineBetween(0, 0, x, y);
        
        // Draw arrow head
        const arrowAngle = Math.atan2(y, x);
        const arrowAngleNormal = arrowAngle + Math.PI/2;

        const arrowHeadLength = 10;
        const arrowHeadWidth = 10;

        this.arrow.fillTriangle(
            x + Math.cos(arrowAngleNormal) * arrowHeadWidth,
            y + Math.sin(arrowAngleNormal) * arrowHeadWidth,
            x + Math.cos(arrowAngle) * arrowHeadLength,
            y + Math.sin(arrowAngle) * arrowHeadLength,
            x - Math.cos(arrowAngleNormal) * arrowHeadWidth,
            y - Math.sin(arrowAngleNormal) * arrowHeadWidth,
        );

    }

    private setArrowEnabled(enabled: boolean) {
        this.arrow.visible = enabled;
    }

}