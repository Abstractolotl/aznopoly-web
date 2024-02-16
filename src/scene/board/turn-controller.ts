import BoardSceneController from "../board-scene-controller";


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

    /**
     * The player that is currently taking their turn
     */
    private player: string;

    constructor(controller: BoardSceneController, player: string) {
        this.controller = controller;
        this.player = player;
    }

    public doRoll(sender: string) : boolean {
        if (this.state != TurnState.PRE_ROLL) return false;
        if (sender != this.player) return false;

        this.controller.executeRoll(this.player);
        const field = this.controller.getFieldForPlayer(this.player);
        
        if (this.controller.isFieldOwned(field)) {
            this.state = TurnState.PROPERTY;
            // do buy field stuff
            // this.controller.executeBuyProperty(this.player);
        } else {
            this.controller.onTurnEnd(this.player);
        }

        return true;
    }

    public doBuyProperty(): boolean {
        return false;
    }

    public doUseItem() : boolean{

        return false;
    }

}