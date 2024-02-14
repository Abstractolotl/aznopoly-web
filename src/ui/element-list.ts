import { FRAME_PADDING } from "@/style";


export default class AzNopolyList<T extends Phaser.GameObjects.Container> extends Phaser.GameObjects.Container{

    private elements: T[] = [];

    public addElement(element: T) {
        this.elements.push(element);
        this.add(element);
        element.setPosition(0, this.height);
        console.log("Element has height", element.height)

        this.height += element.height + 20;
    }

}