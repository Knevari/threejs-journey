import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Randomness
 */
function getRandomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Galaxy
 */
const parameters = {
  count: 40000,
  size: 0.01,
  radius: 6,
  branches: 5,
  spin: 1,
  speed: 0,
  randomness: 0.2,
  randomnessPower: 5,
};

const generateGalaxyWithUpdatedParams = generateGalaxy.bind(null, parameters);

gui
  .add(parameters, "count")
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateGalaxyWithUpdatedParams);
gui
  .add(parameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxyWithUpdatedParams);
gui
  .add(parameters, "radius")
  .min(0.01)
  .max(20)
  .step(0.001)
  .onFinishChange(generateGalaxyWithUpdatedParams);
gui
  .add(parameters, "branches")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxyWithUpdatedParams);
gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(0.0001)
  .onFinishChange(generateGalaxyWithUpdatedParams);
gui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxyWithUpdatedParams);
gui
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxyWithUpdatedParams);
gui
  .add(parameters, "speed")
  .min(0)
  .max(10)
  .step(0.1)
  .onFinishChange(generateGalaxyWithUpdatedParams);

function configureStarsOnBufferGeometry(params, geometry) {
  const positions = new Float32Array(params.count * 3);
  const colors = new Float32Array(params.count * 3);
  for (let i = 0; i < params.count * 3; i++) {
    const i0 = i * 3;
    const i1 = i * 3 + 1;
    const i2 = i * 3 + 2;

    const branchAngle = ((i % params.branches) / params.branches) * Math.PI * 2;
    const radius = getRandomBetween(0, params.radius);
    const spinAngle = radius * params.spin;

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      parameters.randomness *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      parameters.randomness *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      parameters.randomness *
      (Math.random() < 0.5 ? 1 : -1);

    positions[i0] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i1] = randomY;
    positions[i2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const color = new THREE.Color(
      `hsl(${(radius / params.radius) * 360}, 100%, 60%)`
    );

    colors[i0] = color.r;
    colors[i1] = color.g;
    colors[i2] = color.b;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
}

let geometry;
let material;
let particles;

function recycleGalaxyObjects() {
  if (particles) {
    geometry.dispose();
    material.dispose();
    scene.remove(particles);
  }
}

function generateGalaxy(params) {
  // Get rid of old objects
  recycleGalaxyObjects();

  geometry = new THREE.BufferGeometry();

  // Position particles
  configureStarsOnBufferGeometry(params, geometry);

  // Configure how material looks
  material = new THREE.PointsMaterial();
  material.size = params.size;
  material.sizeAttenuation = true;
  material.depthWrite = false;
  material.blending = THREE.AdditiveBlending;
  material.vertexColors = true;

  // Add galaxy to scene
  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

generateGalaxy(parameters);

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
camera.position.x = 3;
camera.position.y = 3;
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

const CENTER = new THREE.Vector3(0, 0, 0);

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (particles) {
    const direction = parameters.spin < 0 ? -1 : 1;
    particles.rotation.y = elapsedTime * 0.2 * parameters.speed * direction;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
