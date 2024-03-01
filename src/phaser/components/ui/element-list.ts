import { FRAME_PADDING } from "@/style";


export default class AzNopolyList<T extends Phaser.GameObjects.Container> extends Phaser.GameObjects.Container{

    private elements: {key: string, element: T}[] = [];

    public addElement(key: string, element: T) {
        this.elements.push({key, element});
        this.add(element);
        element.setPosition(0, this.height);

        this.height += element.height + FRAME_PADDING;
    }

    public getElement(key: string) {
        return this.elements.find(e => e.key === key)?.element;
    }

}