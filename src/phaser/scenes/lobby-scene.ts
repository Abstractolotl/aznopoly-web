import { FONT_STYLE_HEADLINE } from "../../style";

import TilingBackground from "../components/ui/tiling-background";
import { AzNopolyButton } from "../components/ui/button";
import PlayerList from "../components/ui/player-list";
import { BaseScene } from "./base/base-scene";
import LobbySceneController from "./lobby-scene-controller";
import { PlayerProfile } from "@/phaser/components/ui/player-info";
import { SETTINGS } from "@/settings";

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

        const button = new AzNopolyButton(this, "Start Game", SETTINGS.DISPLAY_WIDTH - 200, SETTINGS.DISPLAY_HEIGHT - 120, 300, 60, this.controller.onStartClick.bind(this.controller));
        this.add.existing(button);
    }

    public updatePlayerList(player: PlayerProfile[]) {
        this.playerList.updatePlayerList(player);
    }
    
}