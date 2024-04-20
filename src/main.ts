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

import * as THREE from 'three';

//import * as WebGLDebugUtils from './webgl-debug.js';
import DebugScene from './phaser/scenes/debug-scene.js';

window.onload = () => {
    setTimeout(async () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('webgl2')!;
        // const debugContext = WebGLDebugUtils.default.makeDebugContext(context,
        //     console.error,
        //     (funcName: string, args: any) => {
        //         if (funcName === "pixelStorei") {
        //             console.log(funcName, args)
        //         }
        //     },
        // );
        document.body.querySelector("#app")!.appendChild(canvas);

        const renderer = new THREE.WebGLRenderer({ canvas, context: context });
        renderer.setSize(SETTINGS.DISPLAY_WIDTH, SETTINGS.DISPLAY_HEIGHT);
        renderer.autoClear = false;

        let game = new Phaser.Game({
            type: Phaser.WEBGL,
            width: SETTINGS.DISPLAY_WIDTH,
            height: SETTINGS.DISPLAY_HEIGHT,
            parent: 'app',
            backgroundColor: COLOR_BACKGROUND,
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
            },
            canvas: canvas,
            context: context as any,
        });
        (game as any).threeRenderer = renderer;

        const aznopoly = new AzNopolyGame();
        game.scene.add('title', new TitleScene(aznopoly));
        game.scene.add('lobby', new LobbyScene(aznopoly));
        game.scene.add('game', new BoardScene(aznopoly));

        //Minigames
        game.scene.add('minigame-roomba', new RoombaScene(aznopoly));
        game.scene.add('minigame-shitty-shooter', new ShittyShooterScene(aznopoly));
        game.scene.add('minigame-water-drop', new WaterDropScene(aznopoly));

        //Debug
        game.scene.add('debug', new DebugScene());

        const params = new URLSearchParams(window.location.search);
        const debug = params.get('debug');
        if (debug !== null) {
            console.log('Debug mode enabled', debug);
            mock(aznopoly);
            game.scene.start(debug || 'lobby');
        } else {
            game.scene.start('title');
        }

        Object.assign(window, { game });

    }, 250)
};