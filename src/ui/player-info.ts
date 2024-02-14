import { FONT_STYLE_BODY, FRAME_PADDING } from "@/style";
import AzNopolyAvatar, { Avatars } from "./avatar";


export interface PlayerInfo {
    name: string;
    avatar: Avatars;
    money: number;
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

    constructor(scene: Phaser.Scene, x: number, y: number, info: PlayerInfo) {
        super(scene, x, y);
        this.setSize(400, HEIGHT);
        
        const avatar = new AzNopolyAvatar(scene, FRAME_PADDING, FRAME_PADDING, 64, info.avatar, info.colorIndex);
        
        const style = Object.assign({}, FONT_STYLE_BODY, {fontSize: HEIGHT * 0.4})

        const name = new Phaser.GameObjects.Text(scene, 0, 0, info.name, style);
        name.setOrigin(0, 0);
        name.setPosition(FRAME_PADDING * 2 + HEIGHT, FRAME_PADDING);

        const moneyIcon = new Phaser.GameObjects.Image(scene, name.x, name.y + name.height * 1.5 , "icon_money");
        moneyIcon.setOrigin(0, 0.5);
        moneyIcon.setScale(name.height / moneyIcon.height);

        const money = new Phaser.GameObjects.Text(scene, 0, 0, `${info.money}`, style);
        money.setOrigin(0, 0);
        money.setPosition(moneyIcon.x + moneyIcon.displayWidth, name.y + name.height);

        this.add(avatar);
        this.add(name);
        this.add(money);
        this.add(moneyIcon);

        if (info.host) {
            const hostIcon = new Phaser.GameObjects.Image(scene, 0, 0, "icon_crown");
            hostIcon.setOrigin(0.5, 0.5);
            hostIcon.setScale(32 / hostIcon.height);
            hostIcon.setPosition(avatar.x + hostIcon.width * 0.5, avatar.y);
            hostIcon.setTint(0xffd700);
            this.add(hostIcon);
        }
    }

}