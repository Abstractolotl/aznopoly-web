import AzNopolyGame from "../../game";

export abstract class BaseScene<T> extends Phaser.Scene {

    protected aznopoly: AzNopolyGame;
    protected controller!: T;

    constructor(aznopoly: AzNopolyGame) {
        super();
        this.aznopoly = aznopoly;
    }

}