import AzNopolyGame from "../../game.ts";
import { AzNopolyButton } from "../components/ui/button.ts";
import {FONT_STYLE_COPYRIGHT_FLAVOUR_TEXT, FONT_STYLE_TITLE_TEXT} from "../../style.ts";
import TitleSceneController from "./title-scene-controller.ts";
import { BaseScene } from "@/phaser/scenes/base/base-scene.ts";
import * as pjson from "@/../package.json"
import AzNopolyInput from "@/phaser/components/ui/input-field.ts";
import { SETTINGS } from "@/settings.ts";
import AzNopolyPanel from "../components/ui/panel.ts";
import TitlePanel from "../components/ui/title/title-panel.ts";
import Board3D from "./board/board-3d.ts";
import AzPhaserGame from "@/main.ts";

type Audio = Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound

export default class TitleScene extends BaseScene<TitleSceneController> {
    
    preload() {
        AzNopolyInput.preload(this);
        TitlePanel.preload(this);

        this.load.image('abstracto', 'assets/background_clouds.png');
        this.load.image('music-on', 'assets/music_on.png');
        this.load.image('music-off', 'assets/music_off.png');
        this.load.html('input_mask', 'assets/title_screen.html');

        this.load.audio('title-bgm', 'assets/audio/title_bgm.mp3');
        this.load.audio('game-start', 'assets/audio/game_start.mp3');

        AzNopolyButton.preload(this);
    }

    private bgm!: Audio;
    private audioStart!: Audio;
    private btnMusic!: Phaser.GameObjects.Image;

    private lobbyInputField!: AzNopolyInput;
    
    constructor(aznopoly: AzNopolyGame) {
        super(aznopoly);
    }

    init() {
        this.controller = new TitleSceneController(this, this.aznopoly);
    }

    create() {
        const copyrightText = "© 2024 AzNopoly - (build " + ((pjson || {}) as any).buildNumber + ")";

        const background = this.add.image(0, 0, 'abstracto');
        background.setScale(SETTINGS.DISPLAY_WIDTH / background.width);
        background.setOrigin(0, 0);

        this.bgm = this.game.sound.add('title-bgm', { loop: true });
        this.bgm.volume = 0.25;
        this.bgm.play();

        this.audioStart = this.game.sound.add('game-start');

        this.initButtons();
        this.add.text(SETTINGS.DISPLAY_WIDTH/2,SETTINGS.DISPLAY_HEIGHT - 20, copyrightText, FONT_STYLE_COPYRIGHT_FLAVOUR_TEXT).setOrigin(0.5, 0.5)
     }

    private initButtons() {
        const panel = new TitlePanel(this);

        panel.setOnJoin(this.controller.onJoinRoomClick.bind(this.controller));
        panel.setOnCreate(this.controller.onCreateRoom.bind(this.controller));

        this.add.existing(panel);

        // const centerX = SETTINGS.DISPLAY_WIDTH / 2;
        // const centerY = SETTINGS.DISPLAY_HEIGHT / 2;

        // const widthInputField = 300;
        // const widthJoinButton = 100;
        // const widthCreateButton = widthInputField + widthJoinButton;

        // const heightInputField = 55;
        // const heightJoinButton = 55;
        // const heightCreateButton = 55;

        // this.lobbyInputField = this.add.existing(
        //     new AzNopolyInput(this, centerX - (widthInputField+widthJoinButton) / 2, centerY, widthInputField, heightInputField));
        // this.add.existing(new AzNopolyButton(this, 'Join', centerX + ((widthInputField/2) - (widthJoinButton/2)), centerY, widthJoinButton,
        //     heightJoinButton, false, this.controller.onJoinRoomClick.bind(this.controller)));
        // this.add.existing(new AzNopolyButton(this, 'Create Lobby',centerX - widthCreateButton / 2, centerY + 75, widthCreateButton,
        //     heightCreateButton, false, this.controller.onCreateRoom.bind(this.controller)));


        // const graphics = this.add.graphics();
        // graphics.lineStyle(2, 0x000000, 1);
        // graphics.strokeCircle(SETTINGS.DISPLAY_WIDTH - 50, 50, 20);
        this.btnMusic = this.add.image(SETTINGS.DISPLAY_WIDTH - 50, 50, 'music-on');
        // this.btnMusic.setInteractive();
        // this.btnMusic.on('pointerdown', this.controller.onMusicButtonClicked.bind(this.controller));
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

}