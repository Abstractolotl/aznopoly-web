import { FONT_STYLE_BODY, FONT_STYLE_DIGITS, FRAME_PADDING } from "@/style";
import AzNopolyAvatar, { Avatars } from "./avatar";
import AnimatedText, { TextAnimationType } from "./animated-text";


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
export default class AzNopolyPlayerInfo extends Phaser.GameObjects.Container {

    static preload(scene: Phaser.Scene) {
        AzNopolyAvatar.preload(scene);
        scene.load.image("icon_money", "assets/icons/icon_money.png");
        scene.load.image("icon_crown", "assets/icons/icon_crown.png");
    }

    private avatar: AzNopolyAvatar;
    private nameText: Phaser.GameObjects.Text;
    private moneyText: AnimatedText;
    private lastMoney: number;

    constructor(scene: Phaser.Scene, x: number, y: number, info: PlayerInfo, profile: PlayerProfile) {
        super(scene, x, y);
        this.setSize(400, HEIGHT);
        this.lastMoney = info.money;
        
        this.avatar = new AzNopolyAvatar(scene, FRAME_PADDING, FRAME_PADDING, 64, profile.avatar, profile.colorIndex);
        
        const style = Object.assign({}, FONT_STYLE_BODY, {fontSize: HEIGHT * 0.4})

        this.nameText = new Phaser.GameObjects.Text(scene, 0, 0, profile.name, style);
        this.nameText.setOrigin(0, 0);
        this.nameText.setPosition(FRAME_PADDING * 2 + HEIGHT, FRAME_PADDING);

        const moneyIcon = new Phaser.GameObjects.Image(scene, this.nameText.x, this.nameText.y + this.nameText.height * 1.5 , "icon_money");
        moneyIcon.setOrigin(0, 0.5);
        moneyIcon.setScale(this.nameText.height / moneyIcon.height);

        this.moneyText = new AnimatedText(scene, 0, 0, ` ${info.money}`, FONT_STYLE_DIGITS);
        this.moneyText.setPosition(moneyIcon.x + moneyIcon.displayWidth, this.nameText.y + this.nameText.height);

        this.add(this.avatar);
        this.add(this.nameText);
        this.add(this.moneyText);
        this.add(moneyIcon);

        if (profile.host) {
            const hostIcon = new Phaser.GameObjects.Image(scene, 0, 0, "icon_crown");
            hostIcon.setOrigin(0.5, 0.5);
            hostIcon.setScale(32 / hostIcon.height);
            hostIcon.setPosition(this.avatar.x + hostIcon.width * 0.5, this.avatar.y);
            hostIcon.setTint(0xffd700);
            this.add(hostIcon);
        }
    }

    preUpdate(time: number, delta: number) {
        this.moneyText.preUpdate(time, delta);
    }

    public updateProfile(profile: PlayerProfile) {
        this.avatar.setAvatar(profile.avatar);
        //TODO: this.avatar.setColor(profile.colorIndex);
        this.nameText.setText(profile.name);
    }

    public updateInfo(info: PlayerInfo) {
        const moneyDif = info.money - this.lastMoney;
        
        if (moneyDif > 0) {
            this.moneyText.setTextAnimated(` ${info.money}`, TextAnimationType.FALL_INTO, {
                altText: `+${moneyDif}`,
                altTextStyle: Object.assign({}, FONT_STYLE_DIGITS, { fill: '#00ff00' }),
            });
        }

        if (moneyDif < 0) {
            this.moneyText.setTextAnimated(` ${info.money}`, TextAnimationType.GRAVITY_FALL, {
                altText: `${moneyDif}`,
                altTextStyle: Object.assign({}, FONT_STYLE_DIGITS, { fill: '#ff0000' }),
            });
        }
    }

}