import { FONT_STYLE_BUTTON, FONT_STYLE_HEADLINE } from "../style";
import { makeButton } from "../util";

import GameObjects = Phaser.GameObjects;
import AzNopolyGame from "../game";
import { RoomEvent } from "../room";
import TilingBackground from "../ui/tiling-background";
import { AzNopolyButton } from "../ui/button";
import PlayerList from "../ui/player-list";

export default class LobbyScene extends Phaser.Scene {

    private aznopoly!: AzNopolyGame;

    private background!: TilingBackground;
    private startButton?: AzNopolyButton;
    private playerList!: PlayerList;

    init(data: any) {
        this.aznopoly = data.aznopoly;

        this.playerList = new PlayerList(this, this.aznopoly.isHost, 100, 200, 450);
    }

    preload() {
        this.load.image('host_crown', 'assets/crown.png');
        this.load.image('lobby_bg', 'assets/lobby_background.png');
        PlayerList.preload(this);
    }

    create() {
        this.background = new TilingBackground(this, 'lobby_bg', new Phaser.Math.Vector2(2, 1), 35, 1.75);
        this.add.text(0, 0, `Lobby ( ${this.aznopoly.room.id} )`, FONT_STYLE_HEADLINE);
        this.playerList.create();

        this.updatePlayerList();
        this.initButton();

        this.aznopoly.room.addEventListener(RoomEvent.JOIN, this.onPlayerJoin.bind(this) as EventListener);
        this.aznopoly.room.addEventListener(RoomEvent.LEAVE, this.onPlayerLeave.bind(this) as EventListener);
        this.aznopoly.room.addEventListener(RoomEvent.UPDATE, this.onPlayerUpdate.bind(this) as EventListener);
    }

    update(time: number, delta: number): void {
        this.background.update(time, delta);
        if (this.startButton) {
            this.startButton.update(time, delta);
        }
    }

    private initButton() {
        if (!this.aznopoly.isHost) return;

        console.log("I AM HOST!")
        this.startButton = new AzNopolyButton(this, "Start Game", 1000, 600, () => {
            this.scene.start('game', { aznopoly: this.aznopoly });
        });
    }

    private updatePlayerList() {
        const arr = Array.from(this.aznopoly.room.connectedPlayers.entries());
        console.log(arr);
        const connectedNames = arr.map(([uuid, {name}]) => ({name, host: this.aznopoly.isPlayerHost(uuid)}));
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