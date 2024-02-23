import AzNopolyGame from "../game";
import { RoomEvent } from "../room";
import { SceneSwitcher } from "../scene-switcher";
import NetworkSceneController from "./base/base-scene-controller";
import LobbyScene from "./lobby-scene";


export default class LobbySceneController extends NetworkSceneController {

    declare protected scene: LobbyScene;

    constructor(scene: LobbyScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly);
        SceneSwitcher.listen(scene, aznopoly)
    }

    onSceneCreate(): void {
        this.aznopoly.room.addEventListener(RoomEvent.JOIN, this.onRoomUpdated.bind(this));
        this.aznopoly.room.addEventListener(RoomEvent.LEAVE, this.onRoomUpdated.bind(this));
        this.aznopoly.room.addEventListener(RoomEvent.READY, this.onRoomUpdated.bind(this));
        this.aznopoly.room.addEventListener(RoomEvent.UPDATE, this.onRoomUpdated.bind(this));
        
        this.updatePlayerList();
    }

    private onRoomUpdated() {
        this.updatePlayerList();
    }

    private updatePlayerList() {
        const players = this.aznopoly.connectedUuids.map(uuid => this.aznopoly.getProfile(uuid));
        this.scene.updatePlayerList(players);
    }

    public onStartClick() {
        this.scene.scene.start('game');
    }

    public onLeaveLobbyClick() {
        this.scene.scene.start('title');
    }

}