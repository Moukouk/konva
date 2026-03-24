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
  supportArmLength: 8,
  obstacle1Enabled: false,
  obstacle1Width: 120,
  obstacle1Height: 15,
  obstacle1Depth: 15,
  obstacle1OffsetX: 0,
  obstacle1OffsetY: 0,
  obstacle2Enabled: false,
  obstacle2Width: 60,
  obstacle2Height: 10,
  obstacle2Depth: 10,
  obstacle2OffsetX: 0,
  obstacle2OffsetY: 0,
  windowThickness: 10
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
  removeImageBtn: document.getElementById("removeImageBtn"),
  cropLeft: document.getElementById("cropLeft"),
  cropRight: document.getElementById("cropRight"),
  cropTop: document.getElementById("cropTop"),
  cropBottom: document.getElementById("cropBottom"),
  resetCropBtn: document.getElementById("resetCropBtn"),
  toggleCropModeBtn: document.getElementById("toggleCropModeBtn"),
  clipImageToWindow: document.getElementById("clipImageToWindow"),
  open3DBtn: document.getElementById("open3DBtn"),
  close3DModalBtn: document.getElementById("close3DModalBtn"),
  export3DBtn: document.getElementById("export3DBtn"),
  reset3DViewBtn: document.getElementById("reset3DViewBtn"),
  obstacle1Width: document.getElementById("obstacle1Width"),
  obstacle1Height: document.getElementById("obstacle1Height"),
  obstacle1Depth: document.getElementById("obstacle1Depth"),
  obstacle2Width: document.getElementById("obstacle2Width"),
  obstacle2Height: document.getElementById("obstacle2Height"),
  obstacle2Depth: document.getElementById("obstacle2Depth"),
  addObstacleBtn: document.getElementById("addObstacleBtn"),
  removeObstacle1Btn: document.getElementById("removeObstacle1Btn"),
  removeObstacle2Btn: document.getElementById("removeObstacle2Btn"),
  windowThickness: document.getElementById("windowThickness")
};

const imageControlsSection = document.getElementById("imageControlsSection");
const obstacle1Section = document.getElementById("obstacle1Section");
const obstacle2Section = document.getElementById("obstacle2Section");
const obstacleAddSection = document.getElementById("obstacleAddSection");

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
const obstacle1Rect = new Konva.Rect({
  fill: "rgba(139, 92, 246, 0.35)",
  stroke: "#7c3aed",
  strokeWidth: 1.5,
  dash: [6, 3],
  visible: false,
  draggable: true
});

const obstacle1Label = new Konva.Text({
  fontSize: 12,
  fill: "#7c3aed",
  visible: false,
  listening: false
});

const obstacle2Rect = new Konva.Rect({
  fill: "rgba(236, 72, 153, 0.35)",
  stroke: "#db2777",
  strokeWidth: 1.5,
  dash: [6, 3],
  visible: false,
  draggable: true
});

const obstacle2Label = new Konva.Text({
  fontSize: 12,
  fill: "#db2777",
  visible: false,
  listening: false
});

windowGroup.add(windowWidthLine);
windowGroup.add(windowWidthLeftMarker);
windowGroup.add(windowWidthRightMarker);
windowGroup.add(windowWidthText);
windowGroup.add(obstacle1Rect);
windowGroup.add(obstacle1Label);
windowGroup.add(obstacle2Rect);
windowGroup.add(obstacle2Label);

layer.add(windowGroup);

const obstacleTransformer = new Konva.Transformer({
  rotateEnabled: false,
  keepRatio: false,
  enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right", "top-center", "bottom-center"],
  borderStroke: "#7c3aed",
  anchorFill: "#7c3aed",
  anchorStroke: "#ffffff",
  anchorStrokeWidth: 2,
  anchorSize: 9,
  visible: false
});
layer.add(obstacleTransformer);

function onObstacleDragMove(rect, labelNode, idx) {
  const lx = rect.x();
  const ly = rect.y();
  labelNode.x(lx + 4);
  labelNode.y(ly + 3);
}

obstacle1Rect.on("dragmove", function () {
  onObstacleDragMove(this, obstacle1Label, 1);
});

obstacle1Rect.on("dragend", function () {
  const winWPx = state.windowWidth * state.scalePxPerCm;
  const o1W = state.obstacle1Width * state.scalePxPerCm;
  const o1H = state.obstacle1Height * state.scalePxPerCm;
  const baseX = (winWPx - o1W) / 2;
  const baseY = -o1H;
  state.obstacle1OffsetX = Math.round((this.x() - baseX) / state.scalePxPerCm);
  state.obstacle1OffsetY = Math.round((this.y() - baseY) / state.scalePxPerCm);
  syncInputs();
  draw();
});

obstacle1Rect.on("transform", function () {
  const w = Math.max(4, this.width() * this.scaleX());
  const h = Math.max(4, this.height() * this.scaleY());
  this.scaleX(1);
  this.scaleY(1);
  this.width(w);
  this.height(h);
  obstacle1Label.x(this.x() + 4);
  obstacle1Label.y(this.y() + 3);
});

obstacle1Rect.on("transformend", function () {
  const w = Math.max(4, this.width() * this.scaleX());
  const h = Math.max(4, this.height() * this.scaleY());
  this.scaleX(1);
  this.scaleY(1);
  this.width(w);
  this.height(h);
  state.obstacle1Width = Math.max(1, Math.round(w / state.scalePxPerCm));
  state.obstacle1Height = Math.max(1, Math.round(h / state.scalePxPerCm));
  // Recalc offset based on new size
  const winWPx = state.windowWidth * state.scalePxPerCm;
  const o1W = state.obstacle1Width * state.scalePxPerCm;
  const o1H = state.obstacle1Height * state.scalePxPerCm;
  state.obstacle1OffsetX = Math.round((this.x() - (winWPx - o1W) / 2) / state.scalePxPerCm);
  state.obstacle1OffsetY = Math.round((this.y() - (-o1H)) / state.scalePxPerCm);
  syncInputs();
  draw();
});

obstacle1Rect.on("click tap", function () {
  obstacleTransformer.nodes([obstacle1Rect]);
  obstacleTransformer.visible(true);
  layer.draw();
});

obstacle2Rect.on("dragmove", function () {
  onObstacleDragMove(this, obstacle2Label, 2);
});

obstacle2Rect.on("dragend", function () {
  const winWPx = state.windowWidth * state.scalePxPerCm;
  const o2W = state.obstacle2Width * state.scalePxPerCm;
  const o2H = state.obstacle2Height * state.scalePxPerCm;
  const baseX = (winWPx - o2W) / 2;
  const baseY = -o2H;
  state.obstacle2OffsetX = Math.round((this.x() - baseX) / state.scalePxPerCm);
  state.obstacle2OffsetY = Math.round((this.y() - baseY) / state.scalePxPerCm);
  syncInputs();
  draw();
});

obstacle2Rect.on("transform", function () {
  const w = Math.max(4, this.width() * this.scaleX());
  const h = Math.max(4, this.height() * this.scaleY());
  this.scaleX(1);
  this.scaleY(1);
  this.width(w);
  this.height(h);
  obstacle2Label.x(this.x() + 4);
  obstacle2Label.y(this.y() + 3);
});

obstacle2Rect.on("transformend", function () {
  const w = Math.max(4, this.width() * this.scaleX());
  const h = Math.max(4, this.height() * this.scaleY());
  this.scaleX(1);
  this.scaleY(1);
  this.width(w);
  this.height(h);
  state.obstacle2Width = Math.max(1, Math.round(w / state.scalePxPerCm));
  state.obstacle2Height = Math.max(1, Math.round(h / state.scalePxPerCm));
  const winWPx = state.windowWidth * state.scalePxPerCm;
  const o2W = state.obstacle2Width * state.scalePxPerCm;
  const o2H = state.obstacle2Height * state.scalePxPerCm;
  state.obstacle2OffsetX = Math.round((this.x() - (winWPx - o2W) / 2) / state.scalePxPerCm);
  state.obstacle2OffsetY = Math.round((this.y() - (-o2H)) / state.scalePxPerCm);
  syncInputs();
  draw();
});

obstacle2Rect.on("click tap", function () {
  obstacleTransformer.nodes([obstacle2Rect]);
  obstacleTransformer.visible(true);
  layer.draw();
});

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

// crop overlay
let cropModeActive = false;

const cropOverlayGroup = new Konva.Group({ visible: false });

const cropDimTop = new Konva.Rect({ fill: "rgba(0,0,0,0.45)", listening: false });
const cropDimBottom = new Konva.Rect({ fill: "rgba(0,0,0,0.45)", listening: false });
const cropDimLeft = new Konva.Rect({ fill: "rgba(0,0,0,0.45)", listening: false });
const cropDimRight = new Konva.Rect({ fill: "rgba(0,0,0,0.45)", listening: false });

const cropRect = new Konva.Rect({
  stroke: "#ef4444",
  strokeWidth: 2,
  dash: [6, 4],
  listening: false
});

cropOverlayGroup.add(cropDimTop);
cropOverlayGroup.add(cropDimBottom);
cropOverlayGroup.add(cropDimLeft);
cropOverlayGroup.add(cropDimRight);
cropOverlayGroup.add(cropRect);

const cropHandleNames = ["tl", "tc", "tr", "ml", "mr", "bl", "bc", "br"];
const cropHandles = {};

cropHandleNames.forEach((name) => {
  const handle = new Konva.Rect({
    width: 10,
    height: 10,
    fill: "#ffffff",
    stroke: "#ef4444",
    strokeWidth: 1.5,
    cornerRadius: 2,
    draggable: true,
    name: name
  });
  cropHandles[name] = handle;
  cropOverlayGroup.add(handle);
});

windowGroup.add(cropOverlayGroup);

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

const fgWindowMeasureLine = new Konva.Line({ stroke: "#dc2626", strokeWidth: 1.5 });
const fgWindowMeasureMarkerA = new Konva.Line({ stroke: "#dc2626", strokeWidth: 1.5 });
const fgWindowMeasureMarkerB = new Konva.Line({ stroke: "#dc2626", strokeWidth: 1.5 });
const fgWindowMeasureText = new Konva.Text({ fontSize: 14, fill: "#dc2626" });

const fdWindowMeasureLine = new Konva.Line({ stroke: "#dc2626", strokeWidth: 1.5 });
const fdWindowMeasureMarkerA = new Konva.Line({ stroke: "#dc2626", strokeWidth: 1.5 });
const fdWindowMeasureMarkerB = new Konva.Line({ stroke: "#dc2626", strokeWidth: 1.5 });
const fdWindowMeasureText = new Konva.Text({ fontSize: 14, fill: "#dc2626" });

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
rodGroup.add(fgWindowMeasureLine);
rodGroup.add(fgWindowMeasureMarkerA);
rodGroup.add(fgWindowMeasureMarkerB);
rodGroup.add(fgWindowMeasureText);
rodGroup.add(fdWindowMeasureLine);
rodGroup.add(fdWindowMeasureMarkerA);
rodGroup.add(fdWindowMeasureMarkerB);
rodGroup.add(fdWindowMeasureText);

layer.add(rodGroup);

// poignées
const leftHandle = new Konva.Group({ draggable: true });
const leftHandleCircle = new Konva.Circle({ radius: 11, fill: "#ef4444", stroke: "#ffffff", strokeWidth: 2, hitStrokeWidth: 10 });
leftHandle.add(leftHandleCircle);
leftHandle.add(new Konva.Text({ x: -18, y: 14, text: "G", fontSize: 14, fontStyle: "bold", fill: "#111827" }));
layer.add(leftHandle);

const rightHandle = new Konva.Group({ draggable: true });
const rightHandleCircle = new Konva.Circle({ radius: 11, fill: "#ef4444", stroke: "#ffffff", strokeWidth: 2, hitStrokeWidth: 10 });
rightHandle.add(rightHandleCircle);
rightHandle.add(new Konva.Text({ x: -18, y: 14, text: "D", fontSize: 14, fontStyle: "bold", fill: "#111827" }));
layer.add(rightHandle);

// curseur et effets visuels G
leftHandle.on("mouseenter", function () {
  document.body.style.cursor = "ew-resize";
  leftHandleCircle.fill("#dc2626");
  leftHandleCircle.radius(13);
  layer.draw();
});
leftHandle.on("mouseleave", function () {
  document.body.style.cursor = "default";
  leftHandleCircle.fill("#ef4444");
  leftHandleCircle.radius(11);
  layer.draw();
});
// curseur et effets visuels D
rightHandle.on("mouseenter", function () {
  document.body.style.cursor = "ew-resize";
  rightHandleCircle.fill("#dc2626");
  rightHandleCircle.radius(13);
  layer.draw();
});
rightHandle.on("mouseleave", function () {
  document.body.style.cursor = "default";
  rightHandleCircle.fill("#ef4444");
  rightHandleCircle.radius(11);
  layer.draw();
});

const supportLeftHandle = new Konva.Group({ draggable: true });
const supportLeftCircle = new Konva.Circle({ radius: 11, fill: "#14b8a6", stroke: "#ffffff", strokeWidth: 2, hitStrokeWidth: 10 });
supportLeftHandle.add(supportLeftCircle);
supportLeftHandle.add(new Konva.Text({ x: -12, y: 14, text: "FG", fontSize: 12, fontStyle: "bold", fill: "#111827" }));
layer.add(supportLeftHandle);

const supportRightHandle = new Konva.Group({ draggable: true });
const supportRightCircle = new Konva.Circle({ radius: 11, fill: "#14b8a6", stroke: "#ffffff", strokeWidth: 2, hitStrokeWidth: 10 });
supportRightHandle.add(supportRightCircle);
supportRightHandle.add(new Konva.Text({ x: -12, y: 14, text: "FD", fontSize: 12, fontStyle: "bold", fill: "#111827" }));
layer.add(supportRightHandle);

// curseur et effets visuels FG
supportLeftHandle.on("mouseenter", function () {
  document.body.style.cursor = "move";
  supportLeftCircle.fill("#0d9488");
  supportLeftCircle.radius(13);
  layer.draw();
});
supportLeftHandle.on("mouseleave", function () {
  document.body.style.cursor = "default";
  supportLeftCircle.fill("#14b8a6");
  supportLeftCircle.radius(11);
  layer.draw();
});
// curseur et effets visuels FD
supportRightHandle.on("mouseenter", function () {
  document.body.style.cursor = "move";
  supportRightCircle.fill("#0d9488");
  supportRightCircle.radius(13);
  layer.draw();
});
supportRightHandle.on("mouseleave", function () {
  document.body.style.cursor = "default";
  supportRightCircle.fill("#14b8a6");
  supportRightCircle.radius(11);
  layer.draw();
});

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
  if (cropModeActive) updateCropOverlay();
}

// --- CROP MODE 2D ---
function enterCropMode() {
  if (!userImageNode || !loadedImageElement) return;
  cropModeActive = true;
  inputs.toggleCropModeBtn.textContent = "✔ Valider le recadrage";
  inputs.toggleCropModeBtn.style.background = "#ef4444";
  inputs.toggleCropModeBtn.style.color = "#fff";

  userImageNode.draggable(false);
  imageTransformer.nodes([]);
  imageTransformer.visible(false);

  showFullImageForCrop();
  updateCropOverlay();
  cropOverlayGroup.visible(true);
  cropOverlayGroup.moveToTop();
  layer.draw();
}

function exitCropMode() {
  cropModeActive = false;
  inputs.toggleCropModeBtn.textContent = "✂ Recadrer sur le schéma 2D";
  inputs.toggleCropModeBtn.style.background = "";
  inputs.toggleCropModeBtn.style.color = "";

  cropOverlayGroup.visible(false);

  applyCropToImage();
  userImageNode.draggable(true);
  fitImageToWindow();
  layer.draw();
}

function showFullImageForCrop() {
  if (!userImageNode) return;

  userImageNode.crop({ x: 0, y: 0, width: imageState.sourceWidth, height: imageState.sourceHeight });
  userImageNode.width(imageState.sourceWidth);
  userImageNode.height(imageState.sourceHeight);

  const box = getWindowInnerBox();
  const scaleX = box.width / imageState.sourceWidth;
  const scaleY = box.height / imageState.sourceHeight;
  const scale = Math.min(scaleX, scaleY);

  userImageNode.scale({ x: scale, y: scale });

  const scaledW = imageState.sourceWidth * scale;
  const scaledH = imageState.sourceHeight * scale;

  userImageNode.position({
    x: box.x + (box.width - scaledW) / 2,
    y: box.y + (box.height - scaledH) / 2
  });

  layer.draw();
}

function getCropOverlayCoords() {
  if (!userImageNode) return null;

  const imgX = userImageNode.x();
  const imgY = userImageNode.y();
  const scale = userImageNode.scaleX();

  const fullW = imageState.sourceWidth * scale;
  const fullH = imageState.sourceHeight * scale;

  const cL = imageState.cropLeft * scale;
  const cR = imageState.cropRight * scale;
  const cT = imageState.cropTop * scale;
  const cB = imageState.cropBottom * scale;

  return {
    imgX, imgY, fullW, fullH, scale,
    cropX: imgX + cL,
    cropY: imgY + cT,
    cropW: fullW - cL - cR,
    cropH: fullH - cT - cB
  };
}

function updateCropOverlay() {
  const c = getCropOverlayCoords();
  if (!c) return;

  cropRect.x(c.cropX);
  cropRect.y(c.cropY);
  cropRect.width(c.cropW);
  cropRect.height(c.cropH);

  cropDimTop.x(c.imgX); cropDimTop.y(c.imgY);
  cropDimTop.width(c.fullW); cropDimTop.height(c.cropY - c.imgY);

  cropDimBottom.x(c.imgX); cropDimBottom.y(c.cropY + c.cropH);
  cropDimBottom.width(c.fullW); cropDimBottom.height(c.imgY + c.fullH - (c.cropY + c.cropH));

  cropDimLeft.x(c.imgX); cropDimLeft.y(c.cropY);
  cropDimLeft.width(c.cropX - c.imgX); cropDimLeft.height(c.cropH);

  cropDimRight.x(c.cropX + c.cropW); cropDimRight.y(c.cropY);
  cropDimRight.width(c.imgX + c.fullW - (c.cropX + c.cropW)); cropDimRight.height(c.cropH);

  const hs = 5;
  cropHandles.tl.position({ x: c.cropX - hs, y: c.cropY - hs });
  cropHandles.tc.position({ x: c.cropX + c.cropW / 2 - hs, y: c.cropY - hs });
  cropHandles.tr.position({ x: c.cropX + c.cropW - hs, y: c.cropY - hs });
  cropHandles.ml.position({ x: c.cropX - hs, y: c.cropY + c.cropH / 2 - hs });
  cropHandles.mr.position({ x: c.cropX + c.cropW - hs, y: c.cropY + c.cropH / 2 - hs });
  cropHandles.bl.position({ x: c.cropX - hs, y: c.cropY + c.cropH - hs });
  cropHandles.bc.position({ x: c.cropX + c.cropW / 2 - hs, y: c.cropY + c.cropH - hs });
  cropHandles.br.position({ x: c.cropX + c.cropW - hs, y: c.cropY + c.cropH - hs });

  layer.draw();
}

function onCropHandleDrag(handleName) {
  const c = getCropOverlayCoords();
  if (!c) return;

  const handle = cropHandles[handleName];
  const hs = 5;
  const hx = handle.x() + hs;
  const hy = handle.y() + hs;

  const minSize = 4;

  let newCropL = imageState.cropLeft;
  let newCropR = imageState.cropRight;
  let newCropT = imageState.cropTop;
  let newCropB = imageState.cropBottom;

  if (handleName === "tl" || handleName === "ml" || handleName === "bl") {
    const px = Math.max(c.imgX, Math.min(hx, c.imgX + c.fullW - minSize));
    newCropL = Math.round((px - c.imgX) / c.scale);
  }
  if (handleName === "tr" || handleName === "mr" || handleName === "br") {
    const px = Math.max(c.imgX + minSize, Math.min(hx, c.imgX + c.fullW));
    newCropR = Math.round((c.imgX + c.fullW - px) / c.scale);
  }
  if (handleName === "tl" || handleName === "tc" || handleName === "tr") {
    const py = Math.max(c.imgY, Math.min(hy, c.imgY + c.fullH - minSize));
    newCropT = Math.round((py - c.imgY) / c.scale);
  }
  if (handleName === "bl" || handleName === "bc" || handleName === "br") {
    const py = Math.max(c.imgY + minSize, Math.min(hy, c.imgY + c.fullH));
    newCropB = Math.round((c.imgY + c.fullH - py) / c.scale);
  }

  newCropL = Math.max(0, Math.min(newCropL, imageState.sourceWidth - minSize - newCropR));
  newCropR = Math.max(0, Math.min(newCropR, imageState.sourceWidth - minSize - newCropL));
  newCropT = Math.max(0, Math.min(newCropT, imageState.sourceHeight - minSize - newCropB));
  newCropB = Math.max(0, Math.min(newCropB, imageState.sourceHeight - minSize - newCropT));

  imageState.cropLeft = newCropL;
  imageState.cropRight = newCropR;
  imageState.cropTop = newCropT;
  imageState.cropBottom = newCropB;

  inputs.cropLeft.value = newCropL;
  inputs.cropRight.value = newCropR;
  inputs.cropTop.value = newCropT;
  inputs.cropBottom.value = newCropB;

  updateCropOverlay();
}

cropHandleNames.forEach((name) => {
  cropHandles[name].on("dragmove", () => onCropHandleDrag(name));
});

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

  // Obstacles 2D
  const winWPx = windowWidthPx;
  if (state.obstacle1Enabled) {
    const o1W = state.obstacle1Width * state.scalePxPerCm;
    const o1H = state.obstacle1Height * state.scalePxPerCm;
    const o1Ox = state.obstacle1OffsetX * state.scalePxPerCm;
    const o1Oy = state.obstacle1OffsetY * state.scalePxPerCm;
    const o1X = (winWPx - o1W) / 2 + o1Ox;
    const o1Y = -o1H + o1Oy;
    obstacle1Rect.x(o1X);
    obstacle1Rect.y(o1Y);
    obstacle1Rect.width(o1W);
    obstacle1Rect.height(o1H);
    obstacle1Rect.scaleX(1);
    obstacle1Rect.scaleY(1);
    obstacle1Rect.visible(true);
    obstacle1Label.text(`Obs.1 ${state.obstacle1Width}×${state.obstacle1Height}`);
    obstacle1Label.x(o1X + 4);
    obstacle1Label.y(o1Y + 3);
    obstacle1Label.visible(true);
  } else {
    obstacle1Rect.visible(false);
    obstacle1Label.visible(false);
    if (obstacleTransformer.nodes().indexOf(obstacle1Rect) >= 0) {
      obstacleTransformer.nodes([]);
      obstacleTransformer.visible(false);
    }
  }

  if (state.obstacle2Enabled) {
    const o2W = state.obstacle2Width * state.scalePxPerCm;
    const o2H = state.obstacle2Height * state.scalePxPerCm;
    const o2Ox = state.obstacle2OffsetX * state.scalePxPerCm;
    const o2Oy = state.obstacle2OffsetY * state.scalePxPerCm;
    const o2X = (winWPx - o2W) / 2 + o2Ox;
    const o2Y = -o2H + o2Oy;
    obstacle2Rect.x(o2X);
    obstacle2Rect.y(o2Y);
    obstacle2Rect.width(o2W);
    obstacle2Rect.height(o2H);
    obstacle2Rect.scaleX(1);
    obstacle2Rect.scaleY(1);
    obstacle2Rect.visible(true);
    obstacle2Label.text(`Obs.2 ${state.obstacle2Width}×${state.obstacle2Height}`);
    obstacle2Label.x(o2X + 4);
    obstacle2Label.y(o2Y + 3);
    obstacle2Label.visible(true);
  } else {
    obstacle2Rect.visible(false);
    obstacle2Label.visible(false);
    if (obstacleTransformer.nodes().indexOf(obstacle2Rect) >= 0) {
      obstacleTransformer.nodes([]);
      obstacleTransformer.visible(false);
    }
  }

  if (obstacleTransformer.nodes().length > 0) {
    obstacleTransformer.forceUpdate();
  }

  // Distance FG -> bord gauche fenêtre / FD -> bord droit fenêtre
  const winLeftInRod = state.rodLeftOverflow * state.scalePxPerCm;
  const winRightInRod = winLeftInRod + windowWidthPx;
  const fgToWinLeftCm = Math.round(state.supportLeftInset - state.rodLeftOverflow);
  const fdToWinRightCm = Math.round(state.supportRightInset - state.rodRightOverflow);
  const measureY2 = 170;

  fgWindowMeasureLine.points([winLeftInRod, measureY2, leftSupportX, measureY2]);
  fgWindowMeasureMarkerA.points([winLeftInRod, measureY2 - 8, winLeftInRod, measureY2 + 8]);
  fgWindowMeasureMarkerB.points([leftSupportX, measureY2 - 8, leftSupportX, measureY2 + 8]);
  fgWindowMeasureText.text(`${fgToWinLeftCm} cm`);
  fgWindowMeasureText.x(winLeftInRod + (leftSupportX - winLeftInRod) / 2 - 20);
  fgWindowMeasureText.y(measureY2 + 8);

  fdWindowMeasureLine.points([rightSupportX, measureY2, winRightInRod, measureY2]);
  fdWindowMeasureMarkerA.points([rightSupportX, measureY2 - 8, rightSupportX, measureY2 + 8]);
  fdWindowMeasureMarkerB.points([winRightInRod, measureY2 - 8, winRightInRod, measureY2 + 8]);
  fdWindowMeasureText.text(`${fdToWinRightCm} cm`);
  fdWindowMeasureText.x(rightSupportX + (winRightInRod - rightSupportX) / 2 - 20);
  fdWindowMeasureText.y(measureY2 + 8);

  leftHandle.position({ x: rodX, y: rodY });
  leftHandle._fixedY = rodY;
  rightHandle.position({ x: rodX + rodWidthPx, y: rodY });
  rightHandle._fixedY = rodY;
  supportLeftHandle.position({ x: rodX + leftSupportX, y: rodY + supportBottomY });
  supportLeftHandle._rodY = rodY;
  supportRightHandle.position({ x: rodX + rightSupportX, y: rodY + supportBottomY });
  supportRightHandle._rodY = rodY;

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
  obstacle1Mesh: null,
  obstacle2Mesh: null,
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
    new THREE.CylinderGeometry(5, 5, 1.8, 32),
    supportMat
  );
  const supportRightFoot = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 1.8, 32),
    supportMat
  );
  supportLeftFoot.rotation.x = Math.PI / 2;
  supportRightFoot.rotation.x = Math.PI / 2;
  supportLeftFoot.castShadow = true;
  supportRightFoot.castShadow = true;
  scene.add(supportLeftFoot);
  scene.add(supportRightFoot);

  const photoPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(84, 84),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    })
  );
  photoPlane.position.z = 12.5;
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
  const obstacleMat1 = new THREE.MeshStandardMaterial({
    color: 0x7c3aed,
    roughness: 0.6,
    metalness: 0.15,
    transparent: true,
    opacity: 0.75
  });
  const obstacle1Mesh = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    obstacleMat1
  );
  obstacle1Mesh.castShadow = true;
  obstacle1Mesh.visible = false;
  scene.add(obstacle1Mesh);

  const obstacleMat2 = new THREE.MeshStandardMaterial({
    color: 0xdb2777,
    roughness: 0.6,
    metalness: 0.15,
    transparent: true,
    opacity: 0.75
  });
  const obstacle2Mesh = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    obstacleMat2
  );
  obstacle2Mesh.castShadow = true;
  obstacle2Mesh.visible = false;
  scene.add(obstacle2Mesh);

  threeState.photoPlane = photoPlane;
  threeState.obstacle1Mesh = obstacle1Mesh;
  threeState.obstacle2Mesh = obstacle2Mesh;
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
  const armDepth = Math.max(4, state.supportArmLength);

  // Rod center offset: in 2D the window is fixed and the rod extends
  // asymmetrically. rodLeftOverflow extends left, rodRightOverflow extends right.
  // To keep the window at x=0 in 3D, offset the rod center:
  const rodCenterX = (state.rodRightOverflow - state.rodLeftOverflow) / 2;
  const rodLeftEnd = rodCenterX - rodLength / 2;
  const rodRightEnd = rodCenterX + rodLength / 2;

  const leftX = rodLeftEnd + state.supportLeftInset;
  const rightX = rodRightEnd - state.supportRightInset;

  wallMesh.scale.set(Math.max(1.2, w / 95), Math.max(1.1, h / 95), 1);

  const thick = state.windowThickness;

  frameMesh.scale.set(w / 100, h / 100, thick / 10);
  frameMesh.position.set(0, 0, thick / 2);

  glassMesh.scale.set((w - 12) / 88, (h - 12) / 88, 1);
  glassMesh.position.set(0, 0, thick + 1);

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
    photoPlane.position.set(offsetX3D, offsetY3D, thick + 2.5);
  } else {
    photoPlane.geometry.dispose();
    photoPlane.geometry = new THREE.PlaneGeometry(w - 16, h - 16);
    photoPlane.position.set(0, 0, thick + 2.5);
  }

  rodMesh.scale.set(1, Math.max(0.1, rodLength / 120), 1);
  rodMesh.position.set(rodCenterX, rodY, armDepth);

  rodLeftCapMesh.position.set(rodLeftEnd, rodY, armDepth);
  rodRightCapMesh.position.set(rodRightEnd, rodY, armDepth);

  supportLeftStem.scale.set(1, Math.max(0.12, armDepth / 20), 1);
  supportRightStem.scale.set(1, Math.max(0.12, armDepth / 20), 1);

  supportLeftStem.position.set(leftX, rodY, armDepth / 2);
  supportRightStem.position.set(rightX, rodY, armDepth / 2);

  supportLeftFoot.position.set(leftX, rodY, 0);
  supportRightFoot.position.set(rightX, rodY, 0);

  // Obstacles 3D
  const { obstacle1Mesh, obstacle2Mesh } = threeState;
  if (state.obstacle1Enabled) {
    const o1W = state.obstacle1Width;
    const o1H = state.obstacle1Height;
    const o1D = state.obstacle1Depth;
    const o1Ox = state.obstacle1OffsetX;
    const o1Oy = state.obstacle1OffsetY;
    obstacle1Mesh.geometry.dispose();
    obstacle1Mesh.geometry = new THREE.BoxGeometry(o1W, o1H, o1D);
    obstacle1Mesh.position.set(o1Ox, h / 2 + o1H / 2 - o1Oy, o1D / 2);
    obstacle1Mesh.visible = true;
  } else {
    obstacle1Mesh.visible = false;
  }

  if (state.obstacle2Enabled) {
    const o2W = state.obstacle2Width;
    const o2H = state.obstacle2Height;
    const o2D = state.obstacle2Depth;
    const o2Ox = state.obstacle2OffsetX;
    const o2Oy = state.obstacle2OffsetY;
    obstacle2Mesh.geometry.dispose();
    obstacle2Mesh.geometry = new THREE.BoxGeometry(o2W, o2H, o2D);
    obstacle2Mesh.position.set(o2Ox, h / 2 + o2H / 2 - o2Oy, o2D / 2);
    obstacle2Mesh.visible = true;
  } else {
    obstacle2Mesh.visible = false;
  }

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
  inputs.obstacle1Width.value = state.obstacle1Width;
  inputs.obstacle1Height.value = state.obstacle1Height;
  inputs.obstacle1Depth.value = state.obstacle1Depth;
  inputs.obstacle2Width.value = state.obstacle2Width;
  inputs.obstacle2Height.value = state.obstacle2Height;
  inputs.obstacle2Depth.value = state.obstacle2Depth;
  inputs.windowThickness.value = state.windowThickness;
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
  state.obstacle1Width = Math.max(1, Number(inputs.obstacle1Width.value) || 1);
  state.obstacle1Height = Math.max(1, Number(inputs.obstacle1Height.value) || 1);
  state.obstacle1Depth = Math.max(1, Number(inputs.obstacle1Depth.value) || 1);
  state.obstacle2Width = Math.max(1, Number(inputs.obstacle2Width.value) || 1);
  state.obstacle2Height = Math.max(1, Number(inputs.obstacle2Height.value) || 1);
  state.obstacle2Depth = Math.max(1, Number(inputs.obstacle2Depth.value) || 1);
  state.windowThickness = Math.max(1, Number(inputs.windowThickness.value) || 1);
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
  inputs.scalePxPerCm,
  inputs.windowThickness
].forEach((input) => {
  input.addEventListener("input", () => {
    readInputs();
    syncInputs();
    draw();
  });
});

[
  inputs.obstacle1Width,
  inputs.obstacle1Height,
  inputs.obstacle1Depth,
  inputs.obstacle2Width,
  inputs.obstacle2Height,
  inputs.obstacle2Depth
].forEach((input) => {
  input.addEventListener("input", () => {
    readInputs();
    draw();
  });
});

function updateObstacleUI() {
  const has1 = state.obstacle1Enabled;
  const has2 = state.obstacle2Enabled;
  obstacle1Section.style.display = has1 ? "" : "none";
  obstacle2Section.style.display = has2 ? "" : "none";
  // Show add button only if we can still add (max 2)
  obstacleAddSection.style.display = (has1 && has2) ? "none" : "";
}

inputs.addObstacleBtn.addEventListener("click", () => {
  if (!state.obstacle1Enabled) {
    state.obstacle1Enabled = true;
  } else if (!state.obstacle2Enabled) {
    state.obstacle2Enabled = true;
  }
  updateObstacleUI();
  readInputs();
  draw();
});

inputs.removeObstacle1Btn.addEventListener("click", () => {
  state.obstacle1Enabled = false;
  state.obstacle1OffsetX = 0;
  state.obstacle1OffsetY = 0;
  // If obstacle2 was active, shift it to slot 1
  if (state.obstacle2Enabled) {
    state.obstacle1Enabled = true;
    state.obstacle1Width = state.obstacle2Width;
    state.obstacle1Height = state.obstacle2Height;
    state.obstacle1Depth = state.obstacle2Depth;
    state.obstacle1OffsetX = state.obstacle2OffsetX;
    state.obstacle1OffsetY = state.obstacle2OffsetY;
    state.obstacle2Enabled = false;
    state.obstacle2Width = 60;
    state.obstacle2Height = 10;
    state.obstacle2Depth = 10;
    state.obstacle2OffsetX = 0;
    state.obstacle2OffsetY = 0;
    syncInputs();
  }
  updateObstacleUI();
  readInputs();
  draw();
});

inputs.removeObstacle2Btn.addEventListener("click", () => {
  state.obstacle2Enabled = false;
  state.obstacle2Width = 60;
  state.obstacle2Height = 10;
  state.obstacle2Depth = 10;
  state.obstacle2OffsetX = 0;
  state.obstacle2OffsetY = 0;
  syncInputs();
  updateObstacleUI();
  readInputs();
  draw();
});

[inputs.cropLeft, inputs.cropRight, inputs.cropTop, inputs.cropBottom].forEach((input) => {
  input.addEventListener("input", () => {
    if (!userImageNode) return;
    if (cropModeActive) {
      normalizeCropValues();
      updateCropOverlay();
    } else {
      applyCropToImage();
      fitImageToWindow();
      draw();
    }
  });
});

inputs.resetCropBtn.addEventListener("click", () => {
  resetCrop();
});

inputs.toggleCropModeBtn.addEventListener("click", () => {
  if (cropModeActive) {
    exitCropMode();
  } else {
    enterCropMode();
  }
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

  if (cropModeActive) exitCropMode();

  imageControlsSection.style.display = "";

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

inputs.removeImageBtn.addEventListener("click", () => {
  if (cropModeActive) exitCropMode();
  if (userImageNode) {
    imageTransformer.nodes([]);
    imageTransformer.visible(false);
    userImageNode.destroy();
    userImageNode = null;
  }
  loadedImageElement = null;
  imageState.sourceWidth = 0;
  imageState.sourceHeight = 0;
  imageState.cropLeft = 0;
  imageState.cropRight = 0;
  imageState.cropTop = 0;
  imageState.cropBottom = 0;
  inputs.cropLeft.value = 0;
  inputs.cropRight.value = 0;
  inputs.cropTop.value = 0;
  inputs.cropBottom.value = 0;
  inputs.imageUpload.value = "";
  imageControlsSection.style.display = "none";
  draw();
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
  const clickedOnObstacle = e.target === obstacle1Rect || e.target === obstacle2Rect;

  if (!clickedOnImage && e.target !== imageTransformer) {
    imageTransformer.nodes([]);
    imageTransformer.visible(false);
  }

  if (!clickedOnObstacle && e.target !== obstacleTransformer) {
    obstacleTransformer.nodes([]);
    obstacleTransformer.visible(false);
  }

  layer.draw();
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

leftHandle.on("dragstart", function () {
  this.moveToTop();
});
leftHandle.on("dragmove", function () {
  const pointerX = this.x();
  const maxLeft = windowX;
  const deltaPx = maxLeft - pointerX;
  state.rodLeftOverflow = Math.max(0, Math.round(deltaPx / state.scalePxPerCm));
  this.y(leftHandle._fixedY);
  syncInputs();
  draw();
});

rightHandle.on("dragstart", function () {
  this.moveToTop();
});
rightHandle.on("dragmove", function () {
  const pointerX = this.x();
  const windowRight = windowX + getWindowWidthPx();
  const deltaPx = pointerX - windowRight;
  state.rodRightOverflow = Math.max(0, Math.round(deltaPx / state.scalePxPerCm));
  this.y(rightHandle._fixedY);
  syncInputs();
  draw();
});

supportLeftHandle.on("dragstart", function () {
  this.moveToTop();
});
supportLeftHandle.on("dragmove", function () {
  const rodX = getRodX();
  const rodWidthPx = getRodWidthPx();
  const localX = this.x() - rodX;
  const clampedX = Math.max(0, Math.min(localX, rodWidthPx));
  state.supportLeftInset = Math.round(clampedX / state.scalePxPerCm);
  const armPx = Math.max(0, this.y() - supportLeftHandle._rodY);
  state.supportArmLength = Math.max(0, Math.round(armPx / state.scalePxPerCm));
  normalizeSupportInsets();
  syncInputs();
  draw();
});

supportRightHandle.on("dragstart", function () {
  this.moveToTop();
});
supportRightHandle.on("dragmove", function () {
  const rodX = getRodX();
  const rodWidthPx = getRodWidthPx();
  const localX = this.x() - rodX;
  const clampedX = Math.max(0, Math.min(localX, rodWidthPx));
  state.supportRightInset = Math.round((rodWidthPx - clampedX) / state.scalePxPerCm);
  const armPx = Math.max(0, this.y() - supportRightHandle._rodY);
  state.supportArmLength = Math.max(0, Math.round(armPx / state.scalePxPerCm));
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
updateObstacleUI();
applyImageClip();
draw();