import AzNopolyGame from "../../game";
import { RoomEvent } from "../../room";
import TitleScene from "./title-scene";


export default class TitleSceneController  {
    
    private musicOn: boolean = true;

    private scene: TitleScene;
    private aznopoly: AzNopolyGame;

    constructor(scene: TitleScene, aznopoly: AzNopolyGame) {
        this.scene = scene;
        this.aznopoly = aznopoly;
    }

    public onMusicButtonClicked() {
        if (this.musicOn) {
            this.scene.stopMusic();
            this.musicOn = false;
        } else {
            this.scene.startMusic();
            this.musicOn = true;
        }
    }

    public onJoinRoomClick() {
        const code = this.scene.getInputtedLobbyCode();
        if (!code || code.length !== 6) {
            return
        }
        
        this.joinRoom(code);
    }

    public onCreateRoom() {
        const room = this.generateRoomName();
        this.joinRoom(room);
    }

    private joinRoom(room: string) {
        this.scene.playStartSound();
        setTimeout(() => {
            this.scene.stopMusic();
            this.aznopoly.init(room);
            this.aznopoly.room.addEventListener(RoomEvent.READY, () => {
                this.scene.scene.start('lobby');
            }, { once: true });
        }, 500)
    }

    private generateRoomName(length: number = 6) : string {
        let roomName = "";
        let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            roomName += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return roomName;
    }

}