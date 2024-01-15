import { Audio } from "../types";

type Position = { x: number, y: number, size: number};
type Callback = (btnIndex: number) => void;

const MIN_CLICK_DURATION = 350;
const LOCK_DURATION = 50;
export class SimonSaysBoard {

    static preload(scene: Phaser.Scene) {
        scene.load.audio('simon-button-sound', 'assets/beep.mp3');
        scene.load.image('simon-tile-lit', 'assets/simon_lit.png');
        scene.load.image('simon-tile-unlit', 'assets/simon_unlit.png');
    }

    private interactive: boolean = false;
    private locked: boolean = false;

    private callback?: Callback;

    private x: number;
    private y: number;
    private size: number;

    private currentClick?: NodeJS.Timeout;

    private soundClick!: Audio;

    private btnUp!: Phaser.GameObjects.Image;
    private btnDown!: Phaser.GameObjects.Image;
    private btnLeft!: Phaser.GameObjects.Image;
    private btnRight!: Phaser.GameObjects.Image;
    
    constructor(private scene: Phaser.Scene, interactive: boolean = false, bounds: Position, callback?: Callback) {
        this.interactive = interactive;
        this.size = bounds.size;
        this.x = bounds.x;
        this.y = bounds.y;
        this.callback = callback;

        this.soundClick = this.scene.sound.add('simon-button-sound');

        this.createBoard();
    }

    public playSequence(sequence: number[], delay: number = 500) : Promise<void> {
        return new Promise((resolve) => {
            let i = 0;
            const interval = setInterval(() => {
                if(i >= sequence.length) {
                    clearInterval(interval);
                    resolve();
                    return;
                }
                this.playButton(sequence[i]);
                i++;
            }, delay);
        });
    }

    public playButton(btnIndex: number) {
        this.soundClick.play();
        const btn = [this.btnUp, this.btnDown, this.btnLeft, this.btnRight][btnIndex];
        btn.setTexture('simon-tile-lit');
        setTimeout(() => {
            btn.setTexture('simon-tile-unlit');
        }, MIN_CLICK_DURATION)
    }

    private createBoard() {
        this.btnUp = this.createButton(this.size * 2 + this.x, this.size * 2 + this.y - this.size, 0xff0000);
        this.btnDown = this.createButton(this.size * 2 + this.x, this.y + this.size * 2 + this.size, 0x00ff00);
        this.btnLeft = this.createButton(this.size * 2 + this.x - this.size, this.size * 2 + this.y, 0x0000ff);
        this.btnRight = this.createButton(this.size * 2 + this.x + this.size, this.size * 2 + this.y, 0xffff00);
    }

    private createButton(x: number, y: number, tint: number = 0xffffff) {
        const btn = this.scene.add.image(x, y, 'simon-tile-unlit');
        btn.setScale(this.size / btn.width);
        if (this.interactive) {
            btn.setInteractive();
            btn.on('pointerdown', () => {
                if(this.locked) return;

                this.soundClick.play();

                btn.setTexture('simon-tile-lit');
                this.callback?.([this.btnUp, this.btnDown, this.btnLeft, this.btnRight].indexOf(btn));
                setTimeout(() => {
                    btn.setTexture('simon-tile-unlit');
                }, MIN_CLICK_DURATION)
                
                this.locked = true;
                this.currentClick = setTimeout(() => {
                    this.locked = false;
                    this.currentClick = undefined;
                }, MIN_CLICK_DURATION + LOCK_DURATION)
            });
        }
        btn.tint = tint;
        return btn;
    }

    public lock() {
        this.locked = true;
        clearTimeout(this.currentClick);
    }

    public unlock() {
        this.locked = false;
    }
}