import { FONT_STYLE_HEADLINE } from "../style";

import { RoomEvent } from "../room";
import TilingBackground from "../ui/tiling-background";
import { AzNopolyButton } from "../ui/button";
import PlayerList from "../ui/player-list";
import { SceneChangePacket, PacketType } from "../types/client";
import { HEIGHT, WIDTH } from "../main";
import { BaseScene } from "./base-scene";

export default class LobbyScene extends BaseScene {

    private playerList!: PlayerList;

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

    private initButton() {
        // this.add.existing(new AzNopolyButton(this, "Exit", WIDTH - 400, HEIGHT - 120, () => {
        //     this.scene.stop('lobby');
        // }));
        if (!this.aznopoly.isHost) return;

        this.add.existing(new AzNopolyButton(this, "Start Game", WIDTH - 200, HEIGHT - 120, () => {
            this.startGameScene();
        }));
    }

    private addRoomEventListener() {
        const listener: [string, EventListener][] = [
            [RoomEvent.JOIN, this.onPlayerJoin.bind(this) as EventListener],
            [RoomEvent.LEAVE, this.onPlayerLeave.bind(this) as EventListener],
            [RoomEvent.UPDATE, this.onPlayerUpdate.bind(this) as EventListener]
        ]
        listener.forEach(([event, listener]) => {
            this.aznopoly.room.addEventListener(event, listener);
        });
        this.events.once('shutdown', () => {
            listener.forEach(([event, listener]) => {
                this.aznopoly.room.removeEventListener(event, listener);
            });
        });
    }

    private startGameScene() {
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