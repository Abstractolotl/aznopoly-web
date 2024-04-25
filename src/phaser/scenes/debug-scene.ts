
import { SETTINGS } from '@/settings';
import * as THREE from 'three';
import Dice from '../components/ui/board/dice';

export default class DebugScene extends Phaser.Scene {

    private threeScene!: THREE.Scene;
    private threeCamera!: THREE.PerspectiveCamera;
    private threeRenderer!: THREE.WebGLRenderer;

    private dice!: Dice;
    
    constructor() {
        super();

    }

    create() {
        this.threeRenderer = (this.game as any).threeRenderer;
        this.threeScene = new THREE.Scene();
        this.threeCamera = new THREE.PerspectiveCamera(75, SETTINGS.DISPLAY_WIDTH / SETTINGS.DISPLAY_HEIGHT, 0.1, 1000);
    
        this.threeCamera.position.x = 0;
        this.threeCamera.position.y = 5;
        this.threeCamera.position.z = -5;

        this.threeCamera.lookAt(0, 0, 0);

        this.dice = new Dice();

        let i = 3;
        this.input.on('pointerdown', () => {
            this.dice.doRollAnimation(++i)
        });

        this.threeScene.add(this.dice);
        this.add.existing(Object.assign(new Phaser.GameObjects.Extern(this), {
            render: () => {
                this.threeRenderer.getContext().pixelStorei(37440, true);
                this.threeRenderer.render(this.threeScene, this.threeCamera);
                this.threeRenderer.resetState();
                this.threeRenderer.getContext().pixelStorei(37440, false);
            }
        }));
    }

    update(time: number, delta: number): void {
        this.dice.update(delta);
    }

}