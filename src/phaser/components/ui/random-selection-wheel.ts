import { COLOR_PRIMARY, COLOR_PRIMARY_2, FONT_STYLE_BODY } from "../../../style";

const SPIN_TIME = 2000;
const NUM_CHOICE_CHANGES = 50;
const FADE_IN_TIME = 100;
const PADDING = 10;
export default class RandomSelectionWheel extends Phaser.GameObjects.Container {

    private choiceIndex!: number;

    private titleText!: Phaser.GameObjects.Text;
    private choiceTexts: Phaser.GameObjects.Text[] = [];
    private graphics: Phaser.GameObjects.Graphics;

    private spinTimer: number = 0;
    private choiceChangeTimer: number = 0;
    private indexSpinOffset: number = 0;

    private fadeInTimer: number = 0;
    private startPos!: Phaser.Math.Vector2;

    private heightPerChoice: number;
    private fadeinCallback?: () => void;
    private selectionCallback?: () => void;

    constructor(scene: Phaser.Scene, x: number, y: number, bounds = {width: 300, height: 200}) {
        super(scene, x, y);
        this.startPos = new Phaser.Math.Vector2(x, y);

        this.width = bounds.width;
        this.heightPerChoice = bounds.height;

        this.graphics = new Phaser.GameObjects.Graphics(scene);

        this.titleText = new Phaser.GameObjects.Text(scene, this.width*0.5, -PADDING - 45, "MINIGAMES", FONT_STYLE_BODY);
        this.titleText.setOrigin(0.5, 0);

        this.add(this.graphics);
        this.choiceTexts.forEach(text => this.add(text));
        this.add(this.titleText);

        this.setVisible(false);
    }

    private redrawUi() {
        this.graphics.clear();
        this.graphics.fillStyle(COLOR_PRIMARY_2);
        this.graphics.fillRect(-PADDING, -PADDING - 50, this.width + PADDING * 2, this.height + PADDING * 2 + 50);
        
        this.graphics.fillStyle(COLOR_PRIMARY);
        this.graphics.fillRect(-PADDING + 5, -PADDING - 50 + 5, this.width + PADDING * 2 - 10, 45);
    }

    public startSpin(fakeChoices: string[], choice: string) : Promise<void> {
        this.height = this.heightPerChoice * (fakeChoices.length + 1);
        this.setPosition(this.startPos.x - this.width / 2, this.startPos.y - this.height / 2);
        this.redrawUi();

        this.choiceTexts.forEach(text => this.remove(text, true));
        
        const choices = [...fakeChoices, choice].sort(() => Math.random() - 0.5);
        this.choiceIndex = choices.indexOf(choice);
        

        this.choiceTexts = choices.map((choice, i) => {
            const text = this.scene.add.text(0, 0, choice, FONT_STYLE_BODY);
            text.x = this.width / 2;
            text.y = i * this.heightPerChoice;
            text.setOrigin(0.5, 0);
            return text;
        });
        this.choiceTexts.forEach(text => this.add(text));

        this.fadeIn().then(() => {
            this.spinTimer = SPIN_TIME;
            this.choiceChangeTimer = 0;
            this.indexSpinOffset = (this.choiceIndex - NUM_CHOICE_CHANGES + 1) % this.choiceTexts.length;
        })

        return new Promise(resolve => {
            this.selectionCallback = resolve;
        });
    }

    private setChoiceSelected(index: number) {
        this.choiceTexts.forEach((text, i) => {
            text.setStyle(FONT_STYLE_BODY);
            if(i === index) {
                text.setStyle({color: '#dddddd'});
            }
        });
    }

    preUpdate(time: number, delta: number) {
        this.fadeInUpdate(delta);
        this.spinUpdate(delta);
    }

    private fadeInUpdate(delta: number) {
        if(this.fadeInTimer <= 0) {
            return;
        }
        this.fadeInTimer -= delta;

        const progress = 1 - this.fadeInTimer / FADE_IN_TIME;
        this.alpha = progress * 0.5 + 0.5;
        this.scale = progress * 0.5 + 0.5;
        this.setPosition(this.startPos.x - this.width * 0.5 * this.scale, this.startPos.y - this.height * 0.5 * this.scale);

        if (this.fadeInTimer <= 0) {
            this.fadeinCallback?.();
        }
    }
    
    private spinUpdate(delta: number) {
        if(this.spinTimer <= 0) {
            return;
        }
        this.spinTimer -= delta;

        if (this.choiceChangeTimer > 0) {
            this.choiceChangeTimer -= delta;
            return;
        }

        const timeSpun = SPIN_TIME - this.spinTimer;
        const timePerSpin = SPIN_TIME / NUM_CHOICE_CHANGES;
        const index = Math.floor(this.interpolateSpin(timeSpun / timePerSpin)  + this.indexSpinOffset) % this.choiceTexts.length;
        this.setChoiceSelected(index);

        if(this.spinTimer <= 0) {
            this.selectionCallback?.();
        }
    }

    public fadeIn() : Promise<void> {
        this.fadeInTimer = FADE_IN_TIME;
        this.alpha = 0.0;
        this.scale = 0.5;
        this.setPosition(this.startPos.x - this.width * 0.5 * this.scale, this.startPos.y - this.height * 0.5 * this.scale);

        return new Promise(resolve => {
            this.fadeinCallback = resolve;
        });
    }

    private interpolateSpin(t: number) {
        return Math.sin(t / NUM_CHOICE_CHANGES * Math.PI * 0.5) * NUM_CHOICE_CHANGES;
    }


}