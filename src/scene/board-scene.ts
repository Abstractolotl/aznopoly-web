import AzNopolyPanel from "@/ui/panel";
import GameBoard from "../board/board";
import { HEIGHT, WIDTH } from "../main";
import { FRAME_PADDING } from "../style";
import { AzNopolyButton } from "../ui/button";
import PlayerList from "../ui/player-list";
import RandomSelectionWheel from "../ui/random-selection-wheel";
import { BaseScene } from "./base/base-scene";
import BoardSceneController from "./board-scene-controller";
import AzNopolyBar from "@/ui/bar";
import AzNopolyPlayerInfo, { PlayerInfo } from "@/ui/player-info";
import { Avatars } from "@/ui/avatar";
import AzNopolyList from "@/ui/element-list";


export default class BoardScene extends BaseScene<BoardSceneController> {

    private board!: GameBoard;
    private rollButton!: AzNopolyButton;
    private choiceWheel!: RandomSelectionWheel;
    private playerList!: AzNopolyList<AzNopolyPlayerInfo>;

    preload() {
        AzNopolyPlayerInfo.preload(this);
        GameBoard.preload(this);
        AzNopolyButton.preload(this);
    }
    
    init() {
        this.controller = new BoardSceneController(this, this.aznopoly);
    }

    create() {
        this.rollButton = this.add.existing(new AzNopolyButton(this, "Roll Dice", 50, 200, 150, 55, this.controller.onRollClick.bind(this.controller)));
        this.rollButton.disable();
        
        const RIGHT_PANEL_WIDTH = 350;
        this.add.existing(new AzNopolyBar(this, "AzNopoly"));
        const rightPanel = this.add.existing(new AzNopolyPanel(this, WIDTH - RIGHT_PANEL_WIDTH - FRAME_PADDING, AzNopolyBar.HEIGHT + FRAME_PADDING * 2, RIGHT_PANEL_WIDTH, HEIGHT - AzNopolyBar.HEIGHT - FRAME_PADDING * 3).setDepth(-1));
        const leftPanel = this.add.existing(new AzNopolyPanel(this, FRAME_PADDING, AzNopolyBar.HEIGHT + FRAME_PADDING * 2, WIDTH - FRAME_PADDING * 3 - RIGHT_PANEL_WIDTH, HEIGHT - AzNopolyBar.HEIGHT - FRAME_PADDING * 3).setDepth(-1));

        const boardSize = leftPanel.height * 0.8;
        this.board = this.add.existing(new GameBoard(this.aznopoly.room.host, this, leftPanel.x + leftPanel.width * 0.5 - boardSize * 0.5, leftPanel.y + leftPanel.height * 0.5 - boardSize * 0.5, boardSize));

        this.playerList = this.add.existing(new AzNopolyList(this, rightPanel.x + FRAME_PADDING, rightPanel.y + FRAME_PADDING));
      
        this.rollButton = this.add.existing(new AzNopolyButton(this, "Roll Dice", WIDTH - 325, HEIGHT - 100, 250, 55, this.controller.onRollClick.bind(this.controller)));
        this.rollButton.disable();

        this.choiceWheel = this.add.existing(new RandomSelectionWheel(this, WIDTH /2, HEIGHT / 2, {width: 300, height: 40}));
        this.choiceWheel.setVisible(false);
    
    }

    public addPlayers(infos: (PlayerInfo & {uuid: string})[]) {
        infos.forEach(info => {
            this.board.addPlayer(info.uuid);
            const profile = this.aznopoly.getProfile(info.uuid);
            this.playerList.addElement(info.uuid, new AzNopolyPlayerInfo(this, 0, 0, info, profile));
        });
        
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