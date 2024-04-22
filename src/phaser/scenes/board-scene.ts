import GameBoard, { GameBoard2D } from "../components/board";
import { AzNopolyButton } from "../components/ui/button";
import RandomSelectionWheel from "../components/ui/random-selection-wheel";
import { BaseScene } from "./base/base-scene";
import BoardSceneController from "./board-scene-controller";
import AzNopolyPlayerInfo, { PlayerInfo } from "@/phaser/components/ui/player-info";
import AzNopolyList from "@/phaser/components/ui/element-list";
import { SETTINGS } from "@/settings";
import BoardTilePopUp from "../components/board-tile-popup";
import { TileType } from "@/types/board";
import Board3D from "./board/board-3d";
import TurnMenu from "../components/ui/board/turn-menu";
import RoundPanel from "../components/ui/board/round-panel";

export default class BoardScene extends BaseScene<BoardSceneController> {

    private board!: Phaser.GameObjects.GameObject & GameBoard;
    private board3D!: Board3D;
    private tilePopUp!: BoardTilePopUp;
    private choiceWheel!: RandomSelectionWheel;
    private playerList!: AzNopolyList<AzNopolyPlayerInfo>;
    private roundPanel!: RoundPanel;

    private bgm!: Phaser.Sound.BaseSound;
    private popupSound!: Phaser.Sound.BaseSound;

    private turnMenu!: TurnMenu;
    private currentTurnUUID!: string;
    private tiles: TileType[] = [];

    preload() {
        AzNopolyPlayerInfo.preload(this);
        GameBoard2D.preload(this);
        AzNopolyButton.preload(this);
        RoundPanel.preload(this);
        this.load.audio('board-bgm', 'assets/audio/night-walk-electro-swing.mp3')
        this.load.audio('popup-sound', 'assets/audio/minigame-roulette-sound.mp3')
    }

    init() {
        this.controller = new BoardSceneController(this, this.aznopoly);
    }

    create() {
        this.cameras.main.fadeIn(100);
        this.board = new Board3D(this);
        this.board3D = this.board as Board3D;

        this.popupSound = this.sound.add('popup-sound', { volume: 0.6 });
        this.bgm = this.sound.add('board-bgm', { loop: true, volume: 0.2 });
        this.bgm.play();
        this.scene.scene.events.on(Phaser.Scenes.Events.WAKE, this.startMusic, this);


        this.roundPanel = new RoundPanel(this, SETTINGS.DISPLAY_WIDTH * 0.5, 25);
        this.playerList = new AzNopolyList(this, SETTINGS.DISPLAY_WIDTH - AzNopolyPlayerInfo.WIDTH - 25, SETTINGS.DISPLAY_HEIGHT * 0.5, "VERT", 20);
        this.turnMenu = new TurnMenu(this, SETTINGS.DISPLAY_WIDTH / 2, SETTINGS.DISPLAY_HEIGHT * 0.75);
        this.choiceWheel = new RandomSelectionWheel(this, SETTINGS.DISPLAY_WIDTH / 2, SETTINGS.DISPLAY_HEIGHT / 2, { width: 300, height: 40 });
        this.tilePopUp = new BoardTilePopUp(this, SETTINGS.DISPLAY_WIDTH / 2, SETTINGS.DISPLAY_HEIGHT / 2);

        this.roundPanel.setVisible(false);
        this.playerList.setVisible(false);
        this.roundPanel.setOnActionClick(this.onActionClick.bind(this));
        //this.playerList.setVisible(false);
        this.tilePopUp.setSubmitButtonOnClick(this.controller.onClickSubmitProperty.bind(this.controller));
        this.tilePopUp.setCancelButtonOnClick(this.controller.onClickCancelProperty.bind(this.controller));
        this.turnMenu.getRollButton().setOnClick(this.controller.onRollClick.bind(this.controller));
        this.turnMenu.getRollButton().setOnHover(
            () => {
                this.controller.syncProxy.scene.setPreviewDice(true);
            },
            () => {
                this.controller.syncProxy.scene.setPreviewDice(false);
            }
        )
        this.board3D.cameraManager.setListener(this.onCameraStateChange.bind(this));

        this.add.existing(this.board);
        this.add.existing(this.roundPanel);
        this.add.existing(this.playerList);
        this.add.existing(this.turnMenu);
        this.add.existing(this.choiceWheel);
        this.add.existing(this.tilePopUp);
    }

    private onCameraStateChange(state: string) {
        if (state === "OVERVIEW") {
            this.roundPanel.setZoomIcon(true);
        } else {
            this.roundPanel.setZoomIcon(false);
        }
    }

    private onActionClick(action: string) {
        switch (action) {
            case "OVERVIEW":
                this.board3D.cameraManager.focusOverview();
                break;
            case "FOCUS":
                this.board3D.focusPlayer(this.currentTurnUUID);
                break;
        }
    }

    public setPreviewDice(isPreview: boolean) {
        this.board3D.highlightDice(isPreview);
    }

    public initBoard(tiles: TileType[], players: (PlayerInfo & { uuid: string })[]) {
        this.tiles = tiles;
        this.board.init(tiles);
        this.addPlayers(players);
    }

    public async showBoardIntro() {
        await this.board3D.doIntro();
        if (this.aznopoly.isHost) {
            await this.controller.onIntroOver();
            this.roundPanel.setVisible(true);
            this.playerList.setVisible(true);
        }
    }

    private addPlayers(infos: (PlayerInfo & { uuid: string })[]) {
        infos.forEach(info => {
            this.board.addPlayer(info.uuid, this.aznopoly.getProfile(info.uuid));
            const profile = this.aznopoly.getProfile(info.uuid);
            const playerInfo = new AzNopolyPlayerInfo(this, 0, 0, info, profile);
            playerInfo.setOnHover(
                () => {
                    this.board3D.focusPlayer(info.uuid);
                    this.tweens.addCounter({
                        from: 0,
                        to: -25,
                        duration: 50,
                        onUpdate: (tween) => {
                            playerInfo.x = tween.getValue();
                        }
                    
                    })
                },
                () => {
                    this.board3D.focusPlayer(this.currentTurnUUID);
                    playerInfo.x = 0;
                    this.tweens.addCounter({
                        from: -25,
                        to: 0,
                        duration: 50,
                        onUpdate: (tween) => {
                            playerInfo.x = tween.getValue();
                        }
                    
                    })
                }
            )
            this.playerList.addElement(info.uuid, playerInfo);
        });
        this.playerList.y -= this.playerList.height * 0.5;
    }

    public update(time: number, delta: number) {
        this.board3D.update(delta);
    }

    public updatePlayerInfo(uuid: string, info: PlayerInfo) {
        const playerInfoElement = this.playerList.getElement(uuid);
        if (!playerInfoElement) {
            console.error("No player info element found for", uuid);
            return;
        }
        playerInfoElement.updateInfo(info);
    }

    public setCurrentTurn(uuid: string) {
        this.currentTurnUUID = uuid;
        this.playerList.elements.forEach(e => e.element.setIsOnTurn(e.key === uuid));
        this.board3D.showDiceForPlayer(uuid);
    }

    public updatePlayerPosition(uuid: string, startPosition: number, targetPosition: number) {
        return new Promise<void>(resolve => {
            const tilesToMove = (targetPosition > startPosition) ? targetPosition - startPosition : (targetPosition + (4 * SETTINGS.BOARD_SIDE_LENGTH) + 4) - startPosition;

            for (let i = 0; i <= tilesToMove; i++) {
                setTimeout(() => {
                    this.board.teleportPlayerToPosition(uuid, startPosition + i);
                    if (i === tilesToMove) {
                        setTimeout(resolve, 500);
                    }
                }, 250 * (i));
            }
        });
    }

    public updateTileOwners(uuid: string, tileIndexes: number[]) {
        tileIndexes.forEach(tilePos => {
            this.board.updateTileOwner(this.aznopoly.getProfile(uuid), tilePos);
        })
    }

    public async showDiceRoll(roll: number) {
        await this.board3D.rollDice(roll);
    }

    public showPlayerTurnMenu(uuid: string) {
        this.board3D.focusPlayer(uuid);
        if (uuid === this.aznopoly.uuid) {
            this.turnMenu.showRollDialog();
        } else {
            this.turnMenu.showWaitingForPlayer(this.aznopoly.getProfile(uuid).name + "'s Turn");
        }
    }

    public hidePlayerTurnMenu() {
        this.turnMenu.setVisible(false);
    }

    public async showBuyTilePopUp(level: number, price: number, name: string, tileType: TileType) {
        const tileIndexes = this.tiles.reduce((acc: number[], tile, index) => {
            if (tile === tileType) {
                acc.push(index);
            }
            return acc;
        }, []);

        await this.board3D.cameraManager.focusOverview(250);
        await sleep(250);
        this.board3D.highlightTiles(tileIndexes);
        this.popupSound.play();
        this.tilePopUp.show({
            upgradeLevel: level,
            price,
            name,       
            tileType 
        });
    }

    public hideBuyTilePopUp() {
        this.board3D.resetTileHighlights();
        this.tilePopUp.hide();
    }

    public showMinigameSelect(name: string): Promise<void> {
        this.popupSound.play();
        this.choiceWheel.setVisible(true);
        return this.choiceWheel.startSpin(["???", "???", "???"], name);
    }

    public hideMinigameSelect() {
        this.choiceWheel.setVisible(false);
    }

    public stopMusic() {
        this.bgm.pause();
    }

    public startMusic() {
        this.bgm.resume();
    }


}

function sleep(time: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, time);
    });
}