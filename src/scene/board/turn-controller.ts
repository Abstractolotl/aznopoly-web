import BoardSceneController from "../board-scene-controller";
import {TileType} from "@/types/board.ts";
import PropertyManager from "@/scene/board/property-controller.ts";


enum TurnState {
    PRE_ROLL,
    PROPERTY,
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
    private propertyHelper: PropertyManager;

    /**
     * The player that is currently taking their turn
     */
    private player: string;

    constructor(controller: BoardSceneController, propertyHelper: PropertyManager, player: string) {
        this.controller = controller;
        this.propertyHelper = propertyHelper;
        this.player = player;
    }

    getPlayer() {
        return this.player;
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

        // Check if field is not owned or owned by the player
        if (!this.controller.isFieldOwned(field!) || this.controller.isFieldOwnedByPlayer(field!, this.player)) {
            this.controller.onPropertyBuy(this.player);
        } else if(!this.controller.isFieldOwnedByPlayer(field!, this.player)) {
            this.controller.onPropertyRent(this.player);
        } else {
            this.controller.onTurnEnd(this.player);
        }

        return true;
    }

    public doBuyProperty(): boolean {
        if (this.state != TurnState.PROPERTY) return false;

        const field = this.controller.getPlayerPosition(this.player);
        if( !field ) return false;

        let tile = this.controller.getTile(field);
        if(!TileType.isProperty(tile.getTileType())) {
            this.controller.onTurnEnd(this.player);
            return true;
        }

        this.propertyHelper.buyProperty(this.player, field!);
        this.controller.onTurnEnd(this.player);

        return true;
    }

    public doUseItem() : boolean{
        return false;
    }

}