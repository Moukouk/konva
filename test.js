/**
 * test.js – Visualisation 3D améliorée d'une tringle de rideau
 *
 * Structure 3D fidèle à la réalité :
 *   • Fenêtre   : cadre (4 barres) + vitre semi-transparente + photo texture
 *   • Tringle   : cylindre horizontal avec embouts sphériques chromés
 *   • Fixations : platine murale + bras horizontal cylindrique + anneau de maintien
 *   • Mur       : arrière-plan coloré + grille de sol optionnelle
 */

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

// ─────────────────────────────────────────────
// État
// ─────────────────────────────────────────────
const state = {
  windowWidth: 120,      // cm
  windowHeight: 140,     // cm
  rodLeftOverflow: 20,   // cm
  rodRightOverflow: 20,  // cm
  rodTopOffset: 15,      // cm (hauteur tringle au-dessus du bord haut de fenêtre)
  rodRadius: 1.5,        // cm
  supportLeftInset: 10,  // cm (extrémité gauche → fixation FG)
  supportRightInset: 10, // cm (extrémité droite → fixation FD)
  supportArmLength: 8,   // cm (saillie du bras depuis le mur)
  rodColor: "#9333ea",
  supportColor: "#374151",
  wallColor: "#f5f0e8",
  showImage: true,
  imageOpacity: 0.9,     // 0–1
  showGrid: true,
  showMeasures: true
};

// ─────────────────────────────────────────────
// DOM
// ─────────────────────────────────────────────
const container = document.getElementById("threeContainer");
const loadingOverlay = document.getElementById("loadingOverlay");

function el(id) { return document.getElementById(id); }

const ui = {
  windowWidth:          el("windowWidth"),
  windowWidthVal:       el("windowWidthVal"),
  windowHeight:         el("windowHeight"),
  windowHeightVal:      el("windowHeightVal"),
  rodLeftOverflow:      el("rodLeftOverflow"),
  rodLeftOverflowVal:   el("rodLeftOverflowVal"),
  rodRightOverflow:     el("rodRightOverflow"),
  rodRightOverflowVal:  el("rodRightOverflowVal"),
  rodTopOffset:         el("rodTopOffset"),
  rodTopOffsetVal:      el("rodTopOffsetVal"),
  rodRadius:            el("rodRadius"),
  rodRadiusVal:         el("rodRadiusVal"),
  supportLeftInset:     el("supportLeftInset"),
  supportLeftInsetVal:  el("supportLeftInsetVal"),
  supportRightInset:    el("supportRightInset"),
  supportRightInsetVal: el("supportRightInsetVal"),
  supportArmLength:     el("supportArmLength"),
  supportArmLengthVal:  el("supportArmLengthVal"),
  rodColor:             el("rodColor"),
  supportColor:         el("supportColor"),
  wallColor:            el("wallColor"),
  imageUpload:          el("imageUpload"),
  showImage:            el("showImage"),
  imageOpacity:         el("imageOpacity"),
  imageOpacityVal:      el("imageOpacityVal"),
  removeImageBtn:       el("removeImageBtn"),
  showGrid:             el("showGrid"),
  showMeasures:         el("showMeasures"),
  resetViewBtn:         el("resetViewBtn"),
  exportBtn:            el("exportBtn")
};

// ─────────────────────────────────────────────
// Renderer / Camera / Controls
// ─────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(container.clientWidth, Math.max(1, container.clientHeight));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(state.wallColor).lerp(new THREE.Color(0xdbe3ef), 0.4);

const camera = new THREE.PerspectiveCamera(
  42,
  container.clientWidth / Math.max(1, container.clientHeight),
  0.5,
  2000
);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 60;
controls.maxDistance = 800;
controls.maxPolarAngle = Math.PI * 0.85;

// ─────────────────────────────────────────────
// Lumières
// ─────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.3);
keyLight.position.set(100, 200, 150);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.left   = -250;
keyLight.shadow.camera.right  =  250;
keyLight.shadow.camera.top    =  250;
keyLight.shadow.camera.bottom = -250;
keyLight.shadow.camera.near   = 1;
keyLight.shadow.camera.far    = 1000;
keyLight.shadow.bias          = -0.0003;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xe8f0ff, 0.55);
fillLight.position.set(-120, 80, 60);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.25);
rimLight.position.set(0, -50, -200);
scene.add(rimLight);

// ─────────────────────────────────────────────
// Matériaux (réutilisés)
// ─────────────────────────────────────────────
const wallMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color(state.wallColor),
  roughness: 0.88,
  metalness: 0.02
});

const frameMat = new THREE.MeshStandardMaterial({
  color: 0xe5e7eb,
  roughness: 0.5,
  metalness: 0.18
});

const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xd0e8ff,
  transmission: 0.8,
  transparent: true,
  opacity: 0.52,
  roughness: 0.04,
  metalness: 0.0,
  thickness: 0.8,
  ior: 1.52,
  depthWrite: false
});

const rodMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color(state.rodColor),
  metalness: 0.92,
  roughness: 0.13,
  envMapIntensity: 1.0
});

const capMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color(state.rodColor),
  metalness: 0.96,
  roughness: 0.10
});

const supportMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color(state.supportColor),
  metalness: 0.82,
  roughness: 0.32
});

const photoMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  side: THREE.FrontSide
});

// ─────────────────────────────────────────────
// Mur de fond
// ─────────────────────────────────────────────
const wallMesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 6),
  wallMat
);
wallMesh.receiveShadow = true;
wallMesh.position.z = -8;
scene.add(wallMesh);

// ─────────────────────────────────────────────
// Grille de sol
// ─────────────────────────────────────────────
const gridHelper = new THREE.GridHelper(700, 35, 0xadb5bd, 0xced4da);
scene.add(gridHelper);

// ─────────────────────────────────────────────
// Cadre de fenêtre (4 barres)
// ─────────────────────────────────────────────
const FRAME_T = 5;   // épaisseur montants/traverses (cm)
const FRAME_D = 6;   // profondeur du cadre (cm)

function makeFrameBar(mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, FRAME_D), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  scene.add(m);
  return m;
}

const frameTop    = makeFrameBar(frameMat);
const frameBottom = makeFrameBar(frameMat);
const frameLeft   = makeFrameBar(frameMat);
const frameRight  = makeFrameBar(frameMat);

// Vitre
const glassMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glassMat);
glassMesh.position.z = FRAME_D / 2 - 0.3;
scene.add(glassMesh);

// Photo-texture sur la vitre
const photoPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), photoMat);
photoPlane.position.z = FRAME_D / 2 - 0.1;
scene.add(photoPlane);

// ─────────────────────────────────────────────
// Tringle
// ─────────────────────────────────────────────
const rodMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(1, 1, 1, 48),
  rodMat
);
rodMesh.rotation.z = Math.PI / 2;
rodMesh.castShadow = true;
scene.add(rodMesh);

const rodLeftCap = new THREE.Mesh(
  new THREE.SphereGeometry(1, 28, 28),
  capMat
);
rodLeftCap.castShadow = true;
scene.add(rodLeftCap);

const rodRightCap = new THREE.Mesh(
  new THREE.SphereGeometry(1, 28, 28),
  capMat
);
rodRightCap.castShadow = true;
scene.add(rodRightCap);

// ─────────────────────────────────────────────
// Fixations (brackets)
//
// Chaque fixation est composée de :
//   • platine : plaque plate vissée au mur (BoxGeometry dans le plan XY)
//   • bras    : cylindre horizontal sortant du mur (axe Z)
//   • anneau  : tore vertical entourant la tringle (plan YZ)
// ─────────────────────────────────────────────
function createBracket() {
  const group = new THREE.Group();

  // Platine murale : plaque rectangulaire (épaisseur selon Z)
  const platine = new THREE.Mesh(
    new THREE.BoxGeometry(5, 10, 1.6),
    supportMat
  );
  platine.castShadow = true;
  platine.receiveShadow = true;
  group.add(platine);

  // Bras : cylindre normalement orienté Y, puis pivoté de PI/2 autour X
  // → après rotation, l'axe du cylindre est Z (avant/arrière)
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 1, 24),
    supportMat
  );
  arm.rotation.x = Math.PI / 2;
  arm.castShadow = true;
  group.add(arm);

  // Anneau : tore dont l'axe principal est X (anneau vertical autour d'un axe horizontal)
  // TorusGeometry(outerR, tubeR, …) avec outerR=1 et tubeR=0.28
  // → inner hole radius = outerR - tubeR = 0.72 (en unité)
  // → on scale l'anneau pour que le trou intérieur corresponde au rayon de la tringle
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.28, 18, 52),
    supportMat
  );
  ring.rotation.y = Math.PI / 2; // anneau dans le plan YZ → encercle la tringle
  ring.castShadow = true;
  group.add(ring);

  scene.add(group);
  return { group, platine, arm, ring };
}

const leftBracket  = createBracket();
const rightBracket = createBracket();

// ─────────────────────────────────────────────
// Lignes de mesures
// ─────────────────────────────────────────────
const measureGroup = new THREE.Group();
scene.add(measureGroup);
let measureLines = [];

function clearMeasures() {
  measureLines.forEach(obj => {
    measureGroup.remove(obj);
    obj.geometry.dispose();
  });
  measureLines = [];
}

function addMeasure(pA, pB, color) {
  const pts = [pA, pB];
  const geo  = new THREE.BufferGeometry().setFromPoints(pts);
  const mat  = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geo, mat);
  measureGroup.add(line);
  measureLines.push(line);

  // petits tirets perpendiculaires aux extrémités
  const dir  = new THREE.Vector3().subVectors(pB, pA).normalize();
  // perpendiculaire dans le plan XY ou XZ selon l'axe dominant
  const perp = Math.abs(dir.y) < 0.9
    ? new THREE.Vector3(0, 1, 0)
    : new THREE.Vector3(1, 0, 0);

  [pA, pB].forEach(p => {
    const t1 = p.clone().addScaledVector(perp,  3);
    const t2 = p.clone().addScaledVector(perp, -3);
    const tgeo = new THREE.BufferGeometry().setFromPoints([t1, t2]);
    const tick = new THREE.Line(tgeo, new THREE.LineBasicMaterial({ color }));
    measureGroup.add(tick);
    measureLines.push(tick);
  });
}

// ─────────────────────────────────────────────
// Mise à jour de la scène
// ─────────────────────────────────────────────
function syncScene() {
  const w   = state.windowWidth;
  const h   = state.windowHeight;
  const r   = state.rodRadius;
  const arm = Math.max(2, state.supportArmLength);

  // Longueur et position de la tringle
  const rodLen = w + state.rodLeftOverflow + state.rodRightOverflow;
  // Le centre X de la tringle dépend des débords (asymétriques possibles)
  const rodCenterX = (state.rodRightOverflow - state.rodLeftOverflow) / 2;
  const rodCenterY = h / 2 + state.rodTopOffset;
  const rodCenterZ = arm + r; // la face avant du mur = z≈0, le bras sort jusqu'à z=arm

  // Positions X des fixations (sur la tringle)
  const rodLeftEndX  = rodCenterX - rodLen / 2;
  const rodRightEndX = rodCenterX + rodLen / 2;
  const leftX  = rodLeftEndX  + state.supportLeftInset;
  const rightX = rodRightEndX - state.supportRightInset;

  // ── Mur
  const wallScale = Math.max(rodLen * 1.6, 300);
  wallMesh.scale.set(wallScale, Math.max(h + 120, 300), 1);
  wallMesh.position.set(rodCenterX, rodCenterY / 2, -8);
  wallMat.color.set(state.wallColor);
  scene.background = new THREE.Color(state.wallColor).lerp(new THREE.Color(0xdbe3ef), 0.45);

  // ── Grille
  gridHelper.position.y = -h / 2 - 30;
  gridHelper.visible    = state.showGrid;

  // ── Cadre fenêtre (centré en 0, 0)
  const innerW = w - FRAME_T * 2;
  const innerH = h - FRAME_T * 2;

  frameTop.scale.set(w, FRAME_T, 1);
  frameTop.position.set(0, h / 2 - FRAME_T / 2, 0);

  frameBottom.scale.set(w, FRAME_T, 1);
  frameBottom.position.set(0, -(h / 2 - FRAME_T / 2), 0);

  frameLeft.scale.set(FRAME_T, innerH, 1);
  frameLeft.position.set(-(w / 2 - FRAME_T / 2), 0, 0);

  frameRight.scale.set(FRAME_T, innerH, 1);
  frameRight.position.set(w / 2 - FRAME_T / 2, 0, 0);

  // Vitre
  glassMesh.scale.set(innerW, innerH, 1);
  glassMesh.position.set(0, 0, FRAME_D / 2 - 0.3);

  // Photo texture
  photoPlane.scale.set(innerW, innerH, 1);
  photoPlane.position.set(0, 0, FRAME_D / 2 - 0.1);
  if (photoMat.map) {
    photoMat.opacity = state.showImage ? state.imageOpacity : 0;
    photoMat.needsUpdate = true;
  }

  // ── Tringle (cylindre pivoté Z, scale Y = longueur)
  rodMesh.scale.set(r, rodLen, r);
  rodMesh.position.set(rodCenterX, rodCenterY, rodCenterZ);
  rodMat.color.set(state.rodColor);

  // Les embouts sont légèrement plus grands que le rayon de la tringle
  const capR = r * 1.35;
  rodLeftCap.scale.setScalar(capR);
  rodLeftCap.position.set(rodLeftEndX, rodCenterY, rodCenterZ);

  rodRightCap.scale.setScalar(capR);
  rodRightCap.position.set(rodRightEndX, rodCenterY, rodCenterZ);

  capMat.color.copy(new THREE.Color(state.rodColor));

  // ── Fixations
  supportMat.color.set(state.supportColor);

  function updateBracket(bracket, xPos) {
    bracket.group.position.set(xPos, rodCenterY, 0);

    // Platine : au mur (z=0 côté intérieur, z=-0.8 milieu)
    bracket.platine.position.set(0, 0, -0.8);

    // Bras : va de z=0 (mur) à z=arm ; centré à z=arm/2
    // CylinderGeometry scale Y → après rotation.x=PI/2 → échelle en Z
    bracket.arm.scale.set(1, arm, 1);
    bracket.arm.position.set(0, 0, arm / 2);

    // Anneau : au bout du bras, encercle la tringle
    // TorusGeometry(1, 0.28) → inner hole = 0.72 unité
    // On veut inner hole = r → scale = r / 0.72
    const ringScale = r / 0.72;
    bracket.ring.scale.setScalar(ringScale);
    bracket.ring.position.set(0, 0, arm + r);
  }

  updateBracket(leftBracket,  leftX);
  updateBracket(rightBracket, rightX);

  // ── Mesures
  measureGroup.visible = state.showMeasures;
  clearMeasures();

  if (state.showMeasures) {
    const mZ = rodCenterZ + r + 5;

    // Largeur fenêtre (bleu foncé)
    addMeasure(
      new THREE.Vector3(-w / 2, -h / 2 - 14, mZ),
      new THREE.Vector3(w / 2,  -h / 2 - 14, mZ),
      0x1e3a8a
    );

    // Longueur tringle (violet)
    addMeasure(
      new THREE.Vector3(rodLeftEndX,  rodCenterY + r + 10, mZ),
      new THREE.Vector3(rodRightEndX, rodCenterY + r + 10, mZ),
      0x581c87
    );

    // Écart entre fixations (vert)
    if (rightX - leftX > 4) {
      addMeasure(
        new THREE.Vector3(leftX,  rodCenterY + r + 22, mZ),
        new THREE.Vector3(rightX, rodCenterY + r + 22, mZ),
        0x0f766e
      );
    }

    // Saillie du bras (orange) – vue de dessus
    addMeasure(
      new THREE.Vector3(leftX - 10, rodCenterY, 0),
      new THREE.Vector3(leftX - 10, rodCenterY, arm + r),
      0xb45309
    );
  }
}

// ─────────────────────────────────────────────
// Texture image
// ─────────────────────────────────────────────
let loadedTexture = null;

function applyImageTexture(imgElement) {
  if (loadedTexture) {
    loadedTexture.dispose();
    loadedTexture = null;
  }
  if (!imgElement) {
    photoMat.map = null;
    photoMat.opacity = 0;
    photoMat.needsUpdate = true;
    return;
  }
  const tex = new THREE.Texture(imgElement);
  tex.needsUpdate     = true;
  tex.colorSpace      = THREE.SRGBColorSpace;
  tex.minFilter       = THREE.LinearFilter;
  tex.magFilter       = THREE.LinearFilter;
  tex.generateMipmaps = false;
  loadedTexture       = tex;
  photoMat.map        = tex;
  photoMat.opacity    = state.showImage ? state.imageOpacity : 0;
  photoMat.transparent = true;
  photoMat.needsUpdate = true;
}

// ─────────────────────────────────────────────
// Boucle de rendu
// ─────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ─────────────────────────────────────────────
// Utilitaires caméra
// ─────────────────────────────────────────────
function resetView() {
  const rodLen  = state.windowWidth + state.rodLeftOverflow + state.rodRightOverflow;
  const h       = state.windowHeight;
  const arm     = state.supportArmLength;
  const cx      = (state.rodRightOverflow - state.rodLeftOverflow) / 2;
  const cy      = (h / 2 + state.rodTopOffset) * 0.3;
  const dist    = Math.max(200, rodLen * 1.5 + arm * 2);

  camera.position.set(cx, cy, dist);
  controls.target.set(cx * 0.3, cy, arm / 2);
  controls.update();
}

// ─────────────────────────────────────────────
// Export PNG
// ─────────────────────────────────────────────
function exportPNG() {
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL("image/png");
  const a   = document.createElement("a");
  a.href     = url;
  a.download = "tringle-3d.png";
  a.click();
}

// ─────────────────────────────────────────────
// Redimensionnement fenêtre
// ─────────────────────────────────────────────
function onResize() {
  const w = container.clientWidth;
  const h = Math.max(1, container.clientHeight);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener("resize", onResize);

// ─────────────────────────────────────────────
// Liaison des contrôles (sliders)
// ─────────────────────────────────────────────
function bindSlider(inputEl, displayEl, stateKey, isFloat, onUpdate) {
  inputEl.addEventListener("input", () => {
    const v = isFloat
      ? parseFloat(inputEl.value)
      : parseInt(inputEl.value, 10);
    state[stateKey] = v;
    if (displayEl) displayEl.textContent = isFloat ? v.toFixed(1) : v;
    if (onUpdate) onUpdate(v);
    else syncScene();
  });
}

bindSlider(ui.windowWidth,      ui.windowWidthVal,      "windowWidth",      false);
bindSlider(ui.windowHeight,     ui.windowHeightVal,     "windowHeight",     false);
bindSlider(ui.rodLeftOverflow,  ui.rodLeftOverflowVal,  "rodLeftOverflow",  false);
bindSlider(ui.rodRightOverflow, ui.rodRightOverflowVal, "rodRightOverflow", false);
bindSlider(ui.rodTopOffset,     ui.rodTopOffsetVal,     "rodTopOffset",     false);
bindSlider(ui.rodRadius,        ui.rodRadiusVal,        "rodRadius",        true);
bindSlider(ui.supportLeftInset, ui.supportLeftInsetVal, "supportLeftInset", false);
bindSlider(ui.supportRightInset,ui.supportRightInsetVal,"supportRightInset",false);
bindSlider(ui.supportArmLength, ui.supportArmLengthVal, "supportArmLength", true);

// imageOpacity : le slider est en % (10–100), state en 0–1
ui.imageOpacity.addEventListener("input", () => {
  const pct = parseInt(ui.imageOpacity.value, 10);
  state.imageOpacity = pct / 100;
  ui.imageOpacityVal.textContent = pct;
  if (photoMat.map) {
    photoMat.opacity = state.showImage ? state.imageOpacity : 0;
    photoMat.needsUpdate = true;
  }
});

// Couleurs
function bindColor(inputEl, onApply) {
  inputEl.addEventListener("input", () => {
    onApply(inputEl.value);
    syncScene();
  });
}

bindColor(ui.rodColor,     v => { state.rodColor     = v; rodMat.color.set(v); capMat.color.set(v); });
bindColor(ui.supportColor, v => { state.supportColor = v; supportMat.color.set(v); });
bindColor(ui.wallColor,    v => { state.wallColor     = v; });

// Checkboxes
ui.showImage.addEventListener("change", () => {
  state.showImage = ui.showImage.checked;
  if (photoMat.map) {
    photoMat.opacity = state.showImage ? state.imageOpacity : 0;
    photoMat.needsUpdate = true;
  }
});

ui.showGrid.addEventListener("change", () => {
  state.showGrid     = ui.showGrid.checked;
  gridHelper.visible = state.showGrid;
});

ui.showMeasures.addEventListener("change", () => {
  state.showMeasures    = ui.showMeasures.checked;
  measureGroup.visible  = state.showMeasures;
  if (state.showMeasures) syncScene();
});

// Upload image
ui.imageUpload.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    const img = new Image();
    img.onload = () => {
      applyImageTexture(img);
      state.showImage   = true;
      ui.showImage.checked = true;
      syncScene();
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

ui.removeImageBtn.addEventListener("click", () => {
  applyImageTexture(null);
  ui.imageUpload.value = "";
  syncScene();
});

ui.resetViewBtn.addEventListener("click", resetView);
ui.exportBtn.addEventListener("click", exportPNG);

// ─────────────────────────────────────────────
// Démarrage
// ─────────────────────────────────────────────
syncScene();
resetView();
animate();

// Masquer l'overlay de chargement après le premier rendu
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    loadingOverlay.classList.add("hidden");
  });
});
