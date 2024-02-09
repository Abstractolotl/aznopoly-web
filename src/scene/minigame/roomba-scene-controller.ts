import AzNopolyGame from "../../game";
import { HEIGHT as GAME_HEIGHT, WIDTH as GAME_WIDTH } from "../../main";
import { Roomba, RoombaConfig } from "../../minigame/roomba";
import { getColorFromUUID } from "../../util";
import MinigameSceneController from "../base/minigame-scene-controller";
import { RoombaScene } from "./roomba-scene";
import convert from 'color-convert';


const MAX_GAME_TIME = 3000;
export default class RoombaSceneController extends MinigameSceneController {

    declare protected scene: RoombaScene;

    private locked = false;

    private colorUuuidMap = new Map<number, string>();

    constructor(scene: RoombaScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly);

        this.scene = scene;
        this.aznopoly = aznopoly;

        this.registerSyncedMethod(this.initRoombas, true);
        this.registerSyncedMethod(this.lockAllGameplay, true);

        this.registerSyncedMethod(this.updateRoombaDirection, false);
    }

    onMiniGameStart(): void {
        this.scene.events.on("roomba-dragged", ({id, offset} : {id: string, offset: Phaser.Math.Vector2}) => {
            if (this.locked) return;

            this.syncProxy.updateRoombaDirection(id, offset);
        });

        if (!this.aznopoly.isHost) {
            return;
        }
        const roombaConfigs = [];
        for (let j = 0; j < this.aznopoly.connectedUuids.length; j++) {
            const uuid = this.aznopoly.connectedUuids[j] ;
            for (let i = 0; i < 5; i++) {
                roombaConfigs.push(this.generateRandomRoombaConfig(uuid));
            }
            this.colorUuuidMap.set(roombaConfigs[roombaConfigs.length-1].color, uuid);
        }
        this.syncProxy.initRoombas(roombaConfigs);

        setTimeout(() => {
            this.syncProxy.lockAllGameplay();

            const array = this.scene.getAAAAA();
            Object.keys(array).map((key) => {
                console.log(this.colorUuuidMap.get(array[key]));
            });
            this.syncProxy.endGame([], false);
        }, MAX_GAME_TIME)
    }

    private updateRoombaDirection(id: string, direction: Phaser.Math.Vector2) {
        this.scene.updateRoombaDirection(id, new Phaser.Math.Vector2(direction.x, direction.y));
    }

    private initRoombas(configs: RoombaConfig[]) {
        this.scene.initRoombas(configs);
    }

    private lockAllGameplay() {
        this.locked = true;
        this.scene.stopRoombas();
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
            speed: 150
        }
    }

}