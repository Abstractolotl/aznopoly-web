import { FONT_STYLE_PANEL_HEADLINE, PLAYER_COLORS } from "../../style";

import TilingBackground from "../components/ui/tiling-background";
import { AzNopolyButton } from "../components/ui/button";
import PlayerList from "../components/ui/player-list";
import { BaseScene } from "./base/base-scene";
import LobbySceneController from "./lobby-scene-controller";
import { PlayerProfile } from "@/phaser/components/ui/player-info";
import { SETTINGS } from "@/settings";
import ProfileCustomizationPanel from "../components/ui/lobby/profile-customization-panel";
import { Avatars } from "../components/ui/avatar";

export default class LobbyScene extends BaseScene<LobbySceneController> {

    private playerList!: PlayerList;
    private profilePanel!: ProfileCustomizationPanel;

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
        this.cameras.main.fadeIn(100);
        this.add.existing(new TilingBackground(this, 'lobby_bg', new Phaser.Math.Vector2(2, 1), 35, 1.75));
        this.add.text(0, 0, `Lobby ( ${this.aznopoly.room.id} )`, FONT_STYLE_PANEL_HEADLINE);

        const totalWidth = PlayerList.WIDTH + ProfileCustomizationPanel.WIDTH + 20;
        this.playerList = new PlayerList(this, this.aznopoly.isHost, SETTINGS.DISPLAY_WIDTH * 0.5 - totalWidth * 0.5 + PlayerList.WIDTH * 0.5, SETTINGS.DISPLAY_HEIGHT * 0.5 - 100);
        this.profilePanel = new ProfileCustomizationPanel(this, SETTINGS.DISPLAY_WIDTH * 0.5 + totalWidth * 0.5 - ProfileCustomizationPanel.WIDTH * 0.5, SETTINGS.DISPLAY_HEIGHT * 0.5 - 100, this.aznopoly.getProfile(this.aznopoly.uuid));
        this.profilePanel.setProfileChangeCallback(this.onProfileChange.bind(this));

        this.add.existing(this.playerList);
        this.add.existing(this.profilePanel);
        this.initButton();
    }

    public setNumConnectedPlayers(num: number) {
        this.playerList.setHeadline(`CONNECTED PLAYERS  (${num} / 4)`);
    }

    private onProfileChange(profile: PlayerProfile) {
        //this.aznopoly.setProfile(this.aznopoly.uuid, profile);
        this.controller.syncProxy.sendProfileUpdateIntent(profile);
    }

    private initButton() {
        if (!this.aznopoly.isHost) return;

        const startButton = new AzNopolyButton(this, "Start Game", SETTINGS.DISPLAY_WIDTH / 2 + 10, SETTINGS.DISPLAY_HEIGHT * 0.5 + 150, 250);
        startButton.setOnClick(this.controller.onStartClick.bind(this.controller));
        this.add.existing(startButton);

        const leaveButton = new AzNopolyButton(this, "Leave", SETTINGS.DISPLAY_WIDTH / 2 - 250 - 10, SETTINGS.DISPLAY_HEIGHT * 0.5 + 150, 250);
        leaveButton.setOnClick(this.controller.onLeaveLobbyClick.bind(this.controller));
        this.add.existing(leaveButton);
    }

    public updatePlayerList(player: PlayerProfile[]) {
        this.playerList.updatePlayerList(player);

        const otherPlayers = this.aznopoly.connectedUuids
            .filter(e => e !== this.aznopoly.uuid)
            .filter(e => this.aznopoly.hasProfile(e));

        const usedColors = otherPlayers.map(e => this.aznopoly.getProfile(e).colorIndex);
        const usedAvatars = otherPlayers.map(e => this.aznopoly.getProfile(e).avatar);

        const availableAvatars = Object.values(Avatars).filter(e => !usedAvatars.includes(e));
        const availableColors = PLAYER_COLORS.map((_, i) => i).filter(e => !usedColors.includes(e));

        this.profilePanel.updateProfile(this.aznopoly.getProfile(this.aznopoly.uuid));
        this.profilePanel.updateAvailable(availableColors, availableAvatars);
    }

}