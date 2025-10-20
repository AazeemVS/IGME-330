import * as utils from "./utils.js";

let ctx, canvasWidth, canvasHeight, gradient, analyserNode, audioData;

function setupCanvas(canvasElement, analyserNodeRef) {
  // create drawing context
  ctx = canvasElement.getContext("2d");
  canvasWidth = canvasElement.width;
  canvasHeight = canvasElement.height;

  // create a gradient that runs top → bottom
  gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, [
    { percent: 0.0, color: "blue" },
    { percent: 0.25, color: "cyan" },
    { percent: 0.5, color: "green" },
    { percent: 0.75, color: "yellow" },
    { percent: 1.0, color: "red" },
  ]);

  // keep a reference to the analyser node
  analyserNode = analyserNodeRef;

  // this is the array where the analyser data will be stored
  audioData = new Uint8Array(analyserNode.fftSize / 2);
}

function draw(params = {}) {
  // 1 - populate the audioData array with frequency data from the analyserNode
  // note: these arrays are passed "by reference"
  analyserNode.getByteFrequencyData(audioData);
  // OR for waveform visualization:
  // analyserNode.getByteTimeDomainData(audioData);

  // 2 - draw background
  ctx.save();
  ctx.fillStyle = "black";
  ctx.globalAlpha = 0.1;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();

  // 3 - draw gradient overlay
  if (params.showGradient) {
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }

// 4 - draw bars
if (params.showBars) {
  let barSpacing = 4;
  let margin = 5;
  let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
  let barWidth = screenWidthForBars / audioData.length;
  let barHeight = 200;
  let topSpacing = 100;

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.50)";
  ctx.strokeStyle = "rgba(0,0,0,0.50)";

  // loop through the data and draw!
  for (let i = 0; i < audioData.length; i++) {
    ctx.fillRect(
      margin + i * (barWidth + barSpacing),
      topSpacing + 256 - audioData[i],
      barWidth,
      barHeight
    );
    ctx.strokeRect(
      margin + i * (barWidth + barSpacing),
      topSpacing + 256 - audioData[i],
      barWidth,
      barHeight
    );
  }
  ctx.restore();
}

  // 5 - draw circles
if (params.showCircles) {
  let maxRadius = canvasHeight / 4;
  ctx.save();
  ctx.globalAlpha = 0.5;

  for (let i = 0; i < audioData.length; i++) {
    // red-ish circles
    let percent = audioData[i] / 255;
    let circleRadius = percent * maxRadius;

    ctx.beginPath();
    ctx.fillStyle = utils.makeColor(255, 111, 111, 0.34 - percent / 3.0);
    ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();

    // blue-ish circles, bigger, more transparent
    ctx.beginPath();
    ctx.fillStyle = utils.makeColor(0, 0, 255, 0.10 - percent / 10.0);
    ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius * 1.5, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();

    // yellow-ish circles, smaller
    ctx.save();
    ctx.fillStyle = utils.makeColor(200, 200, 0, 0.5 - percent / 5.0);
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius * 0.5, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  ctx.restore();
}

}

export { setupCanvas, draw };
