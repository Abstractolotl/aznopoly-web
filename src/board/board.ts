import { Scene } from "phaser";
import GameObject = Phaser.GameObjects.Shape;
import { PacketType, PlayerPacket } from "../types/client";
import AzNopolyGame from "../game";
import { getColorFromUUID } from "../util";
import BoardTile from "./board-tile.ts";
import BoardGenerator from "./board-generator.ts";
import {TileDirection, TileType} from "../types/board.ts";
import TilingBackground from "../ui/tiling-background.ts";

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

    private aznopoly: AzNopolyGame;

    private players: Map<string, BoardPlayer>;
    private size: number;
    private tileMap: BoardTile[];

    constructor(aznopoly: AzNopolyGame, scene: Scene, x: number, y: number, size: number) {
        super(scene, x, y);

        this.size = size;
        this.aznopoly = aznopoly;
        this.players = new Map();

        let generator = new BoardGenerator(aznopoly.room.id, size, BOARD_SIDE_LENGTH);
        generator.generate(this, scene);
        this.tileMap = generator.getTileMap();

        this.aznopoly.client.addEventListener(PacketType.BOARD, this.onBoardPacket.bind(this) as EventListener);
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

        const coords = this.tileMap[startPos % this.tileMap.length].getPlayerCenter();
        console.log(coords);

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
        this.checkPlayerColisions();

        return this.tileMap[player.position % this.tileMap.length];
    }

    private checkPlayerColisions() {
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

    private getAllOfType(type: TileType) {
        return this.tileMap.filter(tile => tile.getTileType() === type);
    }

}

function transformNumber(e: number) {
    for(let i = 0; i <= e; i++) {
        if (i % 12 == 1) e++;
        if (i % 12 == 11) e++;
    }
    return e;
}