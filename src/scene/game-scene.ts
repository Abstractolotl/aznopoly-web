import { FONT_STYLE_BUTTON } from "../style";
import Arc = Phaser.GameObjects.Arc;
import AzNopolyClient from "../client";
import GameBoard from "../board/board";
import { ClientPacketHandler, PacketType, RoomInitPacket } from "../types/client";
import AzNopolyGame from "../game";

export default class GameScene extends Phaser.Scene {
    private name!: string;
    private uuid?: string;

    private stateArc: Arc | undefined;
    private board!: GameBoard;
    private aznopoly!: AzNopolyGame;

    preload() {
        GameBoard.preload(this);
    }

    init(data: any) {
        this.aznopoly = data.game;
    }

    create() {
        this.stateArc = this.add.circle(15, 615, 5, 0xFF9900)

        this.add.text(100, 100, 'Game Scene', FONT_STYLE_BUTTON);
        this.add.text(100, 200, 'Hello ' + this.name, FONT_STYLE_BUTTON);
        
        this.board = new GameBoard(this.aznopoly, this, {x: 100, y: 300, size: 300});
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        if ( !this.aznopoly.client.isConnected ) {
            this.stateArc!.fillColor = 0xFF5050
        } else {
            this.stateArc!.fillColor = 0x00FF00
        }

    }

}