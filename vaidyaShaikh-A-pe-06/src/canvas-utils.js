// drawRectangle
    export const drawRectangle = (ctx, x, y, w, h, fillStyle="black", lineWidth=0, strokeStyle="black") =>{
      ctx.save();
      ctx.fillStyle = fillStyle;
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      if (fillStyle) ctx.fill();
      if (lineWidth > 0) ctx.stroke();
      ctx.restore();
    }

    // drawArc
    export const drawArc = (ctx, x, y, radius, fillStyle="black", lineWidth=0, strokeStyle="black", startAngle=0, endAngle=Math.PI*2) => {
      ctx.save();
      ctx.fillStyle = fillStyle;
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle);
      if (fillStyle) ctx.fill();
      if (lineWidth > 0) ctx.stroke();
      ctx.restore();
    }

    // drawLine
    export const drawLine = (ctx, x1, y1, x2, y2, lineWidth=1, strokeStyle="black") =>{
      ctx.save();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }