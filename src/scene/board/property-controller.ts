import BoardSceneController from "@/scene/board-scene-controller.ts";

const MAX_PROPERTY_LEVEL = 3;

const DEFAULT_PROPERTY_PRICE = 100;
const PROPERTY_PRICE_MULTIPLIER = 1.5;

const DEFAULT_PROPERTY_RENT = 50;
const PROPERTY_RENT_MULTIPLIER = 1.5;

/**
 * HOST only class
 * PropertyController is responsible for managing property related actions
 */
export default class PropertyManager {

    private controller: BoardSceneController;

    constructor(controller: BoardSceneController) {
        this.controller = controller;
    }

    public getPropertyLevel(field: number) {
        if (!this.controller.isFieldOwned(field)) {
            return 0;
        }

        let owner = this.controller.getPlayers().find(player => player.tiles.includes(field));
        if (!owner) {
            return 0;
        }

        return owner.tiles.filter(t => t == field).length;
    }

    private getPropertyOwner(field: number) {
        return this.controller.getPlayers().find(player => player.tiles.includes(field));
    }

    public calculatePropertyPrice(level: number) {
        return DEFAULT_PROPERTY_PRICE * ((PROPERTY_PRICE_MULTIPLIER * level) + 1);
    }

    private calculatePropertyRent(level: number) {
        return DEFAULT_PROPERTY_RENT * ((PROPERTY_RENT_MULTIPLIER * level) + 1);
    }

    public canBuyProperty(uuid: string, field: number) {
        let player = this.controller.getPlayer(uuid);
        if (!player) {
            return false;
        }

        let owner = this.getPropertyOwner(field);
        if (owner && owner.uuid != uuid) {
            return false;
        }

        let level = this.getPropertyLevel(field);
        if (level >= MAX_PROPERTY_LEVEL) {
            return false;
        }

        return player.money >= this.calculatePropertyPrice(level);
    }

    public buyProperty(uuid: string, field: number) {
        let player = this.controller.getPlayer(uuid);
        if (!player) {
            return false;
        }

        let owner = this.getPropertyOwner(field);
        if (owner && owner.uuid != uuid) {
            return false;
        }

        let level = this.getPropertyLevel(field);
        let tile = this.controller.getTile(field);

        this.controller.removeMoney(uuid, this.calculatePropertyPrice(level))
        this.controller.addTiles(uuid, this.controller.getTiles(tile.getTileType()))

        return true;
    }

    public payPropertyRent(uuid: string, field: number) {
        let player = this.controller.getPlayer(uuid);
        if (!player) {
            return false;
        }

        let owner = this.getPropertyOwner(field);
        if (owner && owner.uuid == uuid) {
            return false;
        }

        let level = this.getPropertyLevel(field);
        this.controller.removeMoney(uuid, this.calculatePropertyRent(level))

        return true;
    }
}