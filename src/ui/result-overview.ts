import { HEIGHT, WIDTH } from "../main";

export interface ResultEntry {
    name: string,
    result: "won" | "lost" | number,
}

export default class ResultOverview {

    private background!: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, results: ResultEntry[]) {
        this.background = scene.add.graphics();
        this.background.fillStyle(0x000000, 0.5);
        this.background.fillRect(0, 0, WIDTH * 0.75, HEIGHT * 0.75);

        results.forEach((result, index) => {
            const text = scene.add.text(0, index * 50, `${result.name}: ${result.result}`, { color: '#ffffff', fontSize: '32px' });
            text.setOrigin(0, 0);
            text.setPosition(WIDTH * 0.25 + 25, HEIGHT * 0.25 + 25 + index * 50);
        });
    }

}