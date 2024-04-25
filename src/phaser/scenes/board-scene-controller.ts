import AzNopolyGame from "@/game";
import SyncedSceneController from "@/phaser/scenes/base/synced-scene-controller";
import BoardScene from "@/phaser/scenes/board-scene";
import { ResultData } from "@/phaser/scenes/base/minigame-scene-controller";
import { TileType } from "@/types/board";
import PropertyManager from "@/scene/board/property-manager.ts";
import BoardGenerator from "@/util/board-generator";
import Turn from "@/scene/board/turn-controller";
import { SETTINGS } from "@/settings";

interface Player {
    uuid: string;
    money: number;
    tiles: number[];
    position: number;
}

export default class BoardSceneController extends SyncedSceneController {

    declare public scene: BoardScene;

    /**
     * List of players in turn order
     */
    private players!: Player[];
    private minigameInprogress: boolean = false;
    private currentTurn?: Turn;
    private propertyManager: PropertyManager = new PropertyManager(this);
    private tiles!: TileType[];

    constructor(scene: BoardScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly, "start");

        this.registerSyncedMethod(this.initBoard, true);
        this.registerSyncedMethod(this.startTurn, true);
        this.registerSyncedMethod(this.startMinigame, true);
        this.registerSyncedMethod(this.startBuyProperty, true);
        this.registerSyncedMethod(this.stopBuyPropertyDialog, true);
        this.registerSyncedMethod(this.removeMoney, true);
        this.registerSyncedMethod(this.addMoney, true);
        this.registerSyncedMethod(this.addTiles, true);

        this.registerSyncedProp("scene");
        this.registerSyncedMethod(this.scene.updatePlayerPosition, false);
        this.registerSyncedMethod(this.scene.showDiceRoll, false);
        this.registerSyncedMethod(this.scene.showBoardIntro, true);
        this.registerSyncedMethod(this.scene.hidePlayerTurnMenu, true);
        this.registerSyncedMethod(this.scene.setPreviewDice, false);

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

            const tiles = BoardGenerator.generateFields(this.aznopoly.room.host, SETTINGS.BOARD_SIDE_LENGTH);
            this.syncProxy.initBoard(tiles, players);
            this.syncProxy.scene.showBoardIntro();
        }
    }

    public onIntroOver() {
        if (!this.aznopoly.isHost) {
            throw new Error("Only the host should call this method");
        }
        this.doTurn(this.players[0].uuid);
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

    private addMoney(uuid: string, amount: number) {
        const player = this.getPlayer(uuid);
        if (!player) {
            console.error("Player not found");
            return;
        }
        player.money += amount;

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
        this.scene.updateTileOwners(uuid, tiles);
    }

    public onPropertyBought(uuid: string, fields: number[], price: number) {
        if (!this.aznopoly.isHost) return;

        this.syncProxy.removeMoney(uuid, price);
        this.syncProxy.addTiles(uuid, fields);
    }

    public onPayedRent(uuid: string, owner: string, rent: number) {
        if (!this.aznopoly.isHost) return;

        this.syncProxy.removeMoney(uuid, rent);
        this.syncProxy.addMoney(owner, (rent * 0.5));
    }

    public executeCancelBuyProperty(uuid: string) {
        if (!this.aznopoly.isHost) return;

        if (!this.currentTurn) {
            console.error("Received cancel buy property request but no turn in progress");
            return;
        }

        this.syncProxy.stopBuyPropertyDialog();
        this.currentTurn.doCancelBuyProperty(uuid);
    }

    public buyProperty() {
        if (!this.aznopoly.isHost) return;

        const sender = arguments[arguments.length - 1];
        if (!this.currentTurn) {
            console.error("Received buy property request but no turn in progress");
            return;
        }

        this.currentTurn.doBuyProperty(sender);
    }

    public cancelBuyProperty() {
        if (!this.aznopoly.isHost) return;

        const sender = arguments[arguments.length - 1];
        if (!this.currentTurn) {
            console.error("Received buy property request but no turn in progress");
            return;
        }

        this.currentTurn.doCancelBuyProperty(sender);
    }

    public onRollClick() {
        this.syncProxy.rollDice();
    }

    public onTurnEnd(uuid: string) {
        setTimeout(() => {
            const currentIndex = this.players.findIndex(p => p.uuid == uuid);
            if (currentIndex == this.players.length - 1) {
                this.minigameInprogress = true;
                const minigames = SETTINGS.AVAILABLE_MINIGAMES;
                this.syncProxy.startMinigame(minigames[Math.floor(Math.random() * minigames.length)]);
            } else {
                const nextPlayer = this.getNextPlayerIndex(uuid);
                this.doTurn(this.players[nextPlayer].uuid);
            }
        }, 500)
    }

    public onClickSubmitProperty() {
        this.scene.hideBuyTilePopUp();
        this.syncProxy.buyProperty();
    }

    public onClickCancelProperty() {
        this.scene.hideBuyTilePopUp();
        this.syncProxy.cancelBuyProperty();
    }

    public executeBuyPropertyDialog(uuid: string) {
        const player = this.players.find(p => p.uuid == uuid);
        if (!player) {
            console.error("Player not found");
            return;
        }

        this.syncProxy.startBuyProperty(uuid, this.propertyManager.getPropertyLevel(player.position), this.tiles[player.position]);
    }

    public onHasToPayRent(uuid: string) {
        const player = this.players.find(p => p.uuid == uuid);
        if (!player) {
            console.error("Player not found");
            return;
        }

        // TODO: Show that rent was payed
        this.propertyManager.payPropertyRent(uuid, player.position)
        // TODO: Check if player is bankrupt
    }

    private doTurn(uuid: string) {
        this.currentTurn = new Turn(this, this.propertyManager, uuid);
        this.syncProxy.startTurn(uuid);
    }

    private stopBuyPropertyDialog() {
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
            return -1;
        }
        return player.position!;
    }

    /* Host Functions */
    public async executeRoll(uuid: string) {
        const roll = Math.floor(Math.random() * 6) + 1;
        const player = this.players.find(p => p.uuid == uuid);
        if (!player) {
            console.error("Player not found");
            return;
        }

        console.log("Player rolled", roll);
        await this.syncProxy.scene.showDiceRoll(roll);
        console.log("Player rolled 2", roll);

        const startPosition = player.position;
        player.position = (player.position +  roll) % ((SETTINGS.BOARD_SIDE_LENGTH * 4) + 4);
        await this.syncProxy.scene.updatePlayerPosition(uuid, startPosition, player.position);
    }

    /* Network Functions */
    private initBoard(tiles: TileType[], players: Player[]) {
        this.players = players;
        this.tiles = tiles;

        this.scene.initBoard(tiles, players.map((p, i) => ({
            uuid: p.uuid,
            money: p.money
        })))
    }

    private rollDice() {
        if (!this.aznopoly.isHost) {
            return;
        }

        this.syncProxy.scene.hidePlayerTurnMenu();

        const sender = arguments[arguments.length - 1]; // Black Magic to get the player uuid that started the roll
        if (!this.currentTurn) {
            console.error("Received roll request but no turn in progress");
            return;
        }
        this.currentTurn.doRoll(sender);
    }

    private startMinigame(minigame: string) {
        this.scene.showMinigameSelect("The Minigame").then(() => {
            setTimeout(() => {
                this.scene.hideMinigameSelect();
                if (this.aznopoly.isHost) {
                    this.scene.scene.sleep();
                    this.scene.scene.launch(minigame);
                    this.scene.stopMusic();
                }
            }, 500)
        });
    }

    private startTurn(uuid: string) {
        this.scene.showPlayerTurnMenu(uuid);
        this.scene.setCurrentTurn(uuid);
    }

    private startBuyProperty(uuid: string, level: number, tileType: TileType) {
        if(uuid != this.aznopoly.uuid) {
            return;
        }

        this.scene.showBuyTilePopUp(level, this.propertyManager.calculatePropertyPrice(level), "COOL PROPERTRY", tileType);
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

    public getTile(pos: number): TileType {
        return this.tiles[pos]!;
    }

    public isFieldOwnedByPlayer(pos: number, uuid: string) {
        return this.players.find(p => p.uuid == uuid)?.tiles.includes(pos);
    }

    public isFieldOwned(pos: number) {
        return this.players.some(p => p.tiles.includes(pos));
    }

    public getAllTilesByType(type: TileType){
        return this.tiles.map((tile, index) => ({tile, index})).filter(t => t.tile == type).map(t => t.index);
    }
}