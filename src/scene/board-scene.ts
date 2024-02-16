import GameBoard from "../board/board";
import {HEIGHT, WIDTH} from "../main";
import {FONT_STYLE_BODY} from "../style";
import {AzNopolyButton} from "../ui/button";
import PlayerList from "../ui/player-list";
import RandomSelectionWheel from "../ui/random-selection-wheel";
import {BaseScene} from "./base/base-scene";
import BoardSceneController from "./board-scene-controller";
import {TileType} from "@/types/board.ts";
import BoardTile from "@/board/board-tile.ts";
import BoardTilePopUp from "@/board/board_tile_popup.ts";


export default class BoardScene extends BaseScene<BoardSceneController> {

    private board!: GameBoard;
    private tilePopUp!: BoardTilePopUp;
    private rollButton!: AzNopolyButton;
    private choiceWheel!: RandomSelectionWheel;

    preload() {
        GameBoard.preload(this);
        AzNopolyButton.preload(this);
    }
    
    init() {
        this.controller = new BoardSceneController(this, this.aznopoly);
    }

    create() {
        const boardSize = HEIGHT * 0.8;
        this.board = this.add.existing(new GameBoard(this.aznopoly.room.host, this, (WIDTH - boardSize) * 0.5 - 200, (HEIGHT - boardSize) * 0.5, boardSize));

        const playerList = this.add.existing(new PlayerList(this, false, WIDTH - 300, 0, 250));
        playerList.updatePlayerList(this.aznopoly.room.connectedPlayerIds.map(e => ({uuid: e, name: this.aznopoly.room.getPlayerName(e), host: false})))
        playerList.updateTitle("");

        this.rollButton = this.add.existing(new AzNopolyButton(this, "Roll Dice", WIDTH - 325, HEIGHT - 100, 250, 55, this.controller.onRollClick.bind(this.controller)));
        this.rollButton.disable();

        this.choiceWheel = this.add.existing(new RandomSelectionWheel(this, WIDTH /2, HEIGHT / 2, {width: 300, height: 40}));
        this.choiceWheel.setVisible(false);

        this.tilePopUp = this.add.existing(new BoardTilePopUp(this, WIDTH / 2, HEIGHT / 2, {width: 300, height: 200},
            this.controller.onTileBuyCancel.bind(this.controller), this.controller.onTileBuySubmit.bind(this.controller)));
        this.tilePopUp.hide();

        this.add.text(WIDTH - 300, 300, "Current Turn:", FONT_STYLE_BODY);
    }

    public addPlayers(players: string[]) {
        players.forEach(player => this.board.addPlayer(player));
    }

    public updatePlayerPosition(uuid: string, position: number, teleport: boolean = false) {
        if(teleport) {
            return this.board.teleportPlayerToPosition(uuid, position);
        }
        return this.board.movePlayerToPosition(uuid, position);
    }

    public enableRollButton() {
        this.rollButton.enable();
    }

    public disableRollButton() {
        this.rollButton.disable();
    }

    public showBuyTilePopUp(tile: BoardTile, level: number) {
        this.tilePopUp.show(tile, level);
    }

    public hideBuyTilePopUp() {
        this.tilePopUp.hide();
    }

    public showMinigameSelect(name: string) : Promise<void> {
        this.choiceWheel.setVisible(true);
        return this.choiceWheel.startSpin(["Giga Chad says", "Poop up", "GRAND SURPRISE"], name);
    }

    public hideMinigameSelect() {
        this.choiceWheel.setVisible(false);
    }

    public getTile(position: number) {
        return this.board.getTile(position);
    }

    public getTilesOfType(type: TileType) {
        return this.board.getTilesOfType(type);
    }

}