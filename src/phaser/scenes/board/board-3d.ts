import GameBoard from '@/phaser/components/board';
import { Avatars } from '@/phaser/components/ui/avatar';
import Dice from '@/phaser/components/ui/board/dice';
import { PlayerProfile } from '@/phaser/components/ui/player-info';
import { SETTINGS } from '@/settings';
import { PLAYER_COLORS, toHex } from '@/style';
import { TileType } from '@/types/board';
import * as THREE from 'three';
import { initDecoration, unlitMaterial } from './fauna';
import CameraManager from './camera-manager';

// Dimensions of PNG: 447 x 612
const TILE_WIDTH = 4.5;
const TILE_HEIGHT = 6;
const geometryTileSide = new THREE.BoxGeometry(TILE_WIDTH, 0.25, TILE_HEIGHT);
// Dimensions of PNG: 612 x 612
const geometryTileCorner = new THREE.BoxGeometry(TILE_HEIGHT, 0.25, TILE_HEIGHT);
const geometryPlayer = new THREE.CylinderGeometry(0.45, 0.6, 0.2);
const geometryPlayerAvatar = new THREE.BoxGeometry(TILE_WIDTH - 0.5, 0.25, 1.5);

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

type PlayerObject = {
    mesh: THREE.Mesh;
    position: number;
}
export default class Board3D extends Phaser.GameObjects.Extern implements GameBoard {

    public readonly cameraManager: CameraManager;
    private threeScene!: THREE.Scene;
    private threeRenderer: THREE.WebGLRenderer;
    private diceMesh!: Dice;
    private tileMeshes: THREE.Mesh[] = [];
    private group: THREE.Group;
    private players: { [uuid: string]: PlayerObject } = {};

    constructor(scene: Phaser.Scene) {
        super(scene);

        this.threeRenderer = (scene.game as any).threeRenderer;
        this.threeScene = new THREE.Scene();
        this.cameraManager = new CameraManager(scene.tweens, {
            getTilePosition: (tileIndex: number) => this.tileMeshes[tileIndex].position
        });

        this.group = new THREE.Group();
        this.diceMesh = new Dice();

        this.initGround();
        initDecoration(this.threeScene);

        this.threeScene.add(this.group);
    }

    private initGround() {
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 1);
        const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x106d35, side: THREE.DoubleSide, reflectivity: 0 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = Math.PI * 0.5;
        this.threeScene.add(ground);
    }

    init(tiles: TileType[]): void {
        this.tileMeshes = this.generateTileMeshes(tiles);
        this.tileMeshes.forEach(mesh => this.group.add(mesh));
    }

    public update(delta: number) {
        this.diceMesh.update(delta);
    }

    public async doIntro() {
        if (SETTINGS.SKIP_INTRO) {
            this.cameraManager.focusTile(0);
            return;
        }
        Object.values(this.players).forEach(player => { this.threeScene.remove(player.mesh) });
        await this.cameraManager.showIntroCutscene();
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

    public highlightTiles(tiles: number[]) {
        tiles.forEach(tileIndex => {
            //this.tileMeshes[tileIndex].position.y = 0.5;
            this.tileMeshes[tileIndex].scale.set(1.15, 1.15, 1.15);
            this.scene.tweens.addCounter({
                from: 0,
                to: Math.PI * 3,
                duration: 1000,
                onUpdate: (tween) => {
                    const value = Math.sin(tween.getValue() - Math.PI * 0.5) + 1;
                    (this.tileMeshes[tileIndex].material as any).uniforms.intensity = { value: value * 0.25 };
                }
            });
        });
    }

    public resetTileHighlights() {
        this.tileMeshes.forEach(mesh => {
            mesh.position.y = 0;
            mesh.scale.set(1, 1, 1);
            if ((mesh.material as any).uniforms?.intensity) {
                (mesh.material as any).uniforms.intensity = { value: 0.0 };
            }
        });
    }

    public highlightDice(highlight: boolean) {
        this.scene.tweens.addCounter({
            from: highlight ? 1 : 1.25,
            to: highlight ? 1.25 : 1,
            duration: 50,
            onUpdate: (tween) => {
                const value = tween.getValue();
                this.diceMesh.scale.set(value, value, value);
            }
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
                index
            );
            index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 1 + 1 + i;
            tileMeshes[index] = this.generateTileMesh(
                tiles[index],
                offsetX + boardSize * 0.5 - tileHeight * 0.5,
                offsetY - boardSize * 0.5 + tileHeight + tileWidth * 0.5 + i * tileWidth,
                index
            );
            index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 2 + 1 + i;
            tileMeshes[index] = this.generateTileMesh(
                tiles[index],
                offsetX + boardSize * 0.5 - tileHeight - tileWidth * 0.5 - i * tileWidth,
                offsetY + boardSize * 0.5 - tileHeight * 0.5,
                index
            );
            index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 3 + 1 + i;
            tileMeshes[index] = this.generateTileMesh(
                tiles[index],
                offsetX - boardSize * 0.5 + tileHeight * 0.5,
                offsetY + boardSize * 0.5 - tileHeight - tileWidth * 0.5 - i * tileWidth,
                index
            );
        }

        index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 0;
        tileMeshes[index] = this.generateTileMesh(
            tiles[index],
            offsetX - boardSize * 0.5 + tileHeight * 0.5,
            offsetY - boardSize * 0.5 + tileHeight * 0.5,
            index
        );
        index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 1;
        tileMeshes[index] = this.generateTileMesh(
            tiles[index],
            offsetX + boardSize * 0.5 - tileHeight * 0.5,
            offsetY - boardSize * 0.5 + tileHeight * 0.5,
            index
        );
        index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 2;
        tileMeshes[index] = this.generateTileMesh(
            tiles[index],
            offsetX + boardSize * 0.5 - tileHeight * 0.5,
            offsetY + boardSize * 0.5 - tileHeight * 0.5,
            index
        );
        index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 3;
        tileMeshes[index] = this.generateTileMesh(
            tiles[index],
            offsetX - boardSize * 0.5 + tileHeight * 0.5,
            offsetY + boardSize * 0.5 - tileHeight * 0.5,
            index
        );

        return tileMeshes;
    }

    private getRotationForTileIndex(tileIndex: number) {
        const cornerIndex = (i: number) => (SETTINGS.BOARD_SIDE_LENGTH + 1) * i;
        switch (true) {
            case (tileIndex > cornerIndex(0) && tileIndex < cornerIndex(1)): return Math.PI * 1.0;
            case (tileIndex > cornerIndex(1) && tileIndex < cornerIndex(2)): return Math.PI * 0.5;
            case (tileIndex > cornerIndex(2) && tileIndex < cornerIndex(3)): return Math.PI * 0.0;
            case (tileIndex > cornerIndex(3) && tileIndex < cornerIndex(4)): return Math.PI * 1.5;
            default: return Math.PI;
        }
    }

    private generateTileMesh(tile: TileType, x: number, y: number, tileBoardIndex: number): THREE.Mesh {
        const geometry = TileType.isCorner(tile) ? geometryTileCorner : geometryTileSide;
        const material = fieldMaterials[tile] || materialTile;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 0, y);
        //mesh.rotation.z = Math.PI;
        mesh.rotation.y = this.getRotationForTileIndex(tileBoardIndex);
        return mesh;
    }

    addPlayer(uuid: string, profile: PlayerProfile) {
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
        this.cameraManager.focusTile(pos);

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
        const offset = new THREE.Vector3(0, 0.001, -(TILE_HEIGHT * 0.5 - 0.75 - 0.15))
        console.log(offset);
        offset.applyEuler(new THREE.Euler(0, this.getRotationForTileIndex(tileIndex), 0))
        console.log(offset);
        mesh.position.add(tile.position).add(offset);
        //mesh.rotation.z = Math.PI;
        mesh.rotation.y = this.getRotationForTileIndex(tileIndex);
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

        const offset = 0.65;
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
        this.cameraManager.focusTile(player.position);
    }

    render() {
        this.threeRenderer.getContext().pixelStorei(37440, true);
        this.threeRenderer.render(this.threeScene, this.cameraManager.camera);
        this.threeRenderer.resetState();
        this.threeRenderer.getContext().pixelStorei(37440, false);
    }

}

function sleep(time: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, time);
    });
}