import { PLAYER_COLORS } from "@/style";
import AzNopolyGame from "../../../game";
import { Roomba, RoombaConfig } from "../../components/minigame/roomba";
import MinigameScene from "../base/minigame-scene";
import MinigameSceneController from "../base/minigame-scene-controller";
import { RoombaScene } from "./roomba-scene";
import convert from 'color-convert';
import { SETTINGS } from "@/settings";


const MAX_GAME_TIME = 30000;
export default class RoombaSceneController extends MinigameSceneController {

    declare protected scene: RoombaScene;
    private locked = false;
    private colorUuuidMap = new Map<string, string>();

    constructor(scene: RoombaScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly);

        this.scene = scene;
        this.aznopoly = aznopoly;

        this.registerSyncedMethod(this.initRoombas, true);
        this.registerSyncedMethod(this.lockAllGameplay, true);

        this.registerSyncedMethod(this.updateRoombaDirection, false);
    }

    onMiniGameStart(): void {
        this.scene.events.on("roomba-dragged", this.onRoombaDragged.bind(this));

        if (!this.aznopoly.isHost) {
            return;
        }

        const roombaConfigs = this.generateRoombaConfigs();
        this.syncProxy.initRoombas(roombaConfigs);

        setTimeout(() => {
            this.syncProxy.lockAllGameplay();

            const won = this.getPlayersWon();
            this.syncProxy.endGame({playerWon: won, sorted: false});
        }, MAX_GAME_TIME)
    }

    private getPlayersWon() {
        const paintMap = this.scene.getPaintMap();
        const paintedColors = Object.keys(paintMap).filter(e => e != "000000");

        const won = paintedColors.sort()
            .map((key) => this.colorUuuidMap.get(key)!)
            .slice(0, 1);

            return won;
    }

    private onRoombaDragged({ id, offset}: {id: string, offset: Phaser.Math.Vector2}) {
        if (this.locked) return;
        this.syncProxy.updateRoombaDirection(id, offset);
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

    private generateRoombaConfigs() {
        const roombaConfigs = [];
        for (let j = 0; j < this.aznopoly.connectedUuids.length; j++) {
            const uuid = this.aznopoly.connectedUuids[j] ;
            for (let i = 0; i < 4; i++) {
                roombaConfigs.push(this.generateRandomRoombaConfig(uuid));
            }
            this.colorUuuidMap.set(roombaConfigs[roombaConfigs.length-1].paintColor.toString(16).toUpperCase(), uuid);
        }
        return roombaConfigs;
    }

    private generateRandomRoombaConfig(playerid: string) {
        const bounds = MinigameScene.getGameBounds();
        const x = Math.random() * (bounds.width - Roomba.SIZE * 2) + Roomba.SIZE + bounds.x;
        const y = Math.random() * (bounds.height - Roomba.SIZE * 2) + Roomba.SIZE + bounds.y;

        const profile = this.aznopoly.getProfile(playerid);
        const color = PLAYER_COLORS[profile.colorIndex];
        const paintColor = convert.hex.hsl("0x" + color.toString(16).padStart(6, '0'));
        paintColor[2] = 40;
        const paintColorHex = Number("0x" + convert.hsl.hex(paintColor).padStart(6, '0'));
        return { 
            uuid: playerid,
            id: Math.random().toString(36).substring(7),
            x, 
            y, 
            angle: Math.random() * Math.PI * 2,
            color: color,
            paintColor: paintColorHex, 
            speed: SETTINGS.ROOMBA_OUTRAGE.ROOMBA_SPEED
        }
    }

}