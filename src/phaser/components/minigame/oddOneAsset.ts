import {PlayerProfile} from "@/phaser/components/ui/player-info";
import AzNopolyAvatar from "@/phaser/components/ui/avatar";
import {PLAYER_COLORS} from "@/style";
import {DrawArrow} from "@/util/graphics-util";
import {Player} from "@/types";

const SIZE = 60;

export class oddOneAsset extends Phaser.GameObjects.Container {
    static SIZE = SIZE;


    private graphics: Phaser.GameObjects.Graphics;

    private image: Phaser.GameObjects.Image;
    private speed: number;

    private weight: number;
    private isOdd: boolean;
    private player: Player;

    public readonly id: string;

    static preload(scene: Phaser.Scene) {
        //scene.load.image('', '');
    }

    constructor(scene: Phaser.Scene, id: number, x: number, y: number, isOdd: boolean = false) {
        super(scene, x, y);
        this.setSize(SIZE, SIZE);
        this.isOdd = isOdd;

        this.setInteractive({
            hitArea: new Phaser.Geom.Circle(0, 0, SIZE / 2),
            hitAreaCallback: Phaser.Geom.Circle.Contains,
            useHandCursor: false,
            draggable: true
        }, Phaser.Geom.Circle.Contains);
        //this.scene.input.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.onClicked.bind(this));

        //this.image = new Phaser.GameObjects.Image(scene, 0, 0, 'chubbyRacer');
        //this.image.setScale(SIZE / this.image.width);

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.graphics.fillStyle(0xFF0000);

        if (this.isOdd) {
            this.graphics.fillStyle(0x00FF00);
        }

        this.graphics.fillCircle(0, 0, (SIZE / 2));


        //this.add(this.image);
        this.add(this.graphics);

    }

    onClicked(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
        console.log("hello world")
        this.scene.events.emit("oddOneClicked", this);
        // return this.isOdd;
    }

}