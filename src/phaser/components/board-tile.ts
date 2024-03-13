import Phaser, {Scene} from "phaser";
import { TileOrientation, TileType } from "../../types/board.ts";
import { FONT_STYLE_BODY, PLAYER_COLORS } from "../../style.ts";
import convert from 'color-convert';
import { PlayerProfile } from "./ui/player-info.ts";

const color = (c: number) => {
    const hsl = convert.hex.hsv("#"+c.toString(16).padStart(6, '0'));
    hsl[1] = 25;
    return Number("0x" + convert.hsv.hex(hsl));
}

export default class BoardTile extends Phaser.GameObjects.Container {

    public static preload(scene: Scene) {
        scene.load.image('tile-empty', 'assets/board/tile-empty.png')
        scene.load.image('tile-down', 'assets/board/tile-down.png')
        scene.load.image('tile-up', 'assets/board/tile-up.png')
        scene.load.image('tile-left', 'assets/board/tile-left.png')
        scene.load.image('tile-right', 'assets/board/tile-right.png')
    }

    private static TINTS: { [key: string]: number } = {
        [TileType.PROPERTY_BLUE]: color(0x0000ff),
        [TileType.PROPERTY_GREEN]: color(0x00ff00),
        [TileType.PROPERTY_RED]: color(0xff0000),
        [TileType.PROPERTY_YELLOW]: color(0xffff00),
        [TileType.PROPERTY_PURPLE]: color(0x800080),
    }

    private tileType: TileType;
    private tileDirection: TileOrientation;

    private readonly tileWidth: number;
    private readonly tileHeight: number;

    private image: Phaser.GameObjects.Image;
    private graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Scene, x: number, y: number, width: number, height: number, type: TileType, direction: TileOrientation) {
        super(scene, x, y);

        this.tileType = type;
        this.tileDirection = direction;

        this.tileWidth = width;
        this.tileHeight = height;

        this.width = width;
        this.height = height;

        this.image = new Phaser.GameObjects.Image(scene, 0, 0, this.getTexture(direction))
        this.image.setOrigin(0, 0);
        this.image.setScale(width / this.image.width, height / this.image.height);

        this.image.setInteractive();
        this.image.on(Phaser.Input.Events.POINTER_OVER, () => {
            this.image.setAlpha(0.75)
        });
        this.image.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.image.setAlpha(1)
        });
        this.updateTint();

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        if (TileType.isProperty(type)) {
            this.drawTopPart(0xffffff);
        }

        this.add(this.image);
        this.add(this.graphics);

        if (direction == TileOrientation.CORNER) {
            let text = new Phaser.GameObjects.Text(scene, 0, 0, TileType[type], FONT_STYLE_BODY);
            text.setOrigin(0.5, 0.5);
            text.setPosition(width / 2, height / 2);

            if(type === TileType.TO_JAIL) {
                text.rotation = Math.PI / -4;
            }

            this.add(text)
        }
    }

    public setOwner(profile: PlayerProfile) {
        this.drawTopPart(PLAYER_COLORS[profile.colorIndex]);
    }

    private drawTopPart(color: number) {
        this.graphics.fillStyle(color);
        switch (this.tileDirection) {
            case TileOrientation.UP:
                this.graphics.fillRect(1, 1, this.width - 2, 27);
                break;
            case TileOrientation.DOWN:
                this.graphics.fillRect(1, this.height - 27, this.width - 2, 25);
                break;
            case TileOrientation.LEFT:
                this.graphics.fillRect(1, 1, 27, this.height - 2);
                break;
            case TileOrientation.RIGHT:
                this.graphics.fillRect(this.width - 27, 1, 25, this.height - 2);
                break;
        }
    }

    private updateTint() {
        this.image.clearTint();
        this.image.setTint(BoardTile.TINTS[this.tileType] || 0xffffff);
    }

    getTexture(direction: TileOrientation) : string {
        switch (direction) {
            case TileOrientation.UP:
                return "tile-up"
            case TileOrientation.DOWN:
                return "tile-down"
            case TileOrientation.LEFT:
                return "tile-left"
            case TileOrientation.RIGHT:
                return "tile-right"
            default:
                return "tile-empty"
        }
    }

    getTileType() : TileType {
        return this.tileType;
    }

    getTileDirection() : TileOrientation {
        return this.tileDirection;
    }

    getPlayerCenter() {
        return { x: this.x + this.tileWidth / 2, y: this.y + this.tileHeight / 2 }
    }

}