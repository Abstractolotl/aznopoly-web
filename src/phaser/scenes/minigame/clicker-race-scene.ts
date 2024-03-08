import MinigameScene from "@/phaser/scenes/base/minigame-scene.ts";
import ClickerRaceSceneController from "@/phaser/scenes/minigame/clicker-race-scene-controller.ts";
import {TimeBar} from "@/phaser/components/ui/time-bar.ts";
import AzNopolyAvatar from "@/phaser/components/ui/avatar.ts";
import AzNopolyBar from "@/phaser/components/ui/bar.ts";
import AzNopolyPanel from "@/phaser/components/ui/panel.ts";
import {FRAME_PADDING} from "@/style.ts";
import Racer from "@/phaser/scenes/minigame/clicker-racer/racer.ts";
import {AzNopolyButton} from "@/phaser/components/ui/button.ts";
import {AzNopolySlider} from "@/phaser/components/ui/range-slider.ts";

const ACTION_BOUNDS = {
    width: 500,
    height: 80
}

const PLAYER_SIZE = 50;

const gameBounds = MinigameScene.getGameBounds();
const rightBounds = MinigameScene.getRightBounds();

export default class ClickerRaceScene extends MinigameScene<ClickerRaceSceneController> {

    private button!: AzNopolyButton;
    private slider!: AzNopolySlider;
    private bar!: TimeBar;

    private racers: { [uuid: string]: Racer } = {};

    preload() {
        super.preload();
        AzNopolyAvatar.preload(this);
    }

    init() {
        this.controller = new ClickerRaceSceneController(this, this.aznopoly);
    }

    create() {
        super.create();
    }

    update(time: number, delta: number) {
        super.update(time, delta);
    }

    stopAllPlayers() {
        Object.values(this.racers).forEach(racer => {
            racer.stop();
        });
        this.button.disable();
    }

    getScore() {
        const scores: {[key: string]: number} = {};

        this.aznopoly.connectedUuids.forEach((uuid, index) => {
            scores[uuid] = this.racers[uuid].getProgress()
        });

        return scores;
    }

    public initPlayer(uuid: string, position: number) {
        let trackWidth = gameBounds.width + rightBounds.width - FRAME_PADDING - PLAYER_SIZE;

        const profile = this.aznopoly.getProfile(uuid);
        const avatar = new Racer(this, gameBounds.x + FRAME_PADDING, gameBounds.y + FRAME_PADDING + (PLAYER_SIZE + FRAME_PADDING) * position, profile, trackWidth + (PLAYER_SIZE / 2));

        this.add.rectangle(avatar.x + (PLAYER_SIZE / 2), avatar.y + (PLAYER_SIZE / 2), trackWidth, 5, 0x000000, 0.5).setOrigin(0, 0)
        this.add.existing(avatar);

        this.racers[uuid] = avatar;
    }

    public movePlayer(uuid: string) {
        if (this.racers[uuid]) {
            this.racers[uuid].move(() => {
                this.controller.onPlayerFinished()
            });
        }
    }

    public startTimeBar() {
        this.bar.resume();
    }

    public randomInput() {
        if (Math.random() > 0.5) {
            this.button.setVisible(true)
            this.button.enable()
            this.slider.disable()
            this.slider.setVisible(false)
        } else {
            this.button.disable()
            this.button.setVisible(false)
            this.slider.setVisible(true)
            this.slider.enable()
            this.slider.changeMax(100 + Math.random() * 100)
        }
    }

    protected drawSceneLayout() {
        this.add.existing(new AzNopolyBar(this, "Clicker Race"))

        const gamePanel = new AzNopolyPanel(this, gameBounds.x, gameBounds.y, (gameBounds.width + rightBounds.width + FRAME_PADDING), gameBounds.height);
        this.add.existing(gamePanel);

        const actionPanel = new AzNopolyPanel(this, gamePanel.width / 2 - (ACTION_BOUNDS.width / 2), (gameBounds.y / 2) + gameBounds.height - ACTION_BOUNDS.height, ACTION_BOUNDS.width, ACTION_BOUNDS.height)
        this.add.existing(actionPanel)

        this.button = new AzNopolyButton(this, "Race", actionPanel.x + (FRAME_PADDING * 3), actionPanel.y + FRAME_PADDING, actionPanel.width - (FRAME_PADDING * 6), 50, false, () => {
            this.controller.onPlayerClick(this.aznopoly.uuid);
        });

        this.slider = new AzNopolySlider(this, actionPanel.x + (FRAME_PADDING * 3), actionPanel.y + FRAME_PADDING, actionPanel.width - (FRAME_PADDING * 6), 50, 100, this.onSlider.bind(this))

        this.add.existing(this.slider);
        this.add.existing(this.button);

        this.bar = new TimeBar(this, actionPanel.x, actionPanel.y - (FRAME_PADDING * 3), ACTION_BOUNDS.width, 25, 20000);
        this.bar.pause()
        this.add.existing(this.bar);

        this.randomInput()
    }

    private onSlider(value: number) {
        if (value === this.slider.getMax()) {
            this.controller.onPlayerClick(this.aznopoly.uuid);
        }
    }

}