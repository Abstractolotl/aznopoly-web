import GameObject = Phaser.GameObjects.Shape;
import BoardTile from "./board-tile.ts";
import { TileOrientation, TileType } from "../types/board.ts";
import AzNopolyAvatar from "@/ui/avatar.ts";
import { PlayerProfile } from "@/ui/player-info.ts";

interface BoardPlayer {
    gameObject: AzNopolyAvatar,
    position: number,
}

const PLAYER_SIZE = 32;
const BOARD_SIDE_LENGTH = 5; // Without corners
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
            index = this.boardLength - i;
            boardTiles[index] = new BoardTile(scene, size * (i + 2)     , size * length, size      , size * 2  , tiles[index], TileOrientation.UP);
            index = 1 + (this.boardLength * 2) - i;
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

    addPlayer(uuid: string, profile: PlayerProfile, startPos: number = 0) {
        if (this.players.has(uuid)) {
            throw new Error(`Player with UUID ${uuid} already exists!`);
        }

        const coords = this.boardTiles[startPos % this.boardTiles.length].getPlayerCenter();

        const player = {
            gameObject: new AzNopolyAvatar(this.scene, coords.x - PLAYER_SIZE * 0.5, coords.y - PLAYER_SIZE * 0.5, PLAYER_SIZE, profile.avatar, profile.colorIndex),
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

        player.gameObject.setPosition(coords.x - PLAYER_SIZE * 0.5, coords.y - PLAYER_SIZE * 0.5)
        this.checkPlayerCollisions();

        return this.boardTiles[player.position % this.boardTiles.length];
    }

    teleportPlayerToPosition(uuid: string, pos: number) {
        const player = this.players.get(uuid);
        if (!player) {
            throw new Error(`Player with UUID ${uuid} does not exist!`);
        }

        player.position = pos;
        const coords = this.boardTiles[player.position % this.boardTiles.length].getPlayerCenter();

        player.gameObject.setPosition(coords.x, coords.y)
        this.checkPlayerCollisions();

        return this.boardTiles[player.position % this.boardTiles.length];
    }

    getTile(pos: number) {
        return this.boardTiles[pos % this.boardTiles.length];
    }

    getTilesOfType(type: TileType) {
        let tiles: number[] = [];
        this.boardTiles.forEach((tile, i) => {
            if (tile.getTileType() === type) {
                tiles.push(i);
            }
        });
        return tiles;
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