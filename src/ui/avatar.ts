import { COLOR_PRIMARY, FRAME_BORDER_WIDTH, PLAYER_COLORS } from "@/style";


export enum Avatars {
    UNKNOWN = "avatar_unknown",
    AXOLOTL = "avatar_axolotl",
    ABSTRACT = "avatar_abstract",
    BANANA = "avatar_banana",
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

    constructor(scene: Phaser.Scene, x: number, y: number, size: number, avatar: Avatars, colorIndex: number) {
        super(scene, x, y);
        this.scene = scene;

        this.image = new Phaser.GameObjects.Image(scene, 0, 0, avatar);
        this.image.setScale(size / this.image.width);
        this.image.setOrigin(0, 0);

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.setBorderColor(colorIndex);

        this.add(this.image);
        this.add(this.graphics);
    }

    public setAvatar(avatar: Avatars) {
        this.image.setTexture(avatar);
    }

    public setBorderColor(color: number) {
        this.graphics.clear();
        this.graphics.lineStyle(FRAME_BORDER_WIDTH, PLAYER_COLORS[color]);
        const radius = this.image.displayWidth / 2;
        this.graphics.strokeCircle(radius, radius, radius);
    }

    
}