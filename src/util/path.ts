

type Point = { x: number, y: number };
export default class PathMover {

    private targetPositions: Point[];
    private targetObject: Point;
    private speed: number;

    private targetIndex = 0;

    constructor(targetObject: Point, targetPositions: Point[], speed: number) { 
        this.targetObject = targetObject;
        this.targetPositions = targetPositions;
        this.speed = speed;
    }

    public advance(time: number, delta: number) {
        const targetPosition = this.targetPositions[this.targetIndex];
        const distanceToTarget = new Phaser.Math.Vector2(targetPosition.x - this.targetObject.x, targetPosition.y - this.targetObject.y).length();

        if (distanceToTarget < this.speed * delta / 1000) {
            this.targetIndex = (this.targetIndex + 1) % this.targetPositions.length;
            return;
        }

        const direction = new Phaser.Math.Vector2(targetPosition.x - this.targetObject.x, targetPosition.y - this.targetObject.y).normalize();
        this.targetObject.x += direction.x * this.speed * delta / 1000;
        this.targetObject.y += direction.y * this.speed * delta / 1000;
    }

}