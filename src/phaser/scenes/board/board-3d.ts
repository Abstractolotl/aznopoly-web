import GameBoard from '@/phaser/components/board';
import { Avatars } from '@/phaser/components/ui/avatar';
import Dice from '@/phaser/components/ui/board/dice';
import { PlayerProfile } from '@/phaser/components/ui/player-info';
import { SETTINGS } from '@/settings';
import { PLAYER_COLORS, toHex } from '@/style';
import { TileOrientation, TileType } from '@/types/board';
import * as THREE from 'three';
import { addGrass, addTree, unlitMaterial } from './fauna';

// Dimensions of PNG: 447 x 612
const TILE_WIDTH = 4.5;
const TILE_HEIGHT = 6;
const geometryTileSide = new THREE.BoxGeometry(TILE_WIDTH, 0.25, TILE_HEIGHT);
// Dimensions of PNG: 612 x 612
const geometryTileCorner = new THREE.BoxGeometry(TILE_HEIGHT, 0.25, TILE_HEIGHT);
const geometryPlayer = new THREE.CylinderGeometry(0.5, 0.5, 0.25);
const geometryPlayerAvatar = new THREE.BoxGeometry(TILE_WIDTH - 0.5, 1.5, 0.25);

const textureLoader = new THREE.TextureLoader();
const texturePropCoorp = textureLoader.load('assets/board/tile_prop_coorp.png');
const materialTile = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texturePropCoorp });

const playerTextures = {
    [Avatars.ABSTRACT]: textureLoader.load('assets/avatars/avatar_abstract.png'),
    [Avatars.AXOLOTL]: textureLoader.load('assets/avatars/avatar_axolotl.png'),
    [Avatars.BANANA]: textureLoader.load('assets/avatars/avatar_banana.png'),
    [Avatars.UNKNOWN]: textureLoader.load('assets/avatars/avatar_unknown.png'),
}

const fieldMaterials: any = {
    [TileType.PROPERTY_BLUE]: unlitMaterial(textureLoader.load('assets/board/tile_prop_coorp.png')),
    [TileType.PROPERTY_GREEN]: unlitMaterial(textureLoader.load('assets/board/tile_prop_poop.png')),
    [TileType.PROPERTY_RED]: unlitMaterial(textureLoader.load('assets/board/tile_prop_education.png')),
    [TileType.PROPERTY_YELLOW]: unlitMaterial(textureLoader.load('assets/board/tile_prop_rainbow.png')),
    [TileType.PROPERTY_PURPLE]: unlitMaterial(textureLoader.load('assets/board/tile_prop_sailor.png')),
    [TileType.ACTION]: unlitMaterial(textureLoader.load('assets/board/tile_action.png')),
    [TileType.START]: unlitMaterial(textureLoader.load('assets/board/tile_corner_start.png')),
    [TileType.JAIL]: unlitMaterial(textureLoader.load('assets/board/tile_corner_jail.png')),
    [TileType.FREE]: unlitMaterial(textureLoader.load('assets/board/tile_corner_parking.png')),
}

const CAM_DISTANCE = 4;

type PlayerObject = {
    mesh: THREE.Mesh;
    position: number;
}

const ROT_FOCUS_TILE = new THREE.Euler(-Math.PI * 0.75, 0, -Math.PI);
const ROT_FOCUS_OVERVIEW = new THREE.Euler(-Math.PI * 0.55, 0, -Math.PI);
export default class Board3D extends Phaser.GameObjects.Extern implements GameBoard {

    private threeScene!: THREE.Scene;
    private threeCamera!: THREE.PerspectiveCamera;
    private threeRenderer: THREE.WebGLRenderer;

    private diceMesh!: Dice;

    private tileMeshes: THREE.Mesh[] = [];

    private group: THREE.Group;
    //private tiles!: TileType[];

    private players: { [uuid: string]: PlayerObject } = {};

    constructor(scene: Phaser.Scene) {
        super(scene);

        this.threeRenderer = (scene.game as any).threeRenderer;
        this.setupTHREE();
        this.setupUI();

        const groundGeometry = new THREE.BoxGeometry(100, 100, 0.1);
        const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x106d35, side: THREE.DoubleSide, reflectivity: 0 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = Math.PI * 0.5;
        this.threeScene.add(ground);

        this.group = new THREE.Group();
        this.threeScene.add(this.group);

        const range = 35;
        const deadStart = 10;
        const deadEnd = 25;
        for (let i = 0; i < 35; i++) {
            const x = Math.random() * range * 2 - range;
            const y = Math.random() * range * 2 - range;

            if (Math.abs(x) > deadStart && Math.abs(x) < deadEnd || Math.abs(y) > deadStart && Math.abs(y) < deadEnd) {
                continue;
            }
            addTree(this.threeScene, x, y);
        }

        for (let i = 0; i < 35; i++) {
            const x = Math.random() * 12 * 2 - 12;
            const y = Math.random() * 12 * 2 - 12;
            addGrass(this.threeScene, x, y);
        }
    }

    init(tiles: TileType[]): void {
        //this.tiles = tiles;
        this.tileMeshes = this.generateTileMeshes(tiles);
        this.tileMeshes.forEach(mesh => this.group.add(mesh));
        const tile = this.tileMeshes[0];
        this.threeCamera.lookAt(tile.position);
    }

    public update(delta: number) {
        this.diceMesh.update(delta);
    }

    public async doIntro() {
        const tile = this.tileMeshes[0];
        if (SETTINGS.SKIP_INTRO) {
            this.threeCamera.position.set(tile.position.x, 5, tile.position.z - 5);
            this.threeCamera.lookAt(tile.position);
            return;
        }
        this.threeCamera.position.set(0, 22, 0);
        this.threeCamera.rotation.set(Math.PI * -0.5, 0, 0)
        Object.values(this.players).forEach(player => { this.threeScene.remove(player.mesh) });
        //this.threeCamera.lookAt(tile.position);
        await sleep(500);
        await this.moveCameraToPosition(tile.position.x, 5, tile.position.z - 5, 2000, {targetRotation: ROT_FOCUS_TILE});
        this.focusTile(0);
        Object.values(this.players).forEach(async (player, index) => {
            player.mesh.position.y = 25;
            await sleep(150 * index);
            this.threeScene.add(player.mesh)
            this.scene.tweens.addCounter({
                from: 25,
                to: 0.5,
                duration: 500,
                ease: 'Cubic',
                onUpdate: (tween) => {
                    player.mesh.position.y = tween.getValue();
                },
            }); 
        });
        await sleep(1500);
    }

    public setPreviewDice(preview: boolean) {
        this.scene.tweens.addCounter({
            from: preview ? 1 : 1.25,
            to: preview ? 1.25 : 1,
            duration: 50,
            onUpdate: (tween) => {
                const value = tween.getValue();
                this.diceMesh.scale.set(value, value, value);
            }
        });
    }

    private setupTHREE() {
        this.threeScene = new THREE.Scene();
        this.threeCamera = new THREE.PerspectiveCamera(75, SETTINGS.DISPLAY_WIDTH / SETTINGS.DISPLAY_HEIGHT, 0.1, 1000);

        this.threeCamera.position.set(0, 22, 0);
        this.threeCamera.rotation.set(Math.PI * 0.5, 0, 0)

        this.threeCamera.lookAt(0, 0, 0);
    }

    private setupUI() {
        // this.uiScene = new THREE.Group();
        // this.threeScene.add(this.uiScene)

        this.diceMesh = new Dice();
    }

    private moveCameraToPosition(x: number, y: number, z: number, time: number, {lock, targetRotation}: { lock?: THREE.Vector3, targetRotation?: THREE.Euler} = {}) {
        const startX = this.threeCamera.position.x;
        const startY = this.threeCamera.position.y;
        const startZ = this.threeCamera.position.z;

        const endX = x;
        const endY = y;
        const endZ = z;

        const startRotation = this.threeCamera.rotation.clone();
        const endRotation = targetRotation || this.threeCamera.rotation.clone();

        return new Promise<void>((resolve) => {
            this.scene.tweens.addCounter({
                from: 0,
                to: 1,
                duration: time,
                onUpdate: (tween) => {
                    const value = tween.getValue();
                    this.threeCamera.position.x = startX + (endX - startX) * value;
                    this.threeCamera.position.y = startY + (endY - startY) * value;
                    this.threeCamera.position.z = startZ + (endZ - startZ) * value;

                    this.threeCamera.rotation.x = startRotation.x + (endRotation.x - startRotation.x) * value;
                    this.threeCamera.rotation.y = startRotation.y + (endRotation.y - startRotation.y) * value;
                    this.threeCamera.rotation.z = startRotation.z + (endRotation.z - startRotation.z) * value;

                    if (lock) {
                        this.threeCamera.lookAt(lock);
                    }
                },
                onComplete: () => {
                    resolve();
                }
            });
        });
    }

    private generateTileMeshes(tiles: TileType[]) {
        const tileMeshes: THREE.Mesh[] = [];
        tileMeshes.length = SETTINGS.BOARD_SIDE_LENGTH * 4 + 4

        const tileWidth = TILE_WIDTH;
        const tileHeight = TILE_HEIGHT;

        const boardSize = (SETTINGS.BOARD_SIDE_LENGTH) * tileWidth + 2 * tileHeight;
        const offsetX = 0;
        const offsetY = 0;

        let index;
        for (let i = 0; i < SETTINGS.BOARD_SIDE_LENGTH; i++) {

            index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 0 + 1 + i;
            tileMeshes[index] = this.generateTileMesh(
                tiles[index],
                offsetX - boardSize * 0.5 + tileHeight + tileWidth * 0.5 + i * tileWidth,
                offsetY - boardSize * 0.5 + tileHeight * 0.5,
                TileOrientation.DOWN
            );
            index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 1 + 1 + i;
            tileMeshes[index] = this.generateTileMesh(
                tiles[index],
                offsetX + boardSize * 0.5 - tileHeight * 0.5,
                offsetY - boardSize * 0.5 + tileHeight + tileWidth * 0.5 + i * tileWidth,
                TileOrientation.LEFT
            );
            index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 2 + 1 + i;
            tileMeshes[index] = this.generateTileMesh(
                tiles[index],
                offsetX + boardSize * 0.5 - tileHeight - tileWidth * 0.5 - i * tileWidth,
                offsetY + boardSize * 0.5 - tileHeight * 0.5,
                TileOrientation.UP
            );
            index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 3 + 1 + i;
            tileMeshes[index] = this.generateTileMesh(
                tiles[index],
                offsetX - boardSize * 0.5 + tileHeight * 0.5,
                offsetY + boardSize * 0.5 - tileHeight - tileWidth * 0.5 - i * tileWidth,
                TileOrientation.RIGHT
            );
        }

        index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 0;
        tileMeshes[index] = this.generateTileMesh(
            tiles[index],
            offsetX - boardSize * 0.5 + tileHeight * 0.5,
            offsetY - boardSize * 0.5 + tileHeight * 0.5,
            TileOrientation.CORNER
        );
        index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 1;
        tileMeshes[index] = this.generateTileMesh(
            tiles[index],
            offsetX + boardSize * 0.5 - tileHeight * 0.5,
            offsetY - boardSize * 0.5 + tileHeight * 0.5,
            TileOrientation.CORNER
        );
        index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 2;
        tileMeshes[index] = this.generateTileMesh(
            tiles[index],
            offsetX + boardSize * 0.5 - tileHeight * 0.5,
            offsetY + boardSize * 0.5 - tileHeight * 0.5,
            TileOrientation.CORNER
        );
        index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 3;
        tileMeshes[index] = this.generateTileMesh(
            tiles[index],
            offsetX - boardSize * 0.5 + tileHeight * 0.5,
            offsetY + boardSize * 0.5 - tileHeight * 0.5,
            TileOrientation.CORNER
        );

        return tileMeshes;
    }

    private focusTile(tileIndex: number) {
        const tile = this.tileMeshes[tileIndex];

        const endX = tile.position.x;
        const endY = tile.position.z - CAM_DISTANCE;

        this.moveCameraToPosition(endX, CAM_DISTANCE, endY, 250, {targetRotation: ROT_FOCUS_TILE});
    }

    private getRotationForOrientation(orientation: TileOrientation) {
        switch (orientation) {
            case TileOrientation.CORNER: return Math.PI;
            case TileOrientation.DOWN: return Math.PI;
            case TileOrientation.RIGHT: return Math.PI * 1.5;
            case TileOrientation.UP: return 0;
            case TileOrientation.LEFT: return Math.PI * 0.5;
        }
        throw new Error("UNKNOWN TILE ORIENTATION " + orientation);
    }

    private generateTileMesh(tile: TileType, x: number, y: number, orientation: TileOrientation): THREE.Mesh {
        const geometry = TileType.isCorner(tile) ? geometryTileCorner : geometryTileSide;
        const material = fieldMaterials[tile] || materialTile;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 0, y);
        mesh.rotation.y = this.getRotationForOrientation(orientation);
        return mesh;
    }

    addPlayer(uuid: string, profile: PlayerProfile, startPos?: number | undefined) {
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: playerTextures[profile.avatar] });
        const player = new THREE.Mesh(geometryPlayer, [new THREE.MeshBasicMaterial({ color: PLAYER_COLORS[profile.colorIndex] }), material]);
        const tile = this.tileMeshes[0];
        player.position.set(tile.position.x, 0.5, tile.position.z);
        player.rotation.y = Math.PI * -0.5;

        this.players[uuid] = {
            mesh: player,
            position: 0
        };
        this.threeScene.add(player);
        this.resolvePlayerCollisions();
    }
    teleportPlayerToPosition(uuid: string, pos: number): void {
        const player = this.players[uuid];
        const tile = this.tileMeshes[pos];

        player.mesh.position.set(tile.position.x, 0.5, tile.position.z);
        this.focusTile(pos);

        player.position = pos;
        this.resolvePlayerCollisions();
    }

    updateTileOwner(ownerProfile: PlayerProfile, tileIndex: number): void {
        const canvas = THREE.createCanvasElement();
        canvas.width = 300;
        canvas.height = 100;
        const context = canvas.getContext('2d')!;
        const size = 80;
        context.fillStyle = "#ccc3d8";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(playerTextures[ownerProfile.avatar].image, canvas.width * 0.5 - size * 0.5, canvas.height * 0.5 - size * 0.5, size, size);

        console.log(toHex(PLAYER_COLORS[ownerProfile.colorIndex]));
        context.strokeStyle = toHex(PLAYER_COLORS[ownerProfile.colorIndex]) + "ff";
        context.lineWidth = 8;
        context.beginPath();
        context.arc(canvas.width * 0.5, canvas.height * 0.5, size * 0.5, 0, Math.PI * 2);
        context.stroke();

        const texture = new THREE.CanvasTexture(canvas);


        const tile = this.tileMeshes[tileIndex];
        const mesh = new THREE.Mesh(geometryPlayerAvatar, unlitMaterial(texture));
        mesh.position.set(tile.position.x, tile.position.y + 0.001, tile.position.z + TILE_HEIGHT * 0.5 -  0.75 - .15);
        mesh.rotation.x = Math.PI * -0.5;
        mesh.rotation.z = Math.PI;
        this.threeScene.add(mesh);
    }

    private resolvePlayerCollisions() {
        const playerPositions: { [position: number]: string[] } = {};
        Object.entries(this.players).forEach(([uuid, player]) => {
            if (!playerPositions[player.position]) {
                playerPositions[player.position] = [];
            }
            playerPositions[player.position].push(uuid);
        });

        const offset = 0.6;
        const collisionNumOffsetsMap = [
            [{ x: 0, y: 0 }],
            [{ x: offset, y: 0 }, { x: -offset, y: 0 }],
            [{ x: offset, y: offset }, { x: -offset, y: offset }, { x: 0.0, y: -offset }],
            [{ x: offset, y: offset }, { x: -offset, y: offset }, { x: offset, y: -offset }, { x: -offset, y: -offset }],
        ]
        Object.entries(playerPositions).forEach(([position, uuids]) => {
            if (uuids.length > 1) {
                const offsets = collisionNumOffsetsMap[uuids.length - 1];
                const tile = this.tileMeshes[+position];
                uuids.forEach((uuid, i) => {
                    const player = this.players[uuid];
                    player.mesh.position.x = tile.position.x + offsets[i].x;
                    player.mesh.position.z = tile.position.z + offsets[i].y;
                });
            }
        });
    }

    public async showOverview() {
        await this.moveCameraToPosition(0, 22, -5.5, 500, {targetRotation: new THREE.Euler(-Math.PI * 0.55, 0, -Math.PI)});
    }
    
    public showDiceForPlayer(uuid: string): void {
        const player = this.players[uuid];
        this.diceMesh.position.set(player.mesh.position.x, player.mesh.position.y + 1, player.mesh.position.z);
        this.diceMesh.setIdle();
        this.threeScene.add(this.diceMesh);
    }

    public async rollDice(num: number): Promise<void> {
        await this.diceMesh.doRollAnimation(num);
        this.threeScene.remove(this.diceMesh);
    }

    public focusPlayer(uuid: string): void {
        const player = this.players[uuid];
        this.focusTile(player.position);
    }

    render() {
        this.threeRenderer.getContext().pixelStorei(37440, true);
        this.threeRenderer.render(this.threeScene, this.threeCamera);
        this.threeRenderer.resetState();
        this.threeRenderer.getContext().pixelStorei(37440, false);
    }

}

function sleep(time: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, time);
    });
}