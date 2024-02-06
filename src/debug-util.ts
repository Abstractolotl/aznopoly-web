import AzNopolyClient from "./client";
import AzNopolyGame from "./game";
import Room from "./room";

export function mock(aznopoly: AzNopolyGame) {
    let game = aznopoly as any;
    game._client = {
        id: "1111-2222-3333-4444",
        sendPacket: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
    };
    game._room = {
        connectedPlayerIds: ["1111-2222-3333-4444"],
        host: "1111-2222-3333-4444",
    };
    game._name = "mockius maximus";

}