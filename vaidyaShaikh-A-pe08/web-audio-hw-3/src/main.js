/*
  main.js is primarily responsible for hooking up the UI to the rest of the application 
  and setting up the main event loop
*/

import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './canvas.js';

let appData = null;

const drawParams = {
  showGradient: true,
  showBars: true,
  showCircles: true,
  showNoise: false,
  showInvert: false,
  showEmboss: false,
  useWaveform: false
};

const FRAMES = 1000 / 60;

// Load app data 
const loadAppData = async () => {
  const res = await fetch("data/av-data.json");
  if (!res.ok) throw new Error(`Failed to load app data: ${res.status}`);
  return res.json();
};

const init = async () => {
  // 1) Load external JSON
  try {
    appData = await loadAppData();
  } catch (err) {
    console.error(err);
    // Fallback: minimal defaults if JSON failed
    appData = {
      title: "Audio Visualizer",
      tracks: [{ file: "media/New Adventure Theme.mp3", name: "New Adventure Theme" }],
      start: { trackIndex: 0, volume: 1.0, ui: {} }
    };
  }

  // 2) Displays the title
  if (appData.title) {
    document.title = appData.title;
    const h1 = document.querySelector("#app-title");
    if (h1) h1.textContent = appData.title;
  }
  const instr = document.querySelector("#app-instructions");
if (instr && appData.instructions) instr.textContent = appData.instructions;


  // 3) Build track dropdown from JSON
  const selectTrack = document.querySelector("#select-track");
  const start = appData.start ?? {};
  const startIndex = start.trackIndex ?? 0;

  if (selectTrack && Array.isArray(appData.tracks)) {
    selectTrack.innerHTML = "";
    appData.tracks.forEach((t, i) => {
      const opt = document.createElement("option");
      opt.value = t.file;
      opt.textContent = t.name ?? t.file;
      if (i === startIndex) opt.selected = true;
      selectTrack.appendChild(opt);
    });
  }

  // 4) Setup WebAudio with default track from JSON
  const defaultFile = appData.tracks?.[startIndex]?.file ?? "media/New Adventure Theme.mp3";
  audio.setupWebAudio(defaultFile);

  console.log("init called");
  console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
  const canvasElement = document.querySelector("canvas");

  // 5) Initialize UI state from JSON BEFORE wiring listeners
  const ui = start.ui ?? {};
  Object.assign(drawParams, ui);
  // Volume from JSON
  const sliderVolume = document.querySelector("#slider-volume");
  const labelVolume  = document.querySelector("#label-volume");
  if (sliderVolume) {
    const vol = typeof start.volume === "number" ? start.volume : 1.0;
    sliderVolume.value = String(vol);
    audio.setVolume(vol);
    if (labelVolume) labelVolume.textContent = Math.round((vol / 2) * 100);
  }

  // EQ from JSON
  if (start.eq) {
    const { bassGain = 0, trebleGain = 0 } = start.eq;
    if (typeof audio.setBassGain === "function") audio.setBassGain(bassGain);
    if (typeof audio.setTrebleGain === "function") audio.setTrebleGain(trebleGain);

    const sb = document.querySelector("#slider-bass");
    const st = document.querySelector("#slider-treble");
    const lb = document.querySelector("#label-bass");
    const lt = document.querySelector("#label-treble");
    if (sb) sb.value = String(bassGain);
    if (st) st.value = String(trebleGain);
    if (lb) lb.textContent = `${bassGain} dB`;
    if (lt) lt.textContent = `${trebleGain} dB`;
  }

  // Sync checkboxes to JSON initial UI
  const syncBool = (selector, key) => {
    const el = document.querySelector(selector);
    if (el && typeof ui[key] === "boolean") {
      el.checked = ui[key];
      if (key in drawParams) drawParams[key] = ui[key];
    }
  };
  syncBool("#cb-gradient", "showGradient");
  syncBool("#cb-bars", "showBars");
  syncBool("#cb-circles", "showCircles");
  syncBool("#cb-noise", "showNoise");
  syncBool("#cb-invert", "showInvert");
  syncBool("#cb-emboss", "showEmboss");

  // Visualization radios
  const vizRadios = document.querySelectorAll('input[name="viz-mode"]');
  if (vizRadios.length) {
    const target = drawParams.useWaveform ? "waveform" : "frequency";
    vizRadios.forEach(r => { r.checked = (r.value === target); });
  }

  // 6) Wire up event handlers
  setupUi(canvasElement);

  // 7) Setup canvas with analyser and start timed loop
  canvas.setupCanvas(canvasElement, audio.analyserNode);
  loop();
};

// Caps at 60 fps
const loop = () => {
  canvas.draw(drawParams);
  setTimeout(loop, FRAMES);
};

const setupUi = (canvasElement) => {
  // A - fullscreen button
  const btnFullscreen = document.querySelector("#btn-fullscreen");
  if (btnFullscreen){
    btnFullscreen.onclick = () => {
      console.log("goFullscreen() called");
      utils.goFullscreen(canvasElement);
    };
  }

  // B - play/pause
  const btnPlay = document.querySelector("#btn-play");
  if (btnPlay){
    btnPlay.onclick = (e) => {
      console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

      if (audio.audioCtx.state === "suspended") {
        audio.audioCtx.resume();
      }

      console.log(`audioCtx.state after = ${audio.audioCtx.state}`);

      if (e.target.dataset.playing === "no") {
        audio.playCurrentSound();
        e.target.dataset.playing = "yes"; // CSS sets text to "Pause"
      } else {
        audio.pauseCurrentSound();
        e.target.dataset.playing = "no"; // CSS sets text to "Play"
      }
    };
  }

  // C - volume slider & label
  const sliderVolume = document.querySelector("#slider-volume");
  const labelVolume  = document.querySelector("#label-volume");
  if (sliderVolume){
    sliderVolume.oninput = (e) => {
      audio.setVolume(e.target.value);
      if (labelVolume){
        labelVolume.textContent = Math.round((e.target.value / 2) * 100);
      }
    };
  }

  // D - track select
  const selectTrack = document.querySelector("#select-track");
  if (selectTrack){
    selectTrack.onchange = (e) => {
      audio.loadSoundFile(e.target.value);
      if (btnPlay && btnPlay.dataset.playing === "yes") {
        // pause then play to switch immediately
        btnPlay.dispatchEvent(new MouseEvent("click"));
        btnPlay.dispatchEvent(new MouseEvent("click"));
      }
    };
  }

  // E - Show Noise
  const cbNoise = document.querySelector("#cb-noise");
  if (cbNoise) {
    cbNoise.onchange = (e) => {
      drawParams.showNoise = e.target.checked;
    };
  }

  // F - Show Invert
  const cbInvert = document.querySelector("#cb-invert");
  if (cbInvert) {
    cbInvert.onchange = (e) => {
      drawParams.showInvert = e.target.checked;
    };
  }

  // G - Show Emboss
  const cbEmboss = document.querySelector("#cb-emboss");
  if (cbEmboss) {
    cbEmboss.onchange = (e) => {
      drawParams.showEmboss = e.target.checked;
    };
  }

  // H - Gradient/Bars/Circles
  const cbGradient = document.querySelector("#cb-gradient");
  if (cbGradient) {
    cbGradient.onchange = (e) => { drawParams.showGradient = e.target.checked; };
  }
  const cbBars = document.querySelector("#cb-bars");
  if (cbBars) {
    cbBars.onchange = (e) => { drawParams.showBars = e.target.checked; };
  }
  const cbCircles = document.querySelector("#cb-circles");
  if (cbCircles) {
    cbCircles.onchange = (e) => { drawParams.showCircles = e.target.checked; };
  }

  // I - Bass/Treble sliders
  const sliderBass  = document.querySelector("#slider-bass");
  const labelBass   = document.querySelector("#label-bass");
  if (sliderBass) {
    sliderBass.oninput = (e) => {
      if (typeof audio.setBassGain === "function") audio.setBassGain(e.target.value);
      if (labelBass) labelBass.textContent = `${e.target.value} dB`;
    };
  }

  const sliderTreble = document.querySelector("#slider-treble");
  const labelTreble  = document.querySelector("#label-treble");
  if (sliderTreble) {
    sliderTreble.oninput = (e) => {
      if (typeof audio.setTrebleGain === "function") audio.setTrebleGain(e.target.value);
      if (labelTreble) labelTreble.textContent = `${e.target.value} dB`;
    };
  }

  // J - Visualization mode radios
  const vizRadios = document.querySelectorAll('input[name="viz-mode"]');
  if (vizRadios && vizRadios.length) {
    vizRadios.forEach(r => {
      r.addEventListener("change", (e) => {
        drawParams.useWaveform = (e.target.value === "waveform");
      });
    });
  }
}; // end setupUi

export { init };
