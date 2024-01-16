import AzNopolyGame from "../game";
import { WIDTH } from "../main";
import { RoomEvent } from "../room";
import { AzNopolyButton } from "../ui/button";
import { BaseScene } from "./base-scene";

type Audio = Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound

export default class TitleScene extends BaseScene {

    private bgm!: Audio;
    private audioStart!: Audio;
    private btnMusic!: Phaser.GameObjects.Image;
    
    private domContainer!: Phaser.GameObjects.DOMElement;
    private domNameInput!: HTMLInputElement;
    private domLobbyCodeInput!: HTMLInputElement;
    
    preload() {
        this.load.image('abstracto', 'assets/title.png');
        this.load.image('music-on', 'assets/music_on.png');
        this.load.image('music-off', 'assets/music_off.png');
        this.load.html('input_mask', 'assets/title_screen.html');

        this.load.audio('title-bgm', 'assets/title_bgm.mp3');
        this.load.audio('game-start', 'assets/game_start.mp3');

        AzNopolyButton.preload(this);
    }

    create() {
        const background = this.add.image(0, 0, 'abstracto');
        const targetScale = WIDTH / background.width;
        background.setScale(targetScale);
        background.setOrigin(0, 0);

        this.domContainer = this.add.dom(320, 300);
        this.domContainer.createFromCache('input_mask');
        this.domLobbyCodeInput = this.domContainer.getChildByID('title-lobby-code-input') as HTMLInputElement;     
        this.domNameInput = this.domContainer.getChildByID('title-name-input') as HTMLInputElement;        
        this.domNameInput.value = 'test';

        console.log(this.add)
        this.bgm = this.game.sound.add('title-bgm', { loop: true });
        this.bgm.play();
        this.bgm.volume = 0.25;

        this.audioStart = this.game.sound.add('game-start');
        this.initButtons();

        //setTimeout(() => { this.joinRoom("debugg", "Michael" + ("" + Math.random()).substring(2,4)) }, 1000)
    }

    destroy() {
        console.log('destroying title scene');
    }

    private initButtons() {
        const centerX = WIDTH / 2;
        this.add.existing(new AzNopolyButton(this, 'Join Lobby', centerX - 250, 600, this.onJoinRoomClick.bind(this)));
        this.add.existing(new AzNopolyButton(this, 'Create Lobby', centerX + 250, 600, this.onCreateRoom.bind(this)));

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
        const name = this.domNameInput.value;
        const room = this.domLobbyCodeInput.value;
        this.joinRoom(room, name);
    }

    private onCreateRoom() {
        const name = this.domNameInput.value;
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