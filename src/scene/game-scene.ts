import GameBoard from "../board/board";
import { HEIGHT, WIDTH } from "../main";
import { FONT_STYLE_BODY } from "../style";
import { GameTurnRollPacket, GameTurnStartPacket, PacketType } from "../types/client";
import { AzNopolyButton } from "../ui/button";
import PlayerList from "../ui/player-list";
import { BaseScene } from "./base-scene";


export default class GameScene extends BaseScene {

    private board!: GameBoard;
    private rollButton!: AzNopolyButton;

    private currentPlayerIndex: number = 0;
    private currentTurnValue!: Phaser.GameObjects.Text;
    
    private turnNumber: number = 0;

    preload() {
        GameBoard.preload(this);
    }

    hostOnAllPlayerReady() {
        this.aznopoly.room.connectedPlayerIds.forEach(uuid => {
            this.board.addPlayer(uuid);
        });

        this.startTurn();
    }

    create() {
        console.log("GameScene created")
        const boardSize = HEIGHT * 0.8;
        this.board = this.add.existing(new GameBoard(this.aznopoly, this, (WIDTH - boardSize) * 0.5 - 200, (HEIGHT - boardSize) * 0.5, boardSize));

        const playerList = this.add.existing(new PlayerList(this, false, WIDTH - 300, 0, 250));
        playerList.updatePlayerList(this.aznopoly.room.connectedPlayerIds.map(e => ({uuid: e, name: this.aznopoly.room.getPlayerName(e), host: false})))
        playerList.updateTitle("");

        this.rollButton = this.add.existing(new AzNopolyButton(this, "Roll Dice", WIDTH - 150, HEIGHT - 100, this.onRollClick.bind(this)));
        this.rollButton.disable();

        this.add.text(WIDTH - 300, 300, "Current Turn:", FONT_STYLE_BODY);
        this.currentTurnValue = this.add.text(WIDTH - 300, 350, "", FONT_STYLE_BODY);

        this.networkInit();
        super.create();
    }

    private networkInit() {
        if (this.aznopoly.isHost) {
            this.aznopoly.client.addEventListener(PacketType.GAME_TURN_ROLL, this.onTurnRoll.bind(this) as EventListener);
        }

        this.aznopoly.client.addEventListener(PacketType.GAME_TURN_START, this.onTurnStart.bind(this) as EventListener);
    }

    private onRollClick() {
        this.rollButton.disable();

        const packet: GameTurnRollPacket = {
            type: PacketType.GAME_TURN_ROLL,
            sender: this.aznopoly.player.uuid,
            data: {}
        }

        if (this.aznopoly.isHost) {
            this.onTurnRoll(new CustomEvent(PacketType.GAME_TURN_ROLL, { detail: packet }));
        } else {
            this.aznopoly.client.sendPacket(packet);
        }
    }

    private onTurnStart(event: CustomEvent<GameTurnStartPacket>) {
        const packet = event.detail;
        if (packet.data.player == this.aznopoly.player.uuid) {
            this.rollButton.enable();
        }

        this.currentTurnValue.setText(this.aznopoly.room.getPlayerName(packet.data.player));
    }

    private onTurnRoll(event: CustomEvent<GameTurnRollPacket>) {
        if (!this.aznopoly.isHost) return;

        const packet = event.detail;
        const currentPlayer = this.aznopoly.room.connectedPlayerIds[this.currentPlayerIndex];
        if (packet.sender == currentPlayer) {
            this.rollDice();
        }
    }

    private rollDice() {
        const roll = Math.floor(Math.random() * 6) + 1;

        const nextPlayer = this.aznopoly.room.connectedPlayerIds[this.currentPlayerIndex];
        this.board.movePlayer(nextPlayer, roll);

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.aznopoly.room.connectedPlayerIds.length;
        this.startTurn();
    }

    private startMiniGame(name: string) {
        this.scene.sleep();
        this.scene.launch(name, { launchMethod: "launch", previousScene: this.scene.key });
    }

    private startTurn() {
        this.turnNumber++;
        if (this.turnNumber > 1 && this.currentPlayerIndex == 0) {
            this.startMiniGame("minigame-roomba");
        }


        const currentPlayer = this.aznopoly.room.connectedPlayerIds[this.currentPlayerIndex];

        const packet: GameTurnStartPacket = {
            type: PacketType.GAME_TURN_START,
            sender: this.aznopoly.player.uuid,
            data: {
                player: currentPlayer,
            }
        }
        this.aznopoly.client.sendPacket(packet);
        this.onTurnStart(new CustomEvent(PacketType.GAME_TURN_START, { detail: packet }));
    }

}