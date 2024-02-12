

export class TimeBar extends Phaser.GameObjects.Graphics {

    private width: number;
    private height: number;
    private color: number = 0x00ff00;
    private time: number;

    private timeRemaining: number;
    private paused: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, time: number) {
        super(scene, { x, y });
        this.width = width;
        this.height = height;
        this.time = time;
        this.timeRemaining = time;

        this.drawBar();
    }

    preUpdate(_: number, delta: number) {
        if (this.timeRemaining <= 0 || this.paused) {
            return;
        }

        this.timeRemaining = Math.max(0, this.timeRemaining - delta);
        this.clear();
        this.drawBar();
    }

    private drawBar() {
        this.fillStyle(0x222222, 1);
        this.fillRect(0, 0, this.width, this.height);

        const fillPercentage = this.timeRemaining / this.time;
        this.fillStyle(this.color, 1);
        this.fillRect(0, 0, this.width * fillPercentage, this.height);
    }

    public setColor(color: number) {
        this.color = color;
    }

    public resetTime(time: number) {
        this.time = time;
        this.timeRemaining = time;
        this.resume();
    }

    public pause() {
        this.paused = true;
    }

    public resume() {
        this.paused = false;
    }

}
