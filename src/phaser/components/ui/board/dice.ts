
import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

const diceTextures = [
    textureLoader.load('assets/sprites/dice_1.png'),
    textureLoader.load('assets/sprites/dice_2.png'),
    textureLoader.load('assets/sprites/dice_3.png'),
    textureLoader.load('assets/sprites/dice_4.png'),
    textureLoader.load('assets/sprites/dice_5.png'),
    textureLoader.load('assets/sprites/dice_6.png'),
]

const diceGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const diceMaterials = [
    new THREE.MeshBasicMaterial({ color: 0xffffff, map: diceTextures[0] }),
    new THREE.MeshBasicMaterial({ color: 0xffffff, map: diceTextures[1] }),
    new THREE.MeshBasicMaterial({ color: 0xffffff, map: diceTextures[2] }),
    new THREE.MeshBasicMaterial({ color: 0xffffff, map: diceTextures[3] }),
    new THREE.MeshBasicMaterial({ color: 0xffffff, map: diceTextures[4] }),
    new THREE.MeshBasicMaterial({ color: 0xffffff, map: diceTextures[5] }),
]

const ROLL_DURATION = 1000;
const ROLL_SPEED = 150;
const IDLE_SPEED = 0.3;
export default class Dice extends THREE.Mesh {

    private rolling: boolean = false;
    private rollTimer: number = 0;
    private rollNumber: number = 0;

    private idle: boolean = false;

    constructor() {
        super(diceGeometry, diceMaterials);
    }

    public update(delta: number) {
        if (this.rolling && this.rollTimer > 0) {
            this.rollTimer -= delta;

            this.rotation.x += ROLL_SPEED * (Math.random() - 0.5) * delta / 1000;
            this.rotation.y += ROLL_SPEED * (Math.random() - 0.5) * delta / 1000;
            this.rotation.z += ROLL_SPEED * (Math.random() - 0.5) * delta / 1000;

            if (this.rollTimer <= 0) {
                this.rolling = false;
                this.rollTimer = 0;
                this.onRollAnimationFinish();
            }
        } else if (this.idle) {
            this.rotation.x += IDLE_SPEED * delta / 1000;
            this.rotation.y -= IDLE_SPEED * 2 * delta / 1000;
            this.rotation.z += IDLE_SPEED * 3 * delta / 1000;
        }
    }

    public setIdle() {
        this.idle = true;
    }

    public doRollAnimation(num: number) {
        this.rolling = true;
        this.rollTimer = ROLL_DURATION;
        this.rollNumber = num;
        this.idle = false;
        
        return new Promise(resolve => setTimeout(resolve, ROLL_DURATION + 500));
    }

    private onRollAnimationFinish() {
        const rotation = this.getRotationForDice(this.rollNumber);
        this.rotation.x = rotation.x;
        this.rotation.y = rotation.y;
        this.rotation.z = rotation.z;
    }

    private getRotationForDice(num: number) {
        console.log("Rolling dice", num);
        switch (num) {
            case 1: return { x: 0, y:  Math.PI * 0.5, z: Math.PI * 0.5 };
            case 2: return { x: 0, y: Math.PI * -0.5, z: -Math.PI * 0.5};
            case 3: return { x: 0, y: Math.PI, z: 0 };
            case 4: return { x: 0, y: 0, z: Math.PI };
            case 5: return { x: Math.PI * -0.5, y: 0, z: Math.PI};
            case 6: return { x: -Math.PI * 0.5, y: Math.PI, z: Math.PI };
        }
        console.warn("Invalid dice number", num);
        return { x: 0, y: 0, z: 0 };
    }

}