import * as THREE from 'three';

import vertShaderCode from '@/../shader/unlit.vert?raw';
import fragShaderCode from '@/../shader/unlit.frag?raw';

const geometryTree = new THREE.PlaneGeometry(1.26 * 4, 1.49 * 4);
geometryTree.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 1.49 * 2, 0));

const geometryGrass = new THREE.PlaneGeometry(1.5, 1.5);
geometryGrass.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.75, 0));

const textureLoader = new THREE.TextureLoader()
const mapTree = textureLoader.load('assets/sprites/tree_1.png');
const mapGrass = textureLoader.load('assets/sprites/grass.png');

const materialTree = unlitMaterial(mapTree, true);
const materialGrass = unlitMaterial(mapGrass, true);

export function unlitMaterial(texture: THREE.Texture, transparent: boolean = false) {
    return new THREE.ShaderMaterial( {
        uniforms: {
            color: {value: new THREE.Vector3(1, 1, 1)},
            mytex: {value: texture},
            intensity: {value: 0.0},
        },
        vertexShader: vertShaderCode,
        fragmentShader: fragShaderCode,
        transparent,
        side: THREE.DoubleSide,
    } );
}

export function initDecoration(scene: THREE.Scene) {
    const range = 35;
    const deadStart = 10;
    const deadEnd = 25;
    for (let i = 0; i < 35; i++) {
        const x = Math.random() * range * 2 - range;
        const y = Math.random() * range * 2 - range;

        if (Math.abs(x) > deadStart && Math.abs(x) < deadEnd || Math.abs(y) > deadStart && Math.abs(y) < deadEnd) {
            continue;
        }
        addTree(scene, x, y);
    }

    for (let i = 0; i < 35; i++) {
        const x = Math.random() * 12 * 2 - 12;
        const y = Math.random() * 12 * 2 - 12;
        addGrass(scene, x, y);
    }
    
}

export const addTree = function (scene: THREE.Scene, x: number, y: number) {
    const tree = new THREE.Mesh(geometryTree, materialTree);
    tree.position.set(x, 0, y);
    tree.rotation.set(0, Math.PI * 0.15, 0);
    scene.add(tree);

    const tree2 = new THREE.Mesh(geometryTree, materialTree);
    tree2.position.set(x, 0, y);
    tree2.rotation.set(0, Math.PI * -0.15, 0);
    scene.add(tree2);
}

export const addGrass = function (scene: THREE.Scene, x: number, y: number) {
    const tree = new THREE.Mesh(geometryGrass, materialGrass);
    tree.position.set(x, 0, y);
    tree.rotation.set(0, Math.PI * 0.15, 0);
    scene.add(tree);

    const tree2 = new THREE.Mesh(geometryGrass, materialGrass);
    tree2.position.set(x, 0, y);
    tree2.rotation.set(0, Math.PI * -0.15, 0);
    scene.add(tree2);
}