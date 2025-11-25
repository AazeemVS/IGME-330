const makeColor = (
  red: number,
  green: number,
  blue: number,
  alpha: number = 1
): string => {
  return `rgba(${red},${green},${blue},${alpha})`;
};

const getRandom = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const getRandomColor = (): string => {
  const floor = 35; // so that colors are not too bright or too dark
  const getByte = () => getRandom(floor, 255 - floor);
  return `rgba(${getByte()},${getByte()},${getByte()},1)`;
};

interface ColorStop {
  percent: number;
  color: string;
}

const getLinearGradient = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  colorStops: ColorStop[]
): CanvasGradient => {
  const lg = ctx.createLinearGradient(startX, startY, endX, endY);
  for (const stop of colorStops) {
    lg.addColorStop(stop.percent, stop.color);
  }
  return lg;
};

// https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
const goFullscreen = (element: HTMLElement | null): void => {
  if (!element) return;

  const anyElem = element as any;

  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (anyElem.mozRequestFullscreen) {
    anyElem.mozRequestFullscreen();
  } else if (anyElem.mozRequestFullScreen) {
    anyElem.mozRequestFullScreen();
  } else if (anyElem.webkitRequestFullscreen) {
    anyElem.webkitRequestFullscreen();
  }
};

export { makeColor, getRandomColor, getLinearGradient, goFullscreen };
