import AzNopolyClient from "./client";
import AzNopolyGame from "./game";
import Room from "./room";

export function mock(aznopoly: AzNopolyGame) {
    let game = aznopoly as any;
    game._client = new AzNopolyClient();
    game._room = new Room("mockkk", aznopoly, game._client);
    game._name = "mockius maximus";

    game._client.connect("mockkk");
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    })
}