import AzNopolyGame from "../game";
import SyncedSceneController from "./base/synced-scene-controller";
import BoardScene from "./board-scene";
import {TileType} from "@/types/board.ts";

interface Player {
    uuid: string;
    name: string;
    money: number;
    tiles: number[];
    position: number;
}

export default class BoardSceneController extends SyncedSceneController {
    
    declare protected scene: BoardScene;

    private currentPlayerUuid: string = "";
    private players!: Player[];

    constructor(scene: BoardScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly, "start");

        this.registerSyncedMethod(this.addPlayersToBoard, true);
        this.registerSyncedMethod(this.updatePlayerPosition, true);
        this.registerSyncedMethod(this.startTurn, true);
        this.registerSyncedMethod(this.startMinigame, true);
        this.registerSyncedMethod(this.updatePlayers, true);
        this.registerSyncedMethod(this.showPropertyPopUp, true);
        this.registerSyncedMethod(this.cancelPropertyPopUp, true);

        this.registerSyncedMethod(this.doDiceRoll, false);
        this.registerSyncedMethod(this.cancelBuy, false)
        this.registerSyncedMethod(this.submitBuy, false);
    }
    
    onAllPlayersReady(): void {
        if (this.aznopoly.isHost) {
            const players = this.aznopoly.connectedUuids.map(uuid => ({
                uuid,
                name: this.aznopoly.room.getPlayerName(uuid),
                money: 1500,
                tiles: [],
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

    private updatePlayers(players: Player[]) {
        this.players = players;
    }

    private startTurn(uuid: string) {
        this.currentPlayerUuid = uuid;

        if(uuid == this.aznopoly.uuid) {
            this.scene.enableRollButton();
        }
    }

    private showPropertyPopUp() {
        if(this.currentPlayerUuid == this.aznopoly.uuid) {
            const player = this.players.find(p => p.uuid == this.aznopoly.uuid);
            if (!player) {
                return;
            }

            this.scene.showBuyTilePopUp(this.scene.getTile(player.position), player.tiles.filter(t => t == player.position).length);
        }
    }

    private cancelPropertyPopUp() {
        if(this.currentPlayerUuid == this.aznopoly.uuid) {
            this.scene.hideBuyTilePopUp();
        }
    }

    public onRollClick() {
        this.scene.disableRollButton();
        this.syncProxy.doDiceRoll();
    }

    public onTileBuySubmit() {
        this.scene.hideBuyTilePopUp();
        this.syncProxy.submitBuy();
    }

    public onTileBuyCancel() {
        this.scene.hideBuyTilePopUp();
        this.syncProxy.cancelBuy();
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

        let tile = this.scene.getTile(player.position)
        if(TileType.isCorner(tile.getTileType()) || tile.getTileType() == TileType.ACTION) {
            this.startNextTurn();
            return;
        }

        // Check if any other player owns the tile
        if (this.players.some(p => p.uuid !== player.uuid && p.tiles.includes(player.position))) {
            this.startNextTurn();
            return;
        }

        // Show buy property popup
        this.syncProxy.showPropertyPopUp();
        setTimeout(() => {
            this.syncProxy.cancelPropertyPopUp();
            this.startNextTurn();
        }, 3000);
    }

    private submitBuy() {
        if (!this.aznopoly.isHost) {
            return;
        }

        const uuid = arguments[arguments.length - 1];
        if (this.currentPlayerUuid != uuid) {
            console.warn("Received buy from non-current player");
            return;
        }

        let sender = this.players.find(value => value.uuid === uuid);
        if (sender === undefined) {
            return;
        }

        let currentTile = this.scene.getTile(sender.position).getTileType();
        if (currentTile == TileType.ACTION || TileType.isCorner(currentTile)) {
            console.warn("Received buy on non-buyable tile")
            return;
        }

        let level = sender.tiles.filter(t => t == sender?.position).length;
        if (level >= 4) {
            console.warn("Received buy on max level tile")
            return;
        }

        let tiles = this.scene.getTilesOfType(currentTile);

        // Check if any tile is already owned by someone else
        for (let tile of tiles) {
            let owner = this.players.find(p => p.tiles.includes(tile));
            if (owner !== undefined && owner.uuid !== uuid) {
                return;
            }
        }

        sender.tiles.push(...tiles);

        this.syncProxy.updatePlayers(this.players);
        this.startNextTurn();
    }

    private cancelBuy() {
        this.startNextTurn();
    }

    private startNextTurn() {
        const currentIndex = this.players.findIndex(p => p.uuid == this.currentPlayerUuid);
        const nextIndex = (currentIndex + 1) % this.players.length;
        const nextPlayer = this.players[nextIndex];

        this.syncProxy.startTurn(nextPlayer.uuid);

        if (nextIndex == 0) {
            this.syncProxy.startMinigame();
        }
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