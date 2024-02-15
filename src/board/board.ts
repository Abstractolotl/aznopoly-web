import { getColorFromUUID } from "../util";
import BoardTile from "./board-tile.ts";
import { TileOrientation, TileType } from "../types/board.ts";

interface BoardPlayer {
    gameObject: Phaser.GameObjects.Shape,
    position: number,
}

const PLAYER_SIZE = 16;
export default class GameBoard extends Phaser.GameObjects.Container {

    public static preload(scene: Phaser.Scene) {
        BoardTile.preload(scene);
    }

    private players: Map<string, BoardPlayer>;
    private boardTiles!: BoardTile[];
    private boardLength: number;
    private tiles!: TileType[];

    constructor(scene: Phaser.Scene, x: number, y: number, size: number, boardLength: number) {
        super(scene, x, y);
        this.players = new Map();
        this.width = size;
        this.height = size;
        this.boardLength = boardLength;
    }

    public init(tiles: TileType[]) {
        this.tiles = tiles;
        this.boardTiles = this.generateBoardTiles(this.scene, this.tiles, this.width / (this.boardLength + 4));
        this.boardTiles.forEach(e => this.add(e));
    }

    private generateBoardTiles(scene: Phaser.Scene, tiles: TileType[], tileWidth: number) {
        const size = tileWidth;
        const length = this.boardLength + 2;

        const boardTiles: BoardTile[] = [];
        tiles.length = this.boardLength * 4 + 4;
        let index;
        for (let i = 0; i < this.boardLength; i++) {
            index = 1 + (1 + this.boardLength) * 0 + i;
            boardTiles[index] = new BoardTile(scene, size * (i + 2)     , size * length, size      , size * 2  , tiles[index], TileOrientation.UP);
            index = 1 + (1 + this.boardLength) * 1 + i;
            boardTiles[index] = new BoardTile(scene, 0                  , size * (i + 2)    , size * 2  , size      , tiles[index], TileOrientation.RIGHT);
            index = 1 + (1 + this.boardLength) * 2 + i;
            boardTiles[index] = new BoardTile(scene, size * (i + 2)     , 0                 , size      , size * 2  , tiles[index], TileOrientation.DOWN);
            index = 1 + (1 + this.boardLength) * 3 + i;
            boardTiles[index] = new BoardTile(scene, size * length , size * (i + 2)    , size * 2  , size      , tiles[index], TileOrientation.LEFT);
        }

        index = (this.boardLength + 1) * 0;
        boardTiles[index] = new BoardTile(scene, size * length, size * length, size * 2, size * 2, tiles[index], TileOrientation.CORNER);
        index = (this.boardLength + 1) * 1;
        boardTiles[index] = new BoardTile(scene, 0, size * length, size * 2, size * 2, tiles[index], TileOrientation.CORNER);
        index = (this.boardLength + 1) * 2;
        boardTiles[index] = new BoardTile(scene, 0, 0, size * 2, size * 2, tiles[index], TileOrientation.CORNER);
        index = (this.boardLength + 1) * 3;
        boardTiles[index] = new BoardTile(scene, size * length, 0, size * 2, size * 2, tiles[index], TileOrientation.CORNER);
        return boardTiles;
    }

    addPlayer(uuid: string, startPos: number = 0) {
        if (this.players.has(uuid)) {
            throw new Error(`Player with UUID ${uuid} already exists!`);
        }

        const coords = this.boardTiles[startPos % this.boardTiles.length].getPlayerCenter();

        const color = getColorFromUUID(uuid);
        const player = {
            gameObject: new Phaser.GameObjects.Rectangle(this.scene, coords.x, coords.y, PLAYER_SIZE, PLAYER_SIZE, color),
            position: startPos,
        };
        this.add(player.gameObject);
        this.players.set(uuid, player)
        this.movePlayerToPosition(uuid, 0);

        return player;
    }

    movePlayerToPosition(uuid: string, pos: number) : BoardTile {
        if (!Number.isInteger(pos)) {
            throw new Error(`Illegal parameter distance: Not an integer (${pos})`);
        }

        let player = this.players.get(uuid);
        if (!player) {
            throw new Error(`Player with UUID ${uuid} does not exist!`);
        }

        player.position = pos;
        const coords = this.boardTiles[player.position % this.boardTiles.length].getPlayerCenter();

        player.gameObject.setPosition(coords.x, coords.y)
        this.checkPlayerCollisions();

        return this.boardTiles[player.position % this.boardTiles.length];
    }

    private checkPlayerCollisions() {
        const positions: { [key: number]: string[] } = {};
        this.players.forEach((player, uuid) => {
            if (positions[player.position % this.boardTiles.length]) {
                positions[player.position % this.boardTiles.length].push(uuid);
            } else {
                positions[player.position % this.boardTiles.length] = [uuid];
            }
        });

        Object.values(positions).forEach((uuids) => {
            if (uuids.length > 1) {
                let i = 0; 
                const offset = uuids.length * PLAYER_SIZE * -0.25;
                uuids.forEach(_ => {
                    const player = this.players.get(uuids[i]);
                    player?.gameObject.setX(player.gameObject.x + offset + PLAYER_SIZE * i);
                    i++;
                })
            }
        })
    }

}