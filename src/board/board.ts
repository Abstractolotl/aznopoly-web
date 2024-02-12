import { Scene } from "phaser";
import GameObject = Phaser.GameObjects.Shape;
import { PacketType } from "../types/client";
import AzNopolyGame from "../game";
import { getColorFromUUID } from "../util";
import BoardTile from "./board-tile.ts";
import BoardGenerator from "./board-generator.ts";
import { TileType } from "../types/board.ts";

interface BoardPlayer {
    gameObject: GameObject,
    position: number,
}

const PLAYER_SIZE = 16;
const BOARD_SIDE_LENGTH = 7;
export default class GameBoard extends Phaser.GameObjects.Container {

    public static preload(scene: Scene) {
        BoardTile.preload(scene);
    }

    private players: Map<string, BoardPlayer>;
    private tileMap: BoardTile[];

    constructor(aznopoly: AzNopolyGame, scene: Scene, x: number, y: number, size: number) {
        super(scene, x, y);
        this.players = new Map();

        let generator = new BoardGenerator(aznopoly.room.id, size, BOARD_SIDE_LENGTH);
        generator.generate(this, scene);
        this.tileMap = generator.getTileMap();
    }

    addPlayer(uuid: string, startPos: number = 0) {
        if (this.players.has(uuid)) {
            throw new Error(`Player with UUID ${uuid} already exists!`);
        }

        const coords = this.tileMap[startPos % this.tileMap.length].getPlayerCenter();

        const color = getColorFromUUID(uuid);
        const player = {
            gameObject: new Phaser.GameObjects.Rectangle(this.scene, coords.x, coords.y, PLAYER_SIZE, PLAYER_SIZE, color),
            position: startPos,
        };
        this.add(player.gameObject);
        this.players.set(uuid, player)
        this.movePlayer(uuid, 0);

        return player;
    }

    movePlayer(uuid: string, distance: number) : BoardTile {
        if (this.aznopoly.isHost) {
            this.aznopoly.client.sendPacket({
                type: PacketType.BOARD,
                data: {
                    function: "movePlayer",
                    args: [uuid, distance],
                },
            })
        }

        if (!Number.isInteger(distance)) {
            throw new Error(`Illegal parameter distance: Not an integer (${distance})`);
        }

        let player = this.players.get(uuid);
        if (!player) {
            throw new Error(`Player with UUID ${uuid} does not exist!`);
        }

        player.position += distance;
        const coords = this.tileMap[player.position % this.tileMap.length].getPlayerCenter();

        player.gameObject.setPosition(coords.x, coords.y)
        this.checkPlayerCollisions();

        return this.tileMap[player.position % this.tileMap.length];
    }

    getAllTilesOfType(type: TileType) {
        return this.tileMap.filter(tile => tile.getTileType() === type);
    }

    private checkPlayerCollisions() {
        const positions: { [key: number]: string[] } = {};
        this.players.forEach((player, uuid) => {
            if (positions[player.position % this.tileMap.length]) {
                positions[player.position % this.tileMap.length].push(uuid);
            } else {
                positions[player.position % this.tileMap.length] = [uuid];
            }
        });

        Object.entries(positions).forEach(([position, uuids]) => {
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