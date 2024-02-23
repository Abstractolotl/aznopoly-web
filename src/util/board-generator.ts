import { TileType } from "../types/board.ts";
import seedrandom from "seedrandom";

interface Config {
    tiles: {
        [key in TileType]?: number
    };
};

function getNumTiles(config: Config) {
    return Object.values(config.tiles).reduce((a, b) => a + b, 0);
}

export default class BoardGenerator {

    private static defaultConfig: Config = {
        tiles: {
            [TileType.PROPERTY_BLUE]: 3,
            [TileType.PROPERTY_GREEN]: 3,
            [TileType.PROPERTY_RED]: 3,
            [TileType.PROPERTY_YELLOW]: 3,
            [TileType.PROPERTY_PURPLE]: 2,
            [TileType.ACTION]: 6,
        }
    };

    public static generateFields(seed: string, boardSideLength: number, config: Config = BoardGenerator.defaultConfig) {
        if (getNumTiles(config) != boardSideLength * 4) {
            throw new Error("Invalid configuration. Got: " + getNumTiles(config) + " but expected " + boardSideLength * 4);
        }

        let tmpTiles: TileType[] = [];
        Object.keys(config.tiles).forEach((key: any) => {
            const tile: TileType = key as TileType;
            const count = config.tiles[tile]!;
            for (let i = 0; i < count; i++) {
                tmpTiles.push(tile);
            }
        });

        const rng = seedrandom(seed)
        tmpTiles = tmpTiles.sort(() => rng() - 0.5);
        return [
            TileType.START,
            ...(tmpTiles.slice(boardSideLength * 0, boardSideLength * 1)),
            TileType.JAIL,
            ...(tmpTiles.slice(boardSideLength * 1, boardSideLength * 2)),
            TileType.FREE,
            ...(tmpTiles.slice(boardSideLength * 2, boardSideLength * 3)),
            TileType.TO_JAIL,
            ...(tmpTiles.slice(boardSideLength * 3, boardSideLength * 4)),
        ]
    }

}