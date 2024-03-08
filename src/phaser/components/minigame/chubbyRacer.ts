import { PlayerProfile } from "@/phaser/components/ui/player-info";
import AzNopolyAvatar from "@/phaser/components/ui/avatar";
import { PLAYER_COLORS } from "@/style";
import { DrawArrow } from "@/util/graphics-util";
import {PushBarrier} from "@/phaser/components/minigame/pushBarrier.ts";

const SIZE = 60;
const WEIGHT = 100;
const WEIGHT_GAIN_FACTOR = 2;

export class ChubbyRacer extends Phaser.GameObjects.Container {
    static SIZE = SIZE;
    static WEIGHT = WEIGHT;


    private graphics: Phaser.GameObjects.Graphics;

    //private image: Phaser.GameObjects.Image;
    private speed: number;

    private weight: number;

    private pushBarrier: PushBarrier;
    private profile: PlayerProfile;

    private isStunned: boolean = false;

    //private scale: number;

    public readonly id: string;

    static preload(scene: Phaser.Scene) {
        scene.load.image('chubbyRacer', 'assets/roomba.png');
        AzNopolyAvatar.preload(scene);
    }

    constructor(scene: Phaser.Scene, x: number, y: number, profile: PlayerProfile) {
        super(scene, x, y);

        this.profile = profile;

        this.weight = WEIGHT;
        this.speed = 300 - this.weight/10 ;

        //this.image = new Phaser.GameObjects.Image(scene, 0, 0, 'chubbyRacer');
        //this.image.setScale(SIZE / this.image.width);

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.graphics.fillStyle(PLAYER_COLORS[profile.colorIndex]);
        this.graphics.fillCircle(0, 0, (SIZE  / 2));

        scene.physics.world.enable(this);
        const body = this.body! as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true)
        body.setOffset(-SIZE / 2, -SIZE / 2);
        body.setCircle(SIZE / 2);

        //this.add(this.image);
        this.add(this.graphics);

        this.updateDirection(new Phaser.Math.Vector2(Math.cos(1), Math.sin(1)));

        //const avatarSize = SIZE * 0.8;
        //this.add(new AzNopolyAvatar(scene, -avatarSize/2, -avatarSize/2, avatarSize, profile.avatar, PLAYER_COLORS[profile.colorIndex]))
    }

    public addWeight(){
        this.weight += WEIGHT_GAIN_FACTOR;
        this.speed -= this.speed/100;
        this.scale += WEIGHT_GAIN_FACTOR/1000;
        //this.graphics.fillCircle(this.x, this.y, (SIZE  / 2) + this.scale);
        console.log("weight: " + this.weight)
        console.log("speed: " + this.speed)
    }

    public removeWeight(weight: number){
        const timesWeightAdded = this.weight / WEIGHT_GAIN_FACTOR;

        this.weight -= weight;
        this.speed += this.speed/100 * timesWeightAdded;
        this.scale -= WEIGHT_GAIN_FACTOR/1000 * timesWeightAdded;
        //this.graphics.fillCircle(this.x, this.y, (SIZE  / 2) + this.scale);
        console.log("weight: " + this.weight)
        console.log("speed: " + this.speed)
    }

    public updateDirection(direction: Phaser.Math.Vector2) {
        const normalized = direction.normalize();
        const body = this.body! as Phaser.Physics.Arcade.Body;
        let ySpeedModifier = 1;

        if (direction.y > 0) {
            ySpeedModifier = 1.5;
        } else if (direction.y < 0) {
            ySpeedModifier = 0.3;
        }
        if(!this.isStunned){
            body.setVelocity(normalized.x * this.speed, normalized.y * this.speed * ySpeedModifier);
        }
    }

    public setBumpVelocity(x: number, y: number){
        this.setStunned(true);
        const body = this.body! as Phaser.Physics.Arcade.Body;
        body.setVelocity(x, y);

        //set timeout 2 seconds
        setTimeout(() => {
            this.setStunned(false);
        }, 100);
    }

    public setStunned(stunned: boolean){
        this.isStunned = stunned;
    }

}