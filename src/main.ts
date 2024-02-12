import Phaser from 'phaser';
import TitleScene from './scene/title-scene';
import BoardScene from './scene/game-scene';
import LobbyScene from './scene/lobby-scene';
import { SimonSaysScene } from './scene/minigame/simon-says-scene';
import AzNopolyGame from './game';
import { RoombaScene } from './scene/minigame/roomba-scene';

export const WIDTH = 1280;
export const HEIGHT = 720;

window.onload = () => {
    let game = new Phaser.Game({
        type: Phaser.AUTO,
        width: WIDTH,
        height: HEIGHT,
        parent: 'app',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: true
            }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        dom: {
            createContainer: true
        }
    });

    const aznopoly = new AzNopolyGame();
    //await mock(aznopoly);
    //console.log("mocked");

    game.scene.add('title', new TitleScene(aznopoly));
    game.scene.add('lobby', new LobbyScene(aznopoly));
    game.scene.add('game', new BoardScene(aznopoly));

    //Minigames
    game.scene.add('minigame-simon-says', new SimonSaysScene(aznopoly))
    game.scene.add('minigame-roomba', new RoombaScene(aznopoly))

    //game.scene.start('minigame-roomba');
    game.scene.start('title');
    
    game.scene.start('title');
    Object.assign(window, { game });
};
