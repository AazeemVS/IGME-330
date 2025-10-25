/*
	main.js is primarily responsible for hooking up the UI to the rest of the application 
	and setting up the main event loop
*/

import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './canvas.js';

const drawParams = {
	showGradient: true,
	showBars: true,
	showCircles: true,
	showNoise: false,
  showInvert: false,
  showEmboss: false
};

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
	sound1: "media/New Adventure Theme.mp3"
});

const init = () => {
  // Loads the sound file and sets up WebAudio context
  audio.setupWebAudio(DEFAULTS.sound1);

	console.log("init called");
	console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
	const canvasElement = document.querySelector("canvas"); // hookup <canvas> element
	setupUi(canvasElement);

  // setup canvas before starting loop
  canvas.setupCanvas(canvasElement, audio.analyserNode);

  //Call the main animation loop
  loop();
};

const loop = () => {
	// simplified loop for visualization only
	requestAnimationFrame(loop);
  canvas.draw(drawParams);
};

const setupUi = (canvasElement) => {
  // A - hookup fullscreen button
  const btnFullscreen = document.querySelector("#btn-fullscreen");
  if (btnFullscreen){
    btnFullscreen.onclick = () => {
      console.log("goFullscreen() called");
      utils.goFullscreen(canvasElement);
    };
  }

  // B - hookup play button
  const btnPlay = document.querySelector("#btn-play");
  if (btnPlay){
    btnPlay.onclick = (e) => {
      console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

      // check if context is in suspended state (autoplay policy)
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

  // C - hookup volume slider & label
  const sliderVolume = document.querySelector("#slider-volume");
  const labelVolume  = document.querySelector("#label-volume");
  if (sliderVolume){
    sliderVolume.oninput = (e) => {
      audio.setVolume(e.target.value);
      if (labelVolume){
        labelVolume.textContent = Math.round((e.target.value / 2) * 100);
      }
    };
    sliderVolume.dispatchEvent(new Event("input"));
  }

  // D - hookup track <select>
  const selectTrack = document.querySelector("#select-track");
  if (selectTrack){
    selectTrack.onchange = (e) => {
      audio.loadSoundFile(e.target.value);
      if (btnPlay && btnPlay.dataset.playing === "yes") {
        btnPlay.dispatchEvent(new MouseEvent("click"));
      }
    };
  }

  // E - hookup "Show Noise" checkbox
  const cbNoise = document.querySelector("#cb-noise");
  if (cbNoise) {
    cbNoise.checked = false;                   // start unchecked
    drawParams.showNoise = false;              // keep state in sync
    cbNoise.onchange = (e) => {
      drawParams.showNoise = e.target.checked; // toggles pixel-noise effect
    };
  }

  // F - hookup "Show Invert" checkbox
  const cbInvert = document.querySelector("#cb-invert");
  if (cbInvert) {
    cbInvert.checked = false;                  // start unchecked
    drawParams.showInvert = false;             // keep state in sync
    cbInvert.onchange = (e) => {
      drawParams.showInvert = e.target.checked; // toggles invert effect
    };
  }

  // G - hookup "Show Emboss" checkbox
  const cbEmboss = document.querySelector("#cb-emboss");
  if (cbEmboss) {
    cbEmboss.checked = false;                 // start unchecked
    drawParams.showEmboss = false;            // sync initial state
    cbEmboss.onchange = (e) => {
      drawParams.showEmboss = e.target.checked;
    };
  }
}; // end setupUi

export { init };
