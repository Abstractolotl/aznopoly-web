import { FONT_STYLE_BUTTON, FONT_STYLE_HEADLINE } from "../style";
import { makeButton } from "../util";

import GameObjects = Phaser.GameObjects;
import AzNopolyGame from "../game";
import { RoomEvent } from "../room";
import TilingBackground from "../ui/tiling-background";
import { AzNopolyButton } from "../ui/button";
import PlayerList from "../ui/player-list";
import { SceneChangePacket, PacketType } from "../types/client";
import { HEIGHT, WIDTH } from "../main";
import { BaseScene } from "./base-scene";

export default class LobbyScene extends BaseScene {

    private playerList!: PlayerList;

    private registeredEventListener: [string, EventListener][] = [];

    preload() {
        PlayerList.preload(this);
        this.load.image('host_crown', 'assets/crown.png');
        this.load.image('lobby_bg', 'assets/lobby_background.png');
    }

    create() {
        this.add.existing(new TilingBackground(this, 'lobby_bg', new Phaser.Math.Vector2(2, 1), 35, 1.75));
        this.add.text(0, 0, `Lobby ( ${this.aznopoly.room.id} )`, FONT_STYLE_HEADLINE);
        this.playerList = this.add.existing(new PlayerList(this, this.aznopoly.isHost, 100, 200, 450));

        this.updatePlayerList();
        this.initButton();

        this.addRoomEventListener();
    }

    private addRoomEventListener() {
        this.registeredEventListener.push([RoomEvent.JOIN, this.onPlayerJoin.bind(this) as EventListener]);
        this.registeredEventListener.push([RoomEvent.LEAVE, this.onPlayerLeave.bind(this) as EventListener]);
        this.registeredEventListener.push([RoomEvent.UPDATE, this.onPlayerUpdate.bind(this) as EventListener]);
        
        this.registeredEventListener.forEach(([event, listener]) => {
            this.aznopoly.room.addEventListener(event, listener);
        });

        const onChangeScene = this.onChangeScene.bind(this) as EventListener;
        this.registeredEventListener.push([PacketType.SCENE_CHANGE, onChangeScene])
        this.aznopoly.client.addEventListener(PacketType.SCENE_CHANGE, onChangeScene);
    }

    private removeRoomEventListener() {
        this.registeredEventListener.forEach(([event, listener]) => {
            this.aznopoly.room.removeEventListener(event, listener);
            this.aznopoly.client.removeEventListener(event, listener);
        });
    }

    private initButton() {
        // this.add.existing(new AzNopolyButton(this, "Exit", WIDTH - 400, HEIGHT - 120, () => {
        //     this.scene.stop('lobby');
        // }));
        if (!this.aznopoly.isHost) return;

        console.log("I AM HOST!")
        this.add.existing(new AzNopolyButton(this, "Start Game", WIDTH - 200, HEIGHT - 120, () => {
            this.startGameScene();
        }));
    }

    private onChangeScene(event: CustomEvent<SceneChangePacket>) {
        const packet = event.detail;
        if (!this.aznopoly.isPlayerHost(packet.sender)) return;

        if (packet.data.scene === "GAME") {
            this.startGameScene();
        } else {
            console.error(`Invalid scene: ${packet.data.scene}`);
        }
    }

    private startGameScene() {
        this.removeRoomEventListener();
        this.scene.start('game', { aznopoly: this.aznopoly });
    }

    private updatePlayerList() {
        const arr = this.aznopoly.room.connectedPlayerIds;
        const connectedNames = arr.map(uuid => ({ name: this.aznopoly.room.getPlayerName(uuid), host: this.aznopoly.isPlayerHost(uuid) }))
        this.playerList.updatePlayerList(connectedNames);
    }

    private onPlayerJoin(event: CustomEvent<string>) {
        this.updatePlayerList();
    }

    private onPlayerLeave(event: CustomEvent<string>) {
        this.updatePlayerList();
    }

    private onPlayerUpdate() {
        this.updatePlayerList();
    }

}