import "./style.css";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

const canvas = document.querySelector("canvas");

const scene = new THREE.Scene();
const fog = new THREE.Fog("#1e1a2f", 2, 45);
scene.fog = fog;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(0, 0, 4);
scene.add(camera);

const renderer = new THREE.WebGL1Renderer({
  canvas,
});

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const matcapTexture = textureLoader.load("/textures/matcaps/1.png");

/**
 * Helpers
 */
function getRandomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Objects
 */
const objectsConfiguration = {
  count: 300,
  minSpawnRadius: 2,
  maxSpawnRadius: 30,
  branches: 10,
};

const objectsGroup = new THREE.Group();
const objectGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const objectMaterial = new THREE.MeshStandardMaterial({ color: "#101010" });
const objects = [];

const getObjectRandomRadius = () =>
  getRandomBetween(
    objectsConfiguration.minSpawnRadius,
    objectsConfiguration.maxSpawnRadius
  );

const getObjectAngle = (objectIndex) =>
  ((objectIndex % objectsConfiguration.branches) /
    objectsConfiguration.branches) *
  Math.PI *
  2;

for (let i = 0; i < objectsConfiguration.count; i++) {
  const mesh = new THREE.Mesh(objectGeometry, objectMaterial);

  const radius = getObjectRandomRadius();
  const angle = getObjectAngle(i);

  const ox = getRandomBetween(-20, 20);
  const oy = getRandomBetween(-10, 20);
  const oz = getRandomBetween(0, 200) - 210;

  const rx = Math.cos(angle);
  const ry = Math.sin(angle);
  const rz = 0;

  mesh.position.set(ox, oy, oz);
  mesh.rotation.set(rx, ry, rz);

  objectsGroup.add(mesh);
  objects.push(mesh);
}

scene.add(objectsGroup);
// objectsGroup.visible = false;

/**
 * Particles
 */
const particlesConfiguration = {
  count: 3000,
  color: "#ffffff",
  amplitude: 20,
};

const getRandomParticleCoordinate = () =>
  getRandomBetween(
    -particlesConfiguration.amplitude,
    particlesConfiguration.amplitude
  );

const particlesGroup = new THREE.Group();
const particlesGeometry = new THREE.BufferGeometry();
const particlesMaterial = new THREE.PointsMaterial({
  color: particlesConfiguration.color,
  size: 0.02,
  sizeAttenuation: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  // vertexColors: true,
});

const positions = new Float32Array(particlesConfiguration.count * 3);

for (let i = 0; i < particlesConfiguration.count * 3; i++) {
  const i0 = i * 3;
  const i1 = i * 3 + 1;
  const i2 = i * 3 + 2;
  positions[i0] = getRandomParticleCoordinate();
  positions[i1] = -0.5;
  positions[i2] = getRandomParticleCoordinate();
}

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
particlesGroup.add(particles);

scene.add(particlesGroup);
// particlesGroup.visible = false;

// const

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("#9B1FE8", 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("#9B1FE8", 1);
directionalLight.position.set(2, 8, 16);
scene.add(directionalLight);

const rectAreaLight = new THREE.RectAreaLight("#4edf00");
scene.add(rectAreaLight);

/**
 * Text
 */
const fontLoader = new FontLoader();
fontLoader.load("/fonts/helvetiker_regular.typeface.json", function (font) {
  const textGeometry = new TextGeometry("Knevari", {
    font,
    size: 0.5,
    height: 0.2,
    curveSegments: 6,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 4,
  });
  textGeometry.center();

  const material = new THREE.MeshNormalMaterial();
  const text = new THREE.Mesh(textGeometry, material);
  scene.add(text);
});

/**
 * Config Stuff
 */
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const cursor = { x: 0, y: 0 };

window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = e.clientY / sizes.height - 0.5;
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor("#1e1a2f");

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup);

const clock = new THREE.Clock();
let previousTime = 0;

function tick() {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;

  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  camera.rotation.x = (Math.sin(elapsedTime) - 0.5) * 0.01;
  camera.rotation.z = (Math.sin(elapsedTime) - 0.5) * 0.01;
  camera.rotation.y = (Math.sin(elapsedTime) - 0.5) * 0.01;

  for (const object of objects) {
    object.position.y += deltaTime * 5;
    if (object.position.y > 20) object.position.y = -10;
    object.rotation.x += deltaTime * 0.1;
    object.rotation.y += deltaTime * 0.12;
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}

tick();
