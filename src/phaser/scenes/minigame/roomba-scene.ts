import MinigameScene from "../base/minigame-scene";
import { Roomba, RoombaConfig } from "../../components/minigame/roomba";
import RoombaSceneController from "./roomba-scene-controller";
import AzNopolyGame from "../../../game";
import ColorProgressBar from "../../components/minigame/color-progressbar";
import convert from 'color-convert';
import { FRAME_PADDING } from "@/style";
import { SETTINGS } from "@/settings";

const GRAPHICS_SWAP_TIME = 1000000;
const PAINT_REFRESH_TIME = 0.2;
export class RoombaScene extends MinigameScene<RoombaSceneController> {

    private roombas: Roomba[] = [];

    private timeSinceLastPaint = 0;
    private timeSinceGraphicsSwap = 0;

    private paint!: Phaser.GameObjects.Graphics; 
    private paintTexture!: Phaser.Textures.DynamicTexture;

    private colorProgressBar!: ColorProgressBar;

    constructor(aznopoly: AzNopolyGame) {
        super(aznopoly);
    }

    init() {
        this.controller = new RoombaSceneController(this, this.aznopoly);
        this.roombas = []
        this.timeSinceLastPaint = 0;
        this.timeSinceGraphicsSwap = 0;
    }

    preload() {
        super.preload();
        Roomba.preload(this);
    }

    create() {
        super.create();

        const bounds = MinigameScene.getGameBounds();
        this.physics.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
        this.physics.world.fixedStep = true;

        this.paint = this.add.graphics();
        this.paintTexture = this.textures.addDynamicTexture("roomba-paint", SETTINGS.DISPLAY_WIDTH, SETTINGS.DISPLAY_HEIGHT)!;
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.paint.destroy();
            this.paintTexture.destroy();
        });

        const rightpanel = MinigameScene.getRightBounds();
        this.colorProgressBar = new ColorProgressBar(this, rightpanel.x + FRAME_PADDING, rightpanel.y + FRAME_PADDING , rightpanel.width - FRAME_PADDING*2, 40);
        
        this.add.sprite(0, 0, "roomba-paint").setOrigin(0, 0).setDepth(0);
        this.add.existing(this.colorProgressBar);
    }

    update(_: number, delta: number) {
        super.update(_, delta);
        this.paintRoombaUpdate(delta);
        this.graphicSwapUpdate(delta);
    }

    public initRoombas(configs: RoombaConfig[]) {
        this.roombas = configs.map(config => new Roomba(this, config, this.aznopoly.getProfile(config.uuid)));
        this.roombas.forEach(roomba => {
            this.add.existing(roomba)
            roomba.paintPath(this.paint);
        });
        this.physics.add.collider(this.roombas, this.roombas);
    }

    public stopRoombas() {
        this.roombas.forEach(roomba => {
            roomba.stop();
        });
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
        const result = this.getPaintMap();
        this.updateProgressBar(result);
    }

    public getPaintMap() {
        if (this.paintTexture.renderTarget) {
            const renderer = this.paintTexture.renderer as Phaser.Renderer.WebGL.WebGLRenderer;

            var total = SETTINGS.DISPLAY_WIDTH * SETTINGS.DISPLAY_HEIGHT * 4;
            var pixels = new Uint8ClampedArray(total);
            
            const prevFramebuffer = renderer.currentFramebuffer;
            renderer.setFramebuffer(this.paintTexture.renderTarget.framebuffer)
            renderer.gl.readPixels(0, 0, SETTINGS.DISPLAY_WIDTH, SETTINGS.DISPLAY_HEIGHT, renderer.gl.RGBA, renderer.gl.UNSIGNED_BYTE, pixels);
            renderer.setFramebuffer(prevFramebuffer);

            const result = this.readPixelArray(pixels);
            return result;
        } else {
            var copyCanvas = Phaser.Display.Canvas.CanvasPool.createWebGL(this, SETTINGS.DISPLAY_WIDTH, SETTINGS.DISPLAY_HEIGHT)

            var ctx = copyCanvas.getContext('2d')!;
            ctx.drawImage(this.paintTexture.canvas, 0, 0, SETTINGS.DISPLAY_WIDTH, SETTINGS.DISPLAY_HEIGHT, 0, 0, SETTINGS.DISPLAY_WIDTH, SETTINGS.DISPLAY_HEIGHT);

            const pixels = ctx.getImageData(0, 0, SETTINGS.DISPLAY_WIDTH, SETTINGS.DISPLAY_HEIGHT).data;
            const result = this.readPixelArray(pixels);
            Phaser.Display.Canvas.CanvasPool.remove(copyCanvas);
            return result;
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
        for (let x = 0; x < SETTINGS.DISPLAY_WIDTH; x++) {
            for (let y = 0; y < SETTINGS.DISPLAY_HEIGHT; y++) {
                const index = (x + y * SETTINGS.DISPLAY_WIDTH) * 4;
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
                    prev[cur] = (colors[cur] / (SETTINGS.DISPLAY_WIDTH * SETTINGS.DISPLAY_HEIGHT));
                    return prev;
                }, {} as {[key: string]: number});

    }


}