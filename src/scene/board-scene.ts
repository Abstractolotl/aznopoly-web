import GameBoard from "../board/board";
import { HEIGHT, WIDTH } from "../main";
import { FONT_STYLE_BODY } from "../style";
import { AzNopolyButton } from "../ui/button";
import PlayerList from "../ui/player-list";
import RandomSelectionWheel from "../ui/random-selection-wheel";
import { BaseScene } from "./base/base-scene";
import BoardSceneController from "./board-scene-controller";


export default class BoardScene extends BaseScene<BoardSceneController> {

    private board!: GameBoard;
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

        this.rollButton = this.add.existing(new AzNopolyButton(this, "Roll Dice", WIDTH - 150, HEIGHT - 100, 0, 0, this.controller.onRollClick.bind(this.controller)));
        this.rollButton.disable();

        this.choiceWheel = this.add.existing(new RandomSelectionWheel(this, WIDTH /2, HEIGHT / 2, {width: 300, height: 40}));
        this.choiceWheel.setVisible(false);

        this.add.text(WIDTH - 300, 300, "Current Turn:", FONT_STYLE_BODY);
    }

    public addPlayers(players: string[]) {
        players.forEach(player => this.board.addPlayer(player));
    }

    public updatePlayerPosition(uuid: string, position: number) {
        this.board.movePlayerToPosition(uuid, position);
    }

    public enableRollButton() {
        this.rollButton.enable();
    }

    public disableRollButton() {
        this.rollButton.disable();
    }

    public showMinigameSelect(name: string) : Promise<void> {
        this.choiceWheel.setVisible(true);
        return this.choiceWheel.startSpin(["Giga Chad says", "Poop up", "GRAND SURPRISE"], name);
    }

    public hideMinigameSelect() {
        this.choiceWheel.setVisible(false);
    }

}