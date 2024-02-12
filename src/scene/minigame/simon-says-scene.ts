/*
import { HEIGHT, WIDTH } from "../../main";
import { SimonSaysBoard } from "../../minigame/simon-says-board";
import { PacketType, PlayerPacket } from "../../types/client";
import { TimeBar } from "../../ui/time-bar";
import MinigameScene from "../base/minigame-scene";
import { Audio } from "../../types";

interface SimonSaysPacket extends PlayerPacket {
    type: PacketType.MINIGAME_SIMON_SAYS,
    data: {
        buttonIndex: number,
    }
}

interface SimonSaysActionPacket extends PlayerPacket {
    type: PacketType.MINIGAME_SIMON_SAYS_ACTION,
    data: {
        action: string,
        data: any,
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
        if (!this.aznopoly.isHost) {
            this.addPacketListener(PacketType.MINIGAME_SIMON_SAYS_ACTION, this.onSimonSaysActionPacket.bind(this));
        }
    }

    create() {
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

        super.create();
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
        console.log("sent", packet)
    };

    private onSimonSaysPacket(packet: SimonSaysPacket) {
        const board = this.playerBoardsMap.get(packet.sender)!;
        board.playButton(packet.data.buttonIndex);

        const sequence = this.playerSequenceMap.get(packet.sender)!;
        sequence.push(packet.data.buttonIndex);
    }

    private onSimonSaysActionPacket(packet: SimonSaysActionPacket) {
        switch(packet.data.action) {
            case "playExampleSequence":
                this.playExampleSequence(packet.data.data[0]);
                break;
            case "lockBoards":
                this.lockBoards();
                break;
            case "unlockBoards":
                this.unlockBoards();
                break;
            case "startTimer":
                this.startTimer(packet.data.data[0]);
                break;
            case "showRoundResult":
                this.showRoundResult(packet.data.data[0]);
                break;
        }
    }

    // STATE SYNC

    private playExampleSequence(sequence: number[]) {
        if(this.aznopoly.isHost) {
            this.mirrorAction("playExampleSequence", [sequence]);
        }

        return this.exampleBoard.playSequence(sequence, 500);
    }

    private lockBoards() {
        if(this.aznopoly.isHost) {
            this.mirrorAction("lockBoards", []);
        }

        this.playerBoardsMap.forEach((board) => {
            board.lock();
        });
    }

    private unlockBoards() {
        if(this.aznopoly.isHost) {
            this.mirrorAction("unlockBoards", []);
        }

        this.playerBoardsMap.forEach((board) => {
            board.unlock();
        });
    }

    private startTimer(time: number) {
        if (this.aznopoly.isHost) {
            this.mirrorAction("startTimer", [time]);
        }

        this.timerBar.resetTime(time);
        this.timerBar.resume();
    }

    private showRoundResult(winner: string[]) {
        if(this.aznopoly.isHost) {
            this.mirrorAction("showRoundResult", [winner]);
        }

        if (winner.includes(this.aznopoly.client.id)) {
            this.soundRight.play();
        } else {
            this.soundWrong.play();
        }
    }

    private mirrorAction(action: string, data: any) {
        const packet: SimonSaysActionPacket = {
            type: PacketType.MINIGAME_SIMON_SAYS_ACTION,
            sender: this.aznopoly.client.id,
            data: {
                action,
                data
            }
        };
        this.aznopoly.client.sendPacket(packet);
    }

    // HOST ONLY
    async onMiniGameStart() {
        this.activePlayer = this.aznopoly.room.connectedPlayerIds.slice();

        await this.startRound(this.generateRandomSequence(4));
        //await this.startRound(this.generateRandomSequence(5));
        //await this.startRound(this.generateRandomSequence(6));

        this.endGame(this.activePlayer, false);
    }

    private async startRound(sequence: number[]) {
        this.currentSequence = sequence;

        this.clearSequences();
        this.lockBoards();
        const delay = 500;
        await this.playExampleSequence(this.currentSequence);
        this.unlockBoards();

        const totalTime = delay * this.currentSequence.length * 1.5 + 1000;
        this.startTimer(totalTime);
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                this.lockBoards();
                this.onRoundOver();
                resolve();
            }, totalTime);
        });
    }

    private onRoundOver() {
        const winner = this.activePlayer.filter((id) => {
            const sequence = this.playerSequenceMap.get(id)!;
            return this.isSequenceCorrect(sequence);
        });

        this.showRoundResult(winner);

        this.activePlayer = winner;
    }

    private clearSequences() {
        this.playerSequenceMap.forEach((sequence) => {
            sequence.length = 0;
        });
    }

    private isSequenceCorrect(sequence: number[]) {
        return sequence.length == this.currentSequence.length && sequence.every((value, index) => value == this.currentSequence[index]);
    }

    private generateRandomSequence(length: number) {
        const sequence: number[] = [];
        for (let i = 0; i < length; i++) {
            sequence.push(Math.floor(Math.random() * 4));
        }
        return sequence;
    }

}
*/