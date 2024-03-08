import { PlayerProfile } from "@/phaser/components/ui/player-info";
import AzNopolyAvatar from "@/phaser/components/ui/avatar";
import { PLAYER_COLORS } from "@/style";
import { DrawArrow } from "@/util/graphics-util";

const SIZE = 10;

export class Food extends Phaser.GameObjects.Container {

    static SIZE = SIZE;

    private graphics: Phaser.GameObjects.Graphics;

    public readonly id: string;

    preLoad(scene: Phaser.Scene) {
        //scene.load.image('food', 'assets/food.png');
    }

    constructor(scene: Phaser.Scene, id: String, x: number, y: number) {
        super(scene, x, y);

        this.id = id;

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.graphics.fillStyle(0x00ff00);
        this.graphics.fillCircle(0, 0, SIZE);
        this.add(this.graphics);

        scene.physics.world.enable(this);
        const body = this.body! as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true)
        body.setOffset(-SIZE / 2, -SIZE / 2);
        body.setCircle(SIZE / 2);

        this.add(this.graphics);
    }


}