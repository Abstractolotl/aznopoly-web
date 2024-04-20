import { FONT_STYLE_BODY, FONT_STYLE_DIGITS, FONT_STYLE_EYECATCHER, FRAME_PADDING, PLAYER_COLORS } from "@/style";
import AzNopolyAvatar, { Avatars } from "./avatar";
import AnimatedText, { TextAnimationType } from "./animated-text";
import AzNopolyPanel from "./panel";


export interface PlayerInfo {
    money: number;
} 

export interface PlayerProfile {
    name: string;
    avatar: Avatars;
    colorIndex: number;
    host: boolean;
}

const HEIGHT = 64;
const WIDTH = 350;
const GAP = 25;
export default class AzNopolyPlayerInfo extends Phaser.GameObjects.Container {
    static HEIGHT = HEIGHT;
    static WIDTH = WIDTH;

    static preload(scene: Phaser.Scene) {
        AzNopolyAvatar.preload(scene);
        scene.load.image("icon_money", "assets/icons/icon_money.png");
        scene.load.image("icon_crown", "assets/icons/icon_crown.png");
    }

    private panel: AzNopolyPanel;
    private avatar: AzNopolyAvatar;
    private nameText: Phaser.GameObjects.Text;
    private moneyText: AnimatedText;
    private lastMoney: number;
    private colorIndex: number;

    constructor(scene: Phaser.Scene, x: number, y: number, info: PlayerInfo, profile: PlayerProfile) {
        super(scene, x, y);
        this.setSize(WIDTH, HEIGHT);
        this.lastMoney = info.money;
        this.colorIndex = profile.colorIndex;
        
        this.panel = new AzNopolyPanel(scene, HEIGHT * 0.5, 0, WIDTH - HEIGHT * 0.5, HEIGHT);
        this.avatar = new AzNopolyAvatar(scene, HEIGHT*0.5, HEIGHT * 0.5, HEIGHT, profile.avatar, profile.colorIndex);

        this.nameText = new Phaser.GameObjects.Text(scene, HEIGHT + 10, 0, profile.name, FONT_STYLE_EYECATCHER);
        this.nameText.setOrigin(0, 0);

        const moneyIcon = new Phaser.GameObjects.Image(scene, this.nameText.x, this.nameText.y + this.nameText.height * 1.5 , "icon_money");
        moneyIcon.setOrigin(0, 0.5);
        moneyIcon.setScale(this.nameText.height / moneyIcon.height);

        this.moneyText = new AnimatedText(scene, 0, 0, ` ${info.money}`, FONT_STYLE_BODY);
        this.moneyText.setPosition(moneyIcon.x + moneyIcon.displayWidth, this.nameText.y + this.nameText.height);

        this.add(this.panel);
        this.add(this.avatar);
        this.add(this.nameText);
        this.add(this.moneyText);
        this.add(moneyIcon);

        if (profile.host) {
            const hostIcon = new Phaser.GameObjects.Image(scene, 0, 0, "icon_crown");
            hostIcon.setScale(32 / hostIcon.height);
            hostIcon.setPosition(this.avatar.x, this.avatar.y - this.avatar.height * 0.5 );
            hostIcon.setTint(0xffd700);
            this.add(hostIcon);
        }

        this.setIsOnTurn(false);
    }

    preUpdate(time: number, delta: number) {
        this.moneyText.preUpdate(time, delta);
    }

    public setOnHover(hoverIn: () => void, hoverOut: () => void) {
        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(this.width * 0.5, this.height * 0.5, this.width, this.height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        });
        this.on("pointerover", hoverIn);
        this.on("pointerout", hoverOut);
    }

    public updateProfile(profile: PlayerProfile) {
        this.avatar.setAvatar(profile.avatar);
        //TODO: this.avatar.setColor(profile.colorIndex);
        this.nameText.setText(profile.name);
    }

    public updateInfo(info: PlayerInfo) {
        const moneyDif = info.money - this.lastMoney;
        this.lastMoney = info.money;
        
        if (moneyDif > 0) {
            this.moneyText.setTextAnimated(` ${info.money}`, TextAnimationType.SIDE, { 
                altText: `+${moneyDif}`,
                altTextStyle: Object.assign({}, FONT_STYLE_DIGITS, { fill: '#66FF66' })
            });
        }

        if (moneyDif < 0) {
            this.moneyText.setTextAnimated(` ${info.money}`, TextAnimationType.SIDE, { 
                altText: `${moneyDif}`,
                altTextStyle: Object.assign({}, FONT_STYLE_DIGITS, { fill: '#FF6666' })
            });
        }
    }

    public setIsOnTurn(isOnTurn: boolean) {
        if (isOnTurn) {
            this.panel.setBorder(PLAYER_COLORS[this.colorIndex]);
        } else {
            this.panel.setBorder(0x000000, 0);
        }
    }

}