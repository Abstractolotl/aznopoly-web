import {TileType} from "@/types/board.ts";
import PropertyManager from "@/scene/board/property-manager.ts";
import BoardSceneController from "@/phaser/scenes/board-scene-controller";


enum TurnState {
    PRE_ROLL,
    PROPERTY,
    ITEM,
    OVER
}

/**
 * HOST only class
 * Controls the current turn and manage state
 * Should not be used to interact with the ui
 */
export default class Turn {

    private state: TurnState = TurnState.PRE_ROLL;
    private controller: BoardSceneController;
    private propertyManager: PropertyManager;

    /**
     * The player that is currently taking their turn
     */
    private readonly player: string;

    // Scheduler for handling time based events
    private scheduler!: NodeJS.Timeout;

    constructor(controller: BoardSceneController, propertyManager: PropertyManager, player: string) {
        this.controller = controller;
        this.propertyManager = propertyManager;
        this.player = player;
    }

    public isOnTurn(player: string) {
        return this.player == player;
    }

    public doRoll(sender: string) : boolean {
        if (this.state != TurnState.PRE_ROLL) return false;
        if (sender != this.player) return false;

        this.controller.executeRoll(this.player);
        const field = this.controller.getPlayerPosition(this.player);
        if( !field ) return false;

        let tile = this.controller.getTile(field);
        if(!TileType.isProperty(tile.getTileType())) {
            this.controller.onTurnEnd(this.player);
            return true;
        }

        this.state = TurnState.PROPERTY;
        if(this.propertyManager.hasToPayRent(this.player, field)) {
            this.controller.onHasToPayRent(this.player);
        } else if(this.propertyManager.canBuyProperty(this.player, field)) {
            this.scheduler = setTimeout(() => {
                this.controller.onBuyInterrupt(this.player);
                this.cancelBuyProperty();
            }, 3000);
            this.controller.onCanBuyProperty(this.player);
        } else {
            this.controller.onTurnEnd(this.player);
        }

        return true;
    }

    public doBuyProperty(): boolean {
        if (this.state != TurnState.PROPERTY) return false;

        clearTimeout(this.scheduler);

        const field = this.controller.getPlayerPosition(this.player);
        if( !field ) return false;

        let tile = this.controller.getTile(field);
        if(!TileType.isProperty(tile.getTileType())) {
            this.controller.onTurnEnd(this.player);
            return true;
        }

        this.propertyManager.buyProperty(this.player, field!);
        this.controller.onTurnEnd(this.player);

        return true;
    }

    public cancelBuyProperty(): boolean {
        if (this.state != TurnState.PROPERTY) return false;

        clearTimeout(this.scheduler);

        this.state = TurnState.OVER;
        this.controller.onTurnEnd(this.player);

        return false;
    }

    public doUseItem() : boolean{
        return false;
    }

}