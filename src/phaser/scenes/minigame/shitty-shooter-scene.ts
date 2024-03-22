import AzNopolyAvatar from "@/phaser/components/ui/avatar";
import MinigameScene from "../base/minigame-scene";
import ShittyShooterSceneController from "./shitty-shooter-scene-controller";
import Bullet from "../../components/shitty-shooter/bullet";
import Turret, { CORNER } from "../../components/shitty-shooter/turret";
import LoveGoomba from "@/phaser/components/minigame/love-goomba";
import { FRAME_PADDING, PLAYER_COLORS } from "@/style";
import AzNopolyPanel from "@/phaser/components/ui/panel";
import { SETTINGS } from "@/settings";
import { TimeBar } from "@/phaser/components/ui/time-bar";

const RELOAD_TIME = 250;
const WORLD_BOUNDS = (() => {
    const size = SETTINGS.DISPLAY_HEIGHT - FRAME_PADDING * 2 ;
    return new Phaser.Geom.Rectangle(SETTINGS.DISPLAY_WIDTH / 2 - size / 2, 0 + FRAME_PADDING * 1, size, size);
})();

export default class ShittyShooterScene extends MinigameScene<ShittyShooterSceneController> {
    public static WORLD_BOUNDS = WORLD_BOUNDS;
    public static PLAYER_BOUNDS: Phaser.Geom.Rectangle[] = [
        new Phaser.Geom.Rectangle(WORLD_BOUNDS.x, WORLD_BOUNDS.y, WORLD_BOUNDS.width / 2, WORLD_BOUNDS.height / 2),
        new Phaser.Geom.Rectangle(WORLD_BOUNDS.x + WORLD_BOUNDS.width / 2, WORLD_BOUNDS.y + WORLD_BOUNDS.height / 2, WORLD_BOUNDS.width / 2, WORLD_BOUNDS.height / 2),
        new Phaser.Geom.Rectangle(WORLD_BOUNDS.x + WORLD_BOUNDS.width / 2, WORLD_BOUNDS.y, WORLD_BOUNDS.width / 2, WORLD_BOUNDS.height / 2),
        new Phaser.Geom.Rectangle(WORLD_BOUNDS.x, WORLD_BOUNDS.y + WORLD_BOUNDS.height / 2, WORLD_BOUNDS.width / 2, WORLD_BOUNDS.height / 2),
    ];

    private shooting = false;
    private shootingTimer = 0;
    
    private bulletGroup!: Phaser.GameObjects.Group;
    private goombaGroup!: Phaser.GameObjects.Group;

    private bgm!: Phaser.Sound.BaseSound;
    private shootSound!: Phaser.Sound.BaseSound;

    private turrets: { [uuid: string]: Turret } = {};
    private goombas: { [id: string]: LoveGoomba } = {};

    private bar!: TimeBar;

    preload() {
        super.preload();
        AzNopolyAvatar.preload(this);
        LoveGoomba.preload(this);
        Bullet.preload(this);
        this.load.audio('shittyShooterBgm', 'assets/audio/start-now-synth-pop.mp3');
        this.load.audio('shittyShooterShoot', 'assets/audio/laser.mp3')
    }

    init() {
        this.controller = new ShittyShooterSceneController(this, this.aznopoly);
    }

    create() {
        super.create();
        const bounds = WORLD_BOUNDS;
        this.physics.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

        this.shootSound = this.game.sound.add('shittyShooterShoot', { volume: 0.1});
        this.bgm = this.game.sound.add('shittyShooterBgm', { loop: true, volume: 0.2});
        this.bgm.play();

        this.bulletGroup = this.add.group();
        this.goombaGroup = this.add.group();


        this.physics.add.collider(this.goombaGroup, this.goombaGroup);

        this.physics.add.overlap(this.bulletGroup, this.goombaGroup, (a, b) => {
            this.onGoombaBuleltCollision(a as Bullet, b as LoveGoomba);
        });
        
        this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
            if (body.gameObject instanceof Bullet) {
                body.gameObject.onReflect();
            }
        }, this);
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        if (this.shooting) {
            this.shootingTimer -= delta;
            if (this.shootingTimer <= 0) {
                this.shootingTimer = RELOAD_TIME;

                const turret = this.turrets[this.aznopoly.uuid];
                const position = this.input.activePointer.position;
                const direction = new Phaser.Math.Vector2(position.x - turret.x, position.y - turret.y).normalize();

                let bulletX = turret.x + direction.x * Turret.BARREL_LENGTH;
                if (bulletX < WORLD_BOUNDS.x + Bullet.BULLET_SIZE) bulletX = WORLD_BOUNDS.x + Bullet.BULLET_SIZE;
                if (bulletX > WORLD_BOUNDS.x + WORLD_BOUNDS.width - Bullet.BULLET_SIZE) bulletX = WORLD_BOUNDS.x + WORLD_BOUNDS.width - Bullet.BULLET_SIZE;

                let bulletY = turret.y + direction.y * Turret.BARREL_LENGTH;
                if (bulletY < WORLD_BOUNDS.y + Bullet.BULLET_SIZE) bulletY = WORLD_BOUNDS.y + Bullet.BULLET_SIZE;
                if (bulletY > WORLD_BOUNDS.y + WORLD_BOUNDS.height - Bullet.BULLET_SIZE) bulletY = WORLD_BOUNDS.y + WORLD_BOUNDS.height - Bullet.BULLET_SIZE;

                this.controller.onPlayerShoot(bulletX, bulletY, direction);
            }
        }
    }

    protected drawSceneLayout(): void {
        const bounds = WORLD_BOUNDS;
        this.add.existing(new AzNopolyPanel(this, bounds.x, bounds.y, bounds.width, bounds.height));
        const graphics = this.add.graphics();

        this.aznopoly.connectedUuids.forEach((uuid, index) => {
            graphics.fillStyle(PLAYER_COLORS[this.aznopoly.getProfile(uuid).colorIndex], 0.2);
            const bounds = ShittyShooterScene.PLAYER_BOUNDS[index];
            graphics.fillRect(
                bounds.x,
                bounds.y,
                bounds.width,
                bounds.height
            );
        });
    }

    public initTurret(uuid: string, corner: CORNER) {
        const profile = this.aznopoly.getProfile(uuid);
        const turret = new Turret(this, WORLD_BOUNDS.x, WORLD_BOUNDS.y, profile, corner);
        this.turrets[uuid] = turret;
        this.add.existing(turret);
    }

    public initGoomba(id: string, x: number, y: number) {
        const goomba = new LoveGoomba(this, id, x, y, this.aznopoly.isHost);
        this.add.existing(goomba);
        this.goombas[id] = goomba;
        this.goombaGroup.add(goomba);
    }

    public updateGoomba(id: string, x: number, y: number, direction: Phaser.Math.Vector2) {
        const goomba = this.goombas[id];
        if (!goomba) {
            console.error('Goomba not found', id);
            return;
        }
        goomba.setPosition(x, y);
        goomba.updateMovement(new Phaser.Math.Vector2(direction.x, direction.y));
    }

    public attractGoomba(id: string, x: number, y: number, colorIndex: number) {
        const goomba = this.goombas[id];
        if (!goomba) {
            console.error('Goomba not found', id);
            return;
        }
        goomba.attractToPosition(PLAYER_COLORS[colorIndex], x, y);
    }

    public addBullet(x: number, y: number, direction: Phaser.Math.Vector2) {
        this.shootSound.play()
        const sender = arguments[arguments.length - 1];
        const bullet = this.add.existing(new Bullet(this, sender, x, y, new Phaser.Math.Vector2(direction.x, direction.y)));
        this.bulletGroup.add(bullet);
    }

    private onGoombaBuleltCollision(bullet: Bullet, goomba: LoveGoomba) {
        bullet.destroy();
        if (this.aznopoly.isHost) {
            const goombaId = Object.keys(this.goombas).find(id => this.goombas[id] === goomba);
            this.controller.onGoombaHit(bullet.originUuid, bullet.originSource, goombaId!, goomba.x, goomba.y);
        }
    }

    public initInput() {
        this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.shooting = true;
        });
        this.input.on(Phaser.Input.Events.POINTER_UP, () => {
            this.shooting = false;
        });
        this.input.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.shooting = false;
        });
        this.input.on(Phaser.Input.Events.POINTER_MOVE, () => {
            const turret = this.turrets[this.aznopoly.uuid];
            const pointer = this.input.activePointer;
            const angle = Phaser.Math.Angle.Between(turret.x, turret.y, pointer.x, pointer.y);
            turret.updateAngle(angle);
        });
        this.bar = new TimeBar(this, SETTINGS.DISPLAY_WIDTH - FRAME_PADDING, FRAME_PADDING, SETTINGS.DISPLAY_HEIGHT - 2*FRAME_PADDING, 10, 20000);
        this.bar.rotation = Math.PI / 2;
        this.add.existing(this.bar);
    }

    public stopAll() {
        this.bulletGroup.clear(true, true);
        this.goombaGroup.getChildren().forEach((a: Phaser.GameObjects.GameObject) => {
            const goomba = a as LoveGoomba;
            goomba.stop();
        });
        Object.values(this.turrets).forEach(turret => turret.stop());
    }

    public getScore() {
        const scores: {[key: string]: number} = {};

        this.aznopoly.connectedUuids.forEach((uuid, index) => {
            const bounds = ShittyShooterScene.PLAYER_BOUNDS[index];
            const count = this.goombaGroup.getChildren().filter((a: Phaser.GameObjects.GameObject) => {
                const goomba = a as LoveGoomba;
                return bounds.contains(goomba.x, goomba.y);
            }).length;
            scores[uuid] = count;
        });

        return scores;
    }

    public stopMusic() {
        this.bgm.pause();
    }

}