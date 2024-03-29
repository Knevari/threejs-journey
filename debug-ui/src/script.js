import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import * as dat from "dat.gui";

const parameters = {
  color: 0xff0000,
  spin: () => {
    gsap.to(mesh.rotation, {
      duration: 1,
      x: mesh.rotation.x + Math.PI * 2 * 3,
      y: mesh.rotation.y + Math.PI * 2 * 3,
    });
  },
};

const gui = new dat.GUI();

const actionsFolder = gui.addFolder("Cube Actions");
actionsFolder.open();
actionsFolder.add(parameters, "spin").name("Spin");

/**
 * We have ranges, colors, texts, checkboxes, selects, buttons and folders
 * Classes:
 *  - Range
 *  - Color
 *  - Text
 *  - Checkbox
 *  - Select
 *  - Button
 *  - Folder
 */

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: parameters.color });
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

// Debug
const cubePosFolder = gui.addFolder("Cube Position");

cubePosFolder.open();
cubePosFolder
  .add(mesh.position, "x")
  .min(-10)
  .max(10)
  .step(0.01)
  .name("Cube X");
cubePosFolder
  .add(mesh.position, "y")
  .min(-10)
  .max(10)
  .step(0.01)
  .name("Cube Y");
cubePosFolder
  .add(mesh.position, "z")
  .min(-10)
  .max(10)
  .step(0.01)
  .name("Cube Z");

const cubeVisibilityFolder = gui.addFolder("Cube Visibility");

cubeVisibilityFolder.open();
cubeVisibilityFolder.add(mesh, "visible").name("Is Visible");
cubeVisibilityFolder.add(material, "wireframe").name("Show Wireframe");
cubeVisibilityFolder
  .addColor(parameters, "color")
  .name("Cube Color")
  .onChange(() => {
    material.color.set(parameters.color);
  });

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
