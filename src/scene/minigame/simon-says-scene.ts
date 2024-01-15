import { HEIGHT, WIDTH } from "../../main";
import { SimonSaysBoard } from "../../minigame/simon-says-board";
import { PacketType, PlayerPacket } from "../../types/client";
import { TimeBar } from "../../ui/time-bar";
import MinigameScene from "../minigame-scene";
import { Audio } from "../../types";

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
    
    private activePlayer: string[] = [];

    private currentSequence!: number[];
    private timerBar!: TimeBar;

    private soundRight!: Audio;
    private soundWrong!: Audio;

    preload() {
        super.preload();
        SimonSaysBoard.preload(this);
        this.load.audio('right', 'assets/correct.mp3');
        this.load.audio('wrong', 'assets/wrong.mp3');
    }

    init(data: any): void {
        super.init(data);
        this.addPacketListener(PacketType.MINIGAME_SIMON_SAYS, this.onSimonSaysPacket.bind(this));
    }

    async onMinigameStart() {
        this.activePlayer = this.aznopoly.room.connectedPlayerIds.slice();

        await this.startRound(this.generateRandomSequence(4));
        //await this.startRound(this.generateRandomSequence(5));
        //await this.startRound(this.generateRandomSequence(6));

        this.endGame(this.activePlayer, false);
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
            const interactive = id == this.aznopoly.client.id;
            const callback = this.onBoardClick.bind(this);
            const board = new SimonSaysBoard(this, interactive, offsets[index], interactive ? callback : undefined);

            this.playerBoardsMap.set(id, board);
            this.playerSequenceMap.set(id, []);
        });

        this.exampleBoard = new SimonSaysBoard(this, false, {
            x: WIDTH/2 - tileSize * 2, 
            y: HEIGHT/2 - tileSize * 2, 
            size: tileSize
        }, () => {});

        this.lockBoards();
        this.timerBar = new TimeBar(this, WIDTH / 2 - 100, HEIGHT / 2 - 150, 200, 15, 1000);
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

    private onBoardClick(index: number) {
        const playerSequence = this.playerSequenceMap.get(this.aznopoly.client.id)!;
        playerSequence.push(index);

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

        const sequence = this.playerSequenceMap.get(packet.sender)!;
        sequence.push(packet.data.buttonIndex);
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

        const totalTime = delay * this.currentSequence.length * 1.5 + 1000;
        this.timerBar.resetTime(totalTime);
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                this.lockBoards();
                this.onRoundOver();
                resolve();
            }, totalTime);
        });
    }

    private onRoundOver() {
        const mySequence = this.playerSequenceMap.get(this.aznopoly.client.id)!;

        if (this.isSequenceCorrect(mySequence)) {
            this.soundRight.play();
        } else {
            this.soundWrong.play();
        }

        this.activePlayer = this.activePlayer.filter((id) => {
            const sequence = this.playerSequenceMap.get(id)!;
            return this.isSequenceCorrect(sequence);
        });
        
    }

    private isSequenceCorrect(sequence: number[]) {
        return sequence.length == this.currentSequence.length && sequence.every((value, index) => value == this.currentSequence[index]);
    }

}