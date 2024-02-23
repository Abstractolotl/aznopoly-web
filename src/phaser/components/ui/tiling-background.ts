import { SETTINGS } from "@/settings";


export default class TilingBackground extends Phaser.GameObjects.TileSprite {
    private _scene: Phaser.Scene;
    private _directionVector: Phaser.Math.Vector2;
    private _speed: number;
    private _scale: number;

    constructor(scene: Phaser.Scene, texture: string, directionVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 1), speed: number = 0.1, scale: number = 1) {
        super(scene, 0, 0, SETTINGS.DISPLAY_WIDTH * scale, SETTINGS.DISPLAY_HEIGHT * scale, texture)
        this._scene = scene;
        this._directionVector = directionVector;
        this._speed = speed;
        this._scale = scale;

        this.setOrigin(0, 0);
        this.setScale(1 / scale);
        this.setScrollFactor(0);
    }

    preUpdate(time: number, delta: number): void {
        this.tilePositionX += this._directionVector.x * this._speed * delta / 1000;
        this.tilePositionY += this._directionVector.y * this._speed * delta / 1000;
    }
}