const stageWidth = 1100;
const stageHeight = 700;

const windowX = 300;
const windowY = 260;

const state = {
  scalePxPerCm: 4,
  windowWidth: 120,
  windowHeight: 140,
  rodLeftOverflow: 20,
  rodRightOverflow: 20,
  rodTopOffset: 15,
  supportLeftInset: 10,
  supportRightInset: 10,
  supportArmLength: 8
};

const inputs = {
  windowWidth: document.getElementById("windowWidth"),
  windowHeight: document.getElementById("windowHeight"),
  rodLeftOverflow: document.getElementById("rodLeftOverflow"),
  rodRightOverflow: document.getElementById("rodRightOverflow"),
  rodTopOffset: document.getElementById("rodTopOffset"),
  supportLeftInset: document.getElementById("supportLeftInset"),
  supportRightInset: document.getElementById("supportRightInset"),
  supportArmLength: document.getElementById("supportArmLength"),
  scalePxPerCm: document.getElementById("scalePxPerCm")
};

const summary = {
  window: document.getElementById("summaryWindow"),
  rod: document.getElementById("summaryRod"),
  left: document.getElementById("summaryLeft"),
  right: document.getElementById("summaryRight"),
  top: document.getElementById("summaryTop"),
  supportLeft: document.getElementById("summarySupportLeft"),
  supportRight: document.getElementById("summarySupportRight"),
  supportArm: document.getElementById("summarySupportArm"),
  betweenSupports: document.getElementById("summaryBetweenSupports")
};

const stage = new Konva.Stage({
  container: "container",
  width: stageWidth,
  height: stageHeight
});

const layer = new Konva.Layer();
stage.add(layer);

// -----------------------------
// Fond
// -----------------------------
const background = new Konva.Rect({
  x: 0,
  y: 0,
  width: stageWidth,
  height: stageHeight,
  fill: "#f6f7fb"
});

const workArea = new Konva.Rect({
  x: 40,
  y: 40,
  width: stageWidth - 80,
  height: stageHeight - 80,
  fill: "#ffffff",
  stroke: "#d8dce8",
  strokeWidth: 1,
  cornerRadius: 12
});

layer.add(background);
layer.add(workArea);

// -----------------------------
// Fenêtre
// -----------------------------
const windowGroup = new Konva.Group({
  x: windowX,
  y: windowY
});

const windowRect = new Konva.Rect({
  fill: "#dbeafe",
  stroke: "#2563eb",
  strokeWidth: 2,
  cornerRadius: 2
});

const windowLabel = new Konva.Text({
  x: 10,
  y: 10,
  fontSize: 18,
  fill: "#1e3a8a",
  fontStyle: "bold"
});

const windowWidthLine = new Konva.Line({
  stroke: "#111827",
  strokeWidth: 1.5
});

const windowWidthLeftMarker = new Konva.Line({
  stroke: "#111827",
  strokeWidth: 1.5
});

const windowWidthRightMarker = new Konva.Line({
  stroke: "#111827",
  strokeWidth: 1.5
});

const windowWidthText = new Konva.Text({
  fontSize: 16,
  fill: "#111827"
});

windowGroup.add(windowRect);
windowGroup.add(windowLabel);
windowGroup.add(windowWidthLine);
windowGroup.add(windowWidthLeftMarker);
windowGroup.add(windowWidthRightMarker);
windowGroup.add(windowWidthText);
layer.add(windowGroup);

// -----------------------------
// Tringle
// -----------------------------
const rodGroup = new Konva.Group({
  draggable: true
});

const rodLine = new Konva.Line({
  stroke: "#7c3aed",
  strokeWidth: 6,
  lineCap: "round"
});

const rodLeftCap = new Konva.Circle({
  radius: 8,
  fill: "#7c3aed"
});

const rodRightCap = new Konva.Circle({
  radius: 8,
  fill: "#7c3aed"
});

const rodLabel = new Konva.Text({
  y: -34,
  fontSize: 18,
  fill: "#581c87",
  fontStyle: "bold"
});

const rodMeasureLine = new Konva.Line({
  stroke: "#581c87",
  strokeWidth: 1.5
});

const rodMeasureLeftMarker = new Konva.Line({
  stroke: "#581c87",
  strokeWidth: 1.5
});

const rodMeasureRightMarker = new Konva.Line({
  stroke: "#581c87",
  strokeWidth: 1.5
});

const rodMeasureText = new Konva.Text({
  y: -82,
  fontSize: 16,
  fill: "#581c87"
});

// -----------------------------
// Supports / pieds d'ancrage
// -----------------------------
const leftBracketWall = new Konva.Rect({
  width: 10,
  height: 36,
  fill: "#4b5563",
  cornerRadius: 2
});

const leftBracketArm = new Konva.Line({
  stroke: "#4b5563",
  strokeWidth: 4,
  lineCap: "round"
});

const leftBracketDrop = new Konva.Line({
  stroke: "#4b5563",
  strokeWidth: 4,
  lineCap: "round"
});

const rightBracketWall = new Konva.Rect({
  width: 10,
  height: 36,
  fill: "#4b5563",
  cornerRadius: 2
});

const rightBracketArm = new Konva.Line({
  stroke: "#4b5563",
  strokeWidth: 4,
  lineCap: "round"
});

const rightBracketDrop = new Konva.Line({
  stroke: "#4b5563",
  strokeWidth: 4,
  lineCap: "round"
});

// -----------------------------
// Cotes supports extrémités
// -----------------------------
const supportLeftMeasureLine = new Konva.Line({
  stroke: "#0f766e",
  strokeWidth: 1.5
});

const supportLeftMeasureMarkerA = new Konva.Line({
  stroke: "#0f766e",
  strokeWidth: 1.5
});

const supportLeftMeasureMarkerB = new Konva.Line({
  stroke: "#0f766e",
  strokeWidth: 1.5
});

const supportLeftMeasureText = new Konva.Text({
  fontSize: 14,
  fill: "#0f766e"
});

const supportRightMeasureLine = new Konva.Line({
  stroke: "#0f766e",
  strokeWidth: 1.5
});

const supportRightMeasureMarkerA = new Konva.Line({
  stroke: "#0f766e",
  strokeWidth: 1.5
});

const supportRightMeasureMarkerB = new Konva.Line({
  stroke: "#0f766e",
  strokeWidth: 1.5
});

const supportRightMeasureText = new Konva.Text({
  fontSize: 14,
  fill: "#0f766e"
});

// -----------------------------
// Cote entraxe support gauche <-> support droit
// -----------------------------
const supportSpanMeasureLine = new Konva.Line({
  stroke: "#0891b2",
  strokeWidth: 1.5
});

const supportSpanMeasureMarkerA = new Konva.Line({
  stroke: "#0891b2",
  strokeWidth: 1.5
});

const supportSpanMeasureMarkerB = new Konva.Line({
  stroke: "#0891b2",
  strokeWidth: 1.5
});

const supportSpanMeasureText = new Konva.Text({
  fontSize: 14,
  fill: "#0891b2"
});

// -----------------------------
// Cote pied d'ancrage
// -----------------------------
const supportArmMeasureLine = new Konva.Line({
  stroke: "#b45309",
  strokeWidth: 1.5
});

const supportArmMeasureMarkerA = new Konva.Line({
  stroke: "#b45309",
  strokeWidth: 1.5
});

const supportArmMeasureMarkerB = new Konva.Line({
  stroke: "#b45309",
  strokeWidth: 1.5
});

const supportArmMeasureText = new Konva.Text({
  fontSize: 14,
  fill: "#b45309"
});

// -----------------------------
// Ajout dans le groupe tringle
// -----------------------------
rodGroup.add(rodLine);
rodGroup.add(rodLeftCap);
rodGroup.add(rodRightCap);
rodGroup.add(rodLabel);

rodGroup.add(rodMeasureLine);
rodGroup.add(rodMeasureLeftMarker);
rodGroup.add(rodMeasureRightMarker);
rodGroup.add(rodMeasureText);

rodGroup.add(leftBracketWall);
rodGroup.add(leftBracketArm);
rodGroup.add(leftBracketDrop);

rodGroup.add(rightBracketWall);
rodGroup.add(rightBracketArm);
rodGroup.add(rightBracketDrop);

rodGroup.add(supportLeftMeasureLine);
rodGroup.add(supportLeftMeasureMarkerA);
rodGroup.add(supportLeftMeasureMarkerB);
rodGroup.add(supportLeftMeasureText);

rodGroup.add(supportRightMeasureLine);
rodGroup.add(supportRightMeasureMarkerA);
rodGroup.add(supportRightMeasureMarkerB);
rodGroup.add(supportRightMeasureText);

rodGroup.add(supportSpanMeasureLine);
rodGroup.add(supportSpanMeasureMarkerA);
rodGroup.add(supportSpanMeasureMarkerB);
rodGroup.add(supportSpanMeasureText);

rodGroup.add(supportArmMeasureLine);
rodGroup.add(supportArmMeasureMarkerA);
rodGroup.add(supportArmMeasureMarkerB);
rodGroup.add(supportArmMeasureText);

layer.add(rodGroup);

// -----------------------------
// Poignées de tringle
// -----------------------------
const leftHandle = new Konva.Group({
  draggable: true
});

const leftHandleCircle = new Konva.Circle({
  radius: 10,
  fill: "#ef4444",
  stroke: "#ffffff",
  strokeWidth: 2
});

const leftHandleText = new Konva.Text({
  x: -18,
  y: 14,
  text: "G",
  fontSize: 14,
  fill: "#111827"
});

leftHandle.add(leftHandleCircle);
leftHandle.add(leftHandleText);
layer.add(leftHandle);

const rightHandle = new Konva.Group({
  draggable: true
});

const rightHandleCircle = new Konva.Circle({
  radius: 10,
  fill: "#ef4444",
  stroke: "#ffffff",
  strokeWidth: 2
});

const rightHandleText = new Konva.Text({
  x: -18,
  y: 14,
  text: "D",
  fontSize: 14,
  fill: "#111827"
});

rightHandle.add(rightHandleCircle);
rightHandle.add(rightHandleText);
layer.add(rightHandle);

// -----------------------------
// Poignées supports
// -----------------------------
const supportLeftHandle = new Konva.Group({
  draggable: true
});

const supportLeftHandleCircle = new Konva.Circle({
  radius: 8,
  fill: "#14b8a6",
  stroke: "#ffffff",
  strokeWidth: 2
});

const supportLeftHandleText = new Konva.Text({
  x: -11,
  y: 12,
  text: "SL",
  fontSize: 12,
  fill: "#111827"
});

supportLeftHandle.add(supportLeftHandleCircle);
supportLeftHandle.add(supportLeftHandleText);
layer.add(supportLeftHandle);

const supportRightHandle = new Konva.Group({
  draggable: true
});

const supportRightHandleCircle = new Konva.Circle({
  radius: 8,
  fill: "#14b8a6",
  stroke: "#ffffff",
  strokeWidth: 2
});

const supportRightHandleText = new Konva.Text({
  x: -11,
  y: 12,
  text: "SR",
  fontSize: 12,
  fill: "#111827"
});

supportRightHandle.add(supportRightHandleCircle);
supportRightHandle.add(supportRightHandleText);
layer.add(supportRightHandle);

// -----------------------------
// Helpers
// -----------------------------
function getWindowWidthPx() {
  return state.windowWidth * state.scalePxPerCm;
}

function getWindowHeightPx() {
  return state.windowHeight * state.scalePxPerCm;
}

function getRodWidthCm() {
  return state.windowWidth + state.rodLeftOverflow + state.rodRightOverflow;
}

function getRodWidthPx() {
  return getRodWidthCm() * state.scalePxPerCm;
}

function getRodX() {
  return windowX - state.rodLeftOverflow * state.scalePxPerCm;
}

function getRodY() {
  return windowY - state.rodTopOffset * state.scalePxPerCm;
}

function getSupportLeftPx() {
  return state.supportLeftInset * state.scalePxPerCm;
}

function getSupportRightPx() {
  return state.supportRightInset * state.scalePxPerCm;
}

function getSupportArmPx() {
  return state.supportArmLength * state.scalePxPerCm;
}

function getSupportSpanCm() {
  return Math.max(
    0,
    getRodWidthCm() - state.supportLeftInset - state.supportRightInset
  );
}

function normalizeSupportInsets() {
  const rodWidthCm = getRodWidthCm();

  state.supportLeftInset = Math.max(0, Math.min(state.supportLeftInset, rodWidthCm));
  state.supportRightInset = Math.max(0, Math.min(state.supportRightInset, rodWidthCm));

  if (state.supportLeftInset + state.supportRightInset > rodWidthCm) {
    const overflow = state.supportLeftInset + state.supportRightInset - rodWidthCm;
    state.supportRightInset = Math.max(0, state.supportRightInset - overflow);
  }
}

// -----------------------------
// Résumé
// -----------------------------
function updateSummary() {
  summary.window.textContent =
    `Fenêtre : ${state.windowWidth} cm × ${state.windowHeight} cm`;

  summary.rod.textContent =
    `Tringle : ${getRodWidthCm()} cm`;

  summary.left.textContent =
    `Débord gauche : ${state.rodLeftOverflow} cm`;

  summary.right.textContent =
    `Débord droit : ${state.rodRightOverflow} cm`;

  summary.top.textContent =
    `Hauteur au-dessus de la fenêtre : ${state.rodTopOffset} cm`;

  summary.supportLeft.textContent =
    `Extrémité gauche → support gauche : ${state.supportLeftInset} cm`;

  summary.supportRight.textContent =
    `Extrémité droite → support droit : ${state.supportRightInset} cm`;

  summary.supportArm.textContent =
    `Pied d'ancrage : ${state.supportArmLength} cm`;

  summary.betweenSupports.textContent =
    `Distance entre supports : ${getSupportSpanCm()} cm`;
}

// -----------------------------
// Dessin
// -----------------------------
function draw() {
  normalizeSupportInsets();

  const windowWidthPx = getWindowWidthPx();
  const windowHeightPx = getWindowHeightPx();

  const rodWidthCm = getRodWidthCm();
  const rodWidthPx = getRodWidthPx();
  const rodX = getRodX();
  const rodY = getRodY();

  const supportLeftPx = getSupportLeftPx();
  const supportRightPx = getSupportRightPx();
  const supportArmPx = getSupportArmPx();

  const leftSupportCenterX = supportLeftPx;
  const rightSupportCenterX = rodWidthPx - supportRightPx;

  const wallY = 42;
  const wallHeight = 36;
  const wallCenterY = wallY + wallHeight / 2;
  const rodDropBottomY = 12;

  // Fenêtre
  windowRect.width(windowWidthPx);
  windowRect.height(windowHeightPx);

  windowLabel.text(`Fenêtre ${state.windowWidth} × ${state.windowHeight} cm`);

  windowWidthLine.points([
    0,
    windowHeightPx + 36,
    windowWidthPx,
    windowHeightPx + 36
  ]);

  windowWidthLeftMarker.points([
    0,
    windowHeightPx + 26,
    0,
    windowHeightPx + 46
  ]);

  windowWidthRightMarker.points([
    windowWidthPx,
    windowHeightPx + 26,
    windowWidthPx,
    windowHeightPx + 46
  ]);

  windowWidthText.text(`${state.windowWidth} cm`);
  windowWidthText.x(windowWidthPx / 2 - 30);
  windowWidthText.y(windowHeightPx + 46);

  // Groupe tringle
  rodGroup.x(rodX);
  rodGroup.y(rodY);

  rodLine.points([0, 0, rodWidthPx, 0]);
  rodLeftCap.x(0);
  rodLeftCap.y(0);
  rodRightCap.x(rodWidthPx);
  rodRightCap.y(0);

  rodLabel.text(`Tringle ${rodWidthCm} cm`);
  rodLabel.x(rodWidthPx / 2 - 70);

  rodMeasureLine.points([0, -56, rodWidthPx, -56]);
  rodMeasureLeftMarker.points([0, -66, 0, -46]);
  rodMeasureRightMarker.points([rodWidthPx, -66, rodWidthPx, -46]);

  rodMeasureText.text(`${rodWidthCm} cm`);
  rodMeasureText.x(rodWidthPx / 2 - 30);

  // Supports : mur, bras horizontal, retombée vers la tringle
  leftBracketWall.x(leftSupportCenterX - supportArmPx - 5);
  leftBracketWall.y(wallY);

  leftBracketArm.points([
    leftSupportCenterX - supportArmPx,
    wallCenterY,
    leftSupportCenterX,
    wallCenterY
  ]);

  leftBracketDrop.points([
    leftSupportCenterX,
    wallCenterY,
    leftSupportCenterX,
    rodDropBottomY
  ]);

  rightBracketWall.x(rightSupportCenterX + supportArmPx - 5);
  rightBracketWall.y(wallY);

  rightBracketArm.points([
    rightSupportCenterX,
    wallCenterY,
    rightSupportCenterX + supportArmPx,
    wallCenterY
  ]);

  rightBracketDrop.points([
    rightSupportCenterX,
    wallCenterY,
    rightSupportCenterX,
    rodDropBottomY
  ]);

  // Mesure gauche extrémité -> support
  supportLeftMeasureLine.points([0, 94, leftSupportCenterX, 94]);
  supportLeftMeasureMarkerA.points([0, 86, 0, 102]);
  supportLeftMeasureMarkerB.points([leftSupportCenterX, 86, leftSupportCenterX, 102]);
  supportLeftMeasureText.text(`${state.supportLeftInset} cm`);
  supportLeftMeasureText.x(Math.max(4, leftSupportCenterX / 2 - 20));
  supportLeftMeasureText.y(102);

  // Mesure entre supports
  supportSpanMeasureLine.points([leftSupportCenterX, 126, rightSupportCenterX, 126]);
  supportSpanMeasureMarkerA.points([leftSupportCenterX, 118, leftSupportCenterX, 134]);
  supportSpanMeasureMarkerB.points([rightSupportCenterX, 118, rightSupportCenterX, 134]);
  supportSpanMeasureText.text(`${getSupportSpanCm()} cm`);
  supportSpanMeasureText.x(
    leftSupportCenterX + (rightSupportCenterX - leftSupportCenterX) / 2 - 22
  );
  supportSpanMeasureText.y(134);

  // Mesure droite support -> extrémité
  supportRightMeasureLine.points([rightSupportCenterX, 94, rodWidthPx, 94]);
  supportRightMeasureMarkerA.points([rightSupportCenterX, 86, rightSupportCenterX, 102]);
  supportRightMeasureMarkerB.points([rodWidthPx, 86, rodWidthPx, 102]);
  supportRightMeasureText.text(`${state.supportRightInset} cm`);
  supportRightMeasureText.x(
    rightSupportCenterX + (rodWidthPx - rightSupportCenterX) / 2 - 20
  );
  supportRightMeasureText.y(102);

  // Mesure du pied d'ancrage
  supportArmMeasureLine.points([
    leftSupportCenterX - supportArmPx,
    wallY - 14,
    leftSupportCenterX,
    wallY - 14
  ]);

  supportArmMeasureMarkerA.points([
    leftSupportCenterX - supportArmPx,
    wallY - 22,
    leftSupportCenterX - supportArmPx,
    wallY - 6
  ]);

  supportArmMeasureMarkerB.points([
    leftSupportCenterX,
    wallY - 22,
    leftSupportCenterX,
    wallY - 6
  ]);

  supportArmMeasureText.text(`${state.supportArmLength} cm`);
  supportArmMeasureText.x(leftSupportCenterX - supportArmPx / 2 - 20);
  supportArmMeasureText.y(wallY - 34);

  // Poignées
  leftHandle.x(rodX);
  leftHandle.y(rodY);

  rightHandle.x(rodX + rodWidthPx);
  rightHandle.y(rodY);

  supportLeftHandle.x(rodX + leftSupportCenterX);
  supportLeftHandle.y(rodY + wallCenterY);

  supportRightHandle.x(rodX + rightSupportCenterX);
  supportRightHandle.y(rodY + wallCenterY);

  updateSummary();
  layer.draw();
}

// -----------------------------
// Sync / lecture
// -----------------------------
function syncInputs() {
  inputs.windowWidth.value = state.windowWidth;
  inputs.windowHeight.value = state.windowHeight;
  inputs.rodLeftOverflow.value = state.rodLeftOverflow;
  inputs.rodRightOverflow.value = state.rodRightOverflow;
  inputs.rodTopOffset.value = state.rodTopOffset;
  inputs.supportLeftInset.value = state.supportLeftInset;
  inputs.supportRightInset.value = state.supportRightInset;
  inputs.supportArmLength.value = state.supportArmLength;
  inputs.scalePxPerCm.value = state.scalePxPerCm;
}

function readInputs() {
  state.windowWidth = Math.max(50, Number(inputs.windowWidth.value) || 50);
  state.windowHeight = Math.max(50, Number(inputs.windowHeight.value) || 50);
  state.rodLeftOverflow = Math.max(0, Number(inputs.rodLeftOverflow.value) || 0);
  state.rodRightOverflow = Math.max(0, Number(inputs.rodRightOverflow.value) || 0);
  state.rodTopOffset = Math.max(0, Number(inputs.rodTopOffset.value) || 0);
  state.supportLeftInset = Math.max(0, Number(inputs.supportLeftInset.value) || 0);
  state.supportRightInset = Math.max(0, Number(inputs.supportRightInset.value) || 0);
  state.supportArmLength = Math.max(0, Number(inputs.supportArmLength.value) || 0);
  state.scalePxPerCm = Math.max(1, Number(inputs.scalePxPerCm.value) || 1);

  normalizeSupportInsets();
}

// -----------------------------
// Events inputs
// -----------------------------
Object.values(inputs).forEach((input) => {
  input.addEventListener("input", () => {
    readInputs();
    syncInputs();
    draw();
  });
});

// -----------------------------
// Drag tringle
// -----------------------------
rodGroup.on("dragmove", function () {
  this.x(getRodX());
});

rodGroup.on("dragend", function () {
  this.x(getRodX());

  const distancePx = windowY - this.y();
  state.rodTopOffset = Math.max(0, Math.round(distancePx / state.scalePxPerCm));

  syncInputs();
  draw();
});

// -----------------------------
// Drag extrémité gauche
// -----------------------------
leftHandle.on("dragmove", function () {
  const pointerX = this.x();
  const maxLeft = windowX;
  const deltaPx = maxLeft - pointerX;

  state.rodLeftOverflow = Math.max(0, Math.round(deltaPx / state.scalePxPerCm));

  syncInputs();
  draw();
});

// -----------------------------
// Drag extrémité droite
// -----------------------------
rightHandle.on("dragmove", function () {
  const pointerX = this.x();
  const windowRight = windowX + getWindowWidthPx();
  const deltaPx = pointerX - windowRight;

  state.rodRightOverflow = Math.max(0, Math.round(deltaPx / state.scalePxPerCm));

  syncInputs();
  draw();
});

// -----------------------------
// Drag support gauche
// -----------------------------
supportLeftHandle.on("dragmove", function () {
  const rodX = getRodX();
  const rodWidthPx = getRodWidthPx();
  const localX = this.x() - rodX;

  const clampedX = Math.max(0, Math.min(localX, rodWidthPx));
  state.supportLeftInset = Math.round(clampedX / state.scalePxPerCm);

  normalizeSupportInsets();
  syncInputs();
  draw();
});

// -----------------------------
// Drag support droit
// -----------------------------
supportRightHandle.on("dragmove", function () {
  const rodX = getRodX();
  const rodWidthPx = getRodWidthPx();
  const localX = this.x() - rodX;

  const clampedX = Math.max(0, Math.min(localX, rodWidthPx));
  state.supportRightInset = Math.round((rodWidthPx - clampedX) / state.scalePxPerCm);

  normalizeSupportInsets();
  syncInputs();
  draw();
});

// -----------------------------
// Init
// -----------------------------
syncInputs();
draw();