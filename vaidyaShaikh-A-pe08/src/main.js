/* main.js: hooks up UI and starts the main loop */
import * as audio from "./audio.js";
import * as utils from "./utils.js";
import * as canvas from './canvas.js'; 
const drawParams = {
    showGradient: true,
    showBars: true,
    showCircles: true,
    showNoise: true
  };

// fake enum / default track
const DEFAULTS = Object.freeze({
  sound1: "media/New Adventure Theme.mp3",
});

function init() {
  console.log("init called");

  // 1) Setup WebAudio graph and load a default track
  audio.setupWebAudio(DEFAULTS.sound1);

  // 2) Hook up UI
  const canvasElement = document.querySelector("canvas");
  setupUI(canvasElement);

  canvas.setupCanvas(canvasElement, audio.analyserNode);

  // 3) Start loop AFTER analyserNode exists
  requestAnimationFrame(loop);
}

function loop() {
  requestAnimationFrame(loop);
canvas.draw(drawParams);
}

function setupUI(canvasElement) {
  // A) Fullscreen button
  const fsButton = document.querySelector("#fsButton");
  fsButton.onclick = () => utils.goFullscreen(canvasElement);

  // B) Play/Pause button
  const playButton = document.querySelector("#playButton");
  // initialize dataset value if missing
  if (!playButton.dataset.playing) playButton.dataset.playing = "no";

  playButton.onclick = (e) => {
    console.log(`audioCtx.state before = ${audio.audioCtx.state}`);
    if (audio.audioCtx.state === "suspended") {
      audio.audioCtx.resume();
    }
    console.log(`audioCtx.state after  = ${audio.audioCtx.state}`);

    if (e.target.dataset.playing === "no") {
      audio.playCurrentSound();
      e.target.dataset.playing = "yes"; // CSS can swap text to "Pause"
    } else {
      audio.pauseCurrentSound();
      e.target.dataset.playing = "no"; // CSS can swap text to "Play"
    }
  };

  // C) Volume slider + label
  const volumeSlider = document.querySelector("#volumeSlider");
  const volumeLabel = document.querySelector("#volumeLabel");
  volumeSlider.oninput = (e) => {
    audio.setVolume(e.target.value);
    volumeLabel.innerHTML = Math.round((e.target.value / 2) * 100);
  };
  // sync label to initial slider value
  volumeSlider.dispatchEvent(new Event("input"));

  // D) Track <select>
  const trackSelect = document.querySelector("#trackSelect");
  trackSelect.onchange = (e) => {
    audio.loadSoundFile(e.target.value);
    // if currently playing, toggle to pause so user must press Play again
    if (playButton.dataset.playing === "yes") {
      playButton.dispatchEvent(new MouseEvent("click"));
    }
  };
}

export { init };
