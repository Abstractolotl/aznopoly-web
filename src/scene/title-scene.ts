import { WIDTH } from "../main";
import { FONT_STYLE_BUTTON, FONT_STYLE_BUTTON_HOVER, FONT_STYLE_HEADLINE } from "../style";

export default class TitleScene extends Phaser.Scene {
    background!: Phaser.GameObjects.Image;
    btnJoinLobby!: Phaser.GameObjects.Text;
    btnCreateLobby!: Phaser.GameObjects.Text;
    domContainer!: Phaser.GameObjects.DOMElement;

    preload() {
        this.load.image('abstracto', 'assets/title_background.png');
        this.load.html('test', 'assets/test.html');
    }

    create() {
        this.background = this.add.image(0, 0, 'abstracto');
        const targetScale = WIDTH / this.background.width;
        this.background.setScale(targetScale);
        this.background.setOrigin(0, 0);
        console.log(this.background.getBounds());

        this.add.text(320, 100, 'AzNopoly', FONT_STYLE_HEADLINE).setOrigin(0.5, 0);
        this.btnJoinLobby = this.add.text(100, 350, 'Join Lobby', FONT_STYLE_BUTTON).setOrigin(0, 0);
        this.btnCreateLobby = this.add.text(100, 400, 'Create Lobby', FONT_STYLE_BUTTON).setOrigin(0, 0);

        this.domContainer = this.add.dom(320, 300);
        this.domContainer.createFromCache('test');
        let input: HTMLInputElement = this.domContainer.getChildByID('test_input') as HTMLInputElement;        
        input.value = 'test';

        for (const btn of [this.btnJoinLobby, this.btnCreateLobby]) {
            btn.setInteractive();
            btn.on('pointerover', () => {
                btn.setX(110);
                btn.setStyle(FONT_STYLE_BUTTON_HOVER);
            });
            btn.on('pointerout', () => {
                btn.setX(100);
                btn.setStyle(FONT_STYLE_BUTTON);
            });
        }

        this.btnCreateLobby.on('pointerdown', () => {
            this.scene.start('game', {
                name: input.value,
                room: this.generateRoomName()
            });
        });
    }

    generateRoomName(length: number = 6) : string {
        let roomName = "";
        let characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            roomName += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return roomName;
    }
}

