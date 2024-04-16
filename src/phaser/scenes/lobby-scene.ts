import { FONT_STYLE_HEADLINE } from "../../style";

import TilingBackground from "../components/ui/tiling-background";
import { AzNopolyButton } from "../components/ui/button";
import PlayerList from "../components/ui/player-list";
import { BaseScene } from "./base/base-scene";
import LobbySceneController from "./lobby-scene-controller";
import { PlayerProfile } from "@/phaser/components/ui/player-info";
import { SETTINGS } from "@/settings";
import ProfileCustomizationPanel from "../components/ui/lobby/profile-customization-panel";

export default class LobbyScene extends BaseScene<LobbySceneController> {

    private playerList!: PlayerList;

    preload() {
        ProfileCustomizationPanel.preload(this);
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

        const profile = new ProfileCustomizationPanel(this, SETTINGS.DISPLAY_WIDTH - 700, 100)

        this.add.existing(profile);
        this.initButton();
    }

    private initButton() {
        if (!this.aznopoly.isHost) return;

        const startButton = new AzNopolyButton(this, "Start Game", SETTINGS.DISPLAY_WIDTH/2 + 300, SETTINGS.DISPLAY_HEIGHT - 120, 250);
        startButton.setOnClick(this.controller.onStartClick.bind(this.controller));
        this.add.existing(startButton);

        const leaveButton = new AzNopolyButton(this, "Leave", SETTINGS.DISPLAY_WIDTH/2 - (300 + 250), SETTINGS.DISPLAY_HEIGHT - 120, 250);
        leaveButton.setOnClick(this.controller.onLeaveLobbyClick.bind(this.controller));
        this.add.existing(leaveButton);
    }

    public updatePlayerList(player: PlayerProfile[]) {
        this.playerList.updatePlayerList(player);
    }
    
}