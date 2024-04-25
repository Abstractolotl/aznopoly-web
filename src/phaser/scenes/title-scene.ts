import AzNopolyGame from "../../game.ts";
import { AzNopolyButton } from "../components/ui/button.ts";
import { FONT_STYLE_COPYRIGHT_FLAVOUR_TEXT, FONT_STYLE_TITLE_TEXT } from "../../style.ts";
import TitleSceneController from "./title-scene-controller.ts";
import { BaseScene } from "@/phaser/scenes/base/base-scene.ts";
import * as pjson from "@/../package.json"
import AzNopolyInput from "@/phaser/components/ui/input-field.ts";
import { SETTINGS } from "@/settings.ts";
import TitlePanel from "../components/ui/title/title-panel.ts";

type Audio = Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound

export default class TitleScene extends BaseScene<TitleSceneController> {

    preload() {
        AzNopolyInput.preload(this);
        TitlePanel.preload(this);

        this.load.image('music-on', 'assets/music_on.png');
        this.load.image('music-off', 'assets/music_off.png');
        this.load.html('input_mask', 'assets/title_screen.html');

        this.load.image('title-bg', 'assets/title/title_bg.png');
        for (let i = 1; i <= 5; i++) {
            this.load.spritesheet('title-face-'+i, 'assets/title/title_'+i+'.png', {
                frameWidth: 800 / 8,
                frameHeight: 113
            });
        }
        this.load.audio('title-bgm', 'assets/audio/title_bgm.mp3');
        this.load.audio('game-start', 'assets/audio/game_start.mp3');

        AzNopolyButton.preload(this);
    }

    private bgm!: Audio;
    private audioStart!: Audio;
    private btnMusic!: Phaser.GameObjects.Image;

    private title!: Phaser.GameObjects.Image;
    private titleLetters: Phaser.GameObjects.Image[] = [];
    private background!: Phaser.GameObjects.Image;

    constructor(aznopoly: AzNopolyGame) {
        super(aznopoly);
    }

    init() {
        this.controller = new TitleSceneController(this, this.aznopoly);
    }

    create() {
        const copyrightText = "© 2024 AzNopoly - (build " + ((pjson || {}) as any).buildNumber + ")";


        this.background = this.add.image(SETTINGS.DISPLAY_WIDTH * 0.5, SETTINGS.DISPLAY_HEIGHT * 0.5, 'title-bg');
        this.background.setScale(SETTINGS.DISPLAY_WIDTH / this.background.width);
        this.background.setOrigin(0.5, 0.5);

        this.title = new Phaser.GameObjects.Image(this, SETTINGS.DISPLAY_WIDTH / 2, 150, 'title-face-1');
        this.title.setOrigin(0.5, 0);

        const offsets = [0, 15, 5, 10, 10, 5, 40, 40];
        let offset = 0;
        for(let i = 0; i < "AzNopoly".length; i++) {
            offset += offsets[i];
            const letter = this.add.image(SETTINGS.DISPLAY_WIDTH / 2 + i * 100 - 280 - offset, 200, "title-face-1", i);
            letter.setOrigin(0.5, 0.75);
            this.titleLetters.push(letter);
        }


        this.bgm = this.game.sound.add('title-bgm', { loop: true });
        this.bgm.volume = 0.25;
        this.bgm.play();

        this.audioStart = this.game.sound.add('game-start');

        this.initButtons();
        this.add.text(SETTINGS.DISPLAY_WIDTH / 2, SETTINGS.DISPLAY_HEIGHT - 20, copyrightText, FONT_STYLE_COPYRIGHT_FLAVOUR_TEXT).setOrigin(0.5, 0.5);
        
        
        for(let i = 0; i < "AzNopoly".length; i++) {
            setTimeout(() => {
                this.waveLetter(this.titleLetters[i]);
            }, i * 150);
        }
        setInterval(() => {
            for(let i = 0; i < "AzNopoly".length; i++) {
                setTimeout(() => {
                    this.waveLetter(this.titleLetters[i]);
                }, i * 150);
            }
        }, 3000);
    }

    update(time: number, delta: number): void {
        const i = Math.floor((time % 500) / 100);
        this.titleLetters.forEach((letter, index) => {
            letter.setTexture('title-face-' + (i + 1), index);
        });
    }

    private waveLetter(letter: Phaser.GameObjects.Image, back: boolean = false) {
        //anticipation
        this.tweens.addCounter({
            from: back ? 1 : 0,
            to: back ? 0 : 1,
            duration: 250,
            ease: 'Sine.easeInOut',
            onUpdate: (tween) => {
                letter.setScale(1 + tween.getValue() * 0.5, 1 - tween.getValue() * 0.5);
            },
            onComplete: () => {
                if (back) {
                    return;
                }
                setTimeout(() => {
                    this.jumpLetter(letter, back);
                }, 150);
            }
        })
    }

    private jumpLetter(letter: Phaser.GameObjects.Image, back: boolean = false) {
        const startY = letter.y;
        const endY = startY - 100;
        this.tweens.addCounter({
            from: letter.scaleX,
            to: 1,
            duration: 250,
            ease: 'Back.easeOut',
            onUpdate: (tween) => {
                letter.setScale(tween.getValue(), 1);
            }
        })

        this.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 250,
            ease: 'Quad',
            yoyo: true,
            onUpdate: (tween) => {
                letter.y = (endY - startY) * tween.getValue() + startY;
            },
            onComplete: () => {
                this.waveLetter(letter, !back);
            }
        })
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
    }

    public startMusic() {
        this.bgm.resume();
        this.btnMusic.setTexture('music-on');
    }

    public playStartSound() {
        this.audioStart.play();
    }

}