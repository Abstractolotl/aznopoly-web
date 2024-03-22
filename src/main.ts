import Phaser from 'phaser';
import TitleScene from './phaser/scenes/title-scene';
import BoardScene from './phaser/scenes/board-scene';
import LobbyScene from './phaser/scenes/lobby-scene';
import AzNopolyGame from './game';
import { RoombaScene } from './phaser/scenes/minigame/roomba-scene';
import { mock } from './util/debug-util';
import { COLOR_BACKGROUND } from './style';

import ShittyShooterScene from './phaser/scenes/minigame/shitty-shooter-scene';
import { SETTINGS } from './settings';
import WaterDropScene from './phaser/scenes/minigame/water-drop-scene';

window.onload = async () => {
    let game = new Phaser.Game({
        type: Phaser.AUTO,
        width: SETTINGS.DISPLAY_WIDTH,
        height: SETTINGS.DISPLAY_HEIGHT,
        parent: 'app',
        backgroundColor: COLOR_BACKGROUND,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
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
    game.scene.add('title', new TitleScene(aznopoly));
    game.scene.add('lobby', new LobbyScene(aznopoly));
    game.scene.add('game', new BoardScene(aznopoly));

    //Minigames
    game.scene.add('minigame-roomba', new RoombaScene(aznopoly));
    game.scene.add('minigame-shitty-shooter', new ShittyShooterScene(aznopoly));
    game.scene.add('minigame-water-drop', new WaterDropScene(aznopoly));

    if (!true) {
        mock(aznopoly);
        game.scene.start('minigame-water-drop');
    } else {
        game.scene.start('title');
    }
    
    Object.assign(window, { game });
};
