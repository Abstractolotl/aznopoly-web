import { Scene } from "phaser";
import MinigameScene from "../minigame-scene";
import { Roomba } from "../../minigame/roomba";
import { HEIGHT, WIDTH } from "../../main";


const PAINT_REFRESH_TIME = 0.5;

const NUM_GRAPHICS = 1;
const GRAPHICS_SWAP_TIME = 2;
export class RoombaScene extends MinigameScene {

    private currentPaint!: Phaser.GameObjects.Graphics; 
    private paintGraphics: Phaser.GameObjects.Graphics[] = [];
    private roombas: Roomba[] = [];

    private timeSinceLastPaint = 0;
    private timeSinceGraphicsSwap = 0;
    private numPaintSwaps = 0;

    private dynTexture!: Phaser.Textures.DynamicTexture;

    preload() {

    }

    private fpsCounter!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    create() {
        this.fpsCounter = this.add.text(0, 0, "FPS: 0", { color: "yellow" }).setDepth(100);
        this.scoreText = this.add.text(0, 20, "", { color: "yellow" }).setDepth(100);
        this.dynTexture = this.textures.addDynamicTexture("roomba-test", WIDTH, HEIGHT)!;
        this.add.sprite(0, 0, "roomba-test").setOrigin(0, 0).setDepth(-1);
        
        for (let i = 0; i < NUM_GRAPHICS; i++) {
            const paint = new Phaser.GameObjects.Graphics(this);
            this.paintGraphics.push(paint);
            this.add.existing(paint);
        }
        this.currentPaint = this.paintGraphics[0];

        for (let i = 0; i < 20; i++) {
            const color = ["red", "green", "blue", "yellow"][Math.floor(Math.random() * 4)] as "red" | "green" | "blue" | "yellow";
            const x = Math.random() * (WIDTH - Roomba.SIZE * 2) + Roomba.SIZE;
            const y = Math.random() * (HEIGHT - Roomba.SIZE * 2) + Roomba.SIZE;

            const roomba = new Roomba(this, x, y, Math.random() * Math.PI * 2, color);
            this.roombas.push(roomba);
            roomba.paintPath(this.currentPaint);
        }
        this.roombas.forEach(roomba => this.add.existing(roomba));
    }

    update(time: number, delta: number) {
        this.fpsCounter.text = "FPS: " + this.game.loop.actualFps;
        this.paintRoombaUpdate(delta);
        this.graphicSwapUpdate(delta);
    }
    
    onMinigameStart(): void {
        
    }

    private paintRoombaUpdate(delta: number) {
        this.timeSinceLastPaint += delta / 1000;
        if (this.timeSinceLastPaint > PAINT_REFRESH_TIME) {
            this.timeSinceLastPaint = 0;
            this.roombas.forEach(roomba => {
                roomba.paintPath(this.currentPaint);
            });
        }
    }


    private graphicSwapUpdate(delta: number) {
        this.timeSinceGraphicsSwap += delta / 1000;
        if (this.timeSinceGraphicsSwap > GRAPHICS_SWAP_TIME) {
            this.timeSinceGraphicsSwap = 0;

            // this.currentPaint.generateTexture('roomba-paint-' + this.numPaintSwaps);
            // this.add.image(0, 0, 'roomba-paint-' + this.numPaintSwaps)
            //         .setOrigin(0, 0)
            //         .setDepth(-1);
            this.dynTexture.draw(this.currentPaint, 0, 0);
            this.calculatePaintPercentage();

            this.numPaintSwaps++;
            this.currentPaint.clear();
            //this.currentPaint = this.paintGraphics[1 - this.paintGraphics.indexOf(this.currentPaint)];
        }
    }

    private calculatePaintPercentage() {
        if (this.dynTexture.renderTarget) {
            const renderer = this.dynTexture.renderer as Phaser.Renderer.WebGL.WebGLRenderer;

            var total = WIDTH * HEIGHT * 4;
            var pixels = new Uint8ClampedArray(total);
            
            const prevFramebuffer = renderer.currentFramebuffer;
            renderer.setFramebuffer(this.dynTexture.renderTarget.framebuffer)
            renderer.gl.readPixels(0, 0, WIDTH, HEIGHT, renderer.gl.RGBA, renderer.gl.UNSIGNED_BYTE, pixels);
            renderer.setFramebuffer(prevFramebuffer);

            const result = this.readPixelArray(pixels);
            this.scoreText.text = Object.keys(result).map(e => e + ": " + result[e]).join("\n");
        } else {
            var copyCanvas = Phaser.Display.Canvas.CanvasPool.createWebGL(this, WIDTH, HEIGHT)

            var ctx = copyCanvas.getContext('2d')!;
            ctx.drawImage(this.dynTexture.canvas, 0, 0, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);

            const pixels = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;
            const result = this.readPixelArray(pixels);
            this.scoreText.text = Object.keys(result).map(e => e + ": " + result[e]).join("\n");

            Phaser.Display.Canvas.CanvasPool.remove(copyCanvas);
        }
    }

    private readPixelArray(pixels: Uint8ClampedArray) {
        const colors: {[key: string]: number} = {};
        for (let x = 0; x < WIDTH; x++) {
            for (let y = 0; y < HEIGHT; y++) {
                const index = (x + y * WIDTH) * 4;
                const r = pixels[index];
                const g = pixels[index + 1];
                const b = pixels[index + 2];
                const a = pixels[index + 3];

                const rgbHex = r.toString(16) + g.toString(16) + b.toString(16) + a.toString(16);
                colors[rgbHex] = colors[rgbHex] ? colors[rgbHex] + 1 : 1;
            }
        }
        return Object.keys(colors)
                .sort((a, b) => colors[b] - colors[a])
                .slice(0, 5)
                .reduce((prev, cur) => {
                    prev[cur] = (colors[cur] / (WIDTH * HEIGHT)) * 100;
                    return prev;
                }, {} as {[key: string]: number});

    }


}