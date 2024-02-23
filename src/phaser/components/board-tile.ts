import Phaser, {Scene} from "phaser";
import { TileOrientation, TileType } from "../../types/board.ts";
import { FONT_STYLE_BODY } from "../../style.ts";

export default class BoardTile extends Phaser.GameObjects.Container {

    public static preload(scene: Scene) {
        scene.load.image('tile-empty', 'assets/board/tile-empty.png')
        scene.load.image('tile-down', 'assets/board/tile-down.png')
        scene.load.image('tile-up', 'assets/board/tile-up.png')
        scene.load.image('tile-left', 'assets/board/tile-left.png')
        scene.load.image('tile-right', 'assets/board/tile-right.png')
    }

    private tileType: TileType;
    private tileDirection: TileOrientation;

    private readonly tileWidth: number;
    private readonly tileHeight: number;

    private image: Phaser.GameObjects.Image;

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
            this.image.setTint(0xaaaaaa);
        });
        this.image.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.updateTint();
        });
        this.updateTint();

        this.add(this.image);

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

    private updateTint() {
        this.image.clearTint();
        
        if (this.tileType == TileType.PROPERTY_BLUE) {
            this.image.setTint(0x0000ff);
        }

        if (this.tileType == TileType.PROPERTY_GREEN) {
            this.image.setTint(0x00ff00);
        }

        if (this.tileType == TileType.PROPERTY_RED) {
            this.image.setTint(0xff0000);
        }

        if (this.tileType == TileType.PROPERTY_YELLOW) {
            this.image.setTint(0xffff00);
        }

        if (this.tileType == TileType.PROPERTY_PURPLE) {
            this.image.setTint(0x800080);
        }
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