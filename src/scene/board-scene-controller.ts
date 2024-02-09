import AzNopolyGame from "../game";
import SyncedSceneController from "./base/synced-scene-controller";
import BoardScene from "./board-scene";

interface Player {
    uuid: string;
    name: string;
    money: number;
    position: number;
}

export default class BoardSceneController extends SyncedSceneController {
    
    declare protected scene: BoardScene;

    private currentPlayerUuid: string = "";
    private players!: Player[];

    constructor(scene: BoardScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly);

        this.registerSyncedMethod(this.addPlayersToBoard, true);
        this.registerSyncedMethod(this.updatePlayerPosition, true);
        this.registerSyncedMethod(this.startTurn, true);
        this.registerSyncedMethod(this.startMinigame, true);

        this.registerSyncedMethod(this.doDiceRoll, false);
    }
    
    onAllPlayersReady(): void {
        if (this.aznopoly.isHost) {
            const players = this.aznopoly.connectedUuids.map(uuid => ({
                uuid,
                name: this.aznopoly.room.getPlayerName(uuid),
                money: 1500,
                position: 0,
            }));
            this.syncProxy.addPlayersToBoard(players);
            this.syncProxy.startTurn(players[0].uuid);
        }

    }

    private addPlayersToBoard(players: Player[]) {
        this.players = players;
        this.scene.addPlayers(players.map(p => p.uuid));
    }

    private startTurn(uuid: string) {
        this.currentPlayerUuid = uuid;

        if(uuid == this.aznopoly.uuid) {
            this.scene.enableRollButton();
        }
    }

    public onRollClick() {
        this.scene.disableRollButton();
        this.syncProxy.doDiceRoll();
    }

    private doDiceRoll() {
        if (!this.aznopoly.isHost) {
            return;
        }

        const sender = arguments[arguments.length - 1]; // Black Magic to get the player uuid that started the roll
        if (this.currentPlayerUuid != sender) {
            console.warn("Received roll from non-current player");
            return;
        }

        const roll = Math.floor(Math.random() * 6) + 1;
        const player = this.players.find(p => p.uuid == sender);
        if (!player) {
            console.error("Player not found");
            return;
        }

        player.position += roll;
        this.syncProxy.updatePlayerPosition(sender, player.position);
        this.startNextTurn();
    }

    private startNextTurn() {
        const currentIndex = this.players.findIndex(p => p.uuid == this.currentPlayerUuid);
        const nextIndex = (currentIndex + 1) % this.players.length;
        const nextPlayer = this.players[nextIndex];

        if (nextIndex == 0) {
            this.syncProxy.startMinigame();
        } else {
            this.syncProxy.startTurn(nextPlayer.uuid);
        }
    }

    private onMinigameResult() {

    }

    private startMinigame() {
        this.scene.showMinigameSelect("Roomba Outrage").then(() => {
            setTimeout(() => {
                this.scene.hideMinigameSelect();

                if (this.aznopoly.isHost) {
                    this.scene.scene.sleep();
                    this.scene.scene.launch("minigame-roomba");
                }
            }, 500)
        });
    }

    private updatePlayerPosition(uuid: string, position: number) {
        this.scene.updatePlayerPosition(uuid, position);
    }

}