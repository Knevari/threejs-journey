import "./style.css";
import * as THREE from "three";
const canvas = document.querySelector(".webgl");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight
);
camera.position.z = 5;
scene.add(camera);

const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);

const group = new THREE.Group();
scene.add(group);

group.add();

group.rotation.reorder("YXZ");
group.rotation.x = -2;
group.rotation.y = 1;

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);
