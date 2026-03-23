const stageWidth = 1180;
const stageHeight = 760;

const windowX = 330;
const windowY = 280;

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

// --------------------------------------------------
// Fond
// --------------------------------------------------
const background = new Konva.Rect({
  x: 0,
  y: 0,
  width: stageWidth,
  height: stageHeight,
  fillLinearGradientStartPoint: { x: 0, y: 0 },
  fillLinearGradientEndPoint: { x: 0, y: stageHeight },
  fillLinearGradientColorStops: [
    0, "#f8fbff",
    1, "#eef2f7"
  ]
});

const workAreaShadow = new Konva.Rect({
  x: 46,
  y: 48,
  width: stageWidth - 80,
  height: stageHeight - 90,
  fill: "rgba(0,0,0,0.06)",
  cornerRadius: 14,
  listening: false
});

const workArea = new Konva.Rect({
  x: 36,
  y: 38,
  width: stageWidth - 80,
  height: stageHeight - 90,
  fill: "#ffffff",
  stroke: "#dbe3ef",
  strokeWidth: 1,
  cornerRadius: 14
});

layer.add(background);
layer.add(workAreaShadow);
layer.add(workArea);

// --------------------------------------------------
// Fenêtre avec effet 3D
// --------------------------------------------------
const windowGroup = new Konva.Group({
  x: windowX,
  y: windowY
});

const windowShadow = new Konva.Rect({
  fill: "rgba(0,0,0,0.12)",
  cornerRadius: 5,
  listening: false
});

const windowFrame = new Konva.Rect({
  fillLinearGradientStartPoint: { x: 0, y: 0 },
  fillLinearGradientEndPoint: { x: 0, y: 100 },
  fillLinearGradientColorStops: [
    0, "#f3f4f6",
    0.5, "#d1d5db",
    1, "#9ca3af"
  ],
  stroke: "#6b7280",
  strokeWidth: 2,
  cornerRadius: 5
});

const windowInnerShadow = new Konva.Rect({
  fill: "rgba(0,0,0,0.03)",
  cornerRadius: 3,
  listening: false
});

const windowGlass = new Konva.Rect({
  fillLinearGradientStartPoint: { x: 0, y: 0 },
  fillLinearGradientEndPoint: { x: 0, y: 400 },
  fillLinearGradientColorStops: [
    0, "#f8fdff",
    0.2, "#edf7ff",
    0.65, "#d7ecff",
    1, "#a9d4ff"
  ],
  stroke: "#8ec5ff",
  strokeWidth: 1.2,
  cornerRadius: 3
});

const windowHighlight = new Konva.Rect({
  fillLinearGradientStartPoint: { x: 0, y: 0 },
  fillLinearGradientEndPoint: { x: 120, y: 0 },
  fillLinearGradientColorStops: [
    0, "rgba(255,255,255,0.55)",
    0.55, "rgba(255,255,255,0.16)",
    1, "rgba(255,255,255,0)"
  ],
  listening: false,
  cornerRadius: 3
});

const windowBottomShade = new Konva.Rect({
  fillLinearGradientStartPoint: { x: 0, y: 0 },
  fillLinearGradientEndPoint: { x: 0, y: 70 },
  fillLinearGradientColorStops: [
    0, "rgba(255,255,255,0)",
    1, "rgba(0,0,0,0.08)"
  ],
  listening: false,
  cornerRadius: 3
});

const windowLabel = new Konva.Text({
  x: 12,
  y: 12,
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

windowGroup.add(windowShadow);
windowGroup.add(windowFrame);
windowGroup.add(windowInnerShadow);
windowGroup.add(windowGlass);
windowGroup.add(windowHighlight);
windowGroup.add(windowBottomShade);
windowGroup.add(windowLabel);
windowGroup.add(windowWidthLine);
windowGroup.add(windowWidthLeftMarker);
windowGroup.add(windowWidthRightMarker);
windowGroup.add(windowWidthText);
layer.add(windowGroup);

// --------------------------------------------------
// Tringle / gabarit avec effet 3D
// --------------------------------------------------
const rodGroup = new Konva.Group({
  draggable: true
});

const rodShadow = new Konva.Line({
  stroke: "rgba(0,0,0,0.18)",
  strokeWidth: 12,
  lineCap: "round",
  listening: false
});

const rodLine = new Konva.Line({
  strokeLinearGradientStartPoint: { x: 0, y: -6 },
  strokeLinearGradientEndPoint: { x: 0, y: 6 },
  strokeLinearGradientColorStops: [
    0, "#c4b5fd",
    0.25, "#9f7aea",
    0.55, "#7c3aed",
    0.8, "#5b21b6",
    1, "#3b0764"
  ],
  strokeWidth: 8,
  lineCap: "round"
});

const rodHighlight = new Konva.Line({
  stroke: "rgba(255,255,255,0.55)",
  strokeWidth: 2.2,
  lineCap: "round",
  listening: false
});

const rodLeftCapShadow = new Konva.Circle({
  radius: 11,
  fill: "rgba(0,0,0,0.18)",
  listening: false
});

const rodLeftCap = new Konva.Circle({
  radius: 9,
  fillRadialGradientStartPoint: { x: -2, y: -2 },
  fillRadialGradientStartRadius: 1,
  fillRadialGradientEndPoint: { x: 0, y: 0 },
  fillRadialGradientEndRadius: 10,
  fillRadialGradientColorStops: [
    0, "#ddd6fe",
    0.35, "#8b5cf6",
    1, "#4c1d95"
  ]
});

const rodRightCapShadow = new Konva.Circle({
  radius: 11,
  fill: "rgba(0,0,0,0.18)",
  listening: false
});

const rodRightCap = new Konva.Circle({
  radius: 9,
  fillRadialGradientStartPoint: { x: -2, y: -2 },
  fillRadialGradientStartRadius: 1,
  fillRadialGradientEndPoint: { x: 0, y: 0 },
  fillRadialGradientEndRadius: 10,
  fillRadialGradientColorStops: [
    0, "#ddd6fe",
    0.35, "#8b5cf6",
    1, "#4c1d95"
  ]
});

const rodLabel = new Konva.Text({
  y: -38,
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
  y: -84,
  fontSize: 16,
  fill: "#581c87"
});

// --------------------------------------------------
// Fixations verticales
// --------------------------------------------------
const leftSupportStemShadow = new Konva.Line({
  stroke: "rgba(0,0,0,0.18)",
  strokeWidth: 6,
  lineCap: "round",
  listening: false
});

const leftSupportStem = new Konva.Line({
  strokeLinearGradientStartPoint: { x: -2, y: 0 },
  strokeLinearGradientEndPoint: { x: 2, y: 0 },
  strokeLinearGradientColorStops: [
    0, "#d1d5db",
    0.4, "#6b7280",
    1, "#374151"
  ],
  strokeWidth: 4,
  lineCap: "round"
});

const rightSupportStemShadow = new Konva.Line({
  stroke: "rgba(0,0,0,0.18)",
  strokeWidth: 6,
  lineCap: "round",
  listening: false
});

const rightSupportStem = new Konva.Line({
  strokeLinearGradientStartPoint: { x: -2, y: 0 },
  strokeLinearGradientEndPoint: { x: 2, y: 0 },
  strokeLinearGradientColorStops: [
    0, "#d1d5db",
    0.4, "#6b7280",
    1, "#374151"
  ],
  strokeWidth: 4,
  lineCap: "round"
});

const leftSupportFootShadow = new Konva.Line({
  stroke: "rgba(0,0,0,0.16)",
  strokeWidth: 6,
  lineCap: "round",
  listening: false
});

const leftSupportFoot = new Konva.Line({
  strokeLinearGradientStartPoint: { x: -12, y: 0 },
  strokeLinearGradientEndPoint: { x: 12, y: 0 },
  strokeLinearGradientColorStops: [
    0, "#e5e7eb",
    0.4, "#9ca3af",
    1, "#4b5563"
  ],
  strokeWidth: 4,
  lineCap: "round"
});

const rightSupportFootShadow = new Konva.Line({
  stroke: "rgba(0,0,0,0.16)",
  strokeWidth: 6,
  lineCap: "round",
  listening: false
});

const rightSupportFoot = new Konva.Line({
  strokeLinearGradientStartPoint: { x: -12, y: 0 },
  strokeLinearGradientEndPoint: { x: 12, y: 0 },
  strokeLinearGradientColorStops: [
    0, "#e5e7eb",
    0.4, "#9ca3af",
    1, "#4b5563"
  ],
  strokeWidth: 4,
  lineCap: "round"
});

// --------------------------------------------------
// Cotes
// --------------------------------------------------
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

// --------------------------------------------------
// Ajout au groupe tringle
// --------------------------------------------------
rodGroup.add(rodShadow);
rodGroup.add(rodLine);
rodGroup.add(rodHighlight);

rodGroup.add(rodLeftCapShadow);
rodGroup.add(rodLeftCap);
rodGroup.add(rodRightCapShadow);
rodGroup.add(rodRightCap);

rodGroup.add(rodLabel);
rodGroup.add(rodMeasureLine);
rodGroup.add(rodMeasureLeftMarker);
rodGroup.add(rodMeasureRightMarker);
rodGroup.add(rodMeasureText);

rodGroup.add(leftSupportStemShadow);
rodGroup.add(leftSupportStem);
rodGroup.add(rightSupportStemShadow);
rodGroup.add(rightSupportStem);

rodGroup.add(leftSupportFootShadow);
rodGroup.add(leftSupportFoot);
rodGroup.add(rightSupportFootShadow);
rodGroup.add(rightSupportFoot);

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

// --------------------------------------------------
// Poignées
// --------------------------------------------------
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
  x: -12,
  y: 12,
  text: "FG",
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
  x: -12,
  y: 12,
  text: "FD",
  fontSize: 12,
  fill: "#111827"
});

supportRightHandle.add(supportRightHandleCircle);
supportRightHandle.add(supportRightHandleText);
layer.add(supportRightHandle);

// --------------------------------------------------
// Helpers
// --------------------------------------------------
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
  return Math.max(0, getRodWidthCm() - state.supportLeftInset - state.supportRightInset);
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

// --------------------------------------------------
// Résumé
// --------------------------------------------------
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
    `Extrémité gauche → fixation gauche : ${state.supportLeftInset} cm`;

  summary.supportRight.textContent =
    `Extrémité droite → fixation droite : ${state.supportRightInset} cm`;

  summary.supportArm.textContent =
    `Distance tige → fixation FG/FD : ${state.supportArmLength} cm`;

  summary.betweenSupports.textContent =
    `Distance entre fixations : ${getSupportSpanCm()} cm`;
}

// --------------------------------------------------
// Dessin
// --------------------------------------------------
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

  const leftSupportX = supportLeftPx;
  const rightSupportX = rodWidthPx - supportRightPx;

  const supportBottomY = supportArmPx;
  const footHalfWidth = 12;

  // Fenêtre 3D
  windowShadow.x(8);
  windowShadow.y(10);
  windowShadow.width(windowWidthPx);
  windowShadow.height(windowHeightPx);

  windowFrame.width(windowWidthPx);
  windowFrame.height(windowHeightPx);

  windowInnerShadow.x(6);
  windowInnerShadow.y(6);
  windowInnerShadow.width(Math.max(10, windowWidthPx - 12));
  windowInnerShadow.height(Math.max(10, windowHeightPx - 12));

  windowGlass.x(10);
  windowGlass.y(10);
  windowGlass.width(Math.max(20, windowWidthPx - 20));
  windowGlass.height(Math.max(20, windowHeightPx - 20));

  windowHighlight.x(16);
  windowHighlight.y(16);
  windowHighlight.width(Math.max(10, (windowWidthPx - 40) * 0.34));
  windowHighlight.height(Math.max(20, windowHeightPx - 32));

  windowBottomShade.x(10);
  windowBottomShade.y(Math.max(10, windowHeightPx - 70));
  windowBottomShade.width(Math.max(20, windowWidthPx - 20));
  windowBottomShade.height(60);

  windowLabel.text(`Fenêtre ${state.windowWidth} × ${state.windowHeight} cm`);

  windowWidthLine.points([0, windowHeightPx + 38, windowWidthPx, windowHeightPx + 38]);
  windowWidthLeftMarker.points([0, windowHeightPx + 28, 0, windowHeightPx + 48]);
  windowWidthRightMarker.points([windowWidthPx, windowHeightPx + 28, windowWidthPx, windowHeightPx + 48]);

  windowWidthText.text(`${state.windowWidth} cm`);
  windowWidthText.x(windowWidthPx / 2 - 30);
  windowWidthText.y(windowHeightPx + 48);

  // Tringle
  rodGroup.x(rodX);
  rodGroup.y(rodY);

  rodShadow.points([0, 4, rodWidthPx, 4]);
  rodLine.points([0, 0, rodWidthPx, 0]);
  rodHighlight.points([2, -2, rodWidthPx - 2, -2]);

  rodLeftCapShadow.position({ x: 0, y: 4 });
  rodLeftCap.position({ x: 0, y: 0 });
  rodRightCapShadow.position({ x: rodWidthPx, y: 4 });
  rodRightCap.position({ x: rodWidthPx, y: 0 });

  rodLabel.text(`Tringle ${rodWidthCm} cm`);
  rodLabel.x(rodWidthPx / 2 - 70);

  rodMeasureLine.points([0, -58, rodWidthPx, -58]);
  rodMeasureLeftMarker.points([0, -68, 0, -48]);
  rodMeasureRightMarker.points([rodWidthPx, -68, rodWidthPx, -48]);

  rodMeasureText.text(`${rodWidthCm} cm`);
  rodMeasureText.x(rodWidthPx / 2 - 30);

  // Fixations 3D
  leftSupportStemShadow.points([leftSupportX + 1, 3, leftSupportX + 1, supportBottomY + 3]);
  leftSupportStem.points([leftSupportX, 0, leftSupportX, supportBottomY]);

  rightSupportStemShadow.points([rightSupportX + 1, 3, rightSupportX + 1, supportBottomY + 3]);
  rightSupportStem.points([rightSupportX, 0, rightSupportX, supportBottomY]);

  leftSupportFootShadow.points([
    leftSupportX - footHalfWidth + 1,
    supportBottomY + 2,
    leftSupportX + footHalfWidth + 1,
    supportBottomY + 2
  ]);
  leftSupportFoot.points([
    leftSupportX - footHalfWidth,
    supportBottomY,
    leftSupportX + footHalfWidth,
    supportBottomY
  ]);

  rightSupportFootShadow.points([
    rightSupportX - footHalfWidth + 1,
    supportBottomY + 2,
    rightSupportX + footHalfWidth + 1,
    supportBottomY + 2
  ]);
  rightSupportFoot.points([
    rightSupportX - footHalfWidth,
    supportBottomY,
    rightSupportX + footHalfWidth,
    supportBottomY
  ]);

  // Cotes horizontales
  supportLeftMeasureLine.points([0, 102, leftSupportX, 102]);
  supportLeftMeasureMarkerA.points([0, 94, 0, 110]);
  supportLeftMeasureMarkerB.points([leftSupportX, 94, leftSupportX, 110]);
  supportLeftMeasureText.text(`${state.supportLeftInset} cm`);
  supportLeftMeasureText.x(Math.max(4, leftSupportX / 2 - 20));
  supportLeftMeasureText.y(110);

  supportRightMeasureLine.points([rightSupportX, 102, rodWidthPx, 102]);
  supportRightMeasureMarkerA.points([rightSupportX, 94, rightSupportX, 110]);
  supportRightMeasureMarkerB.points([rodWidthPx, 94, rodWidthPx, 110]);
  supportRightMeasureText.text(`${state.supportRightInset} cm`);
  supportRightMeasureText.x(rightSupportX + (rodWidthPx - rightSupportX) / 2 - 20);
  supportRightMeasureText.y(110);

  supportSpanMeasureLine.points([leftSupportX, 136, rightSupportX, 136]);
  supportSpanMeasureMarkerA.points([leftSupportX, 128, leftSupportX, 144]);
  supportSpanMeasureMarkerB.points([rightSupportX, 128, rightSupportX, 144]);
  supportSpanMeasureText.text(`${getSupportSpanCm()} cm`);
  supportSpanMeasureText.x(leftSupportX + (rightSupportX - leftSupportX) / 2 - 22);
  supportSpanMeasureText.y(144);

  // Cote verticale tige -> fixation
  const verticalMeasureX = leftSupportX - 38;

  supportArmMeasureLine.points([verticalMeasureX, 0, verticalMeasureX, supportBottomY]);
  supportArmMeasureMarkerA.points([verticalMeasureX - 8, 0, verticalMeasureX + 8, 0]);
  supportArmMeasureMarkerB.points([verticalMeasureX - 8, supportBottomY, verticalMeasureX + 8, supportBottomY]);
  supportArmMeasureText.text(`${state.supportArmLength} cm`);
  supportArmMeasureText.x(verticalMeasureX - 20);
  supportArmMeasureText.y(supportBottomY / 2 - 8);

  // Poignées
  leftHandle.position({ x: rodX, y: rodY });
  rightHandle.position({ x: rodX + rodWidthPx, y: rodY });

  supportLeftHandle.position({ x: rodX + leftSupportX, y: rodY + supportBottomY });
  supportRightHandle.position({ x: rodX + rightSupportX, y: rodY + supportBottomY });

  updateSummary();
  layer.draw();
}

// --------------------------------------------------
// Sync / lecture
// --------------------------------------------------
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

Object.values(inputs).forEach((input) => {
  input.addEventListener("input", () => {
    readInputs();
    syncInputs();
    draw();
  });
});

// --------------------------------------------------
// Drag tringle
// --------------------------------------------------
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

// --------------------------------------------------
// Drag extrémité gauche
// --------------------------------------------------
leftHandle.on("dragmove", function () {
  const pointerX = this.x();
  const maxLeft = windowX;
  const deltaPx = maxLeft - pointerX;

  state.rodLeftOverflow = Math.max(0, Math.round(deltaPx / state.scalePxPerCm));

  syncInputs();
  draw();
});

// --------------------------------------------------
// Drag extrémité droite
// --------------------------------------------------
rightHandle.on("dragmove", function () {
  const pointerX = this.x();
  const windowRight = windowX + getWindowWidthPx();
  const deltaPx = pointerX - windowRight;

  state.rodRightOverflow = Math.max(0, Math.round(deltaPx / state.scalePxPerCm));

  syncInputs();
  draw();
});

// --------------------------------------------------
// Drag fixation gauche
// --------------------------------------------------
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

// --------------------------------------------------
// Drag fixation droite
// --------------------------------------------------
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

// --------------------------------------------------
// Init
// --------------------------------------------------
syncInputs();
draw();