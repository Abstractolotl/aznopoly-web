import { Avatars } from "@/phaser/components/ui/avatar";
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
        addEventListener: () => {},
    };
    game._name = "mockius maximus";

    game.profiles = {
        "1111-2222-3333-4444": {
            name: "mockius maximus",
            colorIndex: 0,
            uuid: "1111-2222-3333-4444",
            avatar: Avatars.AXOLOTL,
            host: true,
        },
        "222": {
            name: "mockius minimus",
            colorIndex: 1,
            uuid: "222",
            avatar: Avatars.ABSTRACT,
        },
        "333": {
            name: "mockius medius",
            colorIndex: 2,
            uuid: "333",
            avatar: Avatars.BANANA,
        },
        "444": {
            name: "mockius maximus",
            colorIndex: 3,
            uuid: "444",
            avatar: Avatars.UNKNOWN
        },
    };

    SceneSwitcher.waitForPlayers = (_a, _b, _c, callback) => {
        setTimeout(callback, 100);
    }
}