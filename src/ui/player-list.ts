import { FONT_STYLE_BODY, FONT_STYLE_BUTTON } from "../style";
import { getColorFromUUID } from "../util";

interface Entry {
    head: Phaser.GameObjects.Image;
    text: Phaser.GameObjects.Text;
    tail?: Phaser.GameObjects.Image;
}


const LINE_HEIGHT = FONT_STYLE_BODY.fontSize as number;
const LINE_GAP = 10;
const PADDING = 10;
export default class PlayerList extends Phaser.GameObjects.Container {

    static preload(scene: Phaser.Scene) {
        scene.load.image("host-crown", "assets/crown.png");
        scene.load.image("player-icon", "assets/default_avatar.png");
        scene.load.image("player-kick", "assets/player_kick.png");
    }

    private entryWidth: number;
    private hostView: boolean;

    private title!: Phaser.GameObjects.Text;
    private graphics!: Phaser.GameObjects.Graphics;
    private playerEntries: Entry[] = [];

    constructor(scene: Phaser.Scene, hostView: boolean, x: number, y: number, entryWidth: number) {
        super(scene);

        this.hostView = hostView;
        this.x = x;
        this.y = y;
        this.entryWidth = entryWidth;

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.add(this.graphics);
        this.graphics.fillStyle(0x000000, 0.5);        
        this.graphics.fillRoundedRect(-PADDING, -PADDING, this.entryWidth + (2 * PADDING),  (2 * PADDING) + (LINE_HEIGHT * 5) + (LINE_GAP * 4), 5);
        
        this.title = new Phaser.GameObjects.Text(scene, 0, 0, "", FONT_STYLE_BODY);
        this.add(this.title);
    }

    public updateTitle(title: string = `Connected Players (${this.playerEntries.length} / 4)`) {
        this.title.setText(title);
    }

    private createPlayerEntry(name: string, host: boolean, uuid: string): Entry {
        const headKey = host ? "host-crown" : "player-icon";
        const head = new Phaser.GameObjects.Image(this.scene, 0, 0, headKey);
        this.add(head);
        const headScale = LINE_HEIGHT / head.height;
        head.setScale(headScale, headScale);
        head.setOrigin(0, 0.5);
        head.tint = getColorFromUUID(uuid);

        const text = new Phaser.GameObjects.Text(this.scene, 50, 0, name, FONT_STYLE_BODY);
        this.add(text);
        let tail: Phaser.GameObjects.Image | undefined = undefined;
        if (this.hostView && !host) {
            tail = new Phaser.GameObjects.Image(this.scene, 0 + this.entryWidth, 0, "player-kick");
            this.add(tail);
            const tailScale = LINE_HEIGHT / tail.height;
            tail.setScale(tailScale, tailScale);
            tail.setOrigin(1, 0.5);
        }
        return { head, text, tail };
    }

    public updatePlayerList(players: {uuid: string, name: string, host: boolean}[]) {
        const newEntries: Entry[] = [];

        const oldEntries = this.playerEntries;;
        oldEntries.forEach(entry => {
            entry.head.destroy();
            entry.text.destroy();
            if (entry.tail) {
                entry.tail.destroy();
            }
        });

        players.forEach(player => {
            const entry = this.createPlayerEntry(player.name, player.host, player.uuid);
            newEntries.push(entry);
        });

        this.playerEntries = newEntries;
        this.updatePlayerPositions();
        this.updateTitle();
    }
    
    private updatePlayerPositions() {
        let y = LINE_GAP + LINE_HEIGHT;
        this.playerEntries.forEach(entry => {
            entry.head.y = y + LINE_HEIGHT / 2;
            entry.text.y = y;
            if (entry.tail) {
                entry.tail.y = y + LINE_HEIGHT / 2;
            }
            y += LINE_HEIGHT + LINE_GAP;
        });
    }


}