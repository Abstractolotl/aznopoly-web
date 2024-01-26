import { Scene } from "phaser";
import GameObject = Phaser.GameObjects.Shape;
import { PacketType, PlayerPacket } from "../types/client";
import { TileDirection, TileType } from "./tile-type.ts";
import AzNopolyGame from "../game";
import { getColorFromUUID } from "../util";
import BoardTile from "./board-tile.ts";

interface BoardPlayer {
    gameObject: GameObject,
    position: number,
}

export interface BoardPacket extends PlayerPacket {
    type: PacketType.BOARD,
    data: {
        function: string,
        args: any[],
    }
}

const PLAYER_SIZE = 16;
const BOARD_SIDE_LENGTH = 7;

export default class GameBoard extends Phaser.GameObjects.Container {

    public static preload(scene: Scene) {
        BoardTile.preload(scene);
    }

    private TILE_SIZE: number;
    private aznopoly: AzNopolyGame;

    private players: Map<string, BoardPlayer>;
    private size: number;

    constructor(aznopoly: AzNopolyGame, scene: Scene, x: number, y: number, size: number) {
        super(scene, x, y);

        this.size = size;
        this.aznopoly = aznopoly;
        this.players = new Map();
        this.TILE_SIZE = size / (BOARD_SIDE_LENGTH + 2);

        this.add(new BoardTile(scene, 0, 0, this.TILE_SIZE * 2, this.TILE_SIZE * 2, TileType.JAIL, TileDirection.CORNER));
        this.add(new BoardTile(scene, this.TILE_SIZE * BOARD_SIDE_LENGTH, 0, this.TILE_SIZE * 2, this.TILE_SIZE * 2, TileType.FREE, TileDirection.CORNER));
        this.add(new BoardTile(scene, 0, this.TILE_SIZE * BOARD_SIDE_LENGTH, this.TILE_SIZE * 2, this.TILE_SIZE * 2, TileType.START, TileDirection.CORNER));
        this.add(new BoardTile(scene, this.TILE_SIZE * BOARD_SIDE_LENGTH, this.TILE_SIZE * BOARD_SIDE_LENGTH, this.TILE_SIZE * 2, this.TILE_SIZE * 2, TileType.TO_JAIL, TileDirection.CORNER));

        let tileSet = this.generateTileSet();
        for(let i = 0; i < (BOARD_SIDE_LENGTH - 2); i++) {
            this.add(new BoardTile(scene, this.TILE_SIZE * (i + 2), 0, this.TILE_SIZE, this.TILE_SIZE * 2, tileSet.pop(), TileDirection.UP));
            this.add(new BoardTile(scene, 0, this.TILE_SIZE * (i + 2), this.TILE_SIZE * 2, this.TILE_SIZE, tileSet.pop(), TileDirection.LEFT));
            this.add(new BoardTile(scene, this.TILE_SIZE * BOARD_SIDE_LENGTH, this.TILE_SIZE * (i + 2), this.TILE_SIZE * 2, this.TILE_SIZE, tileSet.pop(), TileDirection.RIGHT));
            this.add(new BoardTile(scene, this.TILE_SIZE * (i + 2), this.TILE_SIZE * BOARD_SIDE_LENGTH, this.TILE_SIZE, this.TILE_SIZE * 2, tileSet.pop(), TileDirection.DOWN));
        }


        this.aznopoly.client.addEventListener(PacketType.BOARD, this.onBoardPacket.bind(this) as EventListener);
    }

    private generateTileSet() {
        let baseSet = [
            TileType.BLUE, TileType.BLUE, TileType.BLUE,
            TileType.GREEN, TileType.GREEN, TileType.GREEN,
            TileType.RED, TileType.RED, TileType.RED,
            TileType.YELLOW, TileType.YELLOW, TileType.YELLOW,
            TileType.PURPLE, TileType.PURPLE,
            TileType.CHANCE, TileType.CHANCE, TileType.CHANCE,
            TileType.CHANCE, TileType.CHANCE, TileType.CHANCE,
        ];

        // Generate a seed from the room code
        let seed = 0;
        for(let i = 0; i < this.aznopoly.room.id.length; i++) {
            seed += this.aznopoly.room.id.charCodeAt(i);
        }

        // Shuffle the set using the seed so that all players have the same board
        for(let i = 0; i < baseSet.length; i++) {
            seed = (seed * 9301 + 49297) % 233280;
            let j = Math.floor(seed / 233280 * baseSet.length);
            let temp = baseSet[i];
            baseSet[i] = baseSet[j];
            baseSet[j] = temp;
        }


        return baseSet;
    }

    private onBoardPacket(event: CustomEvent<BoardPacket>) {
        const packet = event.detail;
        if (this.aznopoly.isHost) return;
        if (packet.target && packet.target !== this.aznopoly.client.id) return;

        switch (packet.data.function) {
            case "addPlayer":
                this.addPlayer(packet.data.args[0], packet.data.args[1]);
                break;
            case "movePlayer":
                this.movePlayer(packet.data.args[0], packet.data.args[1]);
                break;
        }
    }

    addPlayer(uuid: string, startPos: number = 0) {
        if (this.aznopoly.isHost) {
            this.aznopoly.client.sendPacket({
                type: PacketType.BOARD,
                data: {
                    function: "addPlayer",
                    args: [uuid, startPos],
                },
            })
        }

        if (this.players.has(uuid)) {
            throw new Error(`Player with UUID ${uuid} already exists!`);
        }

        const coords = GameBoard.getCoordForPos(startPos);
        const color = getColorFromUUID(this.aznopoly.room.getPlayerName(uuid));
        const player = {
            gameObject: new Phaser.GameObjects.Rectangle(this.scene, coords.x * this.TILE_SIZE, coords.y * this.TILE_SIZE, PLAYER_SIZE, PLAYER_SIZE, color),
            position: startPos,
        };
        this.add(player.gameObject);
        this.players.set(uuid, player)
        this.movePlayer(uuid, 0);
        return player;
    }

    movePlayer(uuid: string, distance: number) {
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
        const coords = GameBoard.getCoordForPos(player.position);

        player.gameObject.setPosition(coords.x * this.TILE_SIZE, coords.y * this.TILE_SIZE)
        this.checkPlayerColisions();
    }

    private checkPlayerColisions() {
        const positions: { [key: number]: string[] } = {};
        this.players.forEach((player, uuid) => {
            if (positions[player.position]) {
                positions[player.position].push(uuid);
            } else {
                positions[player.position] = [uuid];
            }
        });

        Object.entries(positions).forEach(([position, uuids]) => {
            if (uuids.length > 1) {
                console.log(`Collision at position ${position} between ${uuids.join(", ")}`);
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

    static getCoordForPos(position: number) {
        position = transformNumber(position);
        position = position % (BOARD_SIDE_LENGTH * 4);
        const sideLength = BOARD_SIDE_LENGTH;
        const sideIndex = Math.floor(position / sideLength);
        let sidePosition = position % sideLength;
        let offset_x = 0;
        let offset_y = 0;

        const inawrds_offset = 0.5;

        switch (sideIndex) {
            case 0: // Bottom side
                offset_x = sideLength - sidePosition - (sidePosition == 0 ? inawrds_offset : 0);
                offset_y = sideLength - inawrds_offset;
                break;
            case 1: // Left side
                offset_x = inawrds_offset;
                offset_y = sideLength - sidePosition - (sidePosition == 0 ? inawrds_offset : 0);
                break;
            case 2: // Top side
                offset_x = sidePosition + (sidePosition == 0 ? inawrds_offset : 0);
                offset_y = inawrds_offset;
                break;
            case 3: // Right side
                offset_x = sideLength - inawrds_offset;
                offset_y = sidePosition + (sidePosition == 0 ? inawrds_offset : 0);
                break;
        }

        return { x: offset_x, y: offset_y };
    }

}

function transformNumber(e: number) {
    for(let i = 0; i <= e; i++) {
        if (i % 12 == 1) e++;
        if (i % 12 == 11) e++;
    }
    return e;
}