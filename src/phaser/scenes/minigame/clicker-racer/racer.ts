import AzNopolyAvatar from "@/phaser/components/ui/avatar";
import { PlayerProfile } from "@/phaser/components/ui/player-info";


const BODY_SIZE = 25;
const MOVE_SPEED = 15;

export default class Racer extends Phaser.GameObjects.Container {

    private maxX: number;
    private finished = false;

    private stopped = false;
    private progress = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, profile: PlayerProfile, maxX: number) {
        super(scene);
        this.setPosition(x, y);

        this.maxX = maxX;

        this.add(new AzNopolyAvatar(scene, 0, 0, BODY_SIZE * 2, profile.avatar, profile.colorIndex));
    }

    public getProgress() {
        if(this.finished)
            return this.maxX;
        return this.progress;
    }

    public move(onFinish: () => void) {
        if (this.stopped) {
            return;
        }

        this.progress += MOVE_SPEED;
        this.x = Math.min(this.maxX, this.x + MOVE_SPEED)

        if(this.x >= this.maxX) {
            onFinish();
            this.finished = true;
        }
    }

    public stop() {
        this.stopped = true;
    }

}