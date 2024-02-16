import { Avatars } from "@/ui/avatar";
import AzNopolyGame from "../game";
import SyncedSceneController from "./base/synced-scene-controller";
import BoardScene from "./board-scene";
import { ResultData } from "./base/minigame-scene-controller";
import Turn from "./board/turn-controller";
import { TileType } from "@/types/board";
import BoardGenerator from "@/board/board-generator";
import { BOARD_SIDE_LENGTH } from "@/main";

interface Player {
    uuid: string;
    money: number;
    tiles: number[];
    position: number;
}

export default class BoardSceneController extends SyncedSceneController {
    
    declare protected scene: BoardScene;

    /**
     * List of players in turn order
     */
    private players!: Player[];
    private minigameInprogress: boolean = false;
    private currentTurn?: Turn;

    constructor(scene: BoardScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly, "start");

        this.registerSyncedMethod(this.initBoard, true);
        this.registerSyncedMethod(this.updatePlayerPosition, true);
        this.registerSyncedMethod(this.startTurn, true);
        this.registerSyncedMethod(this.startMinigame, true);
        this.registerSyncedMethod(this.removeMoney, true);

        this.registerSyncedMethod(this.rollDice, false);
    }
    
    onAllPlayersReady(): void {
        if (this.aznopoly.isHost) {
            const players = this.aznopoly.connectedUuids.map(uuid => ({
                uuid,
                money: 1500,
                tiles: [],
                position: 0,
            }));

            const tiles = BoardGenerator.generateFields(this.aznopoly.room.host, BOARD_SIDE_LENGTH);
            this.syncProxy.initBoard(tiles, players);
            this.doTurn(players[0].uuid);
        }
    }

    onSceneWake(_: any, minigameResult: ResultData): void {
        super.onSceneWake(_, minigameResult);
        if (!(this.aznopoly.isHost && this.minigameInprogress)) {
            return;
        }

        this.minigameInprogress = false;
        this.onMinigameResult(minigameResult);
        this.doTurn(this.players[0].uuid);
    }

    private onMinigameResult(result: ResultData) {
        this.aznopoly.connectedUuids.forEach(uuid => {
            if (!result.playerWon.includes(uuid)) {
                this.syncProxy.removeMoney(uuid, 100);
                console.log("Player lost", uuid);
            } else {
                console.log("Player won", uuid);
            }
        });
    }

    public removeMoney(uuid: string, amount: number) {
        const player = this.players.find(p => p.uuid == uuid);
        if (!player) {
            console.error("Player not found");
            return;
        }
        player.money -= amount;

        this.scene.updatePlayerInfo(uuid, player);
    }

    public onRollClick() {
        this.scene.disableRollButton();
        this.syncProxy.rollDice();
    }

    public onTurnEnd(uuid: string) {
        const currentIndex = this.players.findIndex(p => p.uuid == uuid);
        if (currentIndex == this.players.length - 1) {
            this.minigameInprogress = true;
            this.syncProxy.startMinigame("minigame-roomba");
        } else {
            const nextPlayer = this.getNextPlayerIndex(uuid);
            this.doTurn(this.players[nextPlayer].uuid);
        }
    }

    private doTurn(uuid: string) {
        this.currentTurn = new Turn(this, uuid);
        this.syncProxy.startTurn(uuid);
    }

    private getNextPlayerIndex(currentUuid: string) {
        const currentIndex = this.players.findIndex(p => p.uuid == currentUuid);
        return (currentIndex + 1) % this.players.length;
    }

    public getPlayerPosition(uuid: string) {
        const player = this.players.find(p => p.uuid == uuid);
        if (!player) {
            console.error("Player not found");
            return;
        }
        return player.position;
    }

    // TODO
    public getFieldForPlayer(uuid: string) {
        return TileType.START;
    }

    // TODO
    public isFieldOwned(tile: TileType) {
        return false;
    }

    /* Host Functions */

    public executeRoll(uuid: string) {
        const roll = Math.floor(Math.random() * 6) + 1;
        const player = this.players.find(p => p.uuid == uuid);
        if (!player) {
            console.error("Player not found");
            return;
        }
        player.position += roll;
        this.syncProxy.updatePlayerPosition(uuid, player.position);
    }

    /* Network Functions */

    private initBoard(tiles: TileType[], players: Player[]) {
        this.players = players;
        this.scene.initBoard(tiles, players.map((p, i) => ({
            uuid: p.uuid,
            money: p.money
        })))
    }

    private rollDice() {
        if (!this.aznopoly.isHost) {
            return;
        }

        const sender = arguments[arguments.length - 1]; // Black Magic to get the player uuid that started the roll
        if (!this.currentTurn) {
            console.error("Received roll request but no turn in progress");
            return;
        }
        this.currentTurn.doRoll(sender);
    }

    private updatePlayerPosition(uuid: string, position: number) {
        this.scene.updatePlayerPosition(uuid, position);
    }

    private startMinigame(minigame: string) {
        this.scene.showMinigameSelect("The Minigame").then(() => {
            setTimeout(() => {
                this.scene.hideMinigameSelect();
                if (this.aznopoly.isHost) {
                    this.scene.scene.sleep();
                    this.scene.scene.launch(minigame);
                }
            }, 500)
        });
    }

    private startTurn(uuid: string) {
        if(uuid == this.aznopoly.uuid) {
            this.scene.enableRollButton();
        }
    }

}