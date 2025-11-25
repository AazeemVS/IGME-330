import * as utils from "./utils";
import * as audio from "./audio";
import * as canvas from "./canvas";

// ---- Types ----

interface Track {
  file: string;
  name?: string;
}

interface EqSettings {
  bassGain?: number;
  trebleGain?: number;
}

interface StartConfig {
  trackIndex?: number;
  volume?: number;
  ui?: any;
  eq?: EqSettings;
}

interface AppData {
  title?: string;
  tracks?: Track[];
  start?: StartConfig;
  instructions?: string;
}

interface DrawParams {
  showGradient: boolean;
  showBars: boolean;
  showCircles: boolean;
  showNoise: boolean;
  showInvert: boolean;
  showEmboss: boolean;
  useWaveform: boolean;
}

let appData: AppData | null = null;

const drawParams: DrawParams = {
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
const loadAppData = async (): Promise<AppData> => {
  const res = await fetch("data/av-data.json");
  if (!res.ok) throw new Error(`Failed to load app data: ${res.status}`);
  return (res.json() as Promise<AppData>);
};

const init = async (): Promise<void> => {
  // 1) Load external JSON
  try {
    appData = await loadAppData();
  } catch (err) {
    console.error(err);
    appData = {
      title: "Audio Visualizer",
      tracks: [
        {
          file: "media/New Adventure Theme.mp3",
          name: "New Adventure Theme"
        }
      ],
      start: { trackIndex: 0, volume: 1.0, ui: {} }
    };
  }

  if (!appData) return;

  // 2) Displays the title
  if (appData.title) {
    document.title = appData.title;
    const h1 = document.querySelector<HTMLHeadingElement>("#app-title");
    if (h1) h1.textContent = appData.title;
  }

  const instr = document.querySelector<HTMLElement>("#app-instructions");
  if (instr && appData.instructions) instr.textContent = appData.instructions;

  // 3) Build track dropdown from JSON
  const selectTrack = document.querySelector<HTMLSelectElement>("#select-track");
  const start: StartConfig = appData.start ?? {};
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
  const defaultFile =
    appData.tracks?.[startIndex]?.file ?? "media/New Adventure Theme.mp3";
  audio.setupWebAudio(defaultFile);

  console.log("init called");
  console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
  const canvasElement = document.querySelector<HTMLCanvasElement>("canvas");

  // 5) Initialize UI state from JSON BEFORE wiring listeners
  const ui: any = start.ui ?? {};
  Object.assign(drawParams, ui);

  // Volume from JSON
  const sliderVolume =
    document.querySelector<HTMLInputElement>("#slider-volume");
  const labelVolume = document.querySelector<HTMLElement>("#label-volume");
  if (sliderVolume) {
    const vol = typeof start.volume === "number" ? start.volume : 1.0;
    sliderVolume.value = String(vol);
    audio.setVolume(vol);
    if (labelVolume) labelVolume.textContent = String(Math.round((vol / 2) * 100));
  }

  // EQ from JSON
  if (start.eq) {
    const { bassGain = 0, trebleGain = 0 } = start.eq;
    if (typeof audio.setBassGain === "function") audio.setBassGain(bassGain);
    if (typeof audio.setTrebleGain === "function") audio.setTrebleGain(trebleGain);

    const sb = document.querySelector<HTMLInputElement>("#slider-bass");
    const st = document.querySelector<HTMLInputElement>("#slider-treble");
    const lb = document.querySelector<HTMLElement>("#label-bass");
    const lt = document.querySelector<HTMLElement>("#label-treble");
    if (sb) sb.value = String(bassGain);
    if (st) st.value = String(trebleGain);
    if (lb) lb.textContent = `${bassGain} dB`;
    if (lt) lt.textContent = `${trebleGain} dB`;
  }

  // Sync checkboxes to JSON initial UI
  const syncBool = (selector: string, key: string): void => {
    const el = document.querySelector<HTMLInputElement>(selector);
    if (el && typeof ui[key] === "boolean") {
      el.checked = ui[key];
      if (key in drawParams) {
        (drawParams as any)[key] = ui[key];
      }
    }
  };
  syncBool("#cb-gradient", "showGradient");
  syncBool("#cb-bars", "showBars");
  syncBool("#cb-circles", "showCircles");
  syncBool("#cb-noise", "showNoise");
  syncBool("#cb-invert", "showInvert");
  syncBool("#cb-emboss", "showEmboss");

  // Visualization radios
  const vizRadios =
    document.querySelectorAll<HTMLInputElement>('input[name="viz-mode"]');
  if (vizRadios.length) {
    const target = drawParams.useWaveform ? "waveform" : "frequency";
    vizRadios.forEach((r) => {
      r.checked = r.value === target;
    });
  }

  // 6) Wire up event handlers
  setupUi(canvasElement);

  // 7) Setup canvas with analyser and start timed loop
  if (canvasElement && audio.analyserNode) {
  // the "!" tells TypeScript: we KNOW it's not null here
  canvas.setupCanvas(canvasElement, audio.analyserNode!);
  loop();
} else {
    console.error("Canvas element or analyser node not available");
  }
};

// Caps at 60 fps
const loop = (): void => {
  canvas.draw(drawParams);
  setTimeout(loop, FRAMES);
};

const setupUi = (canvasElement: HTMLCanvasElement | null): void => {
  // A - fullscreen button
  const btnFullscreen =
    document.querySelector<HTMLButtonElement>("#btn-fullscreen");
  if (btnFullscreen) {
    btnFullscreen.onclick = () => {
      console.log("goFullscreen() called");
      utils.goFullscreen(canvasElement);
    };
  }

  // B - play/pause
const btnPlay = document.querySelector<HTMLButtonElement>("#btn-play");
if (btnPlay) {
  btnPlay.onclick = (e: MouseEvent) => {
    // copy to a local variable
    const ctx = audio.audioCtx;
    if (!ctx) return; // runtime safety + TS narrowing

    console.log(`audioCtx.state before = ${ctx.state}`);

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    console.log(`audioCtx.state after = ${ctx.state}`);

    const target = e.currentTarget as HTMLButtonElement;
    const playing = target.dataset.playing;

    if (playing === "no") {
      audio.playCurrentSound();
      target.dataset.playing = "yes"; // CSS sets text to "Pause"
    } else {
      audio.pauseCurrentSound();
      target.dataset.playing = "no"; // CSS sets text to "Play"
    }
  };
}


  // C - volume slider & label
  const sliderVolume =
    document.querySelector<HTMLInputElement>("#slider-volume");
  const labelVolume = document.querySelector<HTMLElement>("#label-volume");
  if (sliderVolume) {
    sliderVolume.oninput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const value = target.value;
      audio.setVolume(value);
      if (labelVolume) {
        const numeric = Number(value);
        labelVolume.textContent = String(Math.round((numeric / 2) * 100));
      }
    };
  }

  // D - track select
  const selectTrack = document.querySelector<HTMLSelectElement>("#select-track");
  if (selectTrack) {
    selectTrack.onchange = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      audio.loadSoundFile(target.value);
      if (btnPlay && btnPlay.dataset.playing === "yes") {
        // pause then play to switch immediately
        btnPlay.dispatchEvent(new MouseEvent("click"));
        btnPlay.dispatchEvent(new MouseEvent("click"));
      }
    };
  }

  // E - Show Noise
  const cbNoise = document.querySelector<HTMLInputElement>("#cb-noise");
  if (cbNoise) {
    cbNoise.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      drawParams.showNoise = target.checked;
    };
  }

  // F - Show Invert
  const cbInvert = document.querySelector<HTMLInputElement>("#cb-invert");
  if (cbInvert) {
    cbInvert.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      drawParams.showInvert = target.checked;
    };
  }

  // G - Show Emboss
  const cbEmboss = document.querySelector<HTMLInputElement>("#cb-emboss");
  if (cbEmboss) {
    cbEmboss.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      drawParams.showEmboss = target.checked;
    };
  }

  // H - Gradient/Bars/Circles
  const cbGradient =
    document.querySelector<HTMLInputElement>("#cb-gradient");
  if (cbGradient) {
    cbGradient.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      drawParams.showGradient = target.checked;
    };
  }

  const cbBars = document.querySelector<HTMLInputElement>("#cb-bars");
  if (cbBars) {
    cbBars.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      drawParams.showBars = target.checked;
    };
  }

  const cbCircles = document.querySelector<HTMLInputElement>("#cb-circles");
  if (cbCircles) {
    cbCircles.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      drawParams.showCircles = target.checked;
    };
  }

  // I - Bass/Treble sliders
  const sliderBass = document.querySelector<HTMLInputElement>("#slider-bass");
  const labelBass = document.querySelector<HTMLElement>("#label-bass");
  if (sliderBass) {
    sliderBass.oninput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (typeof audio.setBassGain === "function") {
        audio.setBassGain(target.value);
      }
      if (labelBass) labelBass.textContent = `${target.value} dB`;
    };
  }

  const sliderTreble =
    document.querySelector<HTMLInputElement>("#slider-treble");
  const labelTreble = document.querySelector<HTMLElement>("#label-treble");
  if (sliderTreble) {
    sliderTreble.oninput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (typeof audio.setTrebleGain === "function") {
        audio.setTrebleGain(target.value);
      }
      if (labelTreble) labelTreble.textContent = `${target.value} dB`;
    };
  }

  // J - Visualization mode radios
  const vizRadios =
    document.querySelectorAll<HTMLInputElement>('input[name="viz-mode"]');
  if (vizRadios && vizRadios.length) {
    vizRadios.forEach((r) => {
      r.addEventListener("change", (e: Event) => {
        const target = e.target as HTMLInputElement;
        drawParams.useWaveform = target.value === "waveform";
      });
    });
  }
}; // end setupUi

export { init };
