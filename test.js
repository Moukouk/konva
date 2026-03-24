import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OBJExporter } from "https://unpkg.com/three@0.160.0/examples/jsm/exporters/OBJExporter.js";

// ================================================================
// DOM ELEMENTS
// ================================================================
const container = document.getElementById("canvas-container");
const previewCanvas = document.getElementById("previewCanvas");
const previewCtx = previewCanvas.getContext("2d", { willReadFrequently: true });

const el = (id) => document.getElementById(id);

const ui = {
  imageUpload: el("imageUpload"),
  detectionMode: el("detectionMode"),
  threshold: el("threshold"),
  thresholdHigh: el("thresholdHigh"),
  gaussBlur: el("gaussBlur"),
  profilePoints: el("profilePoints"),
  splineSubdivisions: el("splineSubdivisions"),
  smoothing: el("smoothing"),
  latheSegments: el("latheSegments"),
  modelHeight: el("modelHeight"),
  closedTop: el("closedTop"),
  closedBottom: el("closedBottom"),
  materialType: el("materialType"),
  envMapEnabled: el("envMapEnabled"),
  bloomEnabled: el("bloomEnabled"),
  bloomStrength: el("bloomStrength"),
  imageOpacity: el("imageOpacity"),
  wireframe: el("wireframe"),
  showProfileLine: el("showProfileLine"),
  resetCamera: el("resetCamera"),
  exportOBJ: el("exportOBJ"),
  exportPNG: el("exportPNG"),
  status: el("status"),
  cvStatus: el("cvStatus"),
};

// ================================================================
// OpenCV.js readiness
// ================================================================
let cvReady = false;

function onOpenCvReady() {
  cvReady = true;
  ui.cvStatus.textContent = "OpenCV.js prêt ✓";
  ui.cvStatus.style.color = "#34d399";
}

// OpenCV.js fires cv['onRuntimeInitialized']
if (typeof cv !== "undefined" && cv.Mat) {
  onOpenCvReady();
} else {
  // polled check — because the async script may load before or after this module
  const poll = setInterval(() => {
    if (typeof cv !== "undefined") {
      if (cv.Mat) {
        clearInterval(poll);
        onOpenCvReady();
      } else if (cv.onRuntimeInitialized === undefined) {
        cv.onRuntimeInitialized = () => {
          clearInterval(poll);
          onOpenCvReady();
        };
      }
    }
  }, 200);
}

// ================================================================
// THREE.JS SCENE
// ================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f0f1a);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 4, 10);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 2.5, 0);

// ================================================================
// POSTPROCESSING — Bloom
// ================================================================
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.4,  // strength
  0.6,  // radius
  0.7   // threshold
);
composer.addPass(bloomPass);

// ================================================================
// ENVIRONMENT MAP (procedural studio HDRI)
// ================================================================
let envMap = null;

function generateEnvMap() {
  const pmremGen = new THREE.PMREMGenerator(renderer);
  pmremGen.compileEquirectangularShader();

  // Create a simple gradient environment
  const envScene = new THREE.Scene();

  // Sky dome
  const skyGeo = new THREE.SphereGeometry(50, 32, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color(0x2244aa) },
      bottomColor: { value: new THREE.Color(0x111122) },
      horizonColor: { value: new THREE.Color(0x445566) },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform vec3 horizonColor;
      varying vec3 vWorldPos;
      void main() {
        float h = normalize(vWorldPos).y;
        vec3 col;
        if (h > 0.0) {
          col = mix(horizonColor, topColor, smoothstep(0.0, 0.6, h));
        } else {
          col = mix(horizonColor, bottomColor, smoothstep(0.0, -0.4, h));
        }
        // Add some bright spots for interesting reflections
        float spot1 = smoothstep(0.95, 1.0, dot(normalize(vWorldPos), normalize(vec3(3.0, 5.0, 2.0))));
        float spot2 = smoothstep(0.96, 1.0, dot(normalize(vWorldPos), normalize(vec3(-4.0, 3.0, -1.0))));
        col += vec3(1.0, 0.95, 0.8) * spot1 * 4.0;
        col += vec3(0.8, 0.85, 1.0) * spot2 * 2.5;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  envScene.add(new THREE.Mesh(skyGeo, skyMat));

  const cubeRT = pmremGen.fromScene(envScene, 0.04);
  envMap = cubeRT.texture;

  pmremGen.dispose();
  skyMat.dispose();
  skyGeo.dispose();
}

generateEnvMap();

// ================================================================
// LIGHTING
// ================================================================
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const keyLight = new THREE.DirectionalLight(0xfff5e0, 2.0);
keyLight.position.set(5, 10, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.radius = 4;
keyLight.shadow.camera.near = 0.1;
keyLight.shadow.camera.far = 30;
keyLight.shadow.camera.left = -10;
keyLight.shadow.camera.right = 10;
keyLight.shadow.camera.top = 10;
keyLight.shadow.camera.bottom = -2;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xaaccff, 0.6);
fillLight.position.set(-6, 5, -3);
scene.add(fillLight);

const rimLight = new THREE.SpotLight(0xffffff, 0.8, 30, Math.PI / 6, 0.5);
rimLight.position.set(0, 6, -8);
rimLight.target.position.set(0, 2, 0);
scene.add(rimLight);
scene.add(rimLight.target);

const bottomLight = new THREE.PointLight(0x334466, 0.3, 15);
bottomLight.position.set(0, -1, 0);
scene.add(bottomLight);

// ================================================================
// FLOOR
// ================================================================
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.ShadowMaterial({ opacity: 0.2 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(24, 24, 0x333355, 0x222244);
grid.material.opacity = 0.4;
grid.material.transparent = true;
scene.add(grid);

// ================================================================
// MATERIALS (with envMap)
// ================================================================
function createMaterials() {
  const env = ui.envMapEnabled.checked ? envMap : null;

  return {
    texture: new THREE.MeshStandardMaterial({
      color: 0xffffff, metalness: 0.1, roughness: 0.5,
      map: imageTexture, envMap: env, envMapIntensity: 0.4,
    }),
    gold: new THREE.MeshStandardMaterial({
      color: 0xcaa24a, metalness: 0.92, roughness: 0.18, envMap: env, envMapIntensity: 1.2,
    }),
    silver: new THREE.MeshStandardMaterial({
      color: 0xd0d0d0, metalness: 0.95, roughness: 0.1, envMap: env, envMapIntensity: 1.5,
    }),
    copper: new THREE.MeshStandardMaterial({
      color: 0xb87333, metalness: 0.88, roughness: 0.28, envMap: env, envMapIntensity: 1.0,
    }),
    chrome: new THREE.MeshStandardMaterial({
      color: 0xeeeeee, metalness: 1.0, roughness: 0.05, envMap: env, envMapIntensity: 2.0,
    }),
    ceramic: new THREE.MeshStandardMaterial({
      color: 0xf8f8f4, metalness: 0.0, roughness: 0.45, envMap: env, envMapIntensity: 0.3,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xddeeff, transmission: 0.9, transparent: true, roughness: 0.02,
      metalness: 0.0, thickness: 2.0, envMap: env, envMapIntensity: 1.0,
      clearcoat: 1.0, clearcoatRoughness: 0.02,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x8b5e3c, metalness: 0.0, roughness: 0.72, envMap: env, envMapIntensity: 0.15,
    }),
    marble: new THREE.MeshStandardMaterial({
      color: 0xf0ebe0, metalness: 0.05, roughness: 0.35, envMap: env, envMapIntensity: 0.4,
    }),
    obsidian: new THREE.MeshPhysicalMaterial({
      color: 0x111118, metalness: 0.3, roughness: 0.08, envMap: env, envMapIntensity: 1.8,
      clearcoat: 1.0, clearcoatRoughness: 0.03,
    }),
  };
}

// ================================================================
// STATE
// ================================================================
let loadedImage = null;
let imageData = null;
let latheMesh = null;
let profileGuideLine = null;
let referencePlane = null;
let referenceTexture = null;
let imageTexture = null;

let mats = createMaterials();

// ================================================================
// SILHOUETTE EXTRACTION — OpenCV Canny
// ================================================================
function extractWithOpenCV(imgData, width, height, cannyLow, cannyHigh, blurSize) {
  const src = cv.matFromImageData(imgData);
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const edges = new cv.Mat();

  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  const ksize = new cv.Size(blurSize, blurSize);
  cv.GaussianBlur(gray, blurred, ksize, 0);

  cv.Canny(blurred, edges, cannyLow, cannyHigh);

  // Dilate edges slightly to close gaps
  const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3, 3));
  const dilated = new cv.Mat();
  cv.dilate(edges, dilated, kernel);

  // Find contours
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(dilated, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_NONE);

  // Find the largest contour (most likely the object)
  let maxArea = 0;
  let maxIdx = -1;
  for (let i = 0; i < contours.size(); i++) {
    const area = cv.contourArea(contours.get(i));
    if (area > maxArea) {
      maxArea = area;
      maxIdx = i;
    }
  }

  let rawProfile = [];

  if (maxIdx >= 0) {
    const cnt = contours.get(maxIdx);
    const rect = cv.boundingRect(cnt);

    // For each row in the bounding rect, find min and max X on the contour
    const rowMinX = new Float32Array(height).fill(width);
    const rowMaxX = new Float32Array(height).fill(-1);

    for (let k = 0; k < cnt.data32S.length; k += 2) {
      const cx = cnt.data32S[k];
      const cy = cnt.data32S[k + 1];
      if (cy >= 0 && cy < height) {
        if (cx < rowMinX[cy]) rowMinX[cy] = cx;
        if (cx > rowMaxX[cy]) rowMaxX[cy] = cx;
      }
    }

    // Find vertical bounds
    let topY = height, bottomY = 0;
    for (let y = 0; y < height; y++) {
      if (rowMaxX[y] >= 0) {
        if (y < topY) topY = y;
        if (y > bottomY) bottomY = y;
      }
    }

    if (bottomY > topY) {
      // Center X = average mid-point
      let sumC = 0, cntC = 0;
      for (let y = topY; y <= bottomY; y++) {
        if (rowMaxX[y] >= 0 && rowMinX[y] < width) {
          sumC += (rowMinX[y] + rowMaxX[y]) / 2;
          cntC++;
        }
      }
      const centerX = cntC > 0 ? sumC / cntC : width / 2;
      const objH = bottomY - topY;

      for (let y = topY; y <= bottomY; y++) {
        const radius = rowMaxX[y] >= 0 ? Math.max(0, rowMaxX[y] - centerX) : 0;
        rawProfile.push({
          radius: radius / (objH || 1),
          t: (y - topY) / (objH || 1),
        });
      }
    }
  }

  // Cleanup
  src.delete();
  gray.delete();
  blurred.delete();
  edges.delete();
  kernel.delete();
  dilated.delete();
  contours.delete();
  hierarchy.delete();

  return rawProfile;
}

// ================================================================
// SILHOUETTE EXTRACTION — Simple threshold (fallback)
// ================================================================
function extractSimple(imgData, width, height, thresholdVal) {
  const data = imgData.data;

  // Background estimation from corners
  const bg = [0, 0, 0];
  const corners = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
  ];
  for (const [px, py] of corners) {
    const i = (py * width + px) * 4;
    bg[0] += data[i] / 4;
    bg[1] += data[i + 1] / 4;
    bg[2] += data[i + 2] / 4;
  }

  const rightEdge = new Float32Array(height);
  const leftEdge = new Float32Array(height).fill(width);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const diff =
        Math.abs(data[i] - bg[0]) +
        Math.abs(data[i + 1] - bg[1]) +
        Math.abs(data[i + 2] - bg[2]);
      if (diff > thresholdVal) {
        if (x < leftEdge[y]) leftEdge[y] = x;
        rightEdge[y] = x;
      }
    }
  }

  let topY = 0, bottomY = height - 1;
  for (let y = 0; y < height; y++) {
    if (rightEdge[y] > 0) { topY = y; break; }
  }
  for (let y = height - 1; y >= 0; y--) {
    if (rightEdge[y] > 0) { bottomY = y; break; }
  }

  let sumC = 0, cntC = 0;
  for (let y = topY; y <= bottomY; y++) {
    if (rightEdge[y] > 0 && leftEdge[y] < width) {
      sumC += (leftEdge[y] + rightEdge[y]) / 2;
      cntC++;
    }
  }
  const centerX = cntC > 0 ? sumC / cntC : width / 2;
  const objH = bottomY - topY;
  if (objH <= 0) return [];

  const rawProfile = [];
  for (let y = topY; y <= bottomY; y++) {
    const radius = rightEdge[y] > 0 ? Math.max(0, rightEdge[y] - centerX) : 0;
    rawProfile.push({
      radius: radius / (objH || 1),
      t: (y - topY) / (objH || 1),
    });
  }
  return rawProfile;
}

// ================================================================
// RESAMPLE + SMOOTH + CATMULL-ROM SPLINE
// ================================================================
function resampleProfile(raw, numPoints, smoothPasses) {
  if (raw.length === 0) return [];

  // Uniform resampling
  const resampled = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const idx = t * (raw.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.min(lo + 1, raw.length - 1);
    const f = idx - lo;
    resampled.push(raw[lo].radius * (1 - f) + raw[hi].radius * f);
  }

  // Moving average smoothing
  for (let pass = 0; pass < smoothPasses; pass++) {
    const copy = [...resampled];
    for (let i = 1; i < numPoints - 1; i++) {
      resampled[i] = copy[i - 1] * 0.25 + copy[i] * 0.5 + copy[i + 1] * 0.25;
    }
  }

  return resampled;
}

/**
 * Apply Catmull-Rom spline to the profile for extra-smooth curves.
 * subdivisions=0 means no spline, just use the resampled points.
 */
function applySpline(radii, height, subdivisions) {
  if (subdivisions <= 0 || radii.length < 4) {
    // No spline — return as Vector2 directly
    return radii.map((r, i) => {
      const y = (1 - i / (radii.length - 1)) * height;
      return new THREE.Vector2(Math.max(0.001, r), y);
    });
  }

  // Create a CatmullRomCurve3 from (radius, height, 0)
  const curvePoints = radii.map((r, i) => {
    const y = (1 - i / (radii.length - 1)) * height;
    return new THREE.Vector3(Math.max(0.001, r), y, 0);
  });

  const curve = new THREE.CatmullRomCurve3(curvePoints, false, "catmullrom", 0.5);
  const totalPoints = radii.length * (1 << subdivisions);
  const smooth = curve.getPoints(totalPoints);

  return smooth.map((p) => new THREE.Vector2(Math.max(0.001, p.x), p.y));
}

// ================================================================
// BUILD 3D MODEL
// ================================================================
function buildModel() {
  if (!imageData) return;

  const mode = ui.detectionMode.value;
  const threshLow = parseInt(ui.threshold.value);
  const threshHigh = parseInt(ui.thresholdHigh.value);
  const blur = parseInt(ui.gaussBlur.value);
  const smoothPasses = parseInt(ui.smoothing.value);
  const numPoints = parseInt(ui.profilePoints.value);
  const splineSub = parseInt(ui.splineSubdivisions.value);
  const segments = parseInt(ui.latheSegments.value);
  const height = parseFloat(ui.modelHeight.value);
  const matKey = ui.materialType.value;

  ui.status.textContent = "Extraction...";

  const w = previewCanvas.width;
  const h = previewCanvas.height;

  let raw;
  if (mode === "opencv" && cvReady) {
    raw = extractWithOpenCV(imageData, w, h, threshLow, threshHigh, blur);
  } else {
    raw = extractSimple(imageData, w, h, threshLow);
  }

  if (raw.length === 0) {
    ui.status.textContent = "Aucun contour détecté. Ajustez les seuils.";
    return;
  }

  const resampled = resampleProfile(raw, numPoints, smoothPasses);
  const maxR = Math.max(...resampled);
  const scale = maxR > 0 ? 1 / maxR : 1;
  const rScale = height * 0.3;

  const normalised = resampled.map((r) => r * scale * rScale);
  const profileVec2 = applySpline(normalised, height, splineSub);

  // Optionally close top/bottom by adding points at radius ~0
  const closedT = ui.closedTop.checked;
  const closedB = ui.closedBottom.checked;
  const finalProfile = [...profileVec2];
  if (closedT && finalProfile.length > 0) {
    const topPt = finalProfile[0];
    finalProfile.unshift(new THREE.Vector2(0.001, topPt.y + 0.01));
  }
  if (closedB && finalProfile.length > 0) {
    const botPt = finalProfile[finalProfile.length - 1];
    finalProfile.push(new THREE.Vector2(0.001, botPt.y - 0.01));
  }

  // Clean previous
  if (latheMesh) {
    scene.remove(latheMesh);
    latheMesh.geometry.dispose();
  }

  const geometry = new THREE.LatheGeometry(finalProfile, segments);
  geometry.computeVertexNormals();

  const material = mats[matKey] || mats.gold;
  material.wireframe = ui.wireframe.checked;

  latheMesh = new THREE.Mesh(geometry, material);
  latheMesh.castShadow = true;
  latheMesh.receiveShadow = true;
  scene.add(latheMesh);

  // Profile guide line
  if (profileGuideLine) {
    scene.remove(profileGuideLine);
    profileGuideLine.geometry.dispose();
    profileGuideLine.material.dispose();
  }

  if (ui.showProfileLine.checked) {
    const lp = finalProfile.map((p) => new THREE.Vector3(p.x, p.y, 0));
    const lineGeo = new THREE.BufferGeometry().setFromPoints(lp);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xff4466 });
    profileGuideLine = new THREE.Line(lineGeo, lineMat);
    profileGuideLine.position.x = -rScale * 1.5 - 1;
    scene.add(profileGuideLine);
  } else {
    profileGuideLine = null;
  }

  // Preview overlay
  drawPreviewOverlay(raw);

  const pts = finalProfile.length;
  ui.status.textContent = `Modèle : ${pts} pts profil × ${segments} segments = ${(pts * segments).toLocaleString()} faces`;
}

// ================================================================
// PREVIEW OVERLAY
// ================================================================
function drawPreviewOverlay(raw) {
  if (!loadedImage) return;

  const w = previewCanvas.width;
  const h = previewCanvas.height;

  previewCtx.drawImage(loadedImage, 0, 0, w, h);

  if (raw.length === 0) return;

  // Find bounds
  let topY = 0, bottomY = raw.length - 1;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i].radius > 0) { topY = i; break; }
  }
  for (let i = raw.length - 1; i >= 0; i--) {
    if (raw[i].radius > 0) { bottomY = i; break; }
  }
  const objH = bottomY - topY || 1;

  // Draw center axis (dashed red)
  previewCtx.save();
  previewCtx.strokeStyle = "rgba(255, 80, 80, 0.5)";
  previewCtx.lineWidth = 1;
  previewCtx.setLineDash([6, 4]);
  previewCtx.beginPath();
  previewCtx.moveTo(w / 2, 0);
  previewCtx.lineTo(w / 2, h);
  previewCtx.stroke();
  previewCtx.restore();

  // Draw right edge contour (green)
  previewCtx.strokeStyle = "#00ff88";
  previewCtx.lineWidth = 2;
  previewCtx.setLineDash([]);
  previewCtx.beginPath();
  let started = false;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i].radius > 0) {
      const px = w / 2 + raw[i].radius * objH;
      const py = topY + raw[i].t * objH;
      if (!started) {
        previewCtx.moveTo(px, py);
        started = true;
      } else {
        previewCtx.lineTo(px, py);
      }
    }
  }
  previewCtx.stroke();

  // Draw mirrored left edge (cyan)
  previewCtx.strokeStyle = "#00ccff";
  previewCtx.lineWidth = 1.5;
  previewCtx.beginPath();
  started = false;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i].radius > 0) {
      const px = w / 2 - raw[i].radius * objH;
      const py = topY + raw[i].t * objH;
      if (!started) {
        previewCtx.moveTo(px, py);
        started = true;
      } else {
        previewCtx.lineTo(px, py);
      }
    }
  }
  previewCtx.stroke();
}

// ================================================================
// REFERENCE IMAGE IN 3D SCENE
// ================================================================
function updateReferencePlane() {
  if (!loadedImage) return;

  if (referencePlane) {
    scene.remove(referencePlane);
    referencePlane.geometry.dispose();
    referencePlane.material.dispose();
  }
  if (referenceTexture) referenceTexture.dispose();

  referenceTexture = new THREE.Texture(loadedImage);
  referenceTexture.needsUpdate = true;
  referenceTexture.colorSpace = THREE.SRGBColorSpace;

  const aspect = loadedImage.width / loadedImage.height;
  const planeH = parseFloat(ui.modelHeight.value);
  const planeW = planeH * aspect;

  referencePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(planeW, planeH),
    new THREE.MeshBasicMaterial({
      map: referenceTexture,
      transparent: true,
      opacity: parseFloat(ui.imageOpacity.value),
      side: THREE.DoubleSide,
    })
  );
  referencePlane.position.set(-(planeW / 2 + 2.5), planeH / 2, -2);
  scene.add(referencePlane);
}

// ================================================================
// IMAGE UPLOAD
// ================================================================
ui.imageUpload.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      loadedImage = img;

      // Create texture from uploaded image
      if (imageTexture) imageTexture.dispose();
      imageTexture = new THREE.Texture(img);
      imageTexture.needsUpdate = true;
      imageTexture.colorSpace = THREE.SRGBColorSpace;
      imageTexture.wrapS = THREE.RepeatWrapping;
      imageTexture.wrapT = THREE.ClampToEdgeWrapping;
      // Rebuild materials so the texture option uses the new image
      mats = createMaterials();

      // Max 600px for processing
      const maxDim = 600;
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      previewCanvas.width = w;
      previewCanvas.height = h;
      previewCanvas.style.display = "block";
      previewCtx.drawImage(img, 0, 0, w, h);
      imageData = previewCtx.getImageData(0, 0, w, h);

      updateReferencePlane();
      buildModel();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// ================================================================
// SLIDER & CONTROL EVENTS
// ================================================================
function bindSlider(input, display, cb) {
  input.addEventListener("input", () => {
    display.textContent = input.value;
    cb();
  });
}

bindSlider(ui.threshold, el("thresholdVal"), buildModel);
bindSlider(ui.thresholdHigh, el("thresholdHighVal"), buildModel);
bindSlider(ui.gaussBlur, el("gaussBlurVal"), buildModel);
bindSlider(ui.profilePoints, el("profilePointsVal"), buildModel);
bindSlider(ui.splineSubdivisions, el("splineSubdivisionsVal"), buildModel);
bindSlider(ui.smoothing, el("smoothingVal"), buildModel);
bindSlider(ui.latheSegments, el("latheSegmentsVal"), buildModel);
bindSlider(ui.modelHeight, el("modelHeightVal"), () => {
  buildModel();
  updateReferencePlane();
});

bindSlider(ui.bloomStrength, el("bloomStrengthVal"), () => {
  bloomPass.strength = parseFloat(ui.bloomStrength.value);
});

bindSlider(ui.imageOpacity, el("imageOpacityVal"), () => {
  if (referencePlane) {
    referencePlane.material.opacity = parseFloat(ui.imageOpacity.value);
  }
});

ui.detectionMode.addEventListener("change", buildModel);
ui.closedTop.addEventListener("change", buildModel);
ui.closedBottom.addEventListener("change", buildModel);
ui.wireframe.addEventListener("change", buildModel);
ui.showProfileLine.addEventListener("change", buildModel);

ui.materialType.addEventListener("change", () => {
  if (latheMesh) {
    const matKey = ui.materialType.value;
    if (matKey === "texture" && !imageTexture) {
      ui.status.textContent = "Uploadez d'abord une image pour utiliser la texture.";
      return;
    }
    const mat = mats[matKey] || mats.gold;
    mat.wireframe = ui.wireframe.checked;
    latheMesh.material = mat;
  }
});

ui.envMapEnabled.addEventListener("change", () => {
  mats = createMaterials();
  if (latheMesh) {
    const matKey = ui.materialType.value;
    const mat = mats[matKey] || mats.gold;
    mat.wireframe = ui.wireframe.checked;
    latheMesh.material = mat;
  }
});

ui.bloomEnabled.addEventListener("change", () => {
  bloomPass.enabled = ui.bloomEnabled.checked;
});

// ================================================================
// CAMERA RESET
// ================================================================
ui.resetCamera.addEventListener("click", () => {
  camera.position.set(0, 4, 10);
  controls.target.set(0, 2.5, 0);
  controls.update();
});

// ================================================================
// EXPORT OBJ
// ================================================================
ui.exportOBJ.addEventListener("click", () => {
  if (!latheMesh) {
    ui.status.textContent = "Rien à exporter.";
    return;
  }
  const exporter = new OBJExporter();
  const objStr = exporter.parse(latheMesh);
  const blob = new Blob([objStr], { type: "text/plain" });
  const link = document.createElement("a");
  link.download = "modele-3d.obj";
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  ui.status.textContent = "Fichier OBJ exporté.";
});

// ================================================================
// EXPORT PNG HD
// ================================================================
ui.exportPNG.addEventListener("click", () => {
  // Render at 2x resolution for HD
  const w = window.innerWidth * 2;
  const h = window.innerHeight * 2;
  renderer.setSize(w, h);
  composer.setSize(w, h);
  renderer.render(scene, camera);
  if (bloomPass.enabled) {
    composer.render();
  }

  const link = document.createElement("a");
  link.download = "modele-3d-hd.png";
  link.href = renderer.domElement.toDataURL("image/png");
  link.click();

  // Restore normal size
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  ui.status.textContent = "PNG HD exporté.";
});

// ================================================================
// ANIMATION
// ================================================================
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  if (bloomPass.enabled) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}
animate();

// ================================================================
// RESIZE
// ================================================================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
