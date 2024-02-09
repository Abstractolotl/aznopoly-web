import {TileDirection, TileType} from "../types/board.ts";
import BoardTile from "./board-tile.ts";
import {Scene} from "phaser";
import {stringify} from "ts-jest";
import {FONT_STYLE_BODY} from "../style.ts";

export default class BoardGenerator {

    private roomId: string;
    private tileSet: TileType[];
    private tileMap: BoardTile[];

    private readonly size: number;
    private readonly length: number;
    private readonly tileSize: number;

    constructor(roomId: string, size: number, length: number) {
        this.roomId = roomId;
        this.tileSet = this.defaultTileSet();

        this.size = size;
        this.length = length;

        this.tileSize = size / (length + 2);
        this.tileMap = new Array(this.length);

        this.shuffleTileSet();
    }

    public getTileMap() {
        return this.tileMap;
    }

    public generate(parent: Phaser.GameObjects.Container, scene: Scene) {
        this.addCorners(parent, scene);

        for(let i = 0; i < (this.length - 2); i++) {
            this.addToTileMap(parent, new BoardTile(scene, this.tileSize * (i + 2), this.tileSize * this.length, this.tileSize, this.tileSize * 2, this.tileSet.pop(), TileDirection.UP), (this.length - 1) - (i + 1));
            this.addToTileMap(parent, new BoardTile(scene, 0, this.tileSize * (i + 2), this.tileSize * 2, this.tileSize, this.tileSet.pop(), TileDirection.RIGHT), ((this.length - 1) * 2) - (i + 1));
            this.addToTileMap(parent, new BoardTile(scene, this.tileSize * (i + 2), 0, this.tileSize, this.tileSize * 2, this.tileSet.pop(), TileDirection.DOWN), ((this.length - 1) * 2) + (i + 1));
            this.addToTileMap(parent, new BoardTile(scene, this.tileSize * this.length, this.tileSize * (i + 2), this.tileSize * 2, this.tileSize, this.tileSet.pop(), TileDirection.LEFT), ((this.length - 1) * 3) + (i + 1));
        }
    }

    private addCorners(parent: Phaser.GameObjects.Container, scene: Scene) {
        this.addToTileMap(parent, new BoardTile(scene, this.tileSize * this.length, this.tileSize * this.length, this.tileSize * 2, this.tileSize * 2, TileType.START, TileDirection.CORNER), 0);
        this.addToTileMap(parent, new BoardTile(scene, 0, 0, this.tileSize * 2, this.tileSize * 2, TileType.FREE, TileDirection.CORNER), (this.length - 1) * 2);
        this.addToTileMap(parent, new BoardTile(scene, this.tileSize * this.length, 0, this.tileSize * 2, this.tileSize * 2, TileType.TO_JAIL, TileDirection.CORNER), (this.length - 1) * 3);
        this.addToTileMap(parent, new BoardTile(scene, 0, this.tileSize * this.length, this.tileSize * 2, this.tileSize * 2, TileType.JAIL, TileDirection.CORNER), this.length - 1);
    }

    private addToTileMap(parent: Phaser.GameObjects.Container, tile: BoardTile, index: number) {
        this.tileMap[index] = tile;
        parent.add(tile);
    }

    private shuffleTileSet() {
        let tileSet = this.tileSet;

        let seed = 0;
        for(let i = 0; i < this.roomId.length; i++) {
            seed += this.roomId.charCodeAt(i);
        }

        // Shuffle the set using the seed so that all players have the same board
        for(let i = 0; i < tileSet.length; i++) {
            seed = (seed * 9301 + 49297) % 233280;
            let j = Math.floor(seed / 233280 * tileSet.length);
            let temp = tileSet[i];
            tileSet[i] = tileSet[j];
            tileSet[j] = temp;
        }

        this.tileSet = tileSet;
    }

    private defaultTileSet() {
        return [
            TileType.BLUE, TileType.BLUE, TileType.BLUE,
            TileType.GREEN, TileType.GREEN, TileType.GREEN,
            TileType.RED, TileType.RED, TileType.RED,
            TileType.YELLOW, TileType.YELLOW, TileType.YELLOW,
            TileType.PURPLE, TileType.PURPLE,
            TileType.CHANCE, TileType.CHANCE, TileType.CHANCE,
            TileType.CHANCE, TileType.CHANCE, TileType.CHANCE,
        ];
    }

}