import { PLAYER_COLORS } from "@/style";
import AzNopolyGame from "../../../game";
import MinigameScene from "../base/minigame-scene";
import MinigameSceneController from "../base/minigame-scene-controller";
import { RoombaScene } from "./roomba-scene";
import convert from 'color-convert';
import { SETTINGS } from "@/settings";
import {ChubbyPanicScene} from "@/phaser/scenes/minigame/chubby-panic-scene.ts";
import ShittyShooterScene from "@/phaser/scenes/minigame/shitty-shooter-scene.ts";
import {ChubbyRacer} from "@/phaser/components/minigame/chubbyRacer.ts";

const MAX_GAME_TIME = 30000;
export default class ChubbyPanicSceneController extends MinigameSceneController {

    declare protected scene: ChubbyPanicScene;

    constructor(scene: ChubbyPanicScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly);

        this.registerSyncedProp("scene");

        this.registerSyncedMethod(this.scene.initChubbyRacer, true);
        this.registerSyncedMethod(this.scene.initFood, true);
        this.registerSyncedMethod(this.scene.initInput, true);
        this.registerSyncedMethod(this.scene.initPushBarrier, true);
        this.registerSyncedMethod(this.scene.updateChubbyRacerDirection, false);
        this.registerSyncedMethod(this.scene.updateRacers, false);
    }

    onMiniGameStart(): void {
        if (!this.aznopoly.isHost) {
            return;
        }

        this.aznopoly.connectedUuids.forEach((uuid, index) => {
            this.syncProxy.scene.initChubbyRacer(uuid);
            this.syncProxy.scene.initPushBarrier(uuid);
        });
        this.scene.setInitiated();

        this.syncProxy.scene.initInput();


        for (let i = 0; i < 20; i++) {
            const randomId = Math.random().toString(36).substring(7);
            const randomX = ChubbyPanicScene.WORLD_BOUNDS.x + Math.random() * ChubbyPanicScene.WORLD_BOUNDS.width;
            const randomY = ChubbyPanicScene.WORLD_BOUNDS.y + Math.random() * ChubbyPanicScene.WORLD_BOUNDS.height;
            this.syncProxy.scene.initFood(randomId, randomX, randomY)
        }

        //this.syncProxy.scene.init();
    }

    public updateRacers(): void {
        this.aznopoly.connectedUuids.forEach((uuid) => {
            this.syncProxy.scene.updateRacers(uuid);
        });
        this.spawnFood();
    }

    public spawnFood(): void {
        //set random number between 1 and 5 and if number is 5 spawn food top of screen
        const random = Math.floor(Math.random() * 5) + 1;
        if(random === 5){
            const randomId = Math.random().toString(36).substring(7);
            const randomX = ChubbyPanicScene.WORLD_BOUNDS.x + Math.random() * ChubbyPanicScene.WORLD_BOUNDS.width;
            const randomY = ChubbyPanicScene.WORLD_BOUNDS.y;
            this.syncProxy.scene.initFood(randomId, randomX, randomY);
        }
    }


}