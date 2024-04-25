import { SETTINGS } from "@/settings";
import AzNopolyPanel from "../panel";
import { FONT_STYLE_EYECATCHER } from "@/style";
import { AzNopolyButton } from "../button";
import AzNopolyInput from "../input-field";

const WIDTH = 650;
const HEIGHT = 300;
export default class TitlePanel extends Phaser.GameObjects.Container {

    static preload(scene: Phaser.Scene) {
        scene.load.image('icon_group', 'assets/icons/icon_group.svg');
        scene.load.image("icon_crown", "assets/icons/icon_crown.png");
    }

    private onJoin?: (code: string) => void;
    private onCreate?: () => void;

    private leftPanel!: AzNopolyPanel;
    private rightPanel!: AzNopolyPanel;

    constructor(scene: Phaser.Scene) {
        super(scene, (SETTINGS.DISPLAY_WIDTH - WIDTH) * 0.5, (SETTINGS.DISPLAY_HEIGHT - HEIGHT) * 0.5 + 75);
        this.setSize(WIDTH, HEIGHT);
        this.initLeft();
        this.initRight();

        this.leftPanel.setForceHover(true);
    }

    public setOnJoin(onJoin: (code: string) => void) {
        this.onJoin = (code) => {
            this.outro();
            onJoin(code);
        };
    }

    public setOnCreate(onCreate: () => void) {
        this.onCreate = () => {
            this.outro();
            onCreate();
        }
    }

    private outro() {
        const leftStartX = this.leftPanel.x;
        const leftEndX = -this.width * 0.5 - this.x;
        const rightStartX = this.rightPanel.x;
        const rightEndX = this.width * 0.5 + this.x + this.width;
        
        setTimeout(() => {
            this.scene.tweens.addCounter({
                from: 0,
                to: 1,
                duration: 350,
                ease: 'Back.easeIn',
                onUpdate: (tween) => {
                    const scale = Math.max(0, -tween.getValue()) * 4;

                    this.leftPanel.setScale(1 - scale, 1 + scale);
                    this.leftPanel.x = (leftEndX - leftStartX) * tween.getValue() + leftStartX;
                    this.rightPanel.setScale(1 - scale, 1 + scale);
                    this.rightPanel.x = (rightEndX - rightStartX) * tween.getValue() + rightStartX;
                }
            })
        }, 0)
    }

    private initLeft() {
        const bounds = new Phaser.Geom.Rectangle(-25, 0, this.width * 0.5, this.height);
        this.leftPanel = new AzNopolyPanel(this.scene, bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5, bounds.width, bounds.height, {
            alive: true,
            origin: new Phaser.Math.Vector2(bounds.width * 0.5, bounds.height * 0.5),
        });
        this.add(this.leftPanel);

        const headline = new Phaser.GameObjects.Text(this.scene, bounds.x, bounds.y, "Create your own\nLobby", FONT_STYLE_EYECATCHER);
        headline.setPosition(-headline.width * 0.5, 20 - bounds.height * 0.5);
        this.leftPanel.add(headline);

        const icon = new Phaser.GameObjects.Image(this.scene, 0, 0, 'icon_crown');
        icon.setOrigin(0.5, 0.5);
        this.leftPanel.add(icon);

        const button = new AzNopolyButton(this.scene, "CREATE",  0, bounds.height * 0.5 - 50);
        button.setOnClick(() => this.onCreate?.());
        this.leftPanel.add(button);
    }

    preUpdate(time: number, delta: number) {
        this.leftPanel.preUpdate(time, delta);
        this.rightPanel.preUpdate(time, delta);
    }


    private initRight() {
        const bounds = new Phaser.Geom.Rectangle( this.width * 0.5 + 25, 0, this.width * 0.5, this.height);
        this.rightPanel = new AzNopolyPanel(this.scene, bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.5, bounds.width, bounds.height, {
            alive: true,
            origin: new Phaser.Math.Vector2(bounds.width * 0.5, bounds.height * 0.5),
        });
        this.add(this.rightPanel);

        const headline = new Phaser.GameObjects.Text(this.scene, bounds.x, bounds.y, "Join your friends!", FONT_STYLE_EYECATCHER);
        headline.setPosition(-headline.width * 0.5, 35 - bounds.height * 0.5);
        this.rightPanel.add(headline);

        const icon = new Phaser.GameObjects.Image(this.scene, 0, 0, 'icon_group');
        icon.setOrigin(0.5, 0.5);
        this.rightPanel.add(icon);


        const input = new AzNopolyInput(this.scene, 50 - bounds.width * 0.5, bounds.height * 0.5 - 50, bounds.width * 0.5, 40, "code");
        input.setPosition(input.x, input.y - input.height * 0.5);
        this.rightPanel.add(input);

        const button = new AzNopolyButton(this.scene, "JOIN", bounds.width * 0.25, bounds.height * 0.5 - 50);
        button.setOnClick(() => {
            if (input.getValue().length === 6) {
                this.onJoin?.(input.getValue());
            }
        });
        this.rightPanel.add(button);
    }

}