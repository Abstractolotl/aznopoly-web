import AzNopolyGame from "../../game";
import { HEIGHT, WIDTH } from "../../main";
import { SimonSaysBoard } from "../../minigame/simon-says-board";
import { SceneSwitcher } from "../../scene-switcher";
import { PacketType, PlayerPacket } from "../../types/client";
import { TimeBar } from "../../ui/time-bar";
import { BaseScene } from "../base-scene";
import MinigameScene from "../minigame-scene";

type Audio = Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound

interface SimonSaysPacket extends PlayerPacket {
    type: PacketType.MINIGAME_SIMON_SAYS,
    data: {
        buttonIndex: number,
    }
}

const SCENE_NAME = "simon-says";
export class SimonSaysScene extends MinigameScene {
    
    private exampleBoard!: SimonSaysBoard;
    private playerBoardsMap: Map<string, SimonSaysBoard> = new Map();
    private playerSequenceMap: Map<string, number[]> = new Map();

    private currentSequence!: number[];
    private timerBar!: TimeBar;

    private soundRight!: Audio
    private soundWrong!: Audio;

    preload() {
        super.preload();
        SimonSaysBoard.preload(this);
        this.load.audio('right', 'assets/bloop.mp3');
        this.load.audio('wrong', 'assets/button_out.mp3');
    }

    async onMinigameStart() {
        await this.startRound(this.generateRandomSequence(4));
        await this.startRound(this.generateRandomSequence(5));
        await this.startRound(this.generateRandomSequence(6));
    }

    create() {
        super.create();

        this.soundRight = this.sound.add('right');
        this.soundWrong = this.sound.add('wrong');

        const tileSize = 75;
        const offset = 300;
        const offsets = [
            {x: 0, y: 0, size: tileSize},
            {x: WIDTH-offset, y: 0, size: tileSize},
            {x: 0, y: HEIGHT-offset, size: tileSize},
            {x: WIDTH-offset, y: HEIGHT-offset, size: tileSize},
        ]
        this.aznopoly.room.connectedPlayerIds.forEach((id, index) => {
            console.log("Creating board for", id, index);
            const callback = (index: number) => {
                this.onBoardClick(index, id);
            };
            const interactive = id == this.aznopoly.client.id;
            const board = new SimonSaysBoard(this, interactive, offsets[index], callback);

            this.playerBoardsMap.set(id, board);
            this.playerSequenceMap.set(id, []);
        });

        this.exampleBoard = new SimonSaysBoard(this, false, {
            x: WIDTH/2 - tileSize * 2, 
            y: HEIGHT/2 - tileSize * 2, 
            size: tileSize
        }, () => {});

        this.lockBoards();
        setTimeout(() => { this.onAllPlayerReady()}, 1000)
        this.timerBar = new TimeBar(this, 100, 100, 200, 15, 1000);
        this.timerBar.pause();
        this.add.existing(this.timerBar);
    }

    private generateRandomSequence(length: number) {
        const sequence: number[] = [];
        for (let i = 0; i < length; i++) {
            sequence.push(Math.floor(Math.random() * 4));
        }
        return sequence;
    }

    private onBoardClick(index: number, player: string) {
        const playerSequence = this.playerSequenceMap.get(player)!;
        playerSequence.push(index);
        this.soundRight.play();

        if (player != this.aznopoly.client.id) return;
        const packet: SimonSaysPacket = {
            type: PacketType.MINIGAME_SIMON_SAYS,
            sender: this.aznopoly.client.id,
            data: {
                buttonIndex: index,
            }
        };
        this.aznopoly.client.sendPacket(packet);
    };

    private onSimonSaysPacket(packet: SimonSaysPacket) {
        const board = this.playerBoardsMap.get(packet.sender)!;
        board.playButton(packet.data.buttonIndex);
        //this.soundRight.play();
    }

    private lockBoards() {
        this.playerBoardsMap.forEach((board) => {
            board.lock();
        });
    }

    private unlockBoards() {
        this.playerBoardsMap.forEach((board) => {
            board.unlock();
        });
    }

    private clearSequences() {
        this.playerSequenceMap.forEach((sequence) => {
            sequence.length = 0;
        });
    }

    private async startRound(sequence: number[]) {
        this.currentSequence = sequence;

        this.clearSequences();
        this.lockBoards();
        const delay = 500;
        await this.exampleBoard.playSequence(this.currentSequence, delay);
        this.unlockBoards();

        const totalTime = delay * this.currentSequence.length + 1000;
        this.timerBar.resetTime(totalTime);
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                console.log(this.playerSequenceMap.values())
                this.lockBoards();
                this.onRoundOver();
                resolve();
            }, totalTime);
        });
    }

    private onRoundOver() {
        if (!this.aznopoly.isHost) return;


    }

}