import { Scene } from "phaser";
import GameObject = Phaser.GameObjects.Shape;

interface BoardPlayer {
    gameObject: GameObject,
    position: number,
}

const PLAYER_SIZE = 16;
export default class GameBoard {

    static preload(scene: Scene) {
        scene.load.image("board_bg", "assets/title_background.png")
    }

    //private background: Phaser.GameObjects.Image;

    private TILE_SIZE: number;

    private players: Map<string, BoardPlayer>;
    private scene: Scene;

    private bounds: {x: number, y: number, size: number};

    constructor(scene: Scene, {x, y, size}: {x: number, y: number, size: number}) {
        this.scene = scene;
        this.players = new Map();
        this.bounds = {x, y, size};

        this.TILE_SIZE = size / 10;
        
        const background = this.scene.add.image(x, y, "board_bg")
        const targetScale = size / background.width;
        background.setScale(targetScale);
        background.setOrigin(0, 0);
        console.log(background.getBounds());
    }

    addPlayer(uuid: string) {
        const coords = GameBoard.getCoordForPos(0);
        const color = this.getColorFromUUID(uuid);
        this.players.set(uuid, {
            gameObject: this.scene.add.rectangle(coords.x, coords.y, PLAYER_SIZE, PLAYER_SIZE, color),
            position: 0,
        })
    }

    movePlayer(uuid: string, distance: number) {
        if (!Number.isInteger(distance)) {
            throw new Error(`Illegal parameter distance: Not an integer (${distance})`);
        }

        const player = this.players.get(uuid);
        if (!player) {
            throw new Error(`No player with given UUID (${uuid})`);
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