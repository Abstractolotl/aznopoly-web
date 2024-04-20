import { FONT_STYLE_EYECATCHER } from "@/style";
import AzNopolyPanel from "../panel";
import { AzNopolyButton } from "../button";


const WIDTH = 500;
const HEIGHT = 50;
export default class RoundPanel extends Phaser.GameObjects.Container {

    static preload(scene: Phaser.Scene) {
        scene.load.image("icon-zoom-in", "assets/icons/icon_zoom_in.svg");
        scene.load.image("icon-zoom-out", "assets/icons/icon_zoom_out.svg");
    }
    
    private panel: AzNopolyPanel;
    private title: Phaser.GameObjects.Text;

    private overviewButton: AzNopolyButton;
    private inOverview: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x - WIDTH * 0.5, y);
        this.setSize(WIDTH, HEIGHT);

        this.panel = new AzNopolyPanel(scene, 0, 0, WIDTH, HEIGHT);
        this.title = new Phaser.GameObjects.Text(scene, this.width * 0.5, this.height * 0.5, "Round 1", FONT_STYLE_EYECATCHER);
        this.title.setOrigin(0.5, 0.5);

        this.overviewButton = new AzNopolyButton(scene, "", this.width - 50, 5, this.height - 10);
        this.overviewButton.setImage("icon-zoom-out");

        this.add(this.panel);
        this.add(this.title);
        this.add(this.overviewButton);
    }

    public setOnActionClick(onClick: (action: "OVERVIEW" | "FOCUS") => void) {
        this.overviewButton.setOnClick(() => {
            this.inOverview = !this.inOverview;
            if (this.inOverview) {
                onClick("OVERVIEW");
                this.overviewButton.setImage("icon-zoom-in");
            } else {
                onClick("FOCUS");
                this.overviewButton.setImage("icon-zoom-out");
            }
        });
    }

}