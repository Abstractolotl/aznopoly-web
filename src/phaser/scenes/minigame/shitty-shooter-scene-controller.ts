import AzNopolyGame from "@/game";
import MinigameSceneController, { ResultData } from "../base/minigame-scene-controller";
import ShittyShooterScene from "./shitty-shooter-scene";
import { CORNER } from "../../components/shitty-shooter/turret";

const GAME_TIME = 20000;
export default class ShittyShooterSceneController extends MinigameSceneController {
    
    declare protected scene: ShittyShooterScene;

    constructor(scene: ShittyShooterScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly);
        
        this.registerSyncedProp("scene");
        this.registerSyncedMethod(this.scene.initTurret, true);
        this.registerSyncedMethod(this.scene.initGoomba, true);
        this.registerSyncedMethod(this.scene.initInput, true);
        this.registerSyncedMethod(this.scene.attractGoomba, true);
        this.registerSyncedMethod(this.scene.updateGoomba, true);
        this.registerSyncedMethod(this.scene.stopAll, true);

        this.registerSyncedMethod(this.scene.addBullet, false);
    }

    onMiniGameStart(): void {
        if (!this.aznopoly.isHost) {
            return;
        }
        
        const CORNERS: CORNER[] = ["BOTTOM_LEFT", "BOTTOM_RIGHT", "TOP_LEFT", "TOP_RIGHT"];
        this.aznopoly.connectedUuids.forEach((uuid, index) => {
            this.syncProxy.scene.initTurret(uuid, CORNERS[index]);
        });
        for (let i = 0; i < 5; i++) {
            const randomId = Math.random().toString(36).substring(7);
            const randomX = ShittyShooterScene.WORLD_BOUNDS.x + Math.random() * ShittyShooterScene.WORLD_BOUNDS.width;
            const randomY = ShittyShooterScene.WORLD_BOUNDS.y + Math.random() * ShittyShooterScene.WORLD_BOUNDS.height;
            this.syncProxy.scene.initGoomba(randomId, randomX, randomY)
        }

        this.syncProxy.scene.initInput();
        this.scene.events.on('goombaDirection', this.onGoombaDirection.bind(this));

        setTimeout(() => {
            this.syncProxy.scene.stopAll();
            this.scene.stopMusic();
            const scores = this.scene.getScore();

            const result: ResultData = {
                playerWon: Object.keys(scores).sort().slice(0, 1),
                sorted: false
            }
            this.syncProxy.endGame(result);
        }, GAME_TIME);
    }
    
    public onGoombaHit(uuid: string, bulletOrigin: Phaser.Math.Vector2, goombaId: string, goombaX: number, goombaY: number) {
        const profile = this.aznopoly.getProfile(uuid);
        this.syncProxy.scene.attractGoomba(goombaId, bulletOrigin.x, bulletOrigin.y, profile.colorIndex);
    }

    public onPlayerShoot(x: number, y: number, direction: Phaser.Math.Vector2) {
        this.syncProxy.scene.addBullet(x, y, direction);
    }

    public onGoombaDirection(id: string, x: number, y: number, direction: Phaser.Math.Vector2) {
        this.syncProxy.scene.updateGoomba(id, x, y, direction);

    }

}