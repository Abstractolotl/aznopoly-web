import Phaser from 'phaser';
import TitleScene from './scene/title-scene';
import GameScene from './scene/game-scene';

export const WIDTH = 640;
export const HEIGHT = 640;

window.onload = () => {
    let game = new Phaser.Game({
        type: Phaser.AUTO,
        width: WIDTH,
        height: HEIGHT,
        parent: 'app',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        dom: {
            createContainer: true
        }
    });

    game.scene.add('title', TitleScene);
    game.scene.add('game', GameScene);

    game.scene.start('title');

    Object.assign(window, { game });
};
