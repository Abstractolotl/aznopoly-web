import { Scene } from "phaser";
import GameObject = Phaser.GameObjects.Shape;
import AzNopolyClient from "../client";
import { PacketType, PlayerPacket } from "../types/client";
import AzNopolyGame from "../game";

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
export default class GameBoard {

    static preload(scene: Scene) {
        scene.load.image("board_bg", "assets/title_background.png")
    }

    private TILE_SIZE: number;

    private scene: Scene;
    private game: AzNopolyGame;

    private players: Map<string, BoardPlayer>;
    private bounds: { x: number, y: number, size: number };

    constructor(aznopoly: AzNopolyGame, scene: Scene, { x, y, size }: { x: number, y: number, size: number }) {
        this.game = aznopoly;
        this.scene = scene;
        this.players = new Map();
        this.bounds = { x, y, size };

        this.TILE_SIZE = size / 10;

        const background = this.scene.add.image(x, y, "board_bg")
        const targetScale = size / background.width;
        background.setScale(targetScale);
        background.setOrigin(0, 0);

        this.game.client.addEventListener(PacketType.BOARD, this.onBoardPacket.bind(this) as EventListener);
        // this.client.addEventListener(PacketType.ROOM_JOIN, this.onRoomJoin.bind(this) as EventListener);
    }

    // private onRoomJoin(event: CustomEvent<RoomJoinPacket>) {
    //     const packet = event.detail;
    //     if (!this.client.isHost) return;

    //     this.addPlayer(packet.data.uuid);

    //     this.players.forEach((player, uuid) => {
    //         const packet: BoardPacket = {
    //             type: PacketType.BOARD,
    //             data: {
    //                 function: "addPlayer",
    //                 args: [uuid, player.position],
    //             },
    //             sender: this.client.uuid,
    //             target: packet.data.uuid,
    //         }
    //         this.client.sendPacket(packet);
    //     });
    // }

    private onBoardPacket(event: CustomEvent<BoardPacket>) {
        const packet = event.detail;
        if (this.game.isHost) return;
        if (packet.target && packet.target !== this.game.client.id) return;

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
        if (this.game.isHost) {
            this.game.client.sendPacket({
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
        const color = this.getColorFromUUID(uuid);
        const player = {
            gameObject: this.scene.add.rectangle(coords.x, coords.y, PLAYER_SIZE, PLAYER_SIZE, color),
            position: startPos,
        };
        this.players.set(uuid, player)
        return player;
    }

    movePlayer(uuid: string, distance: number) {
        if (this.game.isHost) {
            this.game.client.sendPacket({
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

        player.gameObject.setPosition(this.bounds.x + coords.x * this.TILE_SIZE, this.bounds.y + coords.y * this.TILE_SIZE)
    }

    private getColorFromUUID(uuid: string) {
        let hash = 0;
        for (let i = 0; i < uuid.length; i++) {
            hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = Math.floor(Math.abs((Math.sin(hash) * 16777215) % 1) * 16777215);
        return color;
    }

    static getCoordForPos(position: number) {
        position = position % 40;
        const sideLength = 10;
        const sideIndex = Math.floor(position / sideLength);
        const sidePosition = position % sideLength;
        let offset_x = 0;
        let offset_y = 0;

        switch (sideIndex) {
            case 0: // Bottom side
                offset_x = sideLength - sidePosition;
                offset_y = sideLength;
                break;
            case 1: // Left side
                offset_x = 0;
                offset_y = sideLength - sidePosition;
                break;
            case 2: // Top side
                offset_x = sidePosition;
                offset_y = 0;
                break;
            case 3: // Right side
                offset_x = sideLength;
                offset_y = sidePosition;
                break;
        }

        return { x: offset_x, y: offset_y };
    }

}