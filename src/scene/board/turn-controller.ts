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

    private propertyBuyTimer!: NodeJS.Timeout;

    constructor(controller: BoardSceneController, propertyManager: PropertyManager, player: string) {
        this.controller = controller;
        this.propertyManager = propertyManager;
        this.player = player;
    }

    public isOnTurn(player: string) {
        return this.player == player;
    }

    public async doRoll(sender: string) {
        if (this.state != TurnState.PRE_ROLL) return;
        if (sender != this.player) return;

        await this.controller.executeRoll(this.player);

        const fieldPosition = this.controller.getPlayerPosition(this.player);
        if(this.propertyManager.hasToPayRent(this.player, fieldPosition)) {
            this.controller.onHasToPayRent(this.player);
        }

        if(this.propertyManager.canBuyProperty(this.player, fieldPosition)) {
            this.state = TurnState.PROPERTY;
            this.controller.executeBuyPropertyDialog(this.player);
            this.propertyBuyTimer = setTimeout(() => {
                this.controller.executeCancelBuyProperty(this.player);
            }, 3000);
            return;
        }

        this.endTurn();
        return;
    }

    public doBuyProperty(sender: string) {
        if (this.state != TurnState.PROPERTY) return;
        if (sender != this.player) return;

        const fieldPosition = this.controller.getPlayerPosition(this.player);
        this.propertyManager.buyProperty(this.player, fieldPosition!);
        
        this.endTurn();
        return true;
    }

    public doCancelBuyProperty(sender: string): boolean {
        if (this.state != TurnState.PROPERTY) return false;
        if (sender != this.player) return false;

        clearTimeout(this.propertyBuyTimer);
        
        this.endTurn();
        return true;
    }

    private endTurn() {
        this.state = TurnState.OVER;
        this.controller.onTurnEnd(this.player);
    }

}