import Phaser from 'phaser';
import TitleScene from './scene/title-scene';
import GameScene from './scene/game-scene';
import LobbyScene from './scene/lobby-scene';
import AzNopolyGame from './game';

export const WIDTH = 1280;
export const HEIGHT = 720;

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

    const aznopoly = new AzNopolyGame();

    game.scene.add('title', new TitleScene(aznopoly));
    game.scene.add('lobby', new LobbyScene(aznopoly));
    game.scene.add('game', new GameScene(aznopoly));

    game.scene.start('title');
    Object.assign(window, { game });
};
