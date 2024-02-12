export enum TileType {
    JAIL,
    TO_JAIL,
    FREE,
    START,

    ACTION,

    PROPERTY_BLUE,
    PROPERTY_GREEN,
    PROPERTY_RED,
    PROPERTY_YELLOW,
    PROPERTY_PURPLE
}

export namespace TileType {
    export function isCorner(type: TileType) {
        return type === TileType.START || type === TileType.FREE || type === TileType.JAIL || type === TileType.TO_JAIL;
    }
}

export enum TileOrientation {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    CORNER
}