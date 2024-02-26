export type TileType = "FREE" | "START" | "JAIL" | "TO_JAIL" | "PROPERTY_BLUE" | "PROPERTY_GREEN" | "PROPERTY_RED" | "PROPERTY_YELLOW" | "PROPERTY_PURPLE" | "ACTION";

export namespace TileType {
    export const START = "START";
    export const FREE = "FREE";
    export const ACTION = "ACTION";
    export const JAIL = "JAIL";
    export const TO_JAIL = "TO_JAIL";

    export const PROPERTY_BLUE = "PROPERTY_BLUE";
    export const PROPERTY_GREEN = "PROPERTY_GREEN";
    export const PROPERTY_RED = "PROPERTY_RED";
    export const PROPERTY_YELLOW = "PROPERTY_YELLOW";
    export const PROPERTY_PURPLE = "PROPERTY_PURPLE";


    export function isCorner(type: TileType) {
        return type === TileType.START || type === TileType.FREE || type === TileType.JAIL || type === TileType.TO_JAIL;
    }

    export function isProperty(type: TileType) {
        return type === TileType.PROPERTY_BLUE || type === TileType.PROPERTY_GREEN || type === TileType.PROPERTY_RED || type === TileType.PROPERTY_YELLOW || type === TileType.PROPERTY_PURPLE;
    }
}

export enum TileOrientation {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    CORNER
}