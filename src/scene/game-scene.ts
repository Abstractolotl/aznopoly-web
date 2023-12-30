import { FONT_STYLE_BUTTON } from "../style";
import Arc = Phaser.GameObjects.Arc;
import AzNopolyClient from "../client";
import GameBoard from "../board/board";
import { ClientPacketHandler, PacketType, RoomInitPacket } from "../types/client";

export default class GameScene extends Phaser.Scene {
    private name!: string;
    private uuid?: string;

    private client!: AzNopolyClient;

    private stateArc: Arc | undefined;
    private board!: GameBoard;

    preload() {
        GameBoard.preload(this);
    }

    init(data: any) {
        console.log("Room: " + data.room)

        this.name = data.name;

        this.client = new AzNopolyClient();
        this.client.addClientEventListener(PacketType.ROOM_INIT, this.onRoomWelcome.bind(this) as ClientPacketHandler);
    }

    create() {
        this.stateArc = this.add.circle(15, 615, 5, 0xFF9900)

        this.add.text(100, 100, 'Game Scene', FONT_STYLE_BUTTON);
        this.add.text(100, 200, 'Hello ' + this.name, FONT_STYLE_BUTTON);
        
        this.board = new GameBoard(this.client, this, {x: 100, y: 300, size: 300});
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        if ( !this.client.isConnected ) {
            this.stateArc!.fillColor = 0xFF5050
        } else {
            this.stateArc!.fillColor = 0x00FF00
        }

    }

    private onRoomWelcome(event: RoomInitPacket) {
        this.uuid = event.data.uuid;
        console.log("My Player UUID: ", this.client.uuid)

        if (this.client.isHost) {
            this.board.addPlayer(event.data.uuid);
            setInterval(() => {
                this.board.movePlayer(this.uuid!, 1)
            }, 500);
        } else {
            this.client.sendPacket({
                type: "ROOM_JOIN",
                data: {
                    uuid: this.client.uuid
                }
            });
        }
    }



}