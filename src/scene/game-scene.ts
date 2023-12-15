import { FONT_STYLE_BUTTON } from "../style";
import Arc = Phaser.GameObjects.Arc;
import AzNopolyClient, {ClientEventHandler, RoomWelcomeEvent} from "../client";
import GameBoard from "../board/board";

export default class GameScene extends Phaser.Scene {
    private name!: string;
    private room!: string;
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
        this.room = data.room;

        this.client = new AzNopolyClient(this.room);
        this.client.addClientEventListener("ROOM_WELCOME", this.onRoomWelcome.bind(this) as ClientEventHandler);
    }

    create() {
        this.stateArc = this.add.circle(15, 615, 5, 0xFF9900)

        this.add.text(100, 100, 'Game Scene', FONT_STYLE_BUTTON);
        this.add.text(100, 200, 'Hello ' + this.name, FONT_STYLE_BUTTON);
        
        this.board = new GameBoard(this, {x: 100, y: 300, size: 300});
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        if ( !this.client.isConnected() ) {
            this.stateArc!.fillColor = 0xFF5050
        } else {
            this.stateArc!.fillColor = 0xFF9900
        }

    }

    private onRoomWelcome(event: RoomWelcomeEvent) {
        this.uuid = event.data.uuid;
        console.log("UUID: ", this.uuid)
        this.board.addPlayer(event.data.uuid);

        setInterval(() => {
            console.log("Moving player")
            this.board.movePlayer(this.uuid!, 1)
        }, 500);
    }

}