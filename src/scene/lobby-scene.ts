import { FONT_STYLE_HEADLINE } from "../style";

import TilingBackground from "../ui/tiling-background";
import { AzNopolyButton } from "../ui/button";
import PlayerList from "../ui/player-list";
import { HEIGHT, WIDTH } from "../main";
import { BaseScene } from "./base/base-scene";
import LobbySceneController from "./lobby-scene-controller";

export default class LobbyScene extends BaseScene<LobbySceneController> {

    private playerList!: PlayerList;

    preload() {
        PlayerList.preload(this);
        this.load.image('host_crown', 'assets/crown.png');
        this.load.image('lobby_bg', 'assets/lobby_background.png');
    }

    init() {
        this.controller = new LobbySceneController(this, this.aznopoly);
    }

    create() {
        this.add.existing(new TilingBackground(this, 'lobby_bg', new Phaser.Math.Vector2(2, 1), 35, 1.75));
        this.add.text(0, 0, `Lobby ( ${this.aznopoly.room.id} )`, FONT_STYLE_HEADLINE);
        this.playerList = this.add.existing(new PlayerList(this, this.aznopoly.isHost, 100, 200, 450));

        this.initButton();
    }

    private initButton() {
        if (!this.aznopoly.isHost) return;

        const button = new AzNopolyButton(this, "Start Game", WIDTH - 200, HEIGHT - 120, 0, 0, this.controller.onStartClick.bind(this.controller));
        this.add.existing(button);
    }

    public updatePlayerList(player: { uuid: string, name: string, host: boolean }[]) {
        this.playerList.updatePlayerList(player);
    }
    
}