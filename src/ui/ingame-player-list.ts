import { FONT_STYLE_BODY } from "../style";
import { PlayerProfile } from "./player-info";

interface Entry {
    head: Phaser.GameObjects.Image;
    text: Phaser.GameObjects.Text;
    tail?: Phaser.GameObjects.Image;
}


const LINE_HEIGHT = FONT_STYLE_BODY.fontSize as number;
const LINE_GAP = 10;
const PADDING = 10;
export default class IngamePlayerList extends Phaser.GameObjects.Container {

    static preload(scene: Phaser.Scene) {
        scene.load.image("host-crown", "assets/crown.png");
        scene.load.image("player-icon", "assets/default_avatar.png");
        scene.load.image("player-kick", "assets/player_kick.png");
    }

    private entryWidth: number;
    private hostView: boolean;

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
        this.graphics.fillStyle(0xCAC9C9, 1);
        this.graphics.fillRect(-PADDING, -PADDING, this.entryWidth + (2 * PADDING),  (2 * PADDING) + (LINE_HEIGHT * 5) + (LINE_GAP * 4));
    }

    private createPlayerEntry(profile: PlayerProfile): Entry {
        const headKey = profile.host ? "host-crown" : "player-icon";
        const head = new Phaser.GameObjects.Image(this.scene, 0, 0, headKey);
        this.add(head);
        const headScale = LINE_HEIGHT / head.height;
        head.setScale(headScale, headScale);
        head.setOrigin(0, 0.5);

        const text = new Phaser.GameObjects.Text(this.scene, 50, 0, profile.name, FONT_STYLE_BODY);
        this.add(text);
        let tail: Phaser.GameObjects.Image | undefined = undefined;
        if (this.hostView && !profile.host) {
            tail = new Phaser.GameObjects.Image(this.scene, 0 + this.entryWidth, 0, "player-kick");
            this.add(tail);
            const tailScale = LINE_HEIGHT / tail.height;
            tail.setScale(tailScale, tailScale);
            tail.setOrigin(1, 0.5);
        }
        return { head, text, tail };
    }

    public updatePlayerList(profiles: PlayerProfile[]) {
        const newEntries: Entry[] = [];

        const oldEntries = this.playerEntries;;
        oldEntries.forEach(entry => {
            entry.head.destroy();
            entry.text.destroy();
            if (entry.tail) {
                entry.tail.destroy();
            }
        });

        profiles.forEach(profile => {
            const entry = this.createPlayerEntry(profile);
            newEntries.push(entry);
        });

        this.playerEntries = newEntries;
        this.updatePlayerPositions();
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