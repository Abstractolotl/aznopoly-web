import {COLOR_PRIMARY, COLOR_PRIMARY_2, FONT_STYLE_HEADLINE} from "../style";

import TilingBackground from "../ui/tiling-background";
import { AzNopolyButton } from "../ui/button";
import PlayerList from "../ui/player-list";
import { HEIGHT, WIDTH } from "../main";
import { BaseScene } from "./base/base-scene";
import LobbySceneController from "./lobby-scene-controller";
import AzNopolyBar from "@/ui/bar.ts";

export default class LobbyScene extends BaseScene<LobbySceneController> {

    private playerList!: PlayerList;

    preload() {
        PlayerList.preload(this);
        this.load.image('host_crown', 'assets/crown.png');
        this.load.image('lobby_bg', 'assets/lobby_background2.png');
        this.load.image('backdrop', 'assets/cloud.png')
    }

    init() {
        this.controller = new LobbySceneController(this, this.aznopoly);
    }

    create() {
        this.add.existing(new TilingBackground(this, 'lobby_bg', new Phaser.Math.Vector2(2, 1), 35, 1.75));
        //this.add.image(0, 0, 'backdrop').setOrigin(0, 0).setAlpha(0.5, 0.5, 0.5, 0.5)
        //this.add.existing(new AzNopolyBar(this,`Lobby ( ${this.aznopoly.room.id} )`, 50))
        this.add.rectangle(0, 0, WIDTH, 100, COLOR_PRIMARY_2).setOrigin(0,0)
        this.add.text(5, 5, `Lobby ( ${this.aznopoly.room.id} )`, FONT_STYLE_HEADLINE);
        this.playerList = this.add.existing(new PlayerList(this, this.aznopoly.isHost, 100, 150, 500, 350, 40));

        this.initButton();
    }

    private initButton() {
        if (!this.aznopoly.isHost) return;

        const startButton = new AzNopolyButton(this, "Start Game", WIDTH/2 + 300, HEIGHT - 120, 250, 55, this.controller.onStartClick.bind(this.controller));
        this.add.existing(startButton);

        const leaveButton = new AzNopolyButton(this, "Leave", WIDTH/2 - (300 + 250), HEIGHT - 120, 250, 55, this.controller.onLeaveLobbyClick.bind(this.controller))
        this.add.existing(leaveButton);

    }

    public updatePlayerList(player: { uuid: string, name: string, host: boolean }[]) {
        this.playerList.updatePlayerList(player);
    }
    
}