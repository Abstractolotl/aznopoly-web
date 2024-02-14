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

    constructor(scene: Phaser.Scene, x: number, y: number, size: number, avatar: Avatars, colorIndex: number) {
        super(scene, x, y);
        this.scene = scene;

        const image = new Phaser.GameObjects.Image(scene, 0, 0, avatar);
        image.setScale(size / image.width);
        image.setOrigin(0, 0);

        const graphics = new Phaser.GameObjects.Graphics(scene);
        graphics.lineStyle(FRAME_BORDER_WIDTH, PLAYER_COLORS[colorIndex]);
        graphics.strokeCircle(size / 2, size / 2, size / 2);

        this.add(image);
        this.add(graphics);
    }
    
}