import AzNopolyGame from "../game";
import {HEIGHT, WIDTH} from "../main";
import { RoomEvent } from "../room";
import { AzNopolyButton } from "../ui/button";
import { BaseScene } from "./base-scene";
import {FONT_STYLE_COPYRIGHT_FLAVOUR_TEXT, FONT_STYLE_TITLE_TEXT} from "../style.ts";
import {AzNopolyInput} from "../ui/input.ts";
import Rectangle = Phaser.GameObjects.Rectangle;

type Audio = Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound

export default class TitleScene extends BaseScene {

    private bgm!: Audio;
    private audioStart!: Audio;
    private btnMusic!: Phaser.GameObjects.Image;
    
    private domContainer!: Phaser.GameObjects.DOMElement;
    private domNameInput!: HTMLInputElement;
    private domLobbyCodeInput!: HTMLInputElement;
    
    preload() {
        this.load.image('abstracto', 'assets/background_clouds.png');
        this.load.image('music-on', 'assets/music_on.png');
        this.load.image('music-off', 'assets/music_off.png');
        this.load.html('input_mask', 'assets/title_screen.html');

        this.load.audio('title-bgm', 'assets/title_bgm.mp3');
        this.load.audio('game-start', 'assets/game_start.mp3');

        AzNopolyButton.preload(this);
    }

    create() {
        const titleText = " AzNopoly "
        const copyrightText = "© 2024 AzNopoly - v.0.0.dev-preAlpha";
        const background = this.add.image(0, 0, 'abstracto');
        const targetScale = WIDTH / background.width;
        background.setScale(targetScale);
        background.setOrigin(0, 0);

        this.domContainer = this.add.dom(WIDTH / 2 - 20, HEIGHT / 2 + 43);
        this.domContainer.createFromCache('input_mask');
        this.domLobbyCodeInput = this.domContainer.getChildByID('title-lobby-code-input') as HTMLInputElement;
        this.domLobbyCodeInput.style.width = "240px";
        this.add.rectangle(WIDTH / 2 - 65, HEIGHT / 2 + 41, 250, 66, 0xffffff, 1).setOrigin(0.5, 0.5)
        //this.domNameInput = this.domContainer.getChildByID('title-name-input') as HTMLInputElement;
        //this.domNameInput.value = 'test';

        console.log(this.add)

        this.bgm = this.game.sound.add('title-bgm', { loop: true });
        this.bgm.play();
        this.bgm.volume = 0.25;
        this.audioStart = this.game.sound.add('game-start');

        this.initButtons();
        this.add.text(WIDTH/2,HEIGHT - 20, copyrightText, FONT_STYLE_COPYRIGHT_FLAVOUR_TEXT).setOrigin(0.5, 0.5)
        this.add.text(WIDTH/2, HEIGHT/4, titleText, FONT_STYLE_TITLE_TEXT).setOrigin(0.5, 0.5)

        //this.add.text(WIDTH/2 /*- this.copyrightText.length/2*/, 50, "this.copyrightText");

        //setTimeout(() => { this.joinRoom("debugg", "Michael" + ("" + Math.random()).substring(2,4)) }, 1000)
    }

    destroy() {
        console.log('destroying title scene');
    }

    private initButtons() {
        const centerX = WIDTH / 2;
        const centerY = HEIGHT / 2;

        this.add.existing(new AzNopolyButton(this, 'Join',
            centerX + 125, centerY + 41, 0, 0, this.onJoinRoomClick.bind(this)));
        this.add.existing(new AzNopolyButton(this, 'Create Lobby',
            centerX, centerY + 125, 50, 0, this.onCreateRoom.bind(this)));

        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x000000, 1);
        graphics.strokeCircle(WIDTH - 50, 50, 20);
        this.btnMusic = this.add.image(WIDTH - 50, 50, 'music-on');
        this.btnMusic.setInteractive();
        this.btnMusic.on('pointerdown', this.onMusicClick.bind(this));
    }

    private generateRoomName(length: number = 6) : string {
        let roomName = "";
        let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            roomName += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return roomName;
    }

    private onMusicClick() {
        const texture = this.bgm.isPlaying ? 'music-off' : 'music-on';
        this.btnMusic.setTexture(texture);
        if (this.bgm.isPlaying) {
            this.bgm.pause();
        } else {
            this.bgm.resume();
        }
    }

    private onJoinRoomClick() {
        const name = "";//this.domNameInput.value;
        const room = this.domLobbyCodeInput.value;
        this.joinRoom(room, name);
    }

    private onCreateRoom() {
        const name = "";//this.domNameInput.value;
        const room = this.generateRoomName();
        this.joinRoom(room, name);
    }

    private joinRoom(room: string, name: string) {
        setTimeout(() => {
            this.audioStart.play();
        }, 100)

        setTimeout(() => {
            this.aznopoly.init(room);
            this.aznopoly.room.addEventListener(RoomEvent.READY, () => {
                this.scene.start('lobby');
            }, { once: true });
            this.bgm.stop();
        }, 500)
    }
}