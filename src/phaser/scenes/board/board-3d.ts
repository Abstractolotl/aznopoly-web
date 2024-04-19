import GameBoard from '@/phaser/components/board';
import { PlayerProfile } from '@/phaser/components/ui/player-info';
import { SETTINGS } from '@/settings';
import { TileOrientation, TileType } from '@/types/board';
import * as THREE from 'three';

// Dimensions of PNG: 447 x 612
const geometryTileSide = new THREE.BoxGeometry( 4.47, 6.12, 1);
// Dimensions of PNG: 612 x 612
const geometryTileCorner = new THREE.BoxGeometry( 6.12, 6.12, 1);
const map = new THREE.TextureLoader().load( 'assets/board/tile-down.png' );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, map } );
export default class Board3D extends Phaser.GameObjects.Extern implements GameBoard {

    private threeScene!: THREE.Scene;
    private threeCamera!: THREE.PerspectiveCamera;
    private threeRenderer: THREE.WebGLRenderer;

    private group: THREE.Group;
    private tiles!: TileType[];

    constructor(scene: Phaser.Scene) {
        super(scene);
        
        this.threeRenderer = (scene.game as any).threeRenderer;
        this.setupTHREE();
        
        this.group = new THREE.Group();

        this.threeScene.add( this.group );
    }

    private setupTHREE() {
        this.threeScene = new THREE.Scene();
        this.threeCamera = new THREE.PerspectiveCamera( 75, SETTINGS.DISPLAY_WIDTH / SETTINGS.DISPLAY_HEIGHT, 0.1, 1000 );

        this.threeCamera.position.z = 35;
        this.threeCamera.position.x = 0;
        this.threeCamera.position.y = 5;
    }

    private generateTileMeshes(tiles: TileType[]) {
        const tileMeshes: THREE.Mesh[] = [];
        tileMeshes.length = SETTINGS.BOARD_SIDE_LENGTH * 4 + 4

        const tileWidth = 4.47;
        const tileHeight = 6.12;

        const boardSize = (SETTINGS.BOARD_SIDE_LENGTH) * tileWidth + 2 * tileHeight;
        const offsetX = 0;
        const offsetY = 0;

        const lineOffset = boardSize * 0.5 - tileHeight;

        let index;
        for (let i = 0; i < SETTINGS.BOARD_SIDE_LENGTH; i++) {
            
            index = SETTINGS.BOARD_SIDE_LENGTH - i;
            tileMeshes[index] = this.generateTileMesh(
                tiles[index], 
                offsetX - lineOffset + tileWidth * 0.5 + i * tileWidth , 
                offsetY + boardSize * 0.5 + tileHeight * 0.5, 
                TileOrientation.UP
            );
            index = 1 + (SETTINGS.BOARD_SIDE_LENGTH * 2) - i;
            tileMeshes[index] = this.generateTileMesh(
                tiles[index], 
                offsetX - boardSize * 0.5 + tileHeight * 0.5, 
                offsetY + boardSize * 0.5 - tileWidth * 0.5 - i * tileWidth, 
                TileOrientation.RIGHT
            );
            index = 1 + (1 + SETTINGS.BOARD_SIDE_LENGTH) * 2 + i;
            tileMeshes[index] = this.generateTileMesh(
                tiles[index], 
                offsetX - lineOffset + tileWidth * 0.5 + i * tileWidth , 
                offsetY - lineOffset + tileHeight * 0.5, 
                TileOrientation.DOWN
            );
            index = 1 + (1 + SETTINGS.BOARD_SIDE_LENGTH) * 3 + i;
            tileMeshes[index] = this.generateTileMesh(
                tiles[index], 
                offsetX + boardSize * 0.5 + tileHeight * 0.5 - tileHeight, 
                offsetY + boardSize * 0.5 - tileWidth * 0.5 - i * tileWidth, 
                TileOrientation.LEFT
            );
        }

        index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 0;
        tileMeshes[index] = this.generateTileMesh(
            tiles[index], 
            offsetX - boardSize * 0.5 + tileHeight * 0.5, 
            offsetY - boardSize * 0.5 + tileHeight * 0.5 + tileHeight, 
            TileOrientation.CORNER
        );
        index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 1;
        tileMeshes[index] = this.generateTileMesh(
            tiles[index], 
            offsetX + boardSize * 0.5 - tileHeight * 0.5, 
            offsetY - boardSize * 0.5 + tileHeight * 0.5 + tileHeight, 
            TileOrientation.CORNER
        );
        index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 2;
        tileMeshes[index] = this.generateTileMesh(
            tiles[index], 
            offsetX - boardSize * 0.5 + tileHeight * 0.5, 
            offsetY + boardSize * 0.5 + tileHeight * 0.5, 
            TileOrientation.CORNER
        );
        index = (SETTINGS.BOARD_SIDE_LENGTH + 1) * 3;
        tileMeshes[index] = this.generateTileMesh(
            tiles[index], 
            offsetX + boardSize * 0.5 - tileHeight * 0.5, 
            offsetY + boardSize * 0.5 + tileHeight * 0.5, 
            TileOrientation.CORNER
        );

        return tileMeshes;
    }

    private getRotationForOrientation(orientation: TileOrientation) {
        switch(orientation) {
            case TileOrientation.CORNER: return 0;
            case TileOrientation.UP: return 0;
            case TileOrientation.RIGHT: return Math.PI * 0.5;
            case TileOrientation.DOWN: return Math.PI;
            case TileOrientation.LEFT: return Math.PI * 1.5;
        }
        throw new Error("UNKNOWN TILE ORIENTATION " + orientation);
    }

    private generateTileMesh(tile: TileType, x: number, y: number, orientation: TileOrientation): THREE.Mesh {
        const geometry = TileType.isCorner(tile) ? geometryTileCorner : geometryTileSide;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, 0);
        mesh.rotation.z = this.getRotationForOrientation(orientation);
        return mesh;
    }

    init(tiles: TileType[]): void {
        this.tiles = tiles;
        const meshes = this.generateTileMeshes(tiles);
        meshes.forEach(mesh => this.group.add(mesh));
    }

    addPlayer(uuid: string, profile: PlayerProfile, startPos?: number | undefined): BoardPlayer {
        throw new Error('Method not implemented.');
    }
    teleportPlayerToPosition(uuid: string, pos: number): void {
        throw new Error('Method not implemented.');
    }
    getPlayerPosition(uuid: string): number | undefined {
        throw new Error('Method not implemented.');
    }
    updateTileOwner(ownerProfile: PlayerProfile, tileIndex: number): void {
        throw new Error('Method not implemented.');
    }

    render() {
        //console.log("RENDERING")
        //this.group.rotation.x += 0.01;
        //this.group.rotation.y += 0.02;
        this.threeRenderer.resetState();
        this.threeRenderer.render(this.threeScene, this.threeCamera);
    }
    
}