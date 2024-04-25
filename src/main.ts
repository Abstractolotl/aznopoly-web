import Phaser from 'phaser';
import TitleScene from './phaser/scenes/title-scene';
import BoardScene from './phaser/scenes/board-scene';
import LobbyScene from './phaser/scenes/lobby-scene';
import AzNopolyGame from './game';
import { RoombaScene } from './phaser/scenes/minigame/roomba-scene';
import { COLOR_BACKGROUND } from './style';

import ShittyShooterScene from './phaser/scenes/minigame/shitty-shooter-scene';
import { SETTINGS } from './settings';
import {RoomEvent} from "@/room.ts";
import {DiscordClient} from "@/util/discord.ts";

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
                gravity: { y: 0, x: 0 },
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

    const params = new URLSearchParams(window.location.search);
    if (params.get('room') !== null) {
        let roomId = params.get('room') as string;
        aznopoly.init(roomId);
        aznopoly.room.addEventListener(RoomEvent.READY, () => {
            game.scene.start('lobby');
        }, {once: true});
    } else if (params.get('discord') !== null) {
        let discordClient = new DiscordClient();
        await discordClient.handleAuthentication();
    } else {
        game.scene.start('title');
    }
    
    Object.assign(window, { game });
};
