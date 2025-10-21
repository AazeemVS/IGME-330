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
	showNoise: true
};

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
	sound1: "media/New Adventure Theme.mp3"
});

function init(){
  // Loads the sound file and sets up WebAudio context
  audio.setupWebAudio(DEFAULTS.sound1);

	console.log("init called");
	console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
	let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
	setupUI(canvasElement);

  // setup canvas before starting loop
  canvas.setupCanvas(canvasElement, audio.analyserNode);

  //Call the main animation loop
  loop();
}

function loop(){
	// simplified loop for visualization only
	requestAnimationFrame(loop)
  canvas.draw(drawParams);
;

	// draw visualization
	canvas.draw({
		showGradient: true,
		showBars: true,
		showCircles: true
	});
}

function setupUI(canvasElement){
  // A - hookup fullscreen button
  const fsButton = document.querySelector("#fsButton");
  fsButton.onclick = e => {
    console.log("goFullscreen() called");
    utils.goFullscreen(canvasElement);
  };

  // B - hookup play button
  const playButton = document.querySelector("#playButton");

  playButton.onclick = e => {
    console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

    // check if context is in suspended state (autoplay policy)
    if (audio.audioCtx.state == "suspended") {
      audio.audioCtx.resume();
    }

    console.log(`audioCtx.state after = ${audio.audioCtx.state}`);

    if (e.target.dataset.playing == "no") {
      // if track is currently paused, play it
      audio.playCurrentSound();
      e.target.dataset.playing = "yes"; // our CSS will set the text to "Pause"
    } else {
      // if track IS playing, pause it
      audio.pauseCurrentSound();
      e.target.dataset.playing = "no"; // our CSS will set the text to "Play"
    }
  };

  // C - hookup volume slider & label
  let volumeSlider = document.querySelector("#volumeSlider");
  let volumeLabel = document.querySelector("#volumeLabel");

  volumeSlider.oninput = e => {
    audio.setVolume(e.target.value);
    volumeLabel.innerHTML = Math.round((e.target.value / 2) * 100);
  };

  volumeSlider.dispatchEvent(new Event("input"));

  // D - hookup track <select>
  let trackSelect = document.querySelector("#trackSelect");

  trackSelect.onchange = e => {
    audio.loadSoundFile(e.target.value);
    if (playButton.dataset.playing == "yes") {
      playButton.dispatchEvent(new MouseEvent("click"));
    }
  };
} // end setupUI

export {init};
