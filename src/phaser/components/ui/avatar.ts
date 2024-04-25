import { COLOR_PRIMARY, FRAME_BORDER_WIDTH, PLAYER_COLORS } from "@/style";


export enum Avatars {
    UNKNOWN = "avatar_unknown",
    AXOLOTL = "avatar_axolotl",
    ABSTRACT = "avatar_abstract",
    BANANA = "avatar_banana",
}

export function rotateAvatar(avatar: Avatars, offset: number) {
    const avatarKeys = Object.values(Avatars);
    const curIndex = avatarKeys.indexOf(avatar);
    const nextIndex = ((curIndex + offset) % avatarKeys.length + avatarKeys.length) % avatarKeys.length;
    return avatarKeys[nextIndex] as Avatars;
}


export default class AzNopolyAvatar extends Phaser.GameObjects.Container {

    static preload(scene: Phaser.Scene) {
        scene.load.image(Avatars.UNKNOWN, 'assets/avatars/avatar_unknown.png');
        scene.load.image(Avatars.AXOLOTL, 'assets/avatars/avatar_axolotl.png');
        scene.load.image(Avatars.ABSTRACT, 'assets/avatars/avatar_abstract.png');
        scene.load.image(Avatars.BANANA, 'assets/avatars/avatar_banana.png');
    }

    private image: Phaser.GameObjects.Image;
    private graphics: Phaser.GameObjects.Graphics;
    private colorIndex: number;

    constructor(scene: Phaser.Scene, x: number, y: number, size: number, avatar: Avatars, colorIndex: number) {
        super(scene, x, y);
        this.colorIndex = colorIndex;
        this.scene = scene;

        this.image = new Phaser.GameObjects.Image(scene, 0, 0, avatar);
        this.image.setScale(size / this.image.width);

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.graphics.setPosition(-size*0.5, -size*0.5);
        this.setBorderColor(colorIndex);

        this.width = this.image.displayWidth;
        this.height = this.image.displayHeight;
        
        this.add(this.image);
        this.add(this.graphics);
    }

    public setAvatarSize(size: number) {
        this.image.setScale(size / this.image.width);
        this.graphics.clear();
        this.graphics.setPosition(-size*0.5, -size*0.5);
        this.setBorderColor(this.colorIndex);
    }

    public getAvatarSize() {
        return this.image.displayWidth;
    }

    public setAvatar(avatar: Avatars) {
        this.image.setTexture(avatar);
    }

    public getAvatar() {
        return this.image.texture.key as Avatars;
    }

    public setBorderColor(color: number) {
        this.colorIndex = color;
        this.graphics.clear();
        const borderWidth = this.image.displayWidth / 15;
        this.graphics.lineStyle(borderWidth, PLAYER_COLORS[color]);
        const radius = this.image.displayWidth / 2;
        this.graphics.strokeCircle(radius, radius, radius);
    }

    public getBorderColor() {
        return this.colorIndex;
    }

    public setLocked(locked: boolean) {
        this.graphics.clear();
        this.setBorderColor(this.colorIndex);
        if (locked) {
            this.image.setTint(0x444444);
        } else {
            this.image.clearTint();
        }
    }
    
}