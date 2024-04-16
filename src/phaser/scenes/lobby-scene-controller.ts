import AzNopolyGame from "../../game";
import { RoomEvent } from "../../room";
import { SceneSwitcher } from "../../util/scene-switcher";
import { PlayerProfile } from "../components/ui/player-info";
import NetworkSceneController from "./base/base-scene-controller";
import LobbyScene from "./lobby-scene";


export default class LobbySceneController extends NetworkSceneController {

    declare protected scene: LobbyScene;

    constructor(scene: LobbyScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly);
        SceneSwitcher.listen(scene, aznopoly)

        this.registerSyncedMethod(this.updatePlayerProfile, false);
    }

    onSceneCreate(): void {
        this.aznopoly.room.addEventListener(RoomEvent.JOIN, this.onRoomJoined.bind(this));
        this.aznopoly.room.addEventListener(RoomEvent.LEAVE, this.onRoomUpdated.bind(this));
        this.aznopoly.room.addEventListener(RoomEvent.READY, this.onRoomReady.bind(this));
        this.aznopoly.room.addEventListener(RoomEvent.UPDATE, this.onRoomUpdated.bind(this));
        
        this.updatePlayerList();
    }

    public updatePlayerProfile(profile: PlayerProfile) {
        const sender = arguments[arguments.length - 1];

        this.aznopoly.setProfile(sender, profile);
        this.updatePlayerList();
    }

    private onRoomReady() {
        this.syncProxy.updatePlayerProfile(this.aznopoly.getProfile(this.aznopoly.uuid));
    }

    private onRoomJoined() {
        this.syncProxy.updatePlayerProfile(this.aznopoly.getProfile(this.aznopoly.uuid));
    }

    private onRoomUpdated() {
        //this.updatePlayerList();
    }

    private updatePlayerList() {
        const players = this.aznopoly.connectedUuids
            .map(uuid => {
                try {
                    return this.aznopoly.getProfile(uuid)
                } catch (ignored) {

                }
            })
            .filter(e => e !== undefined);
        this.scene.updatePlayerList(players as PlayerProfile[]);
    }

    public onStartClick() {
        this.scene.scene.start('game');
    }

    public onLeaveLobbyClick() {
        this.scene.scene.start('title');
    }

}