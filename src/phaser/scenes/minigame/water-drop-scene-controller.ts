import AzNopolyGame from "@/game";
import MinigameSceneController from "../base/minigame-scene-controller";
import WaterDropScene from "./water-drop-scene";


export default class WaterDropSceneController extends MinigameSceneController {
    
    declare protected scene: WaterDropScene;

    constructor(scene: WaterDropScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly);
        
        this.registerSyncedProp("scene");

        this.registerSyncedMethod(this.scene.initGameObjects, true);
    }

    onMiniGameStart(): void {
        if (!this.aznopoly.isHost) {
            return;
        }


        this.syncProxy.scene.initGameObjects();
    }

}