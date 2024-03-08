import { PlayerProfile } from "@/phaser/components/ui/player-info";
import AzNopolyAvatar from "@/phaser/components/ui/avatar";
import { PLAYER_COLORS } from "@/style";
import { DrawArrow } from "@/util/graphics-util";
import {ResultData} from "@/phaser/scenes/base/minigame-scene-controller.ts";


export class PushBarrier extends Phaser.GameObjects.Container {


    private graphics: Phaser.GameObjects.Graphics;

    public readonly id: string;

    private aliveTime: number;
    private uuid: string;
    private activated: boolean = false;

    static preload(scene: Phaser.Scene) {
        scene.load.image('chubbyRacer', 'assets/roomba.png');
        AzNopolyAvatar.preload(scene);
    }

    constructor(scene: Phaser.Scene, x: number, y: number, radius: number, aliveTime: number, profile: PlayerProfile, uuid: string) {
        super(scene, x, y);

        this.uuid = uuid;

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.graphics.lineStyle(3, PLAYER_COLORS[2]);
        this.graphics.strokeCircle(0, 0, radius);

        this.aliveTime = aliveTime;

        scene.physics.world.enable(this);
        const body = this.body! as Phaser.Physics.Arcade.Body;

        body.setOffset(-radius, -radius);
        body.setCircle(radius);




        this.add(this.graphics);
        this.updateScale(4, 500000);
    }

    public updateScale(scale: number, aliveTime: number) {
        this.setScale(scale);
        this.setActivated(true);
        setTimeout(() => {
            this.setActivated(false);
        }, aliveTime);
    }

    public getUUID(): string {
        return this.uuid;
    }

    public setActivated(value: boolean) {
        this.activated = value;
        if (!value) {
            this.setScale(1)
        }
    }

    public isActivated(): boolean {
        return this.activated;
    }

}