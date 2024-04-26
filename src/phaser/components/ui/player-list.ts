import { FONT_STYLE_BODY, FONT_STYLE_BUTTON, FRAME_PADDING, PLAYER_COLORS } from "../../../style";
import AzNopolyAvatar from "./avatar";
import AzNopolyPanel from "./panel";
import { PlayerProfile } from "./player-info";


const LINE_HEIGHT = 60;
const LINE_GAP = FRAME_PADDING;
const WIDTH = 400;
const HEIGHT = 360;
export default class PlayerList extends AzNopolyPanel {
    public static WIDTH = WIDTH;
    public static HEIGHT = HEIGHT;

    static preload(scene: Phaser.Scene) {
        scene.load.image("host-crown", "assets/crown.png");
        scene.load.image("player-icon", "assets/default_avatar.png");
        scene.load.image("player-kick", "assets/icons/icon_kick.svg");
    }

    private hostView: boolean;

    private playerEntries: Phaser.GameObjects.Container[] = [];

    constructor(scene: Phaser.Scene, hostView: boolean, x: number, y: number) {
        super(scene, x, y, WIDTH, HEIGHT, { headline: "CONNECTED PLAYERS"});
        this.setPosition(x - WIDTH * 0.5, y - HEIGHT * 0.5);

        this.hostView = hostView;
    }

    private createPlayerEntry(profile: PlayerProfile) {
        const container = new Phaser.GameObjects.Container(this.scene, 0, 0);

        const graphics = new Phaser.GameObjects.Graphics(this.scene);
        graphics.fillStyle(0x000000, 0.2);
        graphics.fillRect(0, 0, this.contentRect.width, LINE_HEIGHT);

        const head = new AzNopolyAvatar(this.scene, LINE_HEIGHT * 0.5, LINE_HEIGHT * 0.5, LINE_HEIGHT * 0.7, profile.avatar, profile.colorIndex);
        const text = new Phaser.GameObjects.Text(this.scene, head.width + 20, LINE_HEIGHT * 0.5, profile.name, FONT_STYLE_BODY);
        text.setOrigin(0, 0.5);

        let tail;
        if (profile.host || this.hostView) {
            const icon = !profile.host ? "player-kick" : "host-crown";

            tail = new Phaser.GameObjects.Image(this.scene, this.contentRect.width - FRAME_PADDING, LINE_HEIGHT * 0.5, icon);
            const tailScale = (LINE_HEIGHT * 0.5) / tail.height;
            tail.setScale(tailScale, tailScale);
            tail.setOrigin(1, 0.5);
        }

        container.add(graphics);
        container.add(head);
        container.add(text);
        if (tail) {
            container.add(tail);
        }

        this.add(container);
        return container;
    }

    public updatePlayerList(players: PlayerProfile[]) {
        const newEntries: Phaser.GameObjects.Container[] = [];

        const oldEntries = this.playerEntries;
        oldEntries.forEach(entry => {
            entry.destroy();
        });

        players.forEach(player => {
            const entry = this.createPlayerEntry(player);
            newEntries.push(entry);
        });

        this.playerEntries = newEntries;
        this.updatePlayerPositions();
    }
    
    private updatePlayerPositions() {
        let y = this.contentRect.y;
        this.playerEntries.forEach(entry => {
            entry.setPosition(this.contentRect.x, y);
            y += LINE_HEIGHT + LINE_GAP;
        });
    }

    public setNumConnectedPlayers(num: number) {
        this.setHeadline(`CONNECTED PLAYERS (${num} / 4)`);
    }

}