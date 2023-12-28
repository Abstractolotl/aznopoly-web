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