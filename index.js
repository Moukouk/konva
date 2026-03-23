import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const Konva = window.Konva;

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

const imageState = {
  sourceWidth: 0,
  sourceHeight: 0,
  cropLeft: 0,
  cropRight: 0,
  cropTop: 0,
  cropBottom: 0
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
  scalePxPerCm: document.getElementById("scalePxPerCm"),
  imageUpload: document.getElementById("imageUpload"),
  fitImageBtn: document.getElementById("fitImageBtn"),
  resetImageBtn: document.getElementById("resetImageBtn"),
  cropLeft: document.getElementById("cropLeft"),
  cropRight: document.getElementById("cropRight"),
  cropTop: document.getElementById("cropTop"),
  cropBottom: document.getElementById("cropBottom"),
  resetCropBtn: document.getElementById("resetCropBtn"),
  clipImageToWindow: document.getElementById("clipImageToWindow"),
  open3DBtn: document.getElementById("open3DBtn"),
  close3DModalBtn: document.getElementById("close3DModalBtn"),
  export3DBtn: document.getElementById("export3DBtn"),
  reset3DViewBtn: document.getElementById("reset3DViewBtn")
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
  betweenSupports: document.getElementById("summaryBetweenSupports"),
  crop: document.getElementById("summaryCrop"),
  clipMode: document.getElementById("summaryClipMode")
};

const modal3D = document.getElementById("modal3D");
const threeContainer = document.getElementById("threeContainer");

// ------------------------------
// 2D KONVA
// ------------------------------
const stage = new Konva.Stage({
  container: "container",
  width: stageWidth,
  height: stageHeight
});

const layer = new Konva.Layer();
stage.add(layer);

// fond
const background = new Konva.Rect({
  x: 0,
  y: 0,
  width: stageWidth,
  height: stageHeight,
  fillLinearGradientStartPoint: { x: 0, y: 0 },
  fillLinearGradientEndPoint: { x: 0, y: stageHeight },
  fillLinearGradientColorStops: [0, "#f8fbff", 1, "#eef2f7"]
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

// fenêtre
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
  fillLinearGradientColorStops: [0, "#f3f4f6", 0.5, "#d1d5db", 1, "#9ca3af"],
  stroke: "#6b7280",
  strokeWidth: 2,
  cornerRadius: 5
});

const windowInnerShadow = new Konva.Rect({
  fill: "rgba(0,0,0,0.03)",
  cornerRadius: 3,
  listening: false
});

const imageClipGroup = new Konva.Group();

const windowGlass = new Konva.Rect({
  fillLinearGradientStartPoint: { x: 0, y: 0 },
  fillLinearGradientEndPoint: { x: 0, y: 400 },
  fillLinearGradientColorStops: [
    0, "rgba(248,253,255,0.10)",
    0.2, "rgba(237,247,255,0.08)",
    0.65, "rgba(215,236,255,0.06)",
    1, "rgba(169,212,255,0.05)"
  ],
  stroke: "#8ec5ff",
  strokeWidth: 1.2,
  cornerRadius: 3,
  listening: false
});

const windowHighlight = new Konva.Rect({
  fillLinearGradientStartPoint: { x: 0, y: 0 },
  fillLinearGradientEndPoint: { x: 120, y: 0 },
  fillLinearGradientColorStops: [
    0, "rgba(255,255,255,0.45)",
    0.55, "rgba(255,255,255,0.14)",
    1, "rgba(255,255,255,0)"
  ],
  listening: false,
  cornerRadius: 3
});

const windowBottomShade = new Konva.Rect({
  fillLinearGradientStartPoint: { x: 0, y: 0 },
  fillLinearGradientEndPoint: { x: 0, y: 70 },
  fillLinearGradientColorStops: [0, "rgba(255,255,255,0)", 1, "rgba(0,0,0,0.08)"],
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
windowGroup.add(imageClipGroup);
windowGroup.add(windowGlass);
windowGroup.add(windowHighlight);
windowGroup.add(windowBottomShade);
windowGroup.add(windowLabel);
windowGroup.add(windowWidthLine);
windowGroup.add(windowWidthLeftMarker);
windowGroup.add(windowWidthRightMarker);
windowGroup.add(windowWidthText);

layer.add(windowGroup);

// image
let userImageNode = null;
let loadedImageElement = null;

const imageTransformer = new Konva.Transformer({
  rotateEnabled: false,
  keepRatio: false,
  enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
  borderStroke: "#14b8a6",
  anchorFill: "#14b8a6",
  anchorStroke: "#ffffff",
  anchorStrokeWidth: 2,
  anchorSize: 10,
  visible: false
});

layer.add(imageTransformer);

// tringle
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
  strokeLinearGradientColorStops: [0, "#c4b5fd", 0.25, "#9f7aea", 0.55, "#7c3aed", 0.8, "#5b21b6", 1, "#3b0764"],
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
  fillRadialGradientColorStops: [0, "#ddd6fe", 0.35, "#8b5cf6", 1, "#4c1d95"]
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
  fillRadialGradientColorStops: [0, "#ddd6fe", 0.35, "#8b5cf6", 1, "#4c1d95"]
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

// fixations
const leftSupportStemShadow = new Konva.Line({
  stroke: "rgba(0,0,0,0.18)",
  strokeWidth: 6,
  lineCap: "round",
  listening: false
});

const leftSupportStem = new Konva.Line({
  strokeLinearGradientStartPoint: { x: -2, y: 0 },
  strokeLinearGradientEndPoint: { x: 2, y: 0 },
  strokeLinearGradientColorStops: [0, "#d1d5db", 0.4, "#6b7280", 1, "#374151"],
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
  strokeLinearGradientColorStops: [0, "#d1d5db", 0.4, "#6b7280", 1, "#374151"],
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
  strokeLinearGradientColorStops: [0, "#e5e7eb", 0.4, "#9ca3af", 1, "#4b5563"],
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
  strokeLinearGradientColorStops: [0, "#e5e7eb", 0.4, "#9ca3af", 1, "#4b5563"],
  strokeWidth: 4,
  lineCap: "round"
});

// cotes
const supportLeftMeasureLine = new Konva.Line({ stroke: "#0f766e", strokeWidth: 1.5 });
const supportLeftMeasureMarkerA = new Konva.Line({ stroke: "#0f766e", strokeWidth: 1.5 });
const supportLeftMeasureMarkerB = new Konva.Line({ stroke: "#0f766e", strokeWidth: 1.5 });
const supportLeftMeasureText = new Konva.Text({ fontSize: 14, fill: "#0f766e" });

const supportRightMeasureLine = new Konva.Line({ stroke: "#0f766e", strokeWidth: 1.5 });
const supportRightMeasureMarkerA = new Konva.Line({ stroke: "#0f766e", strokeWidth: 1.5 });
const supportRightMeasureMarkerB = new Konva.Line({ stroke: "#0f766e", strokeWidth: 1.5 });
const supportRightMeasureText = new Konva.Text({ fontSize: 14, fill: "#0f766e" });

const supportSpanMeasureLine = new Konva.Line({ stroke: "#0891b2", strokeWidth: 1.5 });
const supportSpanMeasureMarkerA = new Konva.Line({ stroke: "#0891b2", strokeWidth: 1.5 });
const supportSpanMeasureMarkerB = new Konva.Line({ stroke: "#0891b2", strokeWidth: 1.5 });
const supportSpanMeasureText = new Konva.Text({ fontSize: 14, fill: "#0891b2" });

const supportArmMeasureLine = new Konva.Line({ stroke: "#b45309", strokeWidth: 1.5 });
const supportArmMeasureMarkerA = new Konva.Line({ stroke: "#b45309", strokeWidth: 1.5 });
const supportArmMeasureMarkerB = new Konva.Line({ stroke: "#b45309", strokeWidth: 1.5 });
const supportArmMeasureText = new Konva.Text({ fontSize: 14, fill: "#b45309" });

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

// poignées
const leftHandle = new Konva.Group({ draggable: true });
leftHandle.add(new Konva.Circle({ radius: 10, fill: "#ef4444", stroke: "#ffffff", strokeWidth: 2 }));
leftHandle.add(new Konva.Text({ x: -18, y: 14, text: "G", fontSize: 14, fill: "#111827" }));
layer.add(leftHandle);

const rightHandle = new Konva.Group({ draggable: true });
rightHandle.add(new Konva.Circle({ radius: 10, fill: "#ef4444", stroke: "#ffffff", strokeWidth: 2 }));
rightHandle.add(new Konva.Text({ x: -18, y: 14, text: "D", fontSize: 14, fill: "#111827" }));
layer.add(rightHandle);

const supportLeftHandle = new Konva.Group({ draggable: true });
supportLeftHandle.add(new Konva.Circle({ radius: 8, fill: "#14b8a6", stroke: "#ffffff", strokeWidth: 2 }));
supportLeftHandle.add(new Konva.Text({ x: -12, y: 12, text: "FG", fontSize: 12, fill: "#111827" }));
layer.add(supportLeftHandle);

const supportRightHandle = new Konva.Group({ draggable: true });
supportRightHandle.add(new Konva.Circle({ radius: 8, fill: "#14b8a6", stroke: "#ffffff", strokeWidth: 2 }));
supportRightHandle.add(new Konva.Text({ x: -12, y: 12, text: "FD", fontSize: 12, fill: "#111827" }));
layer.add(supportRightHandle);

// ------------------------------
// HELPERS 2D
// ------------------------------
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

function getWindowInnerBox() {
  return {
    x: 10,
    y: 10,
    width: Math.max(20, getWindowWidthPx() - 20),
    height: Math.max(20, getWindowHeightPx() - 20)
  };
}

function applyImageClip() {
  const box = getWindowInnerBox();

  if (inputs.clipImageToWindow.checked) {
    imageClipGroup.clip({
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height
    });
  } else {
    imageClipGroup.clip(null);
  }
}

function normalizeCropValues() {
  if (!userImageNode) return;

  const maxW = imageState.sourceWidth;
  const maxH = imageState.sourceHeight;

  imageState.cropLeft = Math.max(0, Number(inputs.cropLeft.value) || 0);
  imageState.cropRight = Math.max(0, Number(inputs.cropRight.value) || 0);
  imageState.cropTop = Math.max(0, Number(inputs.cropTop.value) || 0);
  imageState.cropBottom = Math.max(0, Number(inputs.cropBottom.value) || 0);

  if (imageState.cropLeft + imageState.cropRight > maxW - 1) {
    imageState.cropRight = Math.max(0, maxW - 1 - imageState.cropLeft);
  }

  if (imageState.cropTop + imageState.cropBottom > maxH - 1) {
    imageState.cropBottom = Math.max(0, maxH - 1 - imageState.cropTop);
  }

  inputs.cropLeft.value = imageState.cropLeft;
  inputs.cropRight.value = imageState.cropRight;
  inputs.cropTop.value = imageState.cropTop;
  inputs.cropBottom.value = imageState.cropBottom;
}

function applyCropToImage() {
  if (!userImageNode) return;

  normalizeCropValues();

  const cropX = imageState.cropLeft;
  const cropY = imageState.cropTop;
  const cropWidth = Math.max(1, imageState.sourceWidth - imageState.cropLeft - imageState.cropRight);
  const cropHeight = Math.max(1, imageState.sourceHeight - imageState.cropTop - imageState.cropBottom);

  userImageNode.crop({
    x: cropX,
    y: cropY,
    width: cropWidth,
    height: cropHeight
  });

  userImageNode.width(cropWidth);
  userImageNode.height(cropHeight);
}

function clampImageInsideWindow() {
  if (!userImageNode) return;
  if (!inputs.clipImageToWindow.checked) return;

  const box = getWindowInnerBox();
  const scaledWidth = userImageNode.width() * userImageNode.scaleX();
  const scaledHeight = userImageNode.height() * userImageNode.scaleY();

  const minX = box.x + box.width - scaledWidth;
  const minY = box.y + box.height - scaledHeight;
  const maxX = box.x;
  const maxY = box.y;

  userImageNode.x(Math.min(maxX, Math.max(minX, userImageNode.x())));
  userImageNode.y(Math.min(maxY, Math.max(minY, userImageNode.y())));
}

function bringWindowOverlayToFront() {
  windowGlass.moveToTop();
  windowHighlight.moveToTop();
  windowBottomShade.moveToTop();
  windowLabel.moveToTop();
  windowWidthLine.moveToTop();
  windowWidthLeftMarker.moveToTop();
  windowWidthRightMarker.moveToTop();
  windowWidthText.moveToTop();
}

function fitImageToWindow() {
  if (!userImageNode) return;

  const box = getWindowInnerBox();
  const imgW = userImageNode.width();
  const imgH = userImageNode.height();

  const scale = Math.max(box.width / imgW, box.height / imgH);

  userImageNode.scale({ x: scale, y: scale });

  const scaledW = imgW * scale;
  const scaledH = imgH * scale;

  userImageNode.position({
    x: box.x + (box.width - scaledW) / 2,
    y: box.y + (box.height - scaledH) / 2
  });

  imageTransformer.nodes([userImageNode]);
  imageTransformer.visible(true);
  clampImageInsideWindow();
  bringWindowOverlayToFront();
  layer.draw();
}

function resetImageToCenter() {
  if (!userImageNode) return;

  const box = getWindowInnerBox();
  const scaledW = userImageNode.width() * userImageNode.scaleX();
  const scaledH = userImageNode.height() * userImageNode.scaleY();

  userImageNode.position({
    x: box.x + (box.width - scaledW) / 2,
    y: box.y + (box.height - scaledH) / 2
  });

  if (inputs.clipImageToWindow.checked) {
    clampImageInsideWindow();
  }

  imageTransformer.nodes([userImageNode]);
  imageTransformer.visible(true);
  bringWindowOverlayToFront();
  layer.draw();
}

function resetCrop() {
  if (!userImageNode) return;

  imageState.cropLeft = 0;
  imageState.cropRight = 0;
  imageState.cropTop = 0;
  imageState.cropBottom = 0;

  inputs.cropLeft.value = 0;
  inputs.cropRight.value = 0;
  inputs.cropTop.value = 0;
  inputs.cropBottom.value = 0;

  applyCropToImage();
  fitImageToWindow();
}

function updateSummary() {
  summary.window.textContent = `Fenêtre : ${state.windowWidth} cm × ${state.windowHeight} cm`;
  summary.rod.textContent = `Tringle : ${getRodWidthCm()} cm`;
  summary.left.textContent = `Débord gauche : ${state.rodLeftOverflow} cm`;
  summary.right.textContent = `Débord droit : ${state.rodRightOverflow} cm`;
  summary.top.textContent = `Hauteur au-dessus de la fenêtre : ${state.rodTopOffset} cm`;
  summary.supportLeft.textContent = `Extrémité gauche → fixation gauche : ${state.supportLeftInset} cm`;
  summary.supportRight.textContent = `Extrémité droite → fixation droite : ${state.supportRightInset} cm`;
  summary.supportArm.textContent = `Distance tige → fixation FG/FD : ${state.supportArmLength} cm`;
  summary.betweenSupports.textContent = `Distance entre fixations : ${getSupportSpanCm()} cm`;
  summary.crop.textContent = `Recadrage image : G ${imageState.cropLeft}px, D ${imageState.cropRight}px, H ${imageState.cropTop}px, B ${imageState.cropBottom}px`;
  summary.clipMode.textContent = `Débordement image autorisé : ${inputs.clipImageToWindow.checked ? "non" : "oui"}`;
}

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

  const innerBox = getWindowInnerBox();

  windowGlass.x(innerBox.x);
  windowGlass.y(innerBox.y);
  windowGlass.width(innerBox.width);
  windowGlass.height(innerBox.height);

  windowHighlight.x(16);
  windowHighlight.y(16);
  windowHighlight.width(Math.max(10, (windowWidthPx - 40) * 0.34));
  windowHighlight.height(Math.max(20, windowHeightPx - 32));

  windowBottomShade.x(innerBox.x);
  windowBottomShade.y(Math.max(innerBox.y, windowHeightPx - 70));
  windowBottomShade.width(innerBox.width);
  windowBottomShade.height(60);

  applyImageClip();
  if (userImageNode) {
    clampImageInsideWindow();
  }
  bringWindowOverlayToFront();

  windowLabel.text(`Fenêtre ${state.windowWidth} × ${state.windowHeight} cm`);
  windowWidthLine.points([0, windowHeightPx + 38, windowWidthPx, windowHeightPx + 38]);
  windowWidthLeftMarker.points([0, windowHeightPx + 28, 0, windowHeightPx + 48]);
  windowWidthRightMarker.points([windowWidthPx, windowHeightPx + 28, windowWidthPx, windowHeightPx + 48]);

  windowWidthText.text(`${state.windowWidth} cm`);
  windowWidthText.x(windowWidthPx / 2 - 30);
  windowWidthText.y(windowHeightPx + 48);

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

  const verticalMeasureX = leftSupportX - 38;
  supportArmMeasureLine.points([verticalMeasureX, 0, verticalMeasureX, supportBottomY]);
  supportArmMeasureMarkerA.points([verticalMeasureX - 8, 0, verticalMeasureX + 8, 0]);
  supportArmMeasureMarkerB.points([verticalMeasureX - 8, supportBottomY, verticalMeasureX + 8, supportBottomY]);
  supportArmMeasureText.text(`${state.supportArmLength} cm`);
  supportArmMeasureText.x(verticalMeasureX - 20);
  supportArmMeasureText.y(supportBottomY / 2 - 8);

  leftHandle.position({ x: rodX, y: rodY });
  rightHandle.position({ x: rodX + rodWidthPx, y: rodY });
  supportLeftHandle.position({ x: rodX + leftSupportX, y: rodY + supportBottomY });
  supportRightHandle.position({ x: rodX + rightSupportX, y: rodY + supportBottomY });

  if (userImageNode && imageTransformer.nodes().length > 0) {
    imageTransformer.forceUpdate();
  }

  updateSummary();
  layer.draw();

  if (threeState.initialized) {
    sync3DFromState();
  }
}

// ------------------------------
// 3D THREE.JS
// ------------------------------
const threeState = {
  initialized: false,
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  frameMesh: null,
  glassMesh: null,
  rodMesh: null,
  rodLeftCapMesh: null,
  rodRightCapMesh: null,
  supportLeftStem: null,
  supportRightStem: null,
  supportLeftFoot: null,
  supportRightFoot: null,
  wallMesh: null,
  floorMesh: null,
  photoPlane: null,
  animationId: null
};

function ensure3DInitialized() {
  if (threeState.initialized) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf3f6fb);

  const camera = new THREE.PerspectiveCamera(
    45,
    Math.max(1, threeContainer.clientWidth) / Math.max(1, threeContainer.clientHeight),
    0.1,
    2000
  );
  camera.position.set(0, 90, 250);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(Math.max(1, threeContainer.clientWidth), Math.max(1, threeContainer.clientHeight));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  threeContainer.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.target.set(0, 40, 0);
  controls.minDistance = 80;
  controls.maxDistance = 700;

  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);

  const dir1 = new THREE.DirectionalLight(0xffffff, 1.15);
  dir1.position.set(140, 180, 120);
  dir1.castShadow = true;
  dir1.shadow.mapSize.width = 2048;
  dir1.shadow.mapSize.height = 2048;
  dir1.shadow.camera.near = 0.5;
  dir1.shadow.camera.far = 1000;
  scene.add(dir1);

  const dir2 = new THREE.DirectionalLight(0xffffff, 0.45);
  dir2.position.set(-100, 100, 80);
  scene.add(dir2);

  const wallGeo = new THREE.BoxGeometry(260, 220, 8);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.92,
    metalness: 0.02
  });
  const wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.receiveShadow = true;
  wallMesh.position.set(0, 45, -10);
  scene.add(wallMesh);

  const floorGeo = new THREE.PlaneGeometry(500, 500);
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.18 });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = -70;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  const frameMesh = new THREE.Mesh(
    new THREE.BoxGeometry(100, 100, 10),
    new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.55,
      metalness: 0.22
    })
  );
  frameMesh.castShadow = true;
  frameMesh.receiveShadow = true;
  scene.add(frameMesh);

  const glassMesh = new THREE.Mesh(
    new THREE.BoxGeometry(88, 88, 2),
    new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      transmission: 0.72,
      transparent: true,
      opacity: 0.62,
      roughness: 0.08,
      metalness: 0.0,
      thickness: 0.6
    })
  );
  glassMesh.position.z = 4;
  scene.add(glassMesh);

  const rodMat = new THREE.MeshStandardMaterial({
    color: 0x7c3aed,
    metalness: 0.95,
    roughness: 0.18
  });

  const rodMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.2, 120, 40),
    rodMat
  );
  rodMesh.rotation.z = Math.PI / 2;
  rodMesh.castShadow = true;
  scene.add(rodMesh);

  const capMat = new THREE.MeshStandardMaterial({
    color: 0x5b21b6,
    metalness: 0.95,
    roughness: 0.2
  });

  const rodLeftCapMesh = new THREE.Mesh(
    new THREE.SphereGeometry(4.2, 24, 24),
    capMat
  );
  const rodRightCapMesh = new THREE.Mesh(
    new THREE.SphereGeometry(4.2, 24, 24),
    capMat
  );
  rodLeftCapMesh.castShadow = true;
  rodRightCapMesh.castShadow = true;
  scene.add(rodLeftCapMesh);
  scene.add(rodRightCapMesh);

  const supportMat = new THREE.MeshStandardMaterial({
    color: 0x4b5563,
    metalness: 0.8,
    roughness: 0.35
  });

  const supportLeftStem = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 20, 24),
    supportMat
  );
  const supportRightStem = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 20, 24),
    supportMat
  );
  supportLeftStem.rotation.x = Math.PI / 2;
  supportRightStem.rotation.x = Math.PI / 2;
  supportLeftStem.castShadow = true;
  supportRightStem.castShadow = true;
  scene.add(supportLeftStem);
  scene.add(supportRightStem);

  const supportLeftFoot = new THREE.Mesh(
    new THREE.BoxGeometry(10, 1.8, 10),
    supportMat
  );
  const supportRightFoot = new THREE.Mesh(
    new THREE.BoxGeometry(10, 1.8, 10),
    supportMat
  );
  supportLeftFoot.castShadow = true;
  supportRightFoot.castShadow = true;
  scene.add(supportLeftFoot);
  scene.add(supportRightFoot);

  const photoPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(84, 84),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0
    })
  );
  photoPlane.position.z = 5.2;
  scene.add(photoPlane);

  threeState.scene = scene;
  threeState.camera = camera;
  threeState.renderer = renderer;
  threeState.controls = controls;
  threeState.frameMesh = frameMesh;
  threeState.glassMesh = glassMesh;
  threeState.rodMesh = rodMesh;
  threeState.rodLeftCapMesh = rodLeftCapMesh;
  threeState.rodRightCapMesh = rodRightCapMesh;
  threeState.supportLeftStem = supportLeftStem;
  threeState.supportRightStem = supportRightStem;
  threeState.supportLeftFoot = supportLeftFoot;
  threeState.supportRightFoot = supportRightFoot;
  threeState.wallMesh = wallMesh;
  threeState.floorMesh = floorMesh;
  threeState.photoPlane = photoPlane;
  threeState.initialized = true;

  reset3DCamera();
  sync3DFromState();
  animate3D();
}

function reset3DCamera() {
  if (!threeState.initialized) return;
  threeState.camera.position.set(0, 90, 250);
  threeState.controls.target.set(0, 35, 0);
  threeState.controls.update();
}

function resize3DRenderer() {
  if (!threeState.initialized) return;
  const width = Math.max(1, threeContainer.clientWidth);
  const height = Math.max(1, threeContainer.clientHeight);
  threeState.camera.aspect = width / height;
  threeState.camera.updateProjectionMatrix();
  threeState.renderer.setSize(width, height);
}

function set3DPhotoTexture() {
  if (!threeState.initialized) return;

  const plane = threeState.photoPlane;

  if (!loadedImageElement) {
    if (plane.material.map) {
      plane.material.map.dispose();
      plane.material.map = null;
    }
    plane.material.opacity = 0;
    plane.material.needsUpdate = true;
    return;
  }

  const texture = new THREE.Texture(loadedImageElement);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;

  if (imageState.sourceWidth > 0 && imageState.sourceHeight > 0) {
    const cL = imageState.cropLeft;
    const cT = imageState.cropTop;
    const cW = Math.max(1, imageState.sourceWidth - imageState.cropLeft - imageState.cropRight);
    const cH = Math.max(1, imageState.sourceHeight - imageState.cropTop - imageState.cropBottom);
    texture.repeat.set(cW / imageState.sourceWidth, cH / imageState.sourceHeight);
    texture.offset.set(cL / imageState.sourceWidth, 1 - (cT + cH) / imageState.sourceHeight);
  }

  if (plane.material.map) {
    plane.material.map.dispose();
  }

  plane.material.map = texture;
  plane.material.opacity = 0.9;
  plane.material.transparent = true;
  plane.material.needsUpdate = true;
}

function sync3DFromState() {
  if (!threeState.initialized) return;

  const {
    frameMesh,
    glassMesh,
    rodMesh,
    rodLeftCapMesh,
    rodRightCapMesh,
    supportLeftStem,
    supportRightStem,
    supportLeftFoot,
    supportRightFoot,
    wallMesh,
    photoPlane
  } = threeState;

  const w = state.windowWidth;
  const h = state.windowHeight;
  const rodLength = getRodWidthCm();
  const rodY = h / 2 + state.rodTopOffset;
  const leftX = -rodLength / 2 + state.supportLeftInset;
  const rightX = rodLength / 2 - state.supportRightInset;
  const armDepth = Math.max(4, state.supportArmLength);

  wallMesh.scale.set(Math.max(1.2, w / 95), Math.max(1.1, h / 95), 1);

  frameMesh.scale.set(w / 100, h / 100, 1);
  frameMesh.position.set(0, 0, 0);

  glassMesh.scale.set((w - 12) / 88, (h - 12) / 88, 1);
  glassMesh.position.set(0, 0, 4);

  if (userImageNode) {
    const box = getWindowInnerBox();
    const winInnerW = box.width;
    const winInnerH = box.height;

    const imgScaledW = userImageNode.width() * userImageNode.scaleX();
    const imgScaledH = userImageNode.height() * userImageNode.scaleY();

    const imgRelX = userImageNode.x() - box.x;
    const imgRelY = userImageNode.y() - box.y;

    const winW3D = w - 16;
    const winH3D = h - 16;

    const scaleRatioX = winW3D / winInnerW;
    const scaleRatioY = winH3D / winInnerH;

    const planeW = imgScaledW * scaleRatioX;
    const planeH = imgScaledH * scaleRatioY;

    const offsetX3D = (imgRelX + imgScaledW / 2 - winInnerW / 2) * scaleRatioX;
    const offsetY3D = -(imgRelY + imgScaledH / 2 - winInnerH / 2) * scaleRatioY;

    photoPlane.geometry.dispose();
    photoPlane.geometry = new THREE.PlaneGeometry(planeW, planeH);
    photoPlane.position.set(offsetX3D, offsetY3D, 5.2);
  } else {
    photoPlane.geometry.dispose();
    photoPlane.geometry = new THREE.PlaneGeometry(w - 16, h - 16);
    photoPlane.position.set(0, 0, 5.2);
  }

  rodMesh.scale.set(1, Math.max(0.1, rodLength / 120), 1);
  rodMesh.position.set(0, rodY, armDepth);

  rodLeftCapMesh.position.set(-rodLength / 2, rodY, armDepth);
  rodRightCapMesh.position.set(rodLength / 2, rodY, armDepth);

  supportLeftStem.scale.set(1, Math.max(0.12, armDepth / 20), 1);
  supportRightStem.scale.set(1, Math.max(0.12, armDepth / 20), 1);

  supportLeftStem.position.set(leftX, rodY, armDepth / 2);
  supportRightStem.position.set(rightX, rodY, armDepth / 2);

  supportLeftFoot.position.set(leftX, rodY, 0);
  supportRightFoot.position.set(rightX, rodY, 0);

  set3DPhotoTexture();
}

function animate3D() {
  if (!threeState.initialized) return;

  const renderLoop = () => {
    threeState.animationId = requestAnimationFrame(renderLoop);
    threeState.controls.update();
    threeState.renderer.render(threeState.scene, threeState.camera);
  };

  renderLoop();
}

function open3DModal() {
  modal3D.classList.add("is-open");
  modal3D.setAttribute("aria-hidden", "false");
  ensure3DInitialized();
  resize3DRenderer();
  sync3DFromState();
}

function close3DModal() {
  modal3D.classList.remove("is-open");
  modal3D.setAttribute("aria-hidden", "true");
}

function export3DPNG() {
  if (!threeState.initialized) return;
  threeState.renderer.render(threeState.scene, threeState.camera);
  const dataURL = threeState.renderer.domElement.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "visualisation-3d-tringle.png";
  link.click();
}

// ------------------------------
// SYNC INPUTS
// ------------------------------
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

[
  inputs.windowWidth,
  inputs.windowHeight,
  inputs.rodLeftOverflow,
  inputs.rodRightOverflow,
  inputs.rodTopOffset,
  inputs.supportLeftInset,
  inputs.supportRightInset,
  inputs.supportArmLength,
  inputs.scalePxPerCm
].forEach((input) => {
  input.addEventListener("input", () => {
    readInputs();
    syncInputs();
    draw();
  });
});

[inputs.cropLeft, inputs.cropRight, inputs.cropTop, inputs.cropBottom].forEach((input) => {
  input.addEventListener("input", () => {
    if (!userImageNode) return;
    applyCropToImage();
    fitImageToWindow();
    draw();
  });
});

inputs.resetCropBtn.addEventListener("click", () => {
  resetCrop();
});

inputs.clipImageToWindow.addEventListener("change", () => {
  applyImageClip();

  if (inputs.clipImageToWindow.checked) {
    clampImageInsideWindow();
  }

  draw();
});

inputs.imageUpload.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    const img = new Image();

    img.onload = () => {
      if (userImageNode) {
        imageTransformer.nodes([]);
        userImageNode.destroy();
        userImageNode = null;
      }

      loadedImageElement = img;

      imageState.sourceWidth = img.width;
      imageState.sourceHeight = img.height;
      imageState.cropLeft = 0;
      imageState.cropRight = 0;
      imageState.cropTop = 0;
      imageState.cropBottom = 0;

      inputs.cropLeft.value = 0;
      inputs.cropRight.value = 0;
      inputs.cropTop.value = 0;
      inputs.cropBottom.value = 0;

      userImageNode = new Konva.Image({
        image: img,
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
        draggable: true
      });

      imageClipGroup.add(userImageNode);
      applyCropToImage();

      userImageNode.on("click tap", () => {
        imageTransformer.nodes([userImageNode]);
        imageTransformer.visible(true);
        bringWindowOverlayToFront();
        layer.draw();
      });

      userImageNode.on("dragmove", () => {
        clampImageInsideWindow();
        bringWindowOverlayToFront();
        layer.draw();
      });

      userImageNode.on("transform", () => {
        clampImageInsideWindow();
        bringWindowOverlayToFront();
        layer.draw();
      });

      userImageNode.on("transformend", () => {
        const scaleX = userImageNode.scaleX();
        const scaleY = userImageNode.scaleY();

        userImageNode.width(Math.max(20, userImageNode.width() * scaleX));
        userImageNode.height(Math.max(20, userImageNode.height() * scaleY));
        userImageNode.scale({ x: 1, y: 1 });

        clampImageInsideWindow();
        imageTransformer.forceUpdate();
        bringWindowOverlayToFront();
        layer.draw();
      });

      fitImageToWindow();
      draw();
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

inputs.fitImageBtn.addEventListener("click", () => {
  fitImageToWindow();
});

inputs.resetImageBtn.addEventListener("click", () => {
  resetImageToCenter();
});

stage.on("wheel", (e) => {
  if (!userImageNode) return;
  if (imageTransformer.nodes().length === 0) return;

  e.evt.preventDefault();

  const oldScaleX = userImageNode.scaleX();
  const oldScaleY = userImageNode.scaleY();
  const scaleBy = 1.05;

  const pointer = stage.getPointerPosition();
  if (!pointer) return;

  const mousePointTo = {
    x: (pointer.x - windowGroup.x() - userImageNode.x()) / oldScaleX,
    y: (pointer.y - windowGroup.y() - userImageNode.y()) / oldScaleY
  };

  const direction = e.evt.deltaY > 0 ? -1 : 1;
  const newScale = direction > 0 ? oldScaleX * scaleBy : oldScaleX / scaleBy;

  userImageNode.scale({ x: newScale, y: newScale });

  userImageNode.position({
    x: pointer.x - windowGroup.x() - mousePointTo.x * newScale,
    y: pointer.y - windowGroup.y() - mousePointTo.y * newScale
  });

  clampImageInsideWindow();
  imageTransformer.forceUpdate();
  bringWindowOverlayToFront();
  layer.draw();
});

stage.on("click tap", (e) => {
  const clickedOnImage = userImageNode && e.target === userImageNode;

  if (!clickedOnImage && e.target !== imageTransformer) {
    imageTransformer.nodes([]);
    imageTransformer.visible(false);
    layer.draw();
  }
});

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

leftHandle.on("dragmove", function () {
  const pointerX = this.x();
  const maxLeft = windowX;
  const deltaPx = maxLeft - pointerX;
  state.rodLeftOverflow = Math.max(0, Math.round(deltaPx / state.scalePxPerCm));
  syncInputs();
  draw();
});

rightHandle.on("dragmove", function () {
  const pointerX = this.x();
  const windowRight = windowX + getWindowWidthPx();
  const deltaPx = pointerX - windowRight;
  state.rodRightOverflow = Math.max(0, Math.round(deltaPx / state.scalePxPerCm));
  syncInputs();
  draw();
});

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

// ------------------------------
// 3D EVENTS
// ------------------------------
inputs.open3DBtn.addEventListener("click", open3DModal);
inputs.close3DModalBtn.addEventListener("click", close3DModal);
inputs.reset3DViewBtn.addEventListener("click", reset3DCamera);
inputs.export3DBtn.addEventListener("click", export3DPNG);

modal3D.addEventListener("click", (e) => {
  if (e.target === modal3D) {
    close3DModal();
  }
});

window.addEventListener("resize", () => {
  resize3DRenderer();
});

// ------------------------------
// INIT
// ------------------------------
syncInputs();
applyImageClip();
draw();