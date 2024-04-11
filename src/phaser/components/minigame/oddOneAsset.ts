import {PlayerProfile} from "@/phaser/components/ui/player-info";
import AzNopolyAvatar from "@/phaser/components/ui/avatar";
import {PLAYER_COLORS} from "@/style";
import {DrawArrow} from "@/util/graphics-util";

const SIZE = 60;

export class oddOneAsset extends Phaser.GameObjects.Container {
    static SIZE = SIZE;


    private graphics: Phaser.GameObjects.Graphics;

    private image: Phaser.GameObjects.Image;
    private speed: number;

    private weight: number;
    private isOdd: boolean;

    public readonly id: string;

    static preload(scene: Phaser.Scene) {
        //scene.load.image('', '');
    }

    constructor(scene: Phaser.Scene, x: number, y: number, isOdd: boolean = false) {
        super(scene, x, y);
        this.isOdd = isOdd;

        //this.image = new Phaser.GameObjects.Image(scene, 0, 0, 'chubbyRacer');
        //this.image.setScale(SIZE / this.image.width);

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.graphics.fillStyle(0xFF0000);
        if (this.isOdd) {
            this.graphics.fillStyle(0x00FF00);
        }

        this.graphics.fillCircle(0, 0, (SIZE / 2));

        scene.physics.world.enable(this);
        const body = this.body! as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true)
        body.setOffset(-SIZE / 2, -SIZE / 2);
        body.setCircle(SIZE / 2);

        //this.add(this.image);
        this.add(this.graphics);

    }

}