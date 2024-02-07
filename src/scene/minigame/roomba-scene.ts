import MinigameScene, { MinigameReadyPacket } from "../minigame-scene";
import { Roomba, RoombaConfig } from "../../minigame/roomba";
import { HEIGHT, WIDTH } from "../../main";
import RoombaSceneController from "./roomba-scene-controller";
import AzNopolyGame from "../../game";
import ColorProgressBar from "../../minigame/color-progressbar";
import convert from 'color-convert';

const GRAPHICS_SWAP_TIME = 1;
const PAINT_REFRESH_TIME = 0.5;
export class RoombaScene extends MinigameScene {

    private controller: RoombaSceneController;

    private roombas: Roomba[] = [];

    private timeSinceLastPaint = 0;
    private timeSinceGraphicsSwap = 0;

    private paint!: Phaser.GameObjects.Graphics; 
    private paintTexture!: Phaser.Textures.DynamicTexture;

    private colorProgressBar!: ColorProgressBar;

    constructor(aznopoly: AzNopolyGame) {
        super(aznopoly, true);
        
        this.controller = new RoombaSceneController(this, aznopoly);
    }

    preload() {
        super.preload();
    }

    create() {
        super.create();
        this.physics.world.setBounds(0, 0, WIDTH, HEIGHT);
        this.physics.world.fixedStep = true;

        this.paint = this.add.graphics();
        this.paintTexture = this.textures.addDynamicTexture("roomba-paint", WIDTH, HEIGHT)!;

        this.colorProgressBar = new ColorProgressBar(this, WIDTH / 2 - 200, 25, 400, 40);
        
        this.add.sprite(0, 0, "roomba-paint").setOrigin(0, 0).setDepth(-1);
        this.add.existing(this.colorProgressBar);
    }

    update(_: number, delta: number) {
        this.paintRoombaUpdate(delta);
        this.graphicSwapUpdate(delta);
    }
    
    onMiniGameStart() {
        this.controller.onSceneReady();
        if (this.aznopoly.isHost) {
            this.controller.hostInit();
        }
    }

    public initRoombas(configs: RoombaConfig[]) {
        this.roombas = configs.map(config => new Roomba(this, config));
        this.roombas.forEach(roomba => {
            this.add.existing(roomba)
            roomba.paintPath(this.paint);
        });
        this.physics.add.collider(this.roombas, this.roombas);
    }

    public updateRoombaDirection(roombaId: String, direction: Phaser.Math.Vector2) {
        const roomba = this.roombas.find(roomba => roomba.id === roombaId);
        if (roomba) {
            roomba.updateDirection(direction);
        } else {
            console.error("Roomba not found");
        }
    }

    private paintRoombaUpdate(delta: number) {
        this.timeSinceLastPaint += delta / 1000;
        if (this.timeSinceLastPaint > PAINT_REFRESH_TIME) {
            this.timeSinceLastPaint = 0;
            this.roombas.forEach(roomba => {
                roomba.paintPath(this.paint);
            });
        }
    }

    private graphicSwapUpdate(delta: number) {
        this.timeSinceGraphicsSwap += delta / 1000;
        if (this.timeSinceGraphicsSwap > GRAPHICS_SWAP_TIME) {
            this.timeSinceGraphicsSwap = 0;
            
            this.paintTexture.draw(this.paint, 0, 0);
            this.calculatePaintPercentage();

            this.paint.clear();
        }
    }

    private calculatePaintPercentage() {
        if (this.paintTexture.renderTarget) {
            const renderer = this.paintTexture.renderer as Phaser.Renderer.WebGL.WebGLRenderer;

            var total = WIDTH * HEIGHT * 4;
            var pixels = new Uint8ClampedArray(total);
            
            const prevFramebuffer = renderer.currentFramebuffer;
            renderer.setFramebuffer(this.paintTexture.renderTarget.framebuffer)
            renderer.gl.readPixels(0, 0, WIDTH, HEIGHT, renderer.gl.RGBA, renderer.gl.UNSIGNED_BYTE, pixels);
            renderer.setFramebuffer(prevFramebuffer);

            const result = this.readPixelArray(pixels);
            this.updateProgressBar(result);
        } else {
            var copyCanvas = Phaser.Display.Canvas.CanvasPool.createWebGL(this, WIDTH, HEIGHT)

            var ctx = copyCanvas.getContext('2d')!;
            ctx.drawImage(this.paintTexture.canvas, 0, 0, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);

            const pixels = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;
            const result = this.readPixelArray(pixels);
            this.updateProgressBar(result);

            Phaser.Display.Canvas.CanvasPool.remove(copyCanvas);
        }
    }

    private updateProgressBar(colors: {[key: string]: number}) {
        const colorMap = new Map<number, number>();
        for (const [color, percentage] of Object.entries(colors)) {
            colorMap.set(parseInt(color, 16), percentage);
        }
        this.colorProgressBar.setColors(colorMap);
    }

    private readPixelArray(pixels: Uint8ClampedArray) {
        const colors: {[key: string]: number} = {};
        for (let x = 0; x < WIDTH; x++) {
            for (let y = 0; y < HEIGHT; y++) {
                const index = (x + y * WIDTH) * 4;
                const r = pixels[index];
                const g = pixels[index + 1];
                const b = pixels[index + 2];

                const rgbHex = convert.rgb.hex([r, g, b]);
                colors[rgbHex] = colors[rgbHex] ? colors[rgbHex] + 1 : 1;
            }
        }
        return Object.keys(colors)
                .sort((a, b) => colors[b] - colors[a])
                .slice(0, 5)
                .reduce((prev, cur) => {
                    prev[cur] = (colors[cur] / (WIDTH * HEIGHT));
                    return prev;
                }, {} as {[key: string]: number});

    }


}