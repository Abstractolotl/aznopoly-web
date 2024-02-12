import AzNopolyGame from "../../game";
import { HEIGHT as GAME_HEIGHT, WIDTH as GAME_WIDTH } from "../../main";
import { Roomba, RoombaConfig } from "../../minigame/roomba";
import { getColorFromUUID } from "../../util";
import BaseSceneController from "../base-scene-controller";
import { RoombaScene } from "./roomba-scene";
import convert from 'color-convert';


export default class RoombaSceneController extends BaseSceneController {

    private scene: RoombaScene;

    constructor(scene: RoombaScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly);

        this.scene = scene;
        this.aznopoly = aznopoly;

        this.registerSyncedMethod(this.initRoombas);
        this.registerSyncedMethod(this.updateRoombaDirection);
    }

    public hostInit() {
        const roombaConfigs = [];

        for (let j = 0; j < this.aznopoly.players.length; j++) {
            for (let i = 0; i < 5; i++) {
                roombaConfigs.push(this.generateRandomRoombaConfig(this.aznopoly.players[j]));
            }
        }
        
        this.syncProxy.initRoombas(roombaConfigs);
    }

    public onSceneReady() {
        super.onSceneReady();
        
        this.scene.events.on("roomba-dragged", ({id, offset} : {id: string, offset: Phaser.Math.Vector2}) => {
            this.syncProxy.updateRoombaDirection(id, offset);
        });
    }

    private updateRoombaDirection(id: string, direction: Phaser.Math.Vector2) {
        this.scene.updateRoombaDirection(id, new Phaser.Math.Vector2(direction.x, direction.y));
    }

    private initRoombas(configs: RoombaConfig[]) {
        this.scene.initRoombas(configs);
    }

    private generateRandomRoombaConfig(playerid: string) {
        const x = Math.random() * (GAME_WIDTH - Roomba.SIZE * 2) + Roomba.SIZE;
        const y = Math.random() * (GAME_HEIGHT - Roomba.SIZE * 2) + Roomba.SIZE;

        const color = getColorFromUUID(playerid);
        const paintColor = convert.hex.hsl("0x" + color.toString(16));
        paintColor[2] = 40;
        const paintColorHex = Number("0x" + convert.hsl.hex(paintColor));
        return { 
            id: Math.random().toString(36).substring(7),
            x, 
            y, 
            angle: Math.random() * Math.PI * 2,
            color: color,
            paintColor: paintColorHex, 
            speed: 50
        }
    }

}