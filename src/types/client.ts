export type ClientPacket = RoomInitPacket | RoomJoinPacket | RoomLeavePacket | RoomNamePacket;
export type ClientPacketHandler = (packet: ClientPacket) => void;

export enum PacketType {
    // Client receives information about the room
    ROOM_INIT = "ROOM_WELCOME", 

    // Another player joins the room
    ROOM_JOIN = "ROOM_JOIN",

    // Another player leaves the room
    ROOM_LEAVE = "ROOM_QUIT",

    // A Player changes their name
    ROOM_NAME = "CLIENT_NAME",

    // Events related to the game board
    BOARD = "CLIENT_BOARD",

    SCENE_CHANGE = "CLIENT_CHANGE_SCENE",
    SCEEN_READY = "CLIENT_SCEEN_READY",

    GAME_TURN_START = "CLIENT_GAME_TURN_START",
    GAME_TURN_ROLL = "CLIENT_GAME_TURN_ROLL",

    // Unused
    EXAMPLE = "CLIENT_EXAMPLE",
}

export interface BasePacket {
    type: string;
    data: any;
}

export interface PlayerPacket extends BasePacket {
    sender: string;
    target?: string;
}

export interface RoomInitPacket extends BasePacket {
    type: PacketType.ROOM_INIT;
    data: {
        uuid: string,
        room: {
            host: string,
            clients: string[],
        }
    };
}

export interface RoomNamePacket extends PlayerPacket {
    type: PacketType.ROOM_NAME;
    data: {
        name: string,
    };

}

export interface RoomJoinPacket extends BasePacket {
    type: PacketType.ROOM_JOIN;
    data: {
        uuid: string,
    };
}

export interface RoomLeavePacket extends BasePacket {
    type: PacketType.ROOM_LEAVE;
    data: {
        uuid: string,
    };
}

export enum ClientState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
}

export interface SceneChangePacket extends PlayerPacket {
    type: PacketType.SCENE_CHANGE;
    data: {
        scene: string,
    };
}

export interface SceneReadyPacket extends PlayerPacket {
    type: PacketType.SCEEN_READY;
    data: {
        scene: string,
    };
}

export interface GameTurnStartPacket extends PlayerPacket {
    type: PacketType.GAME_TURN_START;
    data: {
        player: string,
    };
}

export interface GameTurnRollPacket extends PlayerPacket {
    type: PacketType.GAME_TURN_ROLL;
}