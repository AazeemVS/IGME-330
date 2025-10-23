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

function setupCanvas(canvasElement, analyserNodeRef){
  // create drawing context
  ctx = canvasElement.getContext("2d");
  canvasWidth = canvasElement.width;
  canvasHeight = canvasElement.height;

  // create a gradient that runs top to bottom
  gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, [
    { percent: 0,    color: "blue"   },
    { percent: 0.25, color: "green"  },
    { percent: 0.5,  color: "yellow" },
    { percent: 0.75, color: "red"    },
    { percent: 1,    color: "magenta"}
  ]);

  // keep a reference to the analyser node
  analyserNode = analyserNodeRef;

  // this is the array where the analyser data will be stored
  audioData = new Uint8Array(analyserNode.fftSize / 2);
}

function draw(params = {}){
  // 1 - populate the audioData array with the frequency data from the analyserNode
  analyserNode.getByteFrequencyData(audioData);
  // OR:
  // analyserNode.getByteTimeDomainData(audioData); // waveform data

  // 2 - draw background
  ctx.save();
  ctx.fillStyle = "black";
  ctx.globalAlpha = 0.1;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();

  // 3 - draw gradient
  if (params.showGradient){
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }

  // 4 - draw bars
  if (params.showBars){
    let barSpacing = 4;
    let margin = 5;
    let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
    let barWidth = screenWidthForBars / audioData.length;
    let barHeight = 200;
    let topSpacing = 100;

    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.50)';
    ctx.strokeStyle = 'rgba(0,0,0,0.50)';

    // loop through the data and draw!
    for (let i = 0; i < audioData.length; i++){
      const x = margin + i * (barWidth + barSpacing);
      const y = topSpacing + 256 - audioData[i];
      ctx.fillRect(x, y, barWidth, barHeight);
      ctx.strokeRect(x, y, barWidth, barHeight);
    }
    ctx.restore();
  }

  // 5 - draw circles
  if (params.showCircles){
    const maxRadius = canvasHeight / 4;
    ctx.save();
    ctx.globalAlpha = 0.5;

    for (let i = 0; i < audioData.length; i++){
      const percent = audioData[i] / 255;
      const circleRadius = percent * maxRadius;

      // red-ish circles
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
      ctx.beginPath();
      ctx.fillStyle = utils.makeColor(200, 200, 0, 0.5 - percent / 5.0);
      ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius * 0.5, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    }

    ctx.restore();
  }
}

export { setupCanvas, draw };
