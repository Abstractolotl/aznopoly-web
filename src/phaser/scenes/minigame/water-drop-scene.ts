import MinigameScene from "../base/minigame-scene";
import WaterDropSceneController from "./water-drop-scene-controller";
import AzNopolyPanel from "@/phaser/components/ui/panel";
import Lane from "@/phaser/components/minigame/water-drop/lane";
import AzNopolyAvatar from "@/phaser/components/ui/avatar";
import { TimeBar } from "@/phaser/components/ui/time-bar";
import { FRAME_PADDING } from "@/style";


const DROP_GROWTH_SPEED = 0.001;
const DROP_START_SIZE = 10;
export default class WaterDropScene extends MinigameScene<WaterDropSceneController> {
    public static DROP_GROWTH_SPEED = DROP_GROWTH_SPEED;
    public static DROP_START_SIZE = DROP_START_SIZE;

    private lanes: { [key: string]: Lane } = {};

    preload() {
        super.preload();
        AzNopolyAvatar.preload(this);
    }

    init() {
        this.controller = new WaterDropSceneController(this, this.aznopoly);
    }

    create() {
        super.create();
    }

    public startFeed(uuid: string) {
        this.lanes[uuid].startFeed();
    }

    public startDrop(uuid: string, scale: number) {
        this.lanes[uuid].startDrop(scale);
    }

    public getDropSize(uuid: string) {
        return this.lanes[uuid].getDropSize();
    }

    public updateGlass(uuid: string, width: number, height: number) {
        this.lanes[uuid].updateGlass(width, height);
    }

    public initMinigame(config: { [key: string]: { width: number, height: number } }) {
        const bounds = WaterDropScene.getGameBounds();
        const laneWidth = bounds.width / 4;
        const laneOffset = (bounds.width - laneWidth * this.aznopoly.connectedUuids.length) * 0.5;
        this.aznopoly.connectedUuids.forEach((uuid, index) => {
            
            this.lanes[uuid] = this.add.existing(new Lane(this, laneOffset + bounds.x + laneWidth * index, bounds.y, laneWidth, bounds.height, this.aznopoly.getProfile(uuid), uuid));
            this.lanes[uuid].updateGlass(config[uuid].width, config[uuid].height);
        });
        this.initInput();

        this.add.existing(new TimeBar(this, bounds.x, bounds.y-20-75, bounds.width, 20, WaterDropSceneController.GAME_TIME));
    }

    protected drawSceneLayout(): void {
        const bounds = WaterDropScene.getGameBounds();
        this.add.existing(new AzNopolyPanel(this, bounds.x, bounds.y, bounds.width, bounds.height));
    }

    private initInput() {
        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (this.lanes[this.aznopoly.uuid].isIdle()) {
                this.controller.onPlayerPointerDown();
            }
        });
        this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (this.lanes[this.aznopoly.uuid].isFeeding()) {
                this.controller.onPlayerPointerUp();
            }
        });
        this.events.on("water-drop-lose", (uuid: string) => {
            if (uuid == this.aznopoly.uuid) {
                this.controller.onPlayerPointerUp();
            }
        });
        this.events.on("water-drop-collision", (uuid: string, fill: number) => {
            this.controller.onWaterDropHit(uuid, fill);
        });
    }

}