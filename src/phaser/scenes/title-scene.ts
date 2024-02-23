import AzNopolyGame from "../../game.ts";
import { AzNopolyButton } from "../components/ui/button.ts";
import {FONT_STYLE_COPYRIGHT_FLAVOUR_TEXT, FONT_STYLE_TITLE_TEXT} from "../../style.ts";
import TitleSceneController from "./title-scene-controller.ts";
import { BaseScene } from "@/phaser/scenes/base/base-scene.ts";
import * as pjson from "@/../package.json"
import AzNopolyInput from "@/phaser/components/ui/input-field.ts";
import { SETTINGS } from "@/settings.ts";

type Audio = Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound

export default class TitleScene extends BaseScene<TitleSceneController> {

    private bgm!: Audio;
    private audioStart!: Audio;
    private btnMusic!: Phaser.GameObjects.Image;

    private lobbyInputField!: AzNopolyInput;
    
    constructor(aznopoly: AzNopolyGame) {
        super(aznopoly);
    }
    
    preload() {
        AzNopolyInput.preload(this);

        this.load.image('abstracto', 'assets/background_clouds.png');
        this.load.image('music-on', 'assets/music_on.png');
        this.load.image('music-off', 'assets/music_off.png');
        this.load.html('input_mask', 'assets/title_screen.html');

        this.load.audio('title-bgm', 'assets/audio/title_bgm.mp3');
        this.load.audio('game-start', 'assets/audio/game_start.mp3');

        AzNopolyButton.preload(this);
    }

    init() {
        this.controller = new TitleSceneController(this, this.aznopoly);
    }

    create() {
        const titleText = " AzNopoly "
        const copyrightText = "© 2024 AzNopoly - (build " + ((pjson || {}) as any).buildNumber + ")";
        const background = this.add.image(0, 0, 'abstracto');
        const targetScale = SETTINGS.DISPLAY_WIDTH / background.width;
        background.setScale(targetScale);
        background.setOrigin(0, 0);

        this.bgm = this.game.sound.add('title-bgm', { loop: true });
        this.bgm.play();
        this.bgm.volume = 0.25;
        this.audioStart = this.game.sound.add('game-start');

        this.initButtons();
        this.add.text(SETTINGS.DISPLAY_WIDTH/2,SETTINGS.DISPLAY_HEIGHT - 20, copyrightText, FONT_STYLE_COPYRIGHT_FLAVOUR_TEXT).setOrigin(0.5, 0.5)
        this.add.text(SETTINGS.DISPLAY_WIDTH/2, SETTINGS.DISPLAY_HEIGHT/4, titleText, FONT_STYLE_TITLE_TEXT).setOrigin(0.5, 0.5)
    }

    private initButtons() {
        const centerX = SETTINGS.DISPLAY_WIDTH / 2;
        const centerY = SETTINGS.DISPLAY_HEIGHT / 2;

        this.lobbyInputField = this.add.existing(new AzNopolyInput(this, centerX - 200, centerY, 300, 55));
        this.add.existing(new AzNopolyButton(this, 'Join',        centerX + 100, centerY, 100, 55, this.controller.onJoinRoomClick.bind(this.controller)));
        this.add.existing(new AzNopolyButton(this, 'Create Lobby',centerX - 200, centerY + 75, 400, 55, this.controller.onCreateRoom.bind(this.controller)));


        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x000000, 1);
        graphics.strokeCircle(SETTINGS.DISPLAY_WIDTH - 50, 50, 20);
        this.btnMusic = this.add.image(SETTINGS.DISPLAY_WIDTH - 50, 50, 'music-on');
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
        return this.lobbyInputField.getValue();
    }

}