/*
  The purpose of this file is to take in the analyser node and a <canvas> element: 
    - the module will create a drawing context that points at the <canvas> 
    - it will store the reference to the analyser node
    - in draw(), it will loop through the data in the analyser node
    - and then draw something representative on the canvas
    - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';

let ctx, canvasWidth, canvasHeight, gradient, analyserNode, audioData;

// subtle deep-blue vertical gradient
const makeBlueGradient = () => {
  const g = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  g.addColorStop(0.0, "#051026"); // near-black blue
  g.addColorStop(0.5, "#0b234a"); // deep indigo
  g.addColorStop(1.0, "#081a35"); // navy
  return g;
};

const setupCanvas = (canvasElement, analyserNodeRef) => {
  // create drawing context
  ctx = canvasElement.getContext("2d");
  canvasWidth = canvasElement.width;
  canvasHeight = canvasElement.height;

  // create a gradient that runs top to bottom
  // (replaced with a more subtle blue gradient)
  gradient = makeBlueGradient();

  // keep a reference to the analyser node
  analyserNode = analyserNodeRef;

  // this is the array where the analyser data will be stored
  audioData = new Uint8Array(analyserNode.fftSize / 2);
};

// helper: average amplitude
const avgAmp = () => {
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) sum += audioData[i];
  return (sum / (audioData.length * 255));
};

// helper: rounded rect bars
const roundRect = (x, y, w, h, r) => {
  const rr = Math.min(r, w * 0.5, Math.abs(h) * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
};

const draw = (params = {}) => {
  // 1 - populate the audioData array with the frequency data from the analyserNode
  analyserNode.getByteFrequencyData(audioData);
  // OR:
  // analyserNode.getByteTimeDomainData(audioData); // waveform data

  // 2 - background: fade with slight trail for motion blur
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#000";          // base clear
  ctx.globalAlpha = 0.15;          // longer persistence trail
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();

  // 3 - subtle blue gradient wash
  if (params.showGradient){
    // slowly shift gradient over time for a living background
    gradient = makeBlueGradient();
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }

  // Glow settings
  const avg = avgAmp();
  const glow = 8 + Math.floor(avg * 24);
  const hueBase = 205;
  const sat = 80 + Math.floor(avg * 20);
  const light = 50 + Math.floor(avg * 10);

  // 4 - neon “audio bars” with glow (blue palette)
  if (params.showBars){
    const barSpacing = 3;
    const margin = 20;
    const available = canvasWidth - margin * 2;
    const barWidth = Math.max(2, (available - barSpacing * (audioData.length - 1)) / audioData.length);
    const baseY = canvasHeight * 0.72;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowBlur = glow;
    ctx.shadowColor = `hsl(${hueBase}, ${sat}%, ${light + 15}%)`;

    for (let i = 0; i < audioData.length; i++){
      const mag = audioData[i] / 255;                // 0..1
      const h = Math.pow(mag, 1.3) * canvasHeight * 0.45; // eased height
      const x = margin + i * (barWidth + barSpacing);
      const y = baseY - h;

      ctx.fillStyle = `hsl(${hueBase + i * 0.08}, ${sat}%, ${40 + mag * 35}%)`;
      roundRect(x, y, barWidth, h, Math.min(6, barWidth * 0.5));
      ctx.fill();
    }
    ctx.restore();
  }

  // 5 - radial pulse rings from center (react to average loudness)
  if (params.showCircles){
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const ringCount = 5;
    const baseR = 20 + avg * 60;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = 2 + avg * 3;
    ctx.shadowBlur = glow + 6;
    ctx.shadowColor = `hsl(${hueBase}, ${sat}%, ${light + 10}%)`;

    for (let r = 0; r < ringCount; r++){
      const radius = baseR + r * (canvasHeight * 0.08);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${hueBase + r * 3}, ${sat}%, ${55 - r * 4}%, ${0.28 + avg * 0.4})`;
      ctx.stroke();
    }
    ctx.restore();
  }

  // 6 - “audio ribbon” bezier path (uses frequency bins to sculpt a wave)
  {
    const cx = canvasWidth / 2;
    const cy = canvasHeight * 0.42;
    const scale = canvasHeight * (0.12 + avg * 0.22);    // ribbon amplitude
    const step = Math.max(2, Math.floor(audioData.length / 64)); // thin the samples

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsla(${hueBase - 10}, ${sat}%, ${60 + avg * 10}%, 0.85)`;
    ctx.shadowBlur = glow + 4;
    ctx.shadowColor = `hsl(${hueBase}, ${sat}%, ${light + 15}%)`;

    ctx.beginPath();
    ctx.moveTo(0, cy);

    for (let i = 0; i < audioData.length; i += step){
      const t = i / (audioData.length - 1);
      const x = t * canvasWidth;
      const m = audioData[i] / 255;
      const y = cy - (m - 0.5) * 2 * scale;

      // use a simple quadratic curve to smooth segments
      const ctrlX = x - (canvasWidth / (audioData.length / step)) * 0.5;
      const ctrlY = (cy + y) * 0.5;
      ctx.quadraticCurveTo(ctrlX, ctrlY, x, y);
    }

    ctx.stroke();
    ctx.restore();
  }
  // === AESTHETIC UPGRADE ENDS HERE ===

  // 6 - bitmap manipulation
  // TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
  // regardless of whether or not we are applying a pixel effect
  // At some point, refactor this code so that we are looping though the image data only if
  // it is necessary

  if (params.showNoise || params.showInvert || params.showEmboss) {
    // A) grab pixels
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;
    const length = data.length;

    // B) iterate RGBA in steps of 4
    for (let i = 0; i < length; i += 4) {
      // C) noise (blue-tinted sparkles), only if enabled
      if (params.showNoise && Math.random() < 0.035) {
        data[i]     = 80 + Math.random() * 70;  // R (cool)
        data[i + 1] = 120 + Math.random() * 80; // G
        data[i + 2] = 255;                      // B (push blue)
      }

      // Invert, only if enabled
      if (params.showInvert) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i]     = 255 - r;
        data[i + 1] = 255 - g;
        data[i + 2] = 255 - b;
      }
    }

    if (params.showEmboss) {
      // Work from a copy so neighbor reads aren’t affected by our writes
      const src = new Uint8ClampedArray(data);
      const w4 = imageData.width * 4; // row stride in the flat RGBA array

      for (let i = 0; i < length; i++) {
        if (i % 4 === 3) continue; // skip alpha channel
        const onRightEdge  = ((i + 4) % w4) === 0;
        const onBottomRow  = i >= length - w4;
        if (onRightEdge || onBottomRow) { 
          data[i] = 127;
          continue;
        }
        const value = 127 + 2 * src[i] - src[i + 4] - src[i + w4];
        data[i] = value < 0 ? 0 : value > 255 ? 255 : value;
      }
    }

    // D) copy image data back to canvas
    ctx.putImageData(imageData, 0, 0);
  }
};

export { setupCanvas, draw };
