import { FONT_STYLE_BUTTON } from "../style";
import Arc = Phaser.GameObjects.Arc;
import AzNopolyClient, { RoomWelcomeEvent } from "../client";

export default class GameScene extends Phaser.Scene {
    name!: string;
    room!: string;
    uuid?: string;

    client!: AzNopolyClient;

    stateArc: Arc | undefined;

    init(data: any) {
        console.log("Room: " + data.room)

        this.name = data.name;
        this.room = data.room;

        this.client = new AzNopolyClient(this.room);
        this.client.addClientEventListener("ROOM_WELCOME", (e) => this.onRoomWelcome(e as RoomWelcomeEvent));
    }

    private onRoomWelcome(event: RoomWelcomeEvent) {
        this.uuid = event.data;
        console.log("UUID: " + this.uuid)
    }

    create() {
        this.stateArc = this.add.circle(15, 615, 5, 0xFF9900)

        this.add.text(100, 100, 'Game Scene', FONT_STYLE_BUTTON);
        this.add.text(100, 200, 'Hello ' + this.name, FONT_STYLE_BUTTON);
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        if ( !this.client.isConnected() ) {
            this.stateArc!.fillColor = 0xFF5050
        } else {
            this.stateArc!.fillColor = 0xFF9900
        }
    }
}