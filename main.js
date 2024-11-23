// Import Three.js and OrbitControls
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GUI } from "dat.gui";
import gsap from "gsap";

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

//Set up OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth deceleration
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.enableRotate = true;
// Limit y-axis (vertical) movement
controls.maxPolarAngle = Math.PI / 2; // Adjust this value as needed
controls.minPolarAngle = Math.PI / 4; // Adjust this value as needed
// Disable x-axis (horizontal) movement
// controls.maxAzimuthAngle = 0; // Lock horizontal rotation
// controls.minAzimuthAngle = 0; // Lock horizontal rotation
//limit z-axis movement
controls.minDistance = 6; // Adjust this value as needed
controls.maxDistance = 10; // Adjust this value as needed
// Adjust movement speed
controls.rotateSpeed = 0.3; // Lower value for slower rotation
controls.zoomSpeed = 0.3; // Lower value for slower zoom

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
const shoeMeshes = [];
let isDragging = false;

document.addEventListener("mousedown", (event) => {
  isDragging = true;
  previousMouseX = event.clientX;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

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
    shoe.position.y = 2;
    shoe.scale.set(1, 1, 1);
    shoe.castShadow = true;
    shoe.receiveShadow = true;
    scene.add(shoe);
    shoe.rotation.y = Math.PI / -2;

    // add on click shoe movement turns around
    // let previousMouseX = 0;
    // document.addEventListener("mousemove", (event) => {
    //   if (isDragging) {
    //     const movementX = event.movementX || 0;
    //     shoe.rotation.y += (movementX * Math.PI) / 180 / 4;
    //   }
    // });
  },

  undefined,
  (error) => {
    console.error("An error occurred while loading the model:", error);
  }
);

//change color function
function onColorOptionClick(event) {
  const selectedColor = new THREE.Color(
    parseInt(event.target.dataset.color, 16)
  );
  // Apply the selected color to the entire shoe
  if (selectedPart) {
    switch (selectedPart.name) {
      case "Laces":
        customizationData.lacesColor = selectedColor;
        break;
      case "Sole bottom":
        customizationData.soleBottomColor = selectedColor;
        break;
      case "sole top":
        customizationData.soleTopColor = selectedColor;
        break;
      case "Lining":
        customizationData.liningColor = selectedColor;
        break;
      case "Front part":
        customizationData.frontPartColor = selectedColor;
        break;
      case "Upper part":
        customizationData.upperPartColor = selectedColor;
        break;
      case "Body":
        customizationData.bodyColor = selectedColor;
        break;

      // Add cases for other parts as needed
    }
    if (selectedPart.material) {
      selectedPart.material.color.copy(selectedColor);
      partColors.set(selectedPart.uuid, selectedColor);
    }

    // Add or remove the 'selected' class based on the selected color
    const selectedBox = document.querySelector(".box.selected");
    if (selectedBox) {
      selectedBox.classList.remove("selected");
    }
    event.target.classList.add("selected");
  }
}
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
// add a mouse click event with a gsap animation to move the camera to the clicked object for every object

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

function styleNavChildren() {
  const nav = document.querySelector(".nav");
  const children = nav.children;
  for (let i = 0; i < children.length; i++) {
    children[i].style.opacity = "0.5";
    children[i].style.fontWeight = "normal";
  }
}

function animateCamera(position, targetClass) {
  gsap.to(camera.position, {
    x: position.x,
    y: position.y,
    z: position.z,
    duration: 1,
    onUpdate: () => {
      camera.lookAt(new THREE.Vector3(position.x, position.y, position.z));
    },
  });
  styleNavChildren();
  document.querySelector(targetClass).style.opacity = "1";
  document.querySelector(targetClass).style.fontWeight = "bold";
}

window.addEventListener("click", (event) => {
  // Get the mouse coordinates in normalized device coordinates
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Update the raycaster with the pointer and camera
  raycaster.setFromCamera(pointer, camera);

  // Get intersected objects
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const firstIntersect = intersects[0];
    const intersectedObject = firstIntersect.object;

    // Check if the intersected object has a name and animate the camera accordingly
    switch (intersectedObject.name) {
      case "laces":
        animateCamera({ x: -9, y: 9, z: 2 }, ".laces");
        break;
      case "outside_1":
        animateCamera({ x: -2, y: 6, z: 4 }, ".outside_1");
        break;
      case "outside_2":
        animateCamera({ x: 3, y: 6, z: 4 }, ".outside_2");
        break;
      case "outside_3":
        animateCamera({ x: -6, y: 5.5, z: 3 }, ".outside_3");
        break;
      case "inside":
        animateCamera({ x: -6, y: 7, z: 3 }, ".inside");
        break;
      case "sole_bottom":
        animateCamera({ x: -2, y: 0, z: 6 }, ".sole_bottom");
        break;
      case "sole_top":
        animateCamera({ x: -6, y: 5, z: 6 }, ".sole_top");
        break;
    }
  }
});

// Add event listeners to the navigation buttons
document.getElementById("laces").addEventListener("click", () => {
  animateCamera({ x: -9, y: 9, z: 2 }, ".laces");
});
document.getElementById("outside_1").addEventListener("click", () => {
  animateCamera({ x: -2, y: 6, z: 4 }, ".outside_1");
});
document.getElementById("outside_2").addEventListener("click", () => {
  animateCamera({ x: 3, y: 6, z: 4 }, ".outside_2");
});
document.getElementById("outside_3").addEventListener("click", () => {
  animateCamera({ x: -6, y: 5.5, z: 3 }, ".outside_3");
});
document.getElementById("inside").addEventListener("click", () => {
  animateCamera({ x: -6, y: 7, z: 3 }, ".inside");
});
document.getElementById("sole_bottom").addEventListener("click", () => {
  animateCamera({ x: -2, y: 0, z: 6 }, ".sole_bottom");
});
document.getElementById("sole_top").addEventListener("click", () => {
  animateCamera({ x: -6, y: 5, z: 6 }, ".sole_top");
});

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
