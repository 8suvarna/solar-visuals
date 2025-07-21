const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0x333333));
const light = new THREE.PointLight(0xffffff, 2, 2000);
scene.add(light);

// Sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(14, 64, 64),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
);
scene.add(sun);

// Planet Data
const planetsData = [
  { name: "Mercury", size: 2, dist: 20, color: 0xaaaaff, speed: 0.02, info: "Mercury is the closest planet to the Sun." },
  { name: "Venus", size: 2.5, dist: 30, color: 0xffcc88, speed: 0.015, info: "Venus has a thick, toxic atmosphere." },
  { name: "Earth", size: 3, dist: 40, color: 0x3399ff, speed: 0.01, info: "Earth is our home planet." },
  { name: "Mars", size: 2.8, dist: 50, color: 0xff5533, speed: 0.008, info: "Mars is known as the Red Planet." },
  { name: "Jupiter", size: 5, dist: 65, color: 0xffaa77, speed: 0.006, info: "Jupiter is the largest planet." },
  { name: "Saturn", size: 4.5, dist: 80, color: 0xffdd99, speed: 0.005, info: "Saturn has beautiful rings." },
  { name: "Uranus", size: 3.5, dist: 95, color: 0x66ccff, speed: 0.004, info: "Uranus rotates on its side." },
  { name: "Neptune", size: 3.5, dist: 110, color: 0x3366ff, speed: 0.003, info: "Neptune is farthest from the Sun." },
];

const planets = [];
const labels = {};
const sliders = document.querySelector('.sliders');

// Create Planets
planetsData.forEach(data => {
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(data.size, 32, 32),
    new THREE.MeshStandardMaterial({ color: data.color })
  );

  const pivot = new THREE.Object3D();
  pivot.add(planet);
  planet.position.x = data.dist;
  scene.add(pivot);

  // Orbit Ring
  const orbit = new THREE.Mesh(
    new THREE.RingGeometry(data.dist - 0.2, data.dist + 0.2, 64),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.2 })
  );
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);

  // Label
  const label = document.createElement('div');
  label.className = 'label';
  label.innerText = data.name;
  document.body.appendChild(label);
  labels[data.name] = label;

  // Slider
  const sliderLabel = document.createElement('label');
  sliderLabel.innerHTML = `${data.name} Speed: <input type="range" min="0" max="0.05" step="0.001" value="${data.speed}" data-name="${data.name}">`;
  sliders.appendChild(sliderLabel);

  planets.push({ ...data, mesh: planet, pivot, angle: 0 });
});

// Moon for Earth
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(1, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0x888888 })
);
const moonOrbit = new THREE.Object3D();
moonOrbit.add(moon);
moon.position.x = 5;
planets.find(p => p.name === "Earth").mesh.add(moonOrbit);

let paused = false;
document.getElementById("pauseBtn").onclick = () => {
  paused = !paused;
  document.getElementById("pauseBtn").innerText = paused ? "Resume" : "Pause";
};

// Speed Control
document.querySelectorAll("input[type=range]").forEach(slider => {
  slider.addEventListener("input", e => {
    const planet = planets.find(p => p.name === e.target.dataset.name);
    if (planet) planet.speed = parseFloat(e.target.value);
  });
});

// Click Info
window.addEventListener("click", (e) => {
  const mouse = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
  if (intersects.length > 0) {
    const clicked = planets.find(p => p.mesh === intersects[0].object);
    if (clicked) {
      document.getElementById("modalTitle").innerText = clicked.name;
      document.getElementById("modalBody").innerText = clicked.info;
      document.getElementById("infoModal").style.display = "block";
      document.getElementById("infoModalClose").style.display = "block";
    }
  }
});

document.getElementById("infoModalClose").onclick = () => {
  document.getElementById("infoModal").style.display = "none";
  document.getElementById("infoModalClose").style.display = "none";
};

camera.position.z = 150;

function animate() {
  requestAnimationFrame(animate);
  if (!paused) {
    planets.forEach(p => {
      p.angle += p.speed;
      p.mesh.position.x = Math.cos(p.angle) * p.dist;
      p.mesh.position.z = Math.sin(p.angle) * p.dist;

      // Moon
      if (p.name === "Earth") {
        moonOrbit.rotation.y += 0.05;
      }

      // Label Update
      const vector = p.mesh.position.clone().project(camera);
      const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
      labels[p.name].style.left = `${x}px`;
      labels[p.name].style.top = `${y}px`;
    });
  }
  renderer.render(scene, camera);
}

animate();
