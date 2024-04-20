import AzNopolyGame from "../../game";
import { RoomEvent } from "../../room";
import { SceneSwitcher } from "../../util/scene-switcher";
import { PlayerProfile } from "../components/ui/player-info";
import NetworkSceneController from "./base/base-scene-controller";
import LobbyScene from "./lobby-scene";


export default class LobbySceneController extends NetworkSceneController {

    declare protected scene: LobbyScene;

    private unknownUsers: string[] = [];

    constructor(scene: LobbyScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly);
        SceneSwitcher.listen(scene, aznopoly)

        this.registerSyncedMethod(this.updatePlayerProfile, false);
    }

    onSceneCreate(): void {
        this.aznopoly.room.addEventListener(RoomEvent.JOIN, this.onRoomJoined.bind(this) as EventListener);
        this.aznopoly.room.addEventListener(RoomEvent.LEAVE, this.onRoomUpdated.bind(this));
        this.aznopoly.room.addEventListener(RoomEvent.UPDATE, this.onRoomUpdated.bind(this));
        
        this.syncProxy.updatePlayerProfile(this.aznopoly.getProfile(this.aznopoly.uuid));
    }

    public updatePlayerProfile(profile: PlayerProfile) {
        const sender = arguments[arguments.length - 1];

        if (this.unknownUsers.includes(sender)) {
            this.unknownUsers = this.unknownUsers.filter(e => e !== sender);
            this.syncProxy.updatePlayerProfile(this.aznopoly.getProfile(this.aznopoly.uuid));
        }

        this.aznopoly.setProfile(sender, profile);
        this.updatePlayerList();
    }

    private onRoomJoined(packet: CustomEvent<string>) {
        const uuid = packet.detail;
        this.unknownUsers.push(uuid);
    }

    private onRoomUpdated() {
        this.updatePlayerList();
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
        this.scene.cameras.main.fadeOut(100, 0, 0, 0, (_: any, progress: number) => {
            if (progress === 1) {
                this.scene.scene.start('game');
            }
        });
    }

    public onLeaveLobbyClick() {
        this.scene.scene.start('title');
    }

}