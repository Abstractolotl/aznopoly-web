import { FONT_STYLE_BODY, FONT_STYLE_BUTTON } from "../style";
import GameObjects = Phaser.GameObjects;

interface Entry {
    head: Phaser.GameObjects.Image;
    text: Phaser.GameObjects.Text;
    tail?: Phaser.GameObjects.Image;
}


const LINE_HEIGHT = FONT_STYLE_BODY.fontSize as number;
const LINE_GAP = 10;
const PADDING = 10;
export default class PlayerList {

    static preload(scene: Phaser.Scene) {
        scene.load.image("host-crown", "assets/crown.png");
        scene.load.image("player-icon", "assets/default_avatar.png");
        scene.load.image("player-kick", "assets/player_kick.png");
    }

    private x: number;
    private y: number;
    private width: number;


    private scene: Phaser.Scene;
    private hostView: boolean;

    private title!: GameObjects.Text;
    private graphics!: GameObjects.Graphics;
    private playerEntries: Entry[] = [];

    constructor(scene: Phaser.Scene, hostView: boolean, x: number, y: number, width: number) {
        this.scene = scene;
        this.hostView = hostView;
        this.x = x;
        this.y = y;
        this.width = width;
    }

    public create() {
        this.graphics = this.scene.add.graphics();
        this.graphics.fillStyle(0x000000, 0.5);        
        this.graphics.fillRoundedRect(this.x - PADDING, this.y - PADDING, this.width + (2 * PADDING),  (2 * PADDING) + (LINE_HEIGHT * 5) + (LINE_GAP * 4), 5);
        
        this.title = this.scene.add.text(this.x, this.y, 'Connected Players', FONT_STYLE_BODY);
    }

    private updateTitle() {
        this.title.setText(`Connected Players (${this.playerEntries.length} / 4)`);
    }

    private createPlayerEntry(name: string, host: boolean): Entry {
        const headKey = host ? "host-crown" : "player-icon";
        console.log("headKey", headKey);
        const head = this.scene.add.image(this.x, this.y, headKey);
        const headScale = LINE_HEIGHT / head.height;
        head.setScale(headScale, headScale);
        head.setOrigin(0, 0.5);

        const text = this.scene.add.text(this.x + 50, this.y, name, FONT_STYLE_BODY);

        let tail: Phaser.GameObjects.Image | undefined = undefined;
        if (this.hostView && !host) {
            tail = this.scene.add.image(this.x + this.width, this.y, "player-kick");
            const tailScale = LINE_HEIGHT / tail.height;
            tail.setScale(tailScale, tailScale);
            tail.setOrigin(1, 0.5);
        }
        return { head, text, tail };
    }

    public updatePlayerList(players: {name: string, host: boolean}[]) {
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
            const entry = this.createPlayerEntry(player.name, player.host);
            newEntries.push(entry);
        });

        this.playerEntries = newEntries;
        this.updatePlayerPositions();
        this.updateTitle();
    }
    
    private updatePlayerPositions() {
        let y = this.y + LINE_GAP + LINE_HEIGHT;
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