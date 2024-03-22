import AzNopolyGame from "@/game";
import MinigameSceneController from "../base/minigame-scene-controller";
import WaterDropScene from "./water-drop-scene";


const GAME_TIME = 30000;
const MIN_FILL_THRESHOLD = 0.6;
export default class WaterDropSceneController extends MinigameSceneController {
    public static GAME_TIME = GAME_TIME;
    public static MIN_FILL_THRESHOLD = MIN_FILL_THRESHOLD;

    declare protected scene: WaterDropScene;

    private scores: { [key: string]: number } = {};

    constructor(scene: WaterDropScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly);

        this.registerSyncedProp("scene");

        this.registerSyncedMethod(this.scene.initMinigame, true);
        this.registerSyncedMethod(this.scene.startFeed, true);
        this.registerSyncedMethod(this.scene.startDrop, true);
        this.registerSyncedMethod(this.scene.updateGlass, true);

        this.registerSyncedMethod(this.onPointer, false);
    }

    public onPlayerPointerDown() {
        this.syncProxy.onPointer("down");
    }

    public onPlayerPointerUp() {
        this.syncProxy.onPointer("up");
    }

    public onWaterDropHit(uuid: string, fill: number) {
        if (!this.aznopoly.isHost) {
            return;
        }

        if (fill > MIN_FILL_THRESHOLD && fill < 1) {
            this.scores[uuid] = (this.scores[uuid] || 0) + 1;
        }

        setTimeout(() => {
            const config = this.getRandomGlassConfig();
            this.syncProxy.scene.updateGlass(uuid, config.width, config.height);
        }, 1000)
    }

    private onPointer(direction: "up" | "down") {
        if (!this.aznopoly.isHost) {
            return;
        }

        const sender = arguments[arguments.length - 1];
        if (direction === "down") {
            this.syncProxy.scene.startFeed(sender);
        } else {
            this.syncProxy.scene.startDrop(sender, this.scene.getDropSize(sender));
        }
    }

    onMiniGameStart(): void {
        if (!this.aznopoly.isHost) {
            return;
        }

        const startConfigs: { [key: string]: { width: number, height: number } } = {};
        this.aznopoly.connectedUuids.forEach(uuid => {
            startConfigs[uuid] = this.getRandomGlassConfig();
        });
        this.syncProxy.scene.initMinigame(startConfigs);

        setTimeout(() => {          
            this.syncProxy.endGame({playerWon: this.getPlayersWon(), sorted: true});
        }, GAME_TIME) 
    }

    private getPlayersWon() {
        const maxScore = Math.max(...Object.values(this.scores));
        return Object.keys(this.scores).filter(uuid => this.scores[uuid] === maxScore);
    }

    private getRandomGlassConfig() {
        return {
            width: 50 + Math.random() * 50,
            height: 50 + Math.random() * 50,
        }
    }

}