import Phaser, {Scene} from "phaser";
import { TileDirection, TileType } from "./tile-type.ts";
import {FONT_STYLE_BODY, FONT_STYLE_HEADLINE} from "../style.ts";

export default class BoardTile extends Phaser.GameObjects.Container {

    public static preload(scene: Scene) {
        scene.load.image('tile-empty', 'assets/board/tile-empty.png')
        scene.load.image('tile-down', 'assets/board/tile-down.png')
        scene.load.image('tile-up', 'assets/board/tile-up.png')
        scene.load.image('tile-left', 'assets/board/tile-left.png')
        scene.load.image('tile-right', 'assets/board/tile-right.png')
    }

    constructor(scene: Scene, x: number, y: number, width: number, height: number,
                type: TileType = TileType.START, direction: TileDirection = TileDirection.CORNER) {
        super(scene, x, y);

        let image = new Phaser.GameObjects.Image(scene, 0, 0, this.getTexture(direction))
        image.setOrigin(0, 0);
        image.setScale(width / image.width, height / image.height);

        switch (type) {
            case TileType.BLUE:
                image.setTint(0x0000ff);
                break;
            case TileType.GREEN:
                image.setTint(0x00ff00);
                break;
            case TileType.RED:
                image.setTint(0xff0000);
                break;
            case TileType.YELLOW:
                image.setTint(0xffff00);
                break;
            case TileType.PURPLE:
                image.setTint(0xff00ff);
                break;
        }

        this.add(image);

        if (direction == TileDirection.CORNER) {
            let text = new Phaser.GameObjects.Text(scene, 0, 0, TileType[type], FONT_STYLE_BODY);
            text.setOrigin(0.5, 0.5);
            text.setPosition(width / 2, height / 2);

            if(type === TileType.TO_JAIL) {
                text.rotation = Math.PI / -4;
            }

            this.add(text)
        }
    }

    getTexture(direction: TileDirection) : string {
        switch (direction) {
            case TileDirection.UP:
                return "tile-up"
            case TileDirection.DOWN:
                return "tile-down"
            case TileDirection.LEFT:
                return "tile-left"
            case TileDirection.RIGHT:
                return "tile-right"
            default:
                return "tile-empty"
        }
    }

}