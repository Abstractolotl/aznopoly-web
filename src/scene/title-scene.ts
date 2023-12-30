import AzNopolyGame from "../game";
import { WIDTH } from "../main";
import { RoomEvent } from "../room";
import { AzNopolyButton } from "../ui/button";

export default class TitleScene extends Phaser.Scene {
    private background!: Phaser.GameObjects.Image;
    private btnJoinLobby!: AzNopolyButton;
    private btnCreateLobby!: AzNopolyButton;
    
    private domContainer!: Phaser.GameObjects.DOMElement;
    private domNameInput!: HTMLInputElement;
    private domLobbyCodeInput!: HTMLInputElement;
    
    preload() {
        this.load.image('abstracto', 'assets/title.png');
        this.load.html('input_mask', 'assets/title_screen.html');
    }

    create() {
        this.background = this.add.image(0, 0, 'abstracto');
        const targetScale = WIDTH / this.background.width;
        this.background.setScale(targetScale);
        this.background.setOrigin(0, 0);

        this.domContainer = this.add.dom(320, 300);
        this.domContainer.createFromCache('input_mask');
        this.domLobbyCodeInput = this.domContainer.getChildByID('title-lobby-code-input') as HTMLInputElement;     
        this.domNameInput = this.domContainer.getChildByID('title-name-input') as HTMLInputElement;        
        this.domNameInput.value = 'test';

        this.initButtons();
    }

    update(time: number, delta: number): void {
        this.btnJoinLobby.update(time, delta);
        this.btnCreateLobby.update(time, delta);
    }

    private initButtons() {
        const centerX = WIDTH / 2;
        this.btnJoinLobby = new AzNopolyButton(this, 'Join Lobby', centerX - 250, 600, this.onJoinRoomClick.bind(this));
        this.btnCreateLobby = new AzNopolyButton(this, 'Create Lobby', centerX + 250, 600, this.onCreateRoom.bind(this));
    }

    generateRoomName(length: number = 6) : string {
        let roomName = "";
        let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            roomName += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return roomName;
    }

    private onJoinRoomClick() {
        const name = this.domNameInput.value;
        const room = this.domLobbyCodeInput.value;
        this.joinRoom(room, name);
    }

    private onCreateRoom() {
        const name = this.domNameInput.value;
        const room = this.generateRoomName();
        this.joinRoom(room, name);
    }

    private joinRoom(room: string, name: string) {
        const aznopoly = new AzNopolyGame(room, name);
        aznopoly.room.addEventListener(RoomEvent.READY, () => {
            this.scene.start('lobby', { aznopoly });
        }, { once: true });
    }
}

