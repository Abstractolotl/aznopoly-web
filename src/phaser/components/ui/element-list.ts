import { FRAME_PADDING } from "@/style";


export default class AzNopolyList<T extends Phaser.GameObjects.Container> extends Phaser.GameObjects.Container {

    private _elements: { key: string, element: T }[] = [];
    public get elements() { return this._elements; }

    private direction: "HOR" | "VERT";
    private gap: number;

    constructor(scene: Phaser.Scene, x: number, y: number, direction: "HOR" | "VERT" = "HOR", gap: number = FRAME_PADDING) {
        super(scene, x, y);
        this.direction = direction;
        this.gap = gap;
    }

    public addElement(key: string, element: T) {
        this._elements.push({ key, element });
        this.add(element);

        if (this.direction === "HOR") {
            element.setPosition(this.width, 0);
            this.width += element.width + this.gap;
            this.height = Math.max(this.height, element.height);
        } else {
            element.setPosition(0, this.height);
            this.width = Math.max(this.width, element.width);
            this.height += element.height + this.gap;
        }
    }

    preUpdate(time: number, delta: number) {
        this._elements.forEach(e => (e.element as any).preUpdate?.(time, delta));
    }

    public getElement(key: string) {
        return this._elements.find(e => e.key === key)?.element;
    }

}