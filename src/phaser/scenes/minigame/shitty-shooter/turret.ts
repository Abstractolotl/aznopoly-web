import PathMover from "@/util/path";
import AzNopolyAvatar, { Avatars } from "@/phaser/components/ui/avatar";
import { PlayerProfile } from "@/phaser/components/ui/player-info";
import { SETTINGS } from "@/settings";
import { FRAME_PADDING } from "@/style";


const BARREL_LENGTH = 50;
const BARREL_WIDTH = 10;
const BODY_SIZE = 25;

const MOVE_SPEED = 200;

export type CORNER = "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT";
export default class Turret extends Phaser.GameObjects.Container {
    

    public static BARREL_LENGTH = BARREL_LENGTH;

    private graphics: Phaser.GameObjects.Graphics;
    private path: PathMover;

    private stopped = false;
    
    constructor(scene: Phaser.Scene, x: number, y: number, profile: PlayerProfile, corner: CORNER) {
        super(scene);
        this.setPosition(x, y);

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.graphics.lineStyle(BARREL_WIDTH, 0x000000);
        this.graphics.lineBetween(0, 0, BARREL_LENGTH, 0);

        this.add(this.graphics);
        this.add(new AzNopolyAvatar(scene, -BODY_SIZE, -BODY_SIZE, BODY_SIZE* 2, profile.avatar, profile.colorIndex));
        
        this.path = this.initPath(x, y, corner);
    }

    private initPath(startX: number, startY: number, corner: CORNER) {
        const targetPositions: { x: number, y: number }[] = [];

        const length = SETTINGS.DISPLAY_HEIGHT - 2 * FRAME_PADDING
        const CORNER_POSITIONS = [
            { x: 0, y: 0 },
            { x: 0, y: length/2 },
            { x: 0, y: length},
            { x: length/2, y: length },
            { x: length, y: length },
            { x: length, y: length/2 },
            { x: length, y: 0 },
            { x: length/2, y: 0  },
        ]

        let indexes = [1, 2, 1, 0];
        const indexOffset = (() => {
            switch (corner) {
                case "TOP_LEFT": 
                    indexes = [1, 0, 1, 2];
                    return 5;
                case "TOP_RIGHT": 
                    indexes = [1, 0, 1, 2];
                    return 1;
                case "BOTTOM_RIGHT": return 3;
                case "BOTTOM_LEFT": return  7;
            }
        })();
        for (let i = 0; i < 4; i++) {
            const index = (indexes[i] + indexOffset) % CORNER_POSITIONS.length;
            targetPositions.push( { x: startX + CORNER_POSITIONS[index].x, y: startY + CORNER_POSITIONS[index].y } );
        }
        
        /* Quarter Circle
        const angleOffset = (() => {
            switch (corner) {
                case "TOP_LEFT": return Math.PI;
                case "TOP_RIGHT": return Math.PI * 1.5;
                case "BOTTOM_RIGHT": return 0;
                case "BOTTOM_LEFT": return Math.PI * 0.5;
            }
        })();
        for (let i = 0; i < segments; i++) {
            const angle = i / segments * Math.PI * 0.5 + angleOffset;
            const ax = Math.cos(angle) * 150;
            const ay = Math.sin(angle) * 150;
            targetPositions.push(new Phaser.Math.Vector2(startX + ax, startY + ay));
        }
        for (let i = segments-1; i >= 0; i--) {
            targetPositions.push(targetPositions[i]);
        }
        */
        this.setPosition(targetPositions[0].x, targetPositions[0].y);

        return new PathMover(this, targetPositions, MOVE_SPEED);
    }

    public stop() {
        this.stopped = true;
    }

    public updateAngle(angle: number) {
        if (this.stopped) {
            return;
        }
        this.graphics.setRotation(angle);
    }

    preUpdate(time: number, delta: number) {
        if (this.stopped) {
            return;
        }
        this.path.advance(time, delta);
    }

}