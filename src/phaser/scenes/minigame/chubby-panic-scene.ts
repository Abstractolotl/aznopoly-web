import MinigameScene from "../base/minigame-scene";
import AzNopolyGame from "../../../game";
import ColorProgressBar from "../../components/minigame/color-progressbar";
import convert from 'color-convert';
import {FRAME_PADDING, PLAYER_COLORS} from "@/style";
import {SETTINGS} from "@/settings";
import ChubbyPanicSceneController from "@/phaser/scenes/minigame/chubby-panic-scene-controller.ts";
import {ChubbyRacer} from "@/phaser/components/minigame/chubbyRacer.ts";
import AzNopolyPanel from "@/phaser/components/ui/panel.ts";
import AzNopolyBar from "@/phaser/components/ui/bar.ts";
import {Food} from "@/phaser/components/minigame/food.ts";
import {TimeBar} from "@/phaser/components/ui/time-bar.ts";
import {PushBarrier} from "@/phaser/components/minigame/pushBarrier.ts";

const WORLD_BOUNDS = (() => {
    const size = SETTINGS.DISPLAY_HEIGHT - FRAME_PADDING * 2;
    return new Phaser.Geom.Rectangle(SETTINGS.DISPLAY_WIDTH / 2 - size / 2, 0 + FRAME_PADDING * 1, size, size);
})();

export class ChubbyPanicScene extends MinigameScene<ChubbyPanicSceneController> {
    public static WORLD_BOUNDS = WORLD_BOUNDS;

    public chubbyRacers: { [uuid: string]: ChubbyRacer } = {};
    private food: { [id: string]: Food } = {};
    private pushBarriers: { [id: string]: PushBarrier } = {};

    private chubbyRacerGroup!: Phaser.GameObjects.Group;
    private foodGroup!: Phaser.GameObjects.Group;
    private pushBarrierGroup!: Phaser.GameObjects.Group;

    private racersInitiated!: boolean;

    preload() {
        super.preload();
        ChubbyRacer.preload(this);
    }

    private graphics!: Phaser.GameObjects.Graphics;

    init() {
        this.controller = new ChubbyPanicSceneController(this, this.aznopoly);
    }

    create() {
        this.graphics = this.add.graphics();
        super.create();

        this.racersInitiated = false;

        this.chubbyRacerGroup = this.add.group();
        this.foodGroup = this.add.group();
        this.pushBarrierGroup = this.add.group();

        this.physics.add.collider(this.chubbyRacerGroup, this.chubbyRacerGroup);
        this.physics.add.collider(this.chubbyRacerGroup, this.foodGroup, (a, b) => {
            this.onFoodCollision(a as ChubbyRacer, b as Food);
        });
        this.physics.add.collider(this.pushBarrierGroup, this.pushBarrierGroup, (a, b) => {
            console.log("collision")
            this.screwChubbyRacerOver(a as PushBarrier, b as PushBarrier);
        })


    }

    update(_: number, delta: number) {
        super.update(_, delta);

        if (!this.racersInitiated) {
            return;
        }
        this.controller.updateRacers();
        this.updateChubbyRacerDirection(this.chubbyRacers[this.aznopoly.uuid]);
/*
        const pointer = this.input.activePointer;

        this.updateChubbyRacerRotation(pointer.x, pointer.y, this.chubbyRacer);*/
    }

    public updateRacers(uuid: string) {

        this.pushBarriers[uuid]?.setPosition(this.chubbyRacers[uuid].x, this.chubbyRacers[uuid].y);
    }
    public initInput() {
        this.input.on(Phaser.Input.Events.POINTER_MOVE, () => {
            const chubbyRacer = this.chubbyRacers[this.aznopoly.uuid];
            //this.updateChubbyRacerDirection(chubbyRacer);
        });
        this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
            //spawn barrier for each chubbyRacer


            this.spawnBarrier(this.pushBarriers[this.aznopoly.uuid])
        });

        /*        this.bar = new TimeBar(this, SETTINGS.DISPLAY_WIDTH - FRAME_PADDING, FRAME_PADDING, SETTINGS.DISPLAY_HEIGHT - 2*FRAME_PADDING, 10, 20000);
                this.bar.rotation = Math.PI / 2;
                this.add.existing(this.bar);*/
    }

    public initChubbyRacer(uuid: string) {
        const profile = this.aznopoly.getProfile(uuid);
        const chubbyRacer = this.add.existing(new ChubbyRacer(this, 100, 100, profile));
        this.chubbyRacers[uuid] = chubbyRacer;
        this.chubbyRacerGroup.add(chubbyRacer);
    }

    public initFood(id: string, x: number, y: number) {
        const food = this.add.existing(new Food(this, id, x, y));
        this.food[food.id] = food;
        this.foodGroup.add(food);
    }

    public initPushBarrier(uuid: string) {
        this.pushBarriers[uuid] = this.add.existing(new PushBarrier(this, 0, 0, 25, 1000, this.aznopoly.getProfile(uuid), uuid));
        this.pushBarrierGroup.add(this.pushBarriers[uuid]);
    }

    public screwChubbyRacerOver(chubbyRacerBarrierAggressor: PushBarrier, chubbyRacerBarrierVictim: PushBarrier) {
        //repell chubbyRacers from each other
        const chubbyRacerAggressor = this.chubbyRacers[chubbyRacerBarrierAggressor.getUUID()];
        const chubbyRacerVictim = this.chubbyRacers[chubbyRacerBarrierVictim.getUUID()];

        const direction = new Phaser.Math.Vector2(chubbyRacerBarrierVictim.x - chubbyRacerAggressor.x, chubbyRacerVictim.y - chubbyRacerAggressor.y).normalize();
        this.chubbyRacers[chubbyRacerBarrierVictim.getUUID()].setBumpVelocity(direction.x * 2000, direction.y * 2000);

        if (chubbyRacerBarrierVictim.isActivated()) {
            const directionReverse = new Phaser.Math.Vector2(chubbyRacerBarrierAggressor.x - chubbyRacerVictim.x, chubbyRacerBarrierAggressor.y - chubbyRacerVictim.y).normalize();
            this.chubbyRacers[chubbyRacerBarrierAggressor.getUUID()].setBumpVelocity(directionReverse.x * 2000, directionReverse.y * 2000);

            chubbyRacerBarrierAggressor.setActivated(false);
            chubbyRacerBarrierVictim.setActivated(false);
        }


    }
    public spawnBarrier(pushBarrier: PushBarrier) {
        pushBarrier.updateScale(4, 1000)
    }

    public onFoodCollision(chubbyRacer: ChubbyRacer, food: Food) {
        food.destroy();
        if (this.aznopoly.isHost) {
            chubbyRacer.addWeight();
            this.updateChubbyRacerDirection(chubbyRacer);
        }

    }

    //chubbyRacers should repell each other
    public onCubbyRacersCollision(chubbyRacer1: ChubbyRacer, chubbyRacer2: ChubbyRacer) {
        const direction = new Phaser.Math.Vector2(chubbyRacer1.x - chubbyRacer2.x, chubbyRacer1.y - chubbyRacer2.y).normalize();
        chubbyRacer1.updateDirection(direction);
        chubbyRacer2.updateDirection(direction);
    }

    protected drawSceneLayout(): void {
        //this.add.existing(new AzNopolyPanel(this, 0, 0, 800, 600));
    }

    public updateChubbyRacerDirection(chubbyRacer: ChubbyRacer) {
        const pointer = this.input.activePointer;
        const direction = new Phaser.Math.Vector2(pointer.x - chubbyRacer.x, pointer.y - chubbyRacer.y).normalize();
        chubbyRacer.updateDirection(direction);
    }

    public setInitiated() {
        this.racersInitiated = true;
    }

    // public static WORLD_BOUNDS = WORLD_BOUNDS;
    // private startPositions: StartPosition[4] = []
    // preload() {
    //     super.preload();
    //     ChubbyRacer.preload(this);
    // }
    //
    // create() {
    //     super.create();
    //
    //     const bounds = MinigameScene.getGameBounds();
    //     this.physics.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    //     this.physics.world.fixedStep = true;
    //
    //
    // }
    //
    // protected drawSceneLayout(): void {
    //     const rightBounds = MinigameScene.getRightBounds();
    //     const rightPanel = new AzNopolyPanel(this, rightBounds.x, rightBounds.y - AzNopolyBar.HEIGHT, rightBounds.width, rightBounds.height + AzNopolyBar.HEIGHT);
    //
    //     const bounds = WORLD_BOUNDS;
    //     this.add.existing(new AzNopolyPanel(this, bounds.x - rightBounds.width/2, bounds.y, bounds.width, bounds.height));
    //     const graphics = this.add.graphics();
    //
    //     this.add.existing(rightPanel);
    // }

}