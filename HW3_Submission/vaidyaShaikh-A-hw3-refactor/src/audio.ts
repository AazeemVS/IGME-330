// 1 - our WebAudio context
let audioCtx: AudioContext | null = null;

// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element: HTMLAudioElement | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let analyserNode: AnalyserNode | null = null;
let gainNode: GainNode | null = null;
let bassFilter: BiquadFilterNode | null = null;
let trebleFilter: BiquadFilterNode | null = null;

// 3 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
  gain: 0.5,
  numSamples: 256,
  // EQ defaults
  bassFreq: 100,  
  trebleFreq: 3000,
  bassGain: 0,
  trebleGain: 0
});

let audioData: Uint8Array = new Uint8Array(DEFAULTS.numSamples / 2);

const setupWebAudio = (filePath: string): void => {
  const AudioContextClass =
    window.AudioContext || (window as any).webkitAudioContext;
  audioCtx = new AudioContextClass();

  element = new Audio();

  // 3 - have it point at a sound file
  loadSoundFile(filePath);

  if (!audioCtx || !element) return;

  // 4 - create a source node that points at the <audio> element
  sourceNode = audioCtx.createMediaElementSource(element);

  // 5 - create an analyser node
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
  sourceNode.connect(bassFilter);
  bassFilter.connect(trebleFilter);
  trebleFilter.connect(analyserNode);
  analyserNode.connect(gainNode);
  gainNode.connect(audioCtx.destination);
};

const loadSoundFile = (filePath: string): void => {
  if (!element) return;
  element.src = filePath;
};

const playCurrentSound = (): void => {
  if (!element) return;
  element.play();
};

const pauseCurrentSound = (): void => {
  if (!element) return;
  element.pause();
};

const setVolume = (value: number | string): void => {
  const numericValue = Number(value);
  if (gainNode) gainNode.gain.value = numericValue;
};

/**
 * @param db - gain in dB
 */
const setBassGain = (db: number | string): void => {
  if (bassFilter) bassFilter.gain.value = Number(db);
};

/**
 * @param db - gain in dB
 */
const setTrebleGain = (db: number | string): void => {
  if (trebleFilter) trebleFilter.gain.value = Number(db);
};

const setBassFrequency = (hz: number | string): void => {
  if (bassFilter) bassFilter.frequency.value = Number(hz);
};

const setTrebleFrequency = (hz: number | string): void => {
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
  setBassGain,
  setTrebleGain,
  setBassFrequency,
  setTrebleFrequency
};
