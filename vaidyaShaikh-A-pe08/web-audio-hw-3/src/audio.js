// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCtx;

// **These are "private" properties - these will NOT be visible outside of this module (i.e. file)**
// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element, sourceNode, analyserNode, gainNode, bassFilter, trebleFilter;

// 3 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
  gain: 0.5,
  numSamples: 256,
  // EQ defaults
  bassFreq: 100,      // Hz for the lowshelf corner
  trebleFreq: 3000,   // Hz for the highshelf corner
  bassGain: 0,        // dB
  trebleGain: 0       // dB
});

// 4 - create a new array of 8-bit integers (0-255)
// this is a typed array to hold the audio frequency data
let audioData = new Uint8Array(DEFAULTS.numSamples / 2);

// **Next are "public" methods - we are going to export all of these at the bottom of this file**
const setupWebAudio = (filePath) => {
  // 1 - The || is because WebAudio has not been standardized across browsers yet
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  // 2 - this creates an <audio> element
  element = new Audio(); // document.querySelector("audio");

  // 3 - have it point at a sound file
  loadSoundFile(filePath);

  // 4 - create a source node that points at the <audio> element
  sourceNode = audioCtx.createMediaElementSource(element);

  // 5 - create an analyser node (note the UK spelling of “Analyser”)
  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = DEFAULTS.numSamples;

  // 6 - create EQ filters
  bassFilter = audioCtx.createBiquadFilter();
  bassFilter.type = "lowshelf";
  bassFilter.frequency.value = DEFAULTS.bassFreq;
  bassFilter.gain.value = DEFAULTS.bassGain;

  trebleFilter = audioCtx.createBiquadFilter();
  trebleFilter.type = "highshelf";
  trebleFilter.frequency.value = DEFAULTS.trebleFreq;
  trebleFilter.gain.value = DEFAULTS.trebleGain;

  // 7 - create a gain (volume) node
  gainNode = audioCtx.createGain();
  gainNode.gain.value = DEFAULTS.gain;

  // 8 - connect the nodes - we now have an audio graph
  // source -> bass -> treble -> analyser -> gain -> destination
  sourceNode.connect(bassFilter);
  bassFilter.connect(trebleFilter);
  trebleFilter.connect(analyserNode);
  analyserNode.connect(gainNode);
  gainNode.connect(audioCtx.destination);
};

const loadSoundFile = (filePath) => {
  element.src = filePath;
};

const playCurrentSound = () => {
  element.play();
};

const pauseCurrentSound = () => {
  element.pause();
};

const setVolume = (value) => {
  value = Number(value); // make sure that it's a Number rather than a String
  if (gainNode) gainNode.gain.value = value;
};

/**
 * @param {number} db - gain in dB
 */
const setBassGain = (db) => {
  if (bassFilter) bassFilter.gain.value = Number(db);
};

/**
 * @param {number} db - gain in dB 
 */
const setTrebleGain = (db) => {
  if (trebleFilter) trebleFilter.gain.value = Number(db);
};

const setBassFrequency = (hz) => {
  if (bassFilter) bassFilter.frequency.value = Number(hz);
};

const setTrebleFrequency = (hz) => {
  if (trebleFilter) trebleFilter.frequency.value = Number(hz);
};

export {
  audioCtx,
  setupWebAudio,
  playCurrentSound,
  pauseCurrentSound,
  loadSoundFile,
  setVolume,
  analyserNode,
  // new exports
  setBassGain,
  setTrebleGain,
  setBassFrequency,
  setTrebleFrequency
};
