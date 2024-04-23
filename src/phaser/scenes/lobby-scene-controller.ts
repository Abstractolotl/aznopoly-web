import { PLAYER_COLORS } from "@/style";
import AzNopolyGame from "../../game";
import { RoomEvent } from "../../room";
import { SceneSwitcher } from "../../util/scene-switcher";
import { PlayerProfile } from "../components/ui/player-info";
import NetworkSceneController from "./base/base-scene-controller";
import LobbyScene from "./lobby-scene";
import { Avatars } from "../components/ui/avatar";

export default class LobbySceneController extends NetworkSceneController {

    declare protected scene: LobbyScene;

    private unknownUsers: string[] = [];

    constructor(scene: LobbyScene, aznopoly: AzNopolyGame) {
        super(scene, aznopoly);
        SceneSwitcher.listen(scene, aznopoly)

        this.registerSyncedMethod(this.sendProfileUpdateIntent, false);
        this.registerSyncedMethod(this.updateProfile, true);
    }

    onSceneCreate(): void {
        this.aznopoly.room.addEventListener(RoomEvent.JOIN, this.onRoomJoined.bind(this) as EventListener);
        this.aznopoly.room.addEventListener(RoomEvent.LEAVE, this.onRoomUpdated.bind(this));
        this.aznopoly.room.addEventListener(RoomEvent.UPDATE, this.onRoomUpdated.bind(this));
        
        this.syncProxy.sendProfileUpdateIntent(this.aznopoly.getProfile(this.aznopoly.uuid));
        this.scene.setNumConnectedPlayers(this.aznopoly.connectedUuids.length);
    }

    public sendProfileUpdateIntent(profile: PlayerProfile) {
        if (!this.aznopoly.isHost) {
            return;
        }
        
        const sender = arguments[arguments.length - 1];

        // check wether profile is valid
        this.validateProfile(sender, profile);

        // send profile to all players
        this.syncProxy.updateProfile(sender, profile);
    }

    private updateProfile(uuid: string, profile: PlayerProfile) {
        this.aznopoly.setProfile(uuid, profile);

        if (this.unknownUsers.includes(uuid)) {
            this.unknownUsers = this.unknownUsers.filter(e => e !== uuid);
            this.syncProxy.sendProfileUpdateIntent(this.aznopoly.getProfile(this.aznopoly.uuid));
        }
        this.updatePlayerList();
    }

    private validateProfile(uuid: string, profile: PlayerProfile) {
        console.log("Validating profile", uuid, profile)
        const otherPlayers = this.aznopoly.connectedUuids.filter(e => e !== uuid);

        const usedColors = otherPlayers.map(e => this.aznopoly.getProfile(e).colorIndex);
        const usedAvatars = otherPlayers.map(e => this.aznopoly.getProfile(e).avatar);
        const usedNames = otherPlayers.map(e => this.aznopoly.getProfile(e).name);
        
        if (usedColors.includes(profile.colorIndex)) {
            const availableColors = PLAYER_COLORS.map((_, i) => i).filter(e => !usedColors.includes(e));
            profile.colorIndex = availableColors[Math.floor(Math.random() * availableColors.length)];
        }

        if (usedAvatars.includes(profile.avatar)) {
            const availableAvatars = Object.values(Avatars).filter(e => !usedAvatars.includes(e));
            profile.avatar = availableAvatars[Math.floor(Math.random() * availableAvatars.length)];
        }

        if (usedNames.includes(profile.name)) {
            profile.name = profile.name + " 2";
        }
    }

    private onRoomJoined(packet: CustomEvent<string>) {
        const uuid = packet.detail;
        this.unknownUsers.push(uuid);
        this.scene.setNumConnectedPlayers(this.aznopoly.connectedUuids.length);
    }

    private onRoomUpdated() {
        this.scene.setNumConnectedPlayers(this.aznopoly.connectedUuids.length);
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