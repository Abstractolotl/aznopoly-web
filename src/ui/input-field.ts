

const PADDING_H = 15;
export default class AzNopolyInput extends Phaser.GameObjects.Container {

    static preload(scene: Phaser.Scene) {
        scene.load.html('input_mask', 'assets/input_field.html');
    }

    private graphics: Phaser.GameObjects.Graphics;
    private dom: Phaser.GameObjects.DOMElement;
    private inputDom: HTMLInputElement;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRect(0, 0, width, height);
        this.graphics.lineStyle(5, 0xffffff, 1)
        this.graphics.strokeRect(0, 0, width, height)

        this.dom = scene.add.dom(0, 0).createFromCache('input_mask');
        this.dom.node.id = "input-field-" + Math.random().toString(36).substring(7);

        this.dom.setOrigin(0, 0);
        this.dom.setPosition(PADDING_H, height / 2);
        this.inputDom = this.dom.node.querySelector("input") as HTMLInputElement;
        this.inputDom.style.width = (width - 2 * PADDING_H) + "px";
        this.inputDom.style.fontSize = height * 0.5 + "px";
        
        this.add(this.dom);
        this.add(this.graphics);
    }

    public getValue() {
        return this.inputDom.value;
    }


}