import AzNopolyGame from "../game";
import { SceneSwitcher } from "./scene-switcher";

export function mock(aznopoly: AzNopolyGame) {
    let game = aznopoly as any;
    game._client = {
        id: "1111-2222-3333-4444",
        sendPacket: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
    };
    game._room = {
        connectedPlayerIds: ["1111-2222-3333-4444", "222", "333", "444"],
        host: "1111-2222-3333-4444",
        getPlayerName: () => "mockius maximus",
    };
    game._name = "mockius maximus";

    SceneSwitcher.waitForPlayers = (_a, _b, _c, callback) => {
        setTimeout(callback, 100);
    }
}