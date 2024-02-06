import Phaser from 'phaser';
import TitleScene from './scene/title-scene';
import GameScene from './scene/game-scene';
import LobbyScene from './scene/lobby-scene';
import { SimonSaysScene } from './scene/minigame/simon-says-scene';
import AzNopolyGame from './game';
import { mock } from './debug-util';
import { RoombaScene } from './scene/minigame/roomba-scene';

export const WIDTH = 1280;
export const HEIGHT = 720;

window.onload = async () => {
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

    //Minigames
    game.scene.add('minigame-simon-says', new SimonSaysScene(aznopoly))
    game.scene.add('minigame-roomba', new RoombaScene(aznopoly))
    

    await mock(aznopoly);
    console.log("mocked");

    game.scene.start('minigame-roomba');
    //game.scene.start('title');
    
    Object.assign(window, { game });
};
