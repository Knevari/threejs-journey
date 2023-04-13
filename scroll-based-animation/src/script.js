import * as THREE from "three";
import * as dat from "lil-gui";
import gsap from "gsap";

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: "#ffeded",
};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const gradientTexture = textureLoader.load("/textures/gradients/3.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

/**
 * Objects
 */
const objectsDistance = 4;

const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);

const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

mesh1.position.y = -objectsDistance * 0;
mesh2.position.y = -objectsDistance * 1;
mesh3.position.y = -objectsDistance * 2;

scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

/**
 * Particles
 */
const particlesCount = 300;
const positions = new Float32Array(particlesCount * 3);
const pointsGeometry = new THREE.BufferGeometry();
const pointsMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  size: 0.02,
  sizeAttenuation: true,
});
for (let i = 0; i < particlesCount * 3; i++) {
  const i0 = i * 3;
  const i1 = i * 3 + 1;
  const i2 = i * 3 + 2;
  positions[i0] = (Math.random() - 0.5) * 10;
  positions[i1] = objectsDistance * 0.4 - Math.random() * objectsDistance * 3;
  positions[i2] = (Math.random() - 0.5) * 10;
}
pointsGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
const particles = new THREE.Points(pointsGeometry, pointsMaterial);
scene.add(particles);

gui.addColor(parameters, "materialColor").onChange(() => {
  material.color.set(parameters.materialColor);
  pointsMaterial.color.set(parameters.materialColor);
});

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("#ffffff", 0.4);

const directionalLight = new THREE.DirectionalLight("#ffffff", 0.5);
directionalLight.position.set(1, 1, 0);

scene.add(ambientLight, directionalLight);

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
 * Cursor
 */
const cursor = { x: 0, y: 0 };

/**
 * Camera
 */
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);
  if (newSection !== currentSection) {
    currentSection = newSection;
    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+= 6",
      y: "+= 3",
      z: "+= 1.5",
    });
  }
});

window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const cameraOffsetX = (cursor.x / sizes.width - 0.5) * 0.5;
  const cameraOffsetY = (cursor.y / sizes.height - 0.5) * 0.5;

  cameraGroup.position.x +=
    (cameraOffsetX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (-cameraOffsetY - cameraGroup.position.y) * 5 * deltaTime;

  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
