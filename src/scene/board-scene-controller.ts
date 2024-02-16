import AzNopolyGame from "../game";
import SyncedSceneController from "./base/synced-scene-controller";
import BoardScene from "./board-scene";
import { ResultData } from "./base/minigame-scene-controller";
import Turn from "./board/turn-controller";
import { TileType } from "@/types/board";
import BoardGenerator from "@/board/board-generator";
import { BOARD_SIDE_LENGTH } from "@/main";
import PropertyManager from "@/scene/board/property-controller.ts";

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
    private propertyHelper: PropertyManager = new PropertyManager(this);

    // Scheduler for handling time based events
    private scheduler!: NodeJS.Timeout;

    constructor(scene: BoardScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly, "start");

        this.registerSyncedMethod(this.initBoard, true);
        this.registerSyncedMethod(this.updatePlayerPosition, true);
        this.registerSyncedMethod(this.startTurn, true);
        this.registerSyncedMethod(this.startMinigame, true);
        this.registerSyncedMethod(this.startBuyProperty, true);
        this.registerSyncedMethod(this.interruptBuyProperty, true);
        this.registerSyncedMethod(this.removeMoney, true);
        this.registerSyncedMethod(this.addTiles, true);

        this.registerSyncedMethod(this.rollDice, false);
        this.registerSyncedMethod(this.buyProperty, false)
        this.registerSyncedMethod(this.cancelBuyProperty, false);
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

    private removeMoney(uuid: string, amount: number) {
        const player = this.getPlayer(uuid);
        if (!player) {
            console.error("Player not found");
            return;
        }
        player.money -= amount;

        this.scene.updatePlayerInfo(uuid, player);
    }

    private addTiles(uuid: string, tiles: number[]) {
        const player = this.getPlayer(uuid);
        if (!player) {
            console.error("Player not found");
            return;
        }

        tiles.forEach(value => {
            player.tiles.push(value);
        })

        this.scene.updatePlayerInfo(uuid, player);
    }

    public buyProperty(uuid: string) {
        if (!this.aznopoly.isHost) return;

        const player = this.players.find(p => p.uuid == uuid);
        if (!player) {
            return;
        }

        clearTimeout(this.scheduler);
        this.currentTurn?.doBuyProperty();
    }

    public cancelBuyProperty(uuid: string) {
        if (!this.aznopoly.isHost) return;

        const player = this.players.find(p => p.uuid == uuid);
        if (!player) {
            return;
        }

        clearTimeout(this.scheduler);
        this.currentTurn?.cancelBuyProperty();
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

    public onClickSubmitProperty() {
        this.scene.hideBuyTilePopUp();
        this.syncProxy.buyProperty(this.aznopoly.uuid);
    }

    public onClickCancelProperty() {
        this.scene.hideBuyTilePopUp();
        this.syncProxy.cancelBuyProperty(this.aznopoly.uuid);
    }

    public onCanBuyProperty(uuid: string) {
        const player = this.players.find(p => p.uuid == uuid);
        if (!player) {
            return;
        }

        this.syncProxy.startBuyProperty(uuid, this.propertyHelper.getPropertyLevel(player.position));
        this.scheduler = setTimeout(() => {
            this.syncProxy.interruptBuyProperty(uuid);
            this.currentTurn?.cancelBuyProperty();
        }, 3000);
    }

    public onHasToPayRent(uuid: string) {
        const player = this.players.find(p => p.uuid == uuid);
        if (!player) {
            console.error("Player not found");
            return;
        }

        // TODO: Show that rent was payed
        this.propertyHelper.payPropertyRent(uuid, player.position)
        // TODO: Check if player is bankrupt
        this.onTurnEnd(uuid);
    }

    private doTurn(uuid: string) {
        this.currentTurn = new Turn(this, this.propertyHelper, uuid);
        this.syncProxy.startTurn(uuid);
    }

    private interruptBuyProperty(uuid: string) {
        if(uuid != this.aznopoly.uuid) {
            return;
        }
        this.scene.hideBuyTilePopUp();
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

    /* Host Functions */
    public executeRoll(uuid: string) {
        const roll = Math.floor(Math.random() * 6) + 1;
        const player = this.players.find(p => p.uuid == uuid);
        if (!player) {
            console.error("Player not found");
            return;
        }
        player.position = (player.position +  roll) % ((BOARD_SIDE_LENGTH * 4) + 4);
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

    private startBuyProperty(uuid: string, level: number) {
        if(uuid != this.aznopoly.uuid) {
            return;
        }

        this.scene.showBuyTilePopUp((level > 0), this.propertyHelper.calculatePropertyPrice(level));
    }

    /** Utility Functions **/
    public getPlayers() {
        return this.players;
    }

    public getPlayer(uuid: string) {
        const player = this.players.find(p => p.uuid == uuid);
        if (!player) {
            return null;
        }
        return player;
    }

    public getTile(pos: number) {
        return this.scene.getTile(pos);
    }

    public isFieldOwnedByPlayer(pos: number, uuid: string) {
        return this.players.find(p => p.uuid == uuid)?.tiles.includes(pos);
    }

    public isFieldOwned(pos: number) {
        return this.players.some(p => p.tiles.includes(pos));
    }

    public getTiles(type: TileType){
        return this.scene.getTilesOfType(type);
    }
}