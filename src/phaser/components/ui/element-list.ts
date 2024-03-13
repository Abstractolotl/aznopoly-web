import { FRAME_PADDING } from "@/style";


export default class AzNopolyList<T extends Phaser.GameObjects.Container> extends Phaser.GameObjects.Container{

    private _elements: {key: string, element: T}[] = [];
    public get elements() { return this._elements; }

    public addElement(key: string, element: T) {
        this._elements.push({key, element});
        this.add(element);
        element.setPosition(0, this.height);

        this.height += element.height + FRAME_PADDING;
    }

    preUpdate(time: number, delta: number) {
        this._elements.forEach(e => (e.element as any).preUpdate?.(time, delta));
    }

    public getElement(key: string) {
        return this._elements.find(e => e.key === key)?.element;
    }

    

}