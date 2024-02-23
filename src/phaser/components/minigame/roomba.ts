import { PlayerProfile } from "@/phaser/components/ui/player-info";
import AzNopolyAvatar from "@/phaser/components/ui/avatar";
import { PLAYER_COLORS } from "@/style";
import { DrawArrow } from "@/util/graphics-util";

const SIZE = 60;
const ARROW_COLOR = 0x00ff00;
export interface RoombaConfig {
    uuid: string;
    id: string;
    x: number;
    y: number;
    angle: number; 
    paintColor: number;
    speed: number;
}


export class Roomba extends Phaser.GameObjects.Container {
    static SIZE = SIZE;

    private graphics: Phaser.GameObjects.Graphics;
    private image: Phaser.GameObjects.Image;
    private arrow: Phaser.GameObjects.Graphics;

    private lastPaintPosition: Phaser.Math.Vector2;

    private paintColor: number;
    private speed: number;

    private stopped = false;

    public readonly id: string;

    static preload(scene: Phaser.Scene) {
        scene.load.image('roomba', 'assets/roomba.png');
        AzNopolyAvatar.preload(scene);
    }

    constructor(scene: Phaser.Scene, { id, x, y, angle, paintColor, speed} : RoombaConfig, profile: PlayerProfile) {
        super(scene, x, y);

        this.id = id;
        this.paintColor = paintColor;
        this.speed = speed;

        this.image = new Phaser.GameObjects.Image(scene, 0, 0, 'roomba');
        this.image.setScale(SIZE / this.image.width);

        this.arrow = new Phaser.GameObjects.Graphics(scene);
        this.lastPaintPosition = new Phaser.Math.Vector2(x, y);

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.graphics.lineStyle(5, PLAYER_COLORS[profile.colorIndex]);
        this.graphics.strokeCircle(0, 0, SIZE/2);

        scene.physics.world.enable(this);
        const body = this.body! as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true)
        body.setOffset(-SIZE / 2, -SIZE / 2);
        body.setCircle(SIZE/2);

        this.add(this.arrow);
        this.add(this.image);
        this.add(this.graphics);
        
        //const avatarSize = SIZE * 0.8;
        //this.add(new AzNopolyAvatar(scene, -avatarSize/2, -avatarSize/2, avatarSize, profile.avatar, PLAYER_COLORS[profile.colorIndex]))

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
            DrawArrow(this.arrow, ARROW_COLOR, Phaser.Math.Vector2.ZERO, dragOffset);
        });

        this.on('dragend', (event: any) => {
            if (this.stopped) return;

            const dragOffset = new Phaser.Math.Vector2(event.x - this.x, event.y - this.y);
            this.scene.events.emit('roomba-dragged', { id: this.id, offset: dragOffset});
            DrawArrow(this.arrow, ARROW_COLOR, Phaser.Math.Vector2.ZERO, Phaser.Math.Vector2.ZERO);
            this.arrow.visible = false;
        });
    }

    public updateDirection(direction: Phaser.Math.Vector2) {
        this.image.rotation = direction.angle();

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