// Import Three.js and OrbitControls
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GUI } from "dat.gui";

import "./style.css";

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xeeeeee); // Light gray background
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Set up OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth deceleration
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Add ambientlighting
const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Soft white light
scene.add(ambientLight);

//directionallight
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// add backgroundphere with space.png
const backgroundSphere = new THREE.Mesh(
  new THREE.SphereGeometry(500, 60, 40),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("backgroundcolours.png"),
    side: THREE.BackSide,
  })
);
scene.add(backgroundSphere);

// add shoe.glb
let shoe;

const loader = new GLTFLoader();
loader.load(
  "shoe.glb",
  (gltf) => {
    // change material to standard white(.map)
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.2,
          roughness: 0.5,
        });
      }
    });
    shoe = gltf.scene;
    shoe.position.y = 0;
    shoe.scale.set(1, 1, 1);
    shoe.castShadow = true;
    shoe.receiveShadow = true;
    scene.add(shoe);
    shoe.rotation.y = Math.PI / -2;
  },
  undefined,
  (error) => {
    console.error("An error occurred while loading the model:", error);
  }
);

//make a raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

//mouse click
// window.addEventListener("click", (event) => {
//   pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
//   pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

//   raycaster.setFromCamera(pointer, camera);

//   const intersects = raycaster.intersectObjects(scene.children, true);

//   if (intersects.length > 0) {
//     const firstIntersect = intersects[0];
//     if (
//       firstIntersect.object.material &&
//       firstIntersect.object.material.color
//     ) {
//       firstIntersect.object.material.color.set(0xff0000);
//     }
//     console.log(
//       "Clicked object:",
//       firstIntersect.object.name || firstIntersect.object
//     );
//   }
// });

// Store original colors of the objects
scene.children.forEach((child) => {
  if (child.material && child.material.color) {
    child.originalColor = child.material.color.getHex(); // Store original color
  }
});

let lastHoveredObject = null;

window.addEventListener("mousemove", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  // Reset all object colors back to their original color if not intersected
  scene.children.forEach((child) => {
    if (child.material && child.material.color) {
      // Reset color if it's not the currently hovered object
      if (
        intersects.length === 0 ||
        !intersects.some((intersect) => intersect.object === child)
      ) {
        child.material.color.set(child.originalColor || 0xffffff);
      }
    }
  });

  if (intersects.length > 0) {
    const firstIntersect = intersects[0];
    const intersectedObject = firstIntersect.object;

    // Check for specific object names and highlight in red
    const highlightedObjects = [
      "sole_bottom",
      "sole_top",
      "laces",
      "outside_1",
      "outside_2",
      "outside_3",
      "inside",
    ];

    if (highlightedObjects.includes(intersectedObject.name)) {
      if (intersectedObject.material && intersectedObject.material.color) {
        intersectedObject.material.emissive.set(0xc702fe); // Highlight in red
      }
      if (lastHoveredObject && lastHoveredObject !== intersectedObject) {
        lastHoveredObject.material.color.set(
          lastHoveredObject.originalColor || 0xffffff
        );
        lastHoveredObject.material.emissive.set(0x000000);
      }

      // Update the last hovered object
      lastHoveredObject = intersectedObject;
    } else {
      // When no object is intersected, reset the last hovered object if any
      if (lastHoveredObject) {
        lastHoveredObject.material.color.set(
          lastHoveredObject.originalColor || 0xffffff
        );
        lastHoveredObject.material.emissive.set(0x000000);
        lastHoveredObject = null; // Clear the reference
      }
    }
  }
});

// window.addEventListener("mousemove", (event) => {
//   pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
//   pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

//   raycaster.setFromCamera(pointer, camera);

//   const intersects = raycaster.intersectObjects(scene.children, true);

//   if (intersects.length > 0) {
//     const firstIntersect = intersects[0];
//     if (
//       firstIntersect.object.material &&
//       firstIntersect.object.material.color
//     ) {
//       firstIntersect.object.material.color.set(0x00ff00); // Highlight in green
//     }
//     gsap.to(camera.position, {
//       x: firstIntersect.point.x,
//       y: firstIntersect.point.y,
//       z: firstIntersect.point.z,
//       duration: 1,
//     });
//   }
// });

const gui = new GUI();
const settings = {
  lightIntensity: 0,
  shoeX: 0,
  shoeY: 0,
  shoeZ: 0,
  rotationSpeed: 0,
};

gui
  .add(settings, "lightIntensity", -2, 2, 0.1)
  .name("Light Intensity")
  .onChange((value) => {
    directionalLight.intensity = value;
  });

gui
  .add(settings, "shoeX", -5, 5, 0.1)
  .name("Shoe X Position")
  .onChange((value) => {
    shoe.position.x = value;
  });

gui
  .add(settings, "shoeY", -5, 5, 0.1)
  .name("Shoe Y Position")
  .onChange((value) => {
    shoe.position.y = value;
  });

gui
  .add(settings, "shoeZ", -5, 5, 0.1)
  .name("Shoe Z Position")
  .onChange((value) => {
    shoe.position.z = value;
  });

gui.add(settings, "rotationSpeed", 0, 0.1, 0.01).name("Rotation Speed");

// Position the camera
camera.position.z = 10;
camera.position.y = 3;

// Rotate the cube and update controls
function animate() {
  requestAnimationFrame(animate);

  // shoe.rotation.y += settings.rotationSpeed;

  controls.update(); // Required if damping is enabled
  renderer.render(scene, camera);
  raycaster.setFromCamera(pointer, camera);
}

// Handle window resizing
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

animate();
