
import { SETTINGS } from '@/settings';
import * as THREE from 'three';

interface TileManager {
    getTilePosition(tileIndex: number): THREE.Vector3;
}

type CameraState = "FREE" | "OVERVIEW" | "TILE";
const POSITIONS:{ [key in CameraState]: {position: THREE.Vector3, rotation: THREE.Euler }} = {
    FREE: { position: new THREE.Vector3(0, 0, 0), rotation: new THREE.Euler(0, 0, 0) },
    OVERVIEW: { position: new THREE.Vector3(0, 22, -5.5), rotation: new THREE.Euler(-Math.PI * 0.55, 0, -Math.PI) },
    TILE: { position: new THREE.Vector3(0, 0, 0), rotation: new THREE.Euler(-Math.PI * 0.75, 0, -Math.PI) }
};
export default class CameraManager {

    public readonly camera: THREE.Camera;
    private tweens: Phaser.Tweens.TweenManager;

    private tileManager: TileManager;

    private currentTween: Phaser.Tweens.Tween | null = null;
    private currentState: CameraState = "FREE";

    private listener?: (state: CameraState) => void;

    constructor(tweens: Phaser.Tweens.TweenManager, tileManager: TileManager) {
        this.tileManager = tileManager;

        this.camera = new THREE.PerspectiveCamera(75, SETTINGS.DISPLAY_WIDTH / SETTINGS.DISPLAY_HEIGHT, 0.1, 1000);
        this.camera.position.set(0, 22, 0);
        this.camera.rotation.set(Math.PI * 0.5, 0, 0)
        this.camera.lookAt(0, 0, 0);

        this.tweens = tweens;
    }

    public setListener(listener: (state: CameraState) => void) {
        this.listener = listener;
    }

    public async showIntroCutscene() {
        /*
        this.threeCamera.position.set(0, 22, 0);
        this.threeCamera.rotation.set(Math.PI * -0.5, 0, -Math.PI)
        Object.values(this.players).forEach(player => { this.threeScene.remove(player.mesh) });
        //this.threeCamera.lookAt(tile.position);
        await sleep(500);
        await this.moveCameraToPosition(tile.position.x, 5, tile.position.z - 5, 2000, {targetRotation: ROT_FOCUS_TILE});
        this.focusTile(0);
        await sleep(1500);
        */
        const startTile = this.tileManager.getTilePosition(0);
        this.camera.position.set(POSITIONS.OVERVIEW.position.x, POSITIONS.OVERVIEW.position.y, POSITIONS.OVERVIEW.position.z);
        this.camera.rotation.set(POSITIONS.OVERVIEW.rotation.x, POSITIONS.OVERVIEW.rotation.y, POSITIONS.OVERVIEW.rotation.z);
        await sleep(500);
        await this.focusTile(0, 2000);
    }

    public async focusOverview(duration: number = 750) {
        this.updateState("OVERVIEW");
        await this.moveCameraToPosition(POSITIONS.OVERVIEW.position.x, POSITIONS.OVERVIEW.position.y, POSITIONS.OVERVIEW.position.z, duration, {targetRotation: POSITIONS.OVERVIEW.rotation});
    }

    public async focusTile(tileIndex: number, duration: number = 250) {
        this.updateState("TILE");
        const position = this.tileManager.getTilePosition(tileIndex);
        const newCameraPosition = position.clone().add(POSITIONS.TILE.position);
        await this.moveCameraToPosition(newCameraPosition.x, newCameraPosition.y + 4, newCameraPosition.z - 4, duration, { targetRotation: POSITIONS.TILE.rotation });
    }

    private updateState(state: CameraState) {
        this.currentState = state;
        if (this.listener) {
            this.listener(state);
        }
    }

    private moveCameraToPosition(x: number, y: number, z: number, time: number, {lock, targetRotation}: { lock?: THREE.Vector3, targetRotation?: THREE.Euler} = {}) {
        const startX = this.camera.position.x;
        const startY = this.camera.position.y;
        const startZ = this.camera.position.z;

        const endX = x;
        const endY = y;
        const endZ = z;

        const startRotation = this.camera.rotation.clone();
        const endRotation = targetRotation || this.camera.rotation.clone();

        return new Promise<void>((resolve) => {
            if (this.currentTween) {
                this.currentTween.stop();
            }
            this.currentTween = this.tweens.addCounter({
                from: 0,
                to: 1,
                duration: time,
                onUpdate: (tween) => {
                    const value = tween.getValue();
                    this.camera.position.x = startX + (endX - startX) * value;
                    this.camera.position.y = startY + (endY - startY) * value;
                    this.camera.position.z = startZ + (endZ - startZ) * value;

                    this.camera.rotation.x = startRotation.x + (endRotation.x - startRotation.x) * value;
                    this.camera.rotation.y = startRotation.y + (endRotation.y - startRotation.y) * value;
                    this.camera.rotation.z = startRotation.z + (endRotation.z - startRotation.z) * value;

                    if (lock) {
                        this.camera.lookAt(lock);
                    }
                },
                onComplete: () => {
                    this.currentTween = null;
                    resolve();
                }
            });
        });
    }

}

function sleep(time: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, time);
    });
}