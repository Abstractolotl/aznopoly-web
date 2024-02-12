import AzNopolyGame from "../game";
import { WIDTH } from "../main";
import { AzNopolyButton } from "../ui/button";
import { BaseScene } from "./base/base-scene";
import TitleSceneController from "./title-scene-controller";

type Audio = Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound

export default class TitleScene extends BaseScene<TitleSceneController> {

    private bgm!: Audio;
    private audioStart!: Audio;
    private btnMusic!: Phaser.GameObjects.Image;
    
    private domContainer!: Phaser.GameObjects.DOMElement;
    private domNameInput!: HTMLInputElement;
    private domLobbyCodeInput!: HTMLInputElement;

    constructor(aznopoly: AzNopolyGame) {
        super(aznopoly);
    }
    
    preload() {
        this.load.image('abstracto', 'assets/title.png');
        this.load.image('music-on', 'assets/music_on.png');
        this.load.image('music-off', 'assets/music_off.png');
        this.load.html('input_mask', 'assets/title_screen.html');

        this.load.audio('title-bgm', 'assets/title_bgm.mp3');
        this.load.audio('game-start', 'assets/game_start.mp3');

        AzNopolyButton.preload(this);
    }

    init() {
        console.log("TitleScene init", this.aznopoly)
        this.controller = new TitleSceneController(this, this.aznopoly);
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

        this.bgm = this.game.sound.add('title-bgm', { loop: true });
        this.bgm.play();
        this.bgm.volume = 0.25;

        this.audioStart = this.game.sound.add('game-start');
        this.initButtons();
    }

    private initButtons() {
        const centerX = WIDTH / 2;
        this.add.existing(new AzNopolyButton(this, 'Join Lobby', centerX - 250, 600, this.controller.onJoinRoomClick.bind(this.controller)));
        this.add.existing(new AzNopolyButton(this, 'Create Lobby', centerX + 250, 600, this.controller.onCreateRoom.bind(this.controller)));

        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x000000, 1);
        graphics.strokeCircle(WIDTH - 50, 50, 20);
        this.btnMusic = this.add.image(WIDTH - 50, 50, 'music-on');
        this.btnMusic.setInteractive();
        this.btnMusic.on('pointerdown', this.controller.onMusicButtonClicked.bind(this.controller));
    }
    
    public stopMusic() {
        this.bgm.pause();
        this.btnMusic.setTexture('music-off');
    }

    public startMusic() {
        this.bgm.resume();
        this.btnMusic.setTexture('music-on');
    }

    public playStartSound() {
        this.audioStart.play();
    }

    public getInputtedLobbyCode(): string {
        return this.domLobbyCodeInput.value;
    }

}