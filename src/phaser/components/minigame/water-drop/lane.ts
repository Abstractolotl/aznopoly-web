import WaterDropScene from "@/phaser/scenes/minigame/water-drop-scene";
import AzNopolyAvatar from "../../ui/avatar";
import { PlayerProfile } from "../../ui/player-info";
import WaterDrop from "./drop";
import Glass from "./glass";
import { FRAME_PADDING, PLAYER_COLORS } from "@/style";
import convert from 'color-convert';
import WaterDropSceneController from "@/phaser/scenes/minigame/water-drop-scene-controller";

const AVATAR_SIZE = 100;
export default class Lane extends Phaser.GameObjects.Container {

    private uuid: string;
    private avatar: AzNopolyAvatar;
    private graphics: Phaser.GameObjects.Graphics;
    private drop: WaterDrop;
    private glass: Glass;
    declare state: "idle" | "drop" | "feed";
    private counter: number = 0;
    private counterText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, profile: PlayerProfile, uuid: string) {
        super(scene, x, y);
        this.width = width;
        this.height = height;

        this.uuid = uuid;
        this.state = "idle";

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.avatar = new AzNopolyAvatar(scene, width * 0.5 - AVATAR_SIZE * 0.5, -AVATAR_SIZE*0.5, AVATAR_SIZE, profile.avatar, profile.colorIndex);
        this.drop = new WaterDrop(scene, width * 0.5, AVATAR_SIZE * 0.5, WaterDropScene.DROP_START_SIZE);
        this.glass = new Glass(scene, width * 0.5, 0);
        this.counterText = new Phaser.GameObjects.Text(scene, width*0.5 -16, height*0.25, "0", { fontSize: "64px", color: "#888888" });

        const paintColor = convert.hex.hsl("0x" + PLAYER_COLORS[profile.colorIndex].toString(16).padStart(6, '0'));
        paintColor[2] = 90;
        const paintColorHex = Number("0x" + convert.hsl.hex(paintColor).padStart(6, '0'));
        this.graphics.fillStyle(paintColorHex, 1);
        this.graphics.fillRect(0, 3, width, height-6);

        this.add(this.graphics);
        this.add(this.avatar);
        this.add(this.glass);
        this.add(this.drop);
        this.add(this.counterText);

        scene.physics.add.collider(this.drop, this.glass, this.onDropCollision.bind(this));
    }

    preUpdate(time: number, delta: number): void {
        super.update(time, delta);
        this.glass.preUpdate(time, delta);

        if (this.state === "feed") {
            this.drop.scale += delta * WaterDropScene.DROP_GROWTH_SPEED;
            if (this.drop.scale > 5) {
                this.scene.events.emit("water-drop-lose", this.uuid);
                this.state = "drop";
            }
        }
    }

    public getFillPercent(dropRadius: number, dropScale: number) {
        const glassVolume = this.glass.width * this.glass.height;
        const dropVolume =  Math.PI * Math.pow(dropRadius * dropScale, 2) * 1.75;
        const fill = dropVolume / glassVolume;
        return fill;
    }

    public startDrop(scale: number) {
        this.state = "drop";
        this.drop.scale = scale;

        const body = this.drop.body as Phaser.Physics.Arcade.Body;
        body.setAccelerationY(1000);
        body.setVelocityY(-100)
    }

    public startFeed() {
        this.state = "feed";
        this.resetDrop();
    }

    public getDropSize() {
        return this.drop.scale;
    }

    private resetDrop() {
        this.drop.setVisible(true);
        this.drop.setPosition(this.drop.x, AVATAR_SIZE * 0.5);
        this.drop.scale = 1;
        
        const body = this.drop.body as Phaser.Physics.Arcade.Body;
        body?.setAccelerationY(0);
        body?.setVelocityY(0);
    }

    public updateGlass(width: number, height: number) {
        this.resetDrop();
        this.state = "idle";
        this.glass.setPosition(this.glass.x, this.height - height / 2 - FRAME_PADDING)
        this.glass.setSize(width, height);
        this.glass.setFillPercent(0);
    }

    private onDropCollision() {
        const fill = this.getFillPercent(WaterDropScene.DROP_START_SIZE, this.drop.scale);
        if (fill < WaterDropSceneController.MIN_FILL_THRESHOLD || fill > 1) {
            this.glass.shake(500);
        } else {
            this.increaseCounter();
        }

        this.drop.y = 1000;
        this.drop.setVisible(false);
        this.glass.setFillPercent(fill);
        this.scene.events.emit("water-drop-collision", this.uuid, fill);
    }

    public isIdle() {
        return this.state === "idle";
    }

    public isFeeding() {
        return this.state === "feed";
    }

    public increaseCounter() {
        this.counter++;
        this.counterText.setText(this.counter.toString());
    }

}