// Import Three.js and OrbitControls
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
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
    map: new THREE.TextureLoader().load("backgroundfour.png"),
    side: THREE.BackSide,
    opacity: 0.3,
  })
);
scene.add(backgroundSphere);

// add shoe.glb
let shoe;
const shoeMeshes = [];

const loader = new GLTFLoader();
loader.load(
  "shoe.glb",
  (gltf) => {
    shoe = gltf.scene;
    shoe.position.y = 2;
    shoe.scale.set(1, 1, 1);
    shoe.castShadow = true;
    shoe.receiveShadow = true;
    shoe.rotation.y = Math.PI / -2;

    const leatherTexture = new THREE.TextureLoader().load("fabric/leather.jpg");
    const leatherNormal = new THREE.TextureLoader().load(
      "fabric/leatherNorm.jpg"
    );
    const leatherReflect = new THREE.TextureLoader().load(
      "fabric/leatherReflect.jpg"
    );
    const leatherGloss = new THREE.TextureLoader().load(
      "fabric/leatherGloss.jpg"
    );
    leatherTexture.wrapS = THREE.RepeatWrapping;
    leatherTexture.wrapT = THREE.RepeatWrapping;
    leatherTexture.repeat.set(3, 3);

    const shoeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      normalMap: leatherNormal,
      displacementMap: leatherTexture,
      displacementScale: 0.1,
      envMap: leatherReflect,
      roughnessMap: leatherGloss,
    });

    scene.add(shoe);

    const lacesMesh = shoe.getObjectByName("laces");
    const soleBottomMesh = shoe.getObjectByName("sole_bottom");
    const soleTopMesh = shoe.getObjectByName("sole_top");
    const insideMesh = shoe.getObjectByName("inside");
    const outside1Mesh = shoe.getObjectByName("outside_1");
    const outside2Mesh = shoe.getObjectByName("outside_2");
    const outside3Mesh = shoe.getObjectByName("outside_3");

    shoeMeshes.push(
      lacesMesh,
      soleBottomMesh,
      soleTopMesh,
      insideMesh,
      outside1Mesh,
      outside2Mesh,
      outside3Mesh
    );
  },

  undefined,
  (error) => {
    console.error("An error occurred while loading the model:", error);
  }
);

// move event select object in shoe when hoover
//make a raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
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
        if (!child.userData.selectedColor) {
          child.material.color.set(child.originalColor || 0xffffff);
        }
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
        if (!lastHoveredObject.userData.selectedColor) {
          lastHoveredObject.material.color.set(
            lastHoveredObject.originalColor || 0xffffff
          );
        }
        lastHoveredObject.material.emissive.set(0x000000);
      }

      // Update the last hovered object
      lastHoveredObject = intersectedObject;
    } else {
      // When no object is intersected, reset the last hovered object if any
      if (lastHoveredObject) {
        if (!lastHoveredObject.userData.selectedColor) {
          lastHoveredObject.material.color.set(
            lastHoveredObject.originalColor || 0xffffff
          );
        }
        lastHoveredObject.material.emissive.set(0x000000);
        lastHoveredObject = null; // Clear the reference
      }
    }
  }
});

// click event select object in shoe and camera animation
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

let selectedColor = null;
document.querySelectorAll(".colorOption .box").forEach((box) => {
  box.addEventListener("click", (event) => {
    selectedColor = `#${event.target.getAttribute("data-color")}`;
    // Apply the selected color to the last selected object
    if (lastSelectedObject && selectedColor) {
      lastSelectedObject.material.color.set(selectedColor);
      lastSelectedObject.userData.selectedColor = selectedColor; // Store the selected color
    }
  });
});

let lastSelectedObject = null;
let selectedShoePart = null;
let selectedFabric = null;

function toggleDivs() {
  engravingDiv.style.display = "none";
  optionsDiv.style.display = "flex";
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
    const shoeParts = [
      "laces",
      "sole_bottom",
      "sole_top",
      "inside",
      "outside_1",
      "outside_2",
      "outside_3",
    ];

    if (shoeParts.includes(intersectedObject.name)) {
      // Set the last selected object
      lastSelectedObject = intersectedObject;
      selectedShoePart = intersectedObject;

      // Check if the intersected object has a name and animate the camera accordingly
      switch (intersectedObject.name) {
        case "laces":
          animateCamera({ x: -9, y: 9, z: 2 }, ".laces");
          toggleDivs();
          break;
        case "outside_1":
          animateCamera({ x: -2, y: 6, z: 4 }, ".outside_1");
          toggleDivs();
          break;
        case "outside_2":
          animateCamera({ x: 3, y: 6, z: 4 }, ".outside_2");
          toggleDivs();
          break;
        case "outside_3":
          animateCamera({ x: -6, y: 5.5, z: 3 }, ".outside_3");
          toggleDivs();
          break;
        case "inside":
          animateCamera({ x: -6, y: 7, z: 3 }, ".inside");
          toggleDivs();
          break;
        case "sole_bottom":
          animateCamera({ x: -2, y: 0, z: 6 }, ".sole_bottom");
          toggleDivs();
          break;
        case "sole_top":
          animateCamera({ x: -6, y: 5, z: 6 }, ".sole_top");
          toggleDivs();
          break;
      }
    }
  }
});

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

document.querySelectorAll(".fabricOption .box-fabric").forEach((box) => {
  box.addEventListener("click", (event) => {
    console.log("Window clicked");
    const fabricType = event.target.getAttribute("data-fabric");

    switch (fabricType) {
      case "leather":
        selectedFabric = {
          texture: new THREE.TextureLoader().load("/fabric/leather.jpg", () => {
            console.log("Leather texture loaded");
          }),
          normalMap: new THREE.TextureLoader().load(
            "/fabric/leatherNorm.jpg",
            () => {
              console.log("Leather normal map loaded");
            }
          ),
          roughnessMap: new THREE.TextureLoader().load(
            "/fabric/leatherGloss.jpg",
            () => {
              console.log("Leather roughness map loaded");
            }
          ),
          envMap: new THREE.TextureLoader().load(
            "/fabric/leatherReflect.jpg",
            () => {
              console.log("Leather env map loaded");
            }
          ),
        };
        break;
      case "velvet":
        selectedFabric = {
          texture: new THREE.TextureLoader().load("/fabric/velvet.png", () => {
            console.log("Velvet texture loaded");
          }),
          normalMap: new THREE.TextureLoader().load(
            "/fabric/velvetNorm.png",
            () => {
              console.log("Velvet normal map loaded");
            }
          ),
          roughnessMap: new THREE.TextureLoader().load(
            "/fabric/velvetRough.png",
            () => {
              console.log("Velvet roughness map loaded");
            }
          ),
          envMap: new THREE.TextureLoader().load(
            "/fabric/velvetMetal.png",
            () => {
              console.log("Velvet env map loaded");
            }
          ),
        };
        break;
      case "denim":
        selectedFabric = {
          texture: new THREE.TextureLoader().load("/fabric/denim.jpg", () => {
            console.log("Denim texture loaded");
          }),
          normalMap: new THREE.TextureLoader().load(
            "/fabric/denimNorm.jpg",
            () => {
              console.log("Denim normal map loaded");
            }
          ),
          roughnessMap: new THREE.TextureLoader().load(
            "/fabric/denimSpec.jpg",
            () => {
              console.log("Denim roughness map loaded");
            }
          ),
          envMap: new THREE.TextureLoader().load("/fabric/denimOcc.jpg", () => {
            console.log("Denim env map loaded");
          }),
        };
        break;
      case "polyester":
        selectedFabric = {
          texture: new THREE.TextureLoader().load(
            "/fabric/polyester.png",
            () => {
              console.log("Polyester texture loaded");
            }
          ),
          normalMap: new THREE.TextureLoader().load(
            "/fabric/polyesterNorm.png",
            () => {
              console.log("Polyester normal map loaded");
            }
          ),
          roughnessMap: null,
          envMap: null,
        };
        break;
      case "metal":
        selectedFabric = {
          texture: new THREE.TextureLoader().load(
            "/fabric/metalColor.jpg",
            () => {
              console.log("Metal texture loaded");
            }
          ),
          normalMap: new THREE.TextureLoader().load(
            "/fabric/metalColor.jpg",
            () => {
              console.log("Metal normal map loaded");
            }
          ),
          roughnessMap: null,
          envMap: null,
        };
        break;
    }
    if (selectedShoePart) {
      console.log(`Applying fabric to ${selectedShoePart.name}`);
      applyFabricToShoePart(selectedShoePart, selectedFabric);
    }
  });
});

function applyFabricToShoePart(shoePart, fabric) {
  if (!fabric.texture) {
    console.error("Fabric texture is not loaded");
    return;
  }
  shoePart.material.map = fabric.texture;
  shoePart.material.normalMap = fabric.normalMap || null;
  shoePart.material.roughnessMap = fabric.roughnessMap || null;
  shoePart.material.envMap = fabric.envMap || null;
  shoePart.material.needsUpdate = true;
}
// Position the camera
camera.position.z = 10;
camera.position.y = 3;

const engraveLink = document.querySelector(".engraving");
const otherLinks = document.querySelectorAll(".nav a:not(.engraving)");
const engravingDiv = document.querySelector(".engrave");
const optionsDiv = document.querySelector(".options");
const engraveInput = document.getElementById("engraveText");
const engraveButton = document.getElementById("engraveButton");

document.addEventListener("DOMContentLoaded", () => {
  function styleNavChildren(targetClass) {
    const nav = document.querySelector(".nav");
    const children = nav.children;
    for (let i = 0; i < children.length; i++) {
      children[i].style.opacity = "0.5";
      children[i].style.fontWeight = "normal";
    }
    document.querySelector(targetClass).style.opacity = "1";
    document.querySelector(targetClass).style.fontWeight = "bold";
  }

  engraveLink.addEventListener("click", (event) => {
    event.preventDefault();
    console.log("Engrave link clicked");
    engravingDiv.style.display = "flex";
    optionsDiv.style.display = "none";
    styleNavChildren(".engraving");
    animateCamera({ x: 1.5, y: 6, z: 3.5 }, ".engraving");
  });

  otherLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      console.log("Other link clicked");
      toggleDivs();
      styleNavChildren(`.${event.target.className}`);
    });
  });

  engraveButton.addEventListener("click", () => {
    const text = engraveInput.value;
    console.log(`Engraving text: ${text}`);
    addInitialsToOutside2(text);
  });
});

function addInitialsToOutside2(text) {
  const outside2Part = scene.getObjectByName("outside_2");
  console.log(outside2Part); // Check if the object is found

  if (!outside2Part) {
    console.log("Error: Could not find outside_2 part.");
    return;
  }

  // Remove previous engraving if it exists
  const previousEngraving = outside2Part.getObjectByName("engravingText");
  if (previousEngraving) {
    outside2Part.remove(previousEngraving);
  }

  const fontLoader = new FontLoader();
  fontLoader.load(
    "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json",
    (font) => {
      console.log("Font loaded successfully");

      const textGeometry = new TextGeometry(text, {
        font: font,
        size: 0.3,
        height: 0.05,
        curveSegments: 12,
      });

      const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.name = "engravingText";

      const boundingBox = new THREE.Box3().setFromObject(outside2Part);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      boundingBox.getSize(size);
      boundingBox.getCenter(center);
      textMesh.rotation.y = Math.PI / 2;
      textMesh.position.set(center.x + 2.5, center.y - 1.8, center.z - 1.6);

      textMesh.castShadow = true;
      textMesh.receiveShadow = true;

      outside2Part.add(textMesh);
      console.log(`Added initials "${text}" to outside_2`);
    }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const orderBtn = document.querySelector(".btn");
  const succes = document.querySelector(".succes");

  orderBtn.addEventListener("click", (event) => {
    event.preventDefault();
    succes.style.display = "flex";
    optionsDiv.style.display = "none";
  });
});
document.querySelector(".close-btn").addEventListener("click", function () {
  document.querySelector(".succes").style.display = "none";
});

const shoeConfig = {
  colors: {}, // Dynamically populate with part: color
  fabrics: {}, // Dynamically populate with part: fabric
  size: null,  // Dynamically set size
  initials: null, // Dynamically set initials
};

// Update color and fabric for selected parts dynamically
document.querySelectorAll(".colorOption .box").forEach((box) => {
  box.addEventListener("click", (event) => {
    const color = `#${event.target.getAttribute("data-color")}`;
    if (lastSelectedObject) {
      const partName = lastSelectedObject.name;
      shoeConfig.colors[partName] = color;
      lastSelectedObject.material.color.set(color);
    }
  });
});

document.querySelectorAll(".fabricOption .box-fabric").forEach((box) => {
  box.addEventListener("click", (event) => {
    const fabricType = event.target.getAttribute("data-fabric");
    if (lastSelectedObject) {
      const partName = lastSelectedObject.name;
      shoeConfig.fabrics[partName] = fabricType;
    }
  });
});

// Handle size selection
document.getElementById("size").addEventListener("change", (event) => {
  shoeConfig.size = parseInt(event.target.value.replace("size-", ""));
});

// Handle initials
document.getElementById("engraveButton").addEventListener("click", () => {
  const initials = document.getElementById("engraveText").value.trim();
  shoeConfig.initials = initials;
});

// Handle Order button click
document.querySelector(".btn").addEventListener("click", (event) => {
  event.preventDefault();

  // Validate shoeConfig before proceeding
  if (!shoeConfig.size) {
    alert("Please select a size.");
    return;
  }
  if (Object.keys(shoeConfig.colors).length === 0) {
    alert("Please choose colors for the shoe parts.");
    return;
  }
  if (Object.keys(shoeConfig.fabrics).length === 0) {
    alert("Please choose fabrics for the shoe parts.");
    return;
  }

  // Save the configuration in localStorage
  localStorage.setItem("shoeConfig", JSON.stringify(shoeConfig));

  // Redirect to the Vue.js order page
  window.location.href = "https://frontend-eaoe.onrender.com/order";
});


// Rotate the cube and update controls
function animate() {
  requestAnimationFrame(animate);
  backgroundSphere.rotation.y += 0.001;
  backgroundSphere.rotation.x += 0.001;
  controls.update(); // Required if damping is enabled
  renderer.render(scene, camera);
  raycaster.setFromCamera(pointer, camera);
  //set camera to look at the shoe
  // camera.lookAt(shoe.position);
}

// Handle window resizing
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

animate();
