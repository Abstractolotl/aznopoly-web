import AzNopolyPanel from "@/phaser/components/ui/panel";
import GameBoard from "../components/board";
import { FRAME_PADDING } from "../../style";
import { AzNopolyButton } from "../components/ui/button";
import RandomSelectionWheel from "../components/ui/random-selection-wheel";
import { BaseScene } from "./base/base-scene";
import BoardSceneController from "./board-scene-controller";
import AzNopolyBar from "@/phaser/components/ui/bar";
import AzNopolyPlayerInfo, { PlayerInfo } from "@/phaser/components/ui/player-info";
import AzNopolyList from "@/phaser/components/ui/element-list";
import { SETTINGS } from "@/settings";
import BoardTilePopUp from "../components/board-tile-popup";
import { TileType } from "@/types/board";

export default class BoardScene extends BaseScene<BoardSceneController> {

    private board!: GameBoard;
    private tilePopUp!: BoardTilePopUp;
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
        const RIGHT_PANEL_WIDTH = 350;
        this.add.existing(new AzNopolyBar(this, "AzNopoly"));
        const rightPanel = this.add.existing(new AzNopolyPanel(this, SETTINGS.DISPLAY_WIDTH - RIGHT_PANEL_WIDTH - FRAME_PADDING, AzNopolyBar.HEIGHT + FRAME_PADDING * 2, RIGHT_PANEL_WIDTH, SETTINGS.DISPLAY_HEIGHT - AzNopolyBar.HEIGHT - FRAME_PADDING * 3).setDepth(-1));
        const leftPanel = this.add.existing(new AzNopolyPanel(this, FRAME_PADDING, AzNopolyBar.HEIGHT + FRAME_PADDING * 2, SETTINGS.DISPLAY_WIDTH - FRAME_PADDING * 3 - RIGHT_PANEL_WIDTH, SETTINGS.DISPLAY_HEIGHT - AzNopolyBar.HEIGHT - FRAME_PADDING * 3).setDepth(-1));

        const boardSize = leftPanel.height * 0.8;
        this.board = this.add.existing(new GameBoard(this, leftPanel.x + leftPanel.width * 0.5 - boardSize * 0.5, leftPanel.y + leftPanel.height * 0.5 - boardSize * 0.5, boardSize, SETTINGS.BOARD_SIDE_LENGTH));

        this.playerList = this.add.existing(new AzNopolyList(this, rightPanel.x + FRAME_PADDING, rightPanel.y + FRAME_PADDING));

        this.rollButton = this.add.existing(new AzNopolyButton(this, "Roll Dice", SETTINGS.DISPLAY_WIDTH - 325, SETTINGS.DISPLAY_HEIGHT - 100, 250, 55, this.controller.onRollClick.bind(this.controller)));
        this.rollButton.disable();

        this.choiceWheel = this.add.existing(new RandomSelectionWheel(this, SETTINGS.DISPLAY_WIDTH /2, SETTINGS.DISPLAY_HEIGHT / 2, {width: 300, height: 40}));
        this.choiceWheel.setVisible(false);

        this.tilePopUp = this.add.existing(new BoardTilePopUp(this, SETTINGS.DISPLAY_WIDTH / 2, SETTINGS.DISPLAY_HEIGHT / 2, {width: 300, height: 200}, this.controller.onClickCancelProperty.bind(this.controller), this.controller.onClickSubmitProperty.bind(this.controller)));
        this.tilePopUp.setVisible(false);
    }

    public addPlayers(infos: (PlayerInfo & {uuid: string})[]) {
        infos.forEach(info => {
            this.board.addPlayer(info.uuid, this.aznopoly.getProfile(info.uuid));
            const profile = this.aznopoly.getProfile(info.uuid);
            this.playerList.addElement(info.uuid, new AzNopolyPlayerInfo(this, 0, 0, info, profile));
        });
    }

    public updatePlayerInfo(uuid: string, info: PlayerInfo) {
        const playerInfoElement = this.playerList.getElement(uuid);
        if (!playerInfoElement) {
            console.error("No player info element found for", uuid);
            return;
        }
        playerInfoElement.updateInfo(info);
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

    public showBuyTilePopUp(upgrade: boolean, level: number) {
        this.tilePopUp.show(upgrade, level);
    }

    public hideBuyTilePopUp() {
        this.tilePopUp.hide();
    }

    public showMinigameSelect(name: string) : Promise<void> {
        this.choiceWheel.setVisible(true);
        return this.choiceWheel.startSpin(["???", "???", "???"], name);
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