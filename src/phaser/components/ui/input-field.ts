

const PADDING_HORIZONTAL = 15;
export default class AzNopolyInput extends Phaser.GameObjects.Container {

    static preload(scene: Phaser.Scene) {
        scene.load.html('input_mask', 'assets/input_field.html');
    }

    private graphics: Phaser.GameObjects.Graphics;
    private dom: Phaser.GameObjects.DOMElement;
    private inputDom: HTMLInputElement;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, type?: string) {
        super(scene, x, y);
        this.setSize(width, height);

        this.graphics = new Phaser.GameObjects.Graphics(scene);
        this.dom = new Phaser.GameObjects.DOMElement(scene, 0, 0);
        // this.graphics.fillStyle(0xffffff, 1);
        // this.graphics.fillRect(0, 0, width, height);
        if (type === "code") {
            this.graphics.fillStyle(0xffffff, 0.25);
            for(let i = 0; i < 6; i++) {
                this.graphics.fillRect(0 + i * 20 -2, height * 0.2, 17, height * 0.60);
            }
    
            this.dom.createFromCache('input_mask');
            this.dom.node.id = "input-field-" + Math.random().toString(36).substring(7);

            this.dom.setOrigin(0, 0);
            this.dom.setPosition(0, height / 2);
            this.inputDom = this.dom.node.querySelector("input") as HTMLInputElement;
            this.inputDom.classList.add("code");
            this.inputDom.setAttribute("maxlength", "6");
            this.inputDom.style.width = (width - 2 * PADDING_HORIZONTAL) + "px";
            this.inputDom.style.fontSize = height * 0.5 + "px";
        } else {
            this.graphics.fillStyle(0xffffff, 0.5);
            this.graphics.fillRect(-10, 0, width+20, height);

            this.dom.createFromCache('input_mask');
            this.dom.node.id = "input-field-" + Math.random().toString(36).substring(7);
            
            this.dom.setOrigin(0, 0);
            this.dom.setPosition(0, height / 2);
            
            this.inputDom = this.dom.node.querySelector("input") as HTMLInputElement;
            this.inputDom.setAttribute("maxlength", "14");
            this.inputDom.style.width = (width - 2 * PADDING_HORIZONTAL) + "px";
            this.inputDom.style.fontSize = height * 0.5 + "px";
        }

        this.add(this.dom);
        this.add(this.graphics);
    }

    public getValue() {
        return this.inputDom.value;
    }

    public setValue(value: string) {
        this.inputDom.value = value;
    }

    public setChangeListener(callback: (value: string) => void) {
        this.inputDom.addEventListener("input", () => {
            callback(this.inputDom.value);
        });
    }


}