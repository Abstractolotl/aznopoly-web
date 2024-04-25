import MinigameSceneController, {ResultData} from "@/phaser/scenes/base/minigame-scene-controller.ts";
import ClickerRaceScene from "@/phaser/scenes/minigame/clicker-race-scene.ts";
import AzNopolyGame from "@/game.ts";

const GAME_TIME = 20000;

export default class ClickerRaceSceneController extends MinigameSceneController {

    declare protected scene: ClickerRaceScene;
    private schedule: NodeJS.Timeout | null = null;

    constructor(scene: ClickerRaceScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly);

        this.registerSyncedProp("scene");
        this.registerSyncedMethod(this.scene.initPlayer, true);
        this.registerSyncedMethod(this.scene.movePlayer, true);
        this.registerSyncedMethod(this.scene.stopAllPlayers, true);
        this.registerSyncedMethod(this.scene.startTimeBar, true);

        this.registerSyncedMethod(this.requestPlayerMove, false);
        this.registerSyncedMethod(this.finishedGame, false)
    }

    onMiniGameStart(): void {
        if (!this.aznopoly.isHost) {
            return;
        }

        this.aznopoly.connectedUuids.forEach((uuid, index) => {
            this.syncProxy.scene.initPlayer(uuid, index);
        })
        this.syncProxy.scene.startTimeBar();

        this.schedule = setTimeout(() => {
            this.syncProxy.scene.stopAllPlayers()

            const scores = this.scene.getScore();
            const result: ResultData = {
                playerWon: Object.keys(scores).sort().slice(0, 1),
                sorted: false
            }

            this.endGame(result);
        }, GAME_TIME);
    }

    public finishedGame() {
        if (!this.aznopoly.isHost) {
            return;
        }

        clearTimeout(this.schedule!);

        const scores = this.scene.getScore();
        const result: ResultData = {
            playerWon: Object.keys(scores).sort().slice(0, 1),
            sorted: false
        }

        this.endGame(result);
    }

    public requestPlayerMove(uuid: string) {
        if (!this.aznopoly.isHost) {
            return;
        }

        this.syncProxy.scene.movePlayer(uuid);

    }

    public onPlayerClick(uuid: string) {
        this.syncProxy.requestPlayerMove(uuid);
        this.scene.randomInput()
    }

    public onPlayerFinished() {
        this.syncProxy.finishedGame();
    }

}