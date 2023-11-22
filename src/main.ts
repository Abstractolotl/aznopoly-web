import Phaser from 'phaser';

class ExampleScene extends Phaser.Scene {

    preload() {
        this.load.image('abstracto', 'assets/logo.png');
    }

    create() {
        this.add.image(320, 320, 'abstracto');

    }

}

window.onload = () => {

    var game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 640,
        height: 640,
        parent: 'app',
        scene: ExampleScene,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
    });

    Object.assign(window, { game });

};
