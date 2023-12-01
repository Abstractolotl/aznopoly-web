import { FONT_STYLE_BUTTON } from "../style";
import { joinRoom, checkState } from "../client.ts";
import Arc = Phaser.GameObjects.Arc;

export default class GameScene extends Phaser.Scene {
    name!: string;
    room!: string;

    stateArc: Arc | undefined;

    init(data: any) {
        this.name = data.name;
        this.room = data.room;

        joinRoom(this.room, (packet: string) => {
            console.log(packet)
        })
    }

    create() {
        this.stateArc = this.add.circle(15, 615, 5, 0xFF9900)

        this.add.text(100, 100, 'Game Scene', FONT_STYLE_BUTTON);
        this.add.text(100, 200, 'Hello ' + this.name, FONT_STYLE_BUTTON);
    }

    update(time: number, delta: number) {
        if ( checkState(WebSocket.CONNECTING) ) {
            this.stateArc!.fillColor = 0xFF9900
        } else if( !checkState(WebSocket.OPEN) ) {
            this.stateArc!.fillColor = 0xFF5050
        } else {
            this.stateArc!.fillColor = 0x00CC00
        }
        super.update(time, delta);
    }
}