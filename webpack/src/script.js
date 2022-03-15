import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const getRandomIntBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const getArrayOfSize = (size) => Array.from({ length: size });

const getRandomFromArray = (arr) => arr[getRandomIntBetween(0, arr.length)];

const canvas = document.querySelector(".webgl");

const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const colors = ["green", "yellow", "red", "blue"];

const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
camera.position.z = 30;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const light = new THREE.AmbientLight(0x404040);
scene.add(light);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

// Render a bunch of random torus
const geometries = getArrayOfSize(getRandomIntBetween(15, 30)).map(
  () =>
    new THREE.Mesh(
      new THREE.TorusGeometry(
        getRandomIntBetween(8, 15),
        getRandomIntBetween(3, 5),
        30,
        100
      ),
      new THREE.MeshNormalMaterial({
        // color: new THREE.Color(0x6A9BD7),
        flatShading: true,
      })
    )
);

const group = new THREE.Group();
scene.add(group);

geometries.forEach((geometry) => {
  geometry.position.set(
    getRandomIntBetween(-35, 35),
    getRandomIntBetween(-35, 35),
    getRandomIntBetween(-35, 100)
  );

  geometry.rotation.reorder("YXZ");
  geometry.rotation.set(
    Math.PI * Math.random() * 2,
    Math.PI * Math.random() * 2,
    Math.PI * Math.random() * 2
  );
});
geometries.forEach((geometry) => group.add(geometry));

function update() {
  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

update();
