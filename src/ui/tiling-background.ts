import { HEIGHT, WIDTH } from "../main";


export default class TilingBackground {
    private _scene: Phaser.Scene;
    private _background: Phaser.GameObjects.TileSprite;
    private _directionVector: Phaser.Math.Vector2;
    private _speed: number;
    private _scale: number;

    constructor(scene: Phaser.Scene, texture: string, directionVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 1), speed: number = 0.1, scale: number = 1) {
        this._scene = scene;
        this._directionVector = directionVector;
        this._speed = speed;
        this._scale = scale;

        this._background = this._scene.add.tileSprite(0, 0, WIDTH * scale, HEIGHT * scale, texture);
        this._background.setOrigin(0, 0);
        this._background.setScale(1 / scale);
        this._background.setScrollFactor(0);
    }

    public update(time: number, delta: number): void {
        this._background.tilePositionX += this._directionVector.x * this._speed * delta / 1000;
        this._background.tilePositionY += this._directionVector.y * this._speed * delta / 1000;
    }
}