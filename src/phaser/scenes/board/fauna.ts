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

const materialTree = unlitMaterial(mapTree);
const materialGrass = unlitMaterial(mapGrass);

function unlitMaterial(texture: THREE.Texture) {
    return new THREE.ShaderMaterial( {
        uniforms: {
            color: {value: new THREE.Vector3(1, 1, 1)},
            mytex: {value: texture},
        },
        vertexShader: vertShaderCode,
        fragmentShader: fragShaderCode,
        transparent: true,
        side: THREE.DoubleSide,
    } );
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