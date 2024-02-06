import MinigameScene from "../minigame-scene";
import { Roomba } from "../../minigame/roomba";
import { HEIGHT, WIDTH } from "../../main";

const GRAPHICS_SWAP_TIME = 1;
const PAINT_REFRESH_TIME = 0.5;
export class RoombaScene extends MinigameScene {

    private roombas: Roomba[] = [];

    private timeSinceLastPaint = 0;
    private timeSinceGraphicsSwap = 0;

    private paint!: Phaser.GameObjects.Graphics; 
    private paintTexture!: Phaser.Textures.DynamicTexture;

    private debugText!: Phaser.GameObjects.Text;

    preload() {

    }

    create() {
        this.physics.world.setBounds(0, 0, 800 * 4, 600 * 4);

        this.paintTexture = this.textures.addDynamicTexture("roomba-paint", WIDTH, HEIGHT)!;
        this.add.sprite(0, 0, "roomba-paint")
                .setOrigin(0, 0)
                .setDepth(-1);
        
        this.paint = this.add.graphics();

        for (let i = 0; i < 5; i++) {
            const x = Math.random() * (WIDTH - Roomba.SIZE * 2) + Roomba.SIZE;
            const y = Math.random() * (HEIGHT - Roomba.SIZE * 2) + Roomba.SIZE;

            const roomba = new Roomba(this, x, y, Math.random() * Math.PI * 2, 0xff0000, 0xee0000, 50);
            this.roombas.push(roomba);
        }
        this.roombas.forEach(roomba => this.add.existing(roomba));
        this.physics.add.collider(this.roombas, this.roombas);
    }

    update(time: number, delta: number) {
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
                //roomba.paintPath(this.currentPaint);
            });
        }
    }


    private graphicSwapUpdate(delta: number) {
        this.timeSinceGraphicsSwap += delta / 1000;
        if (this.timeSinceGraphicsSwap > GRAPHICS_SWAP_TIME) {
            this.timeSinceGraphicsSwap = 0;
            
            this.paintTexture.draw(this.paint, 0, 0);
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
        } else {
            var copyCanvas = Phaser.Display.Canvas.CanvasPool.createWebGL(this, WIDTH, HEIGHT)

            var ctx = copyCanvas.getContext('2d')!;
            ctx.drawImage(this.paintTexture.canvas, 0, 0, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);

            const pixels = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;
            const result = this.readPixelArray(pixels);

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