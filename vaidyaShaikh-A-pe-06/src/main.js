import { getRandomInt, getRandomColor } from "./utils.js";
import { drawRectangle, drawArc, drawLine } from "./canvas-utils.js";
    // ---------- state ----------
    const canvas = document.querySelector("#screen");
    const ctx = canvas.getContext("2d");

    let paused = false;
    let running = false;
    let lastTime = 0;
    const interval = 300;     // ms between draws

    let createRectangles = true;
    let createArcs = true;
    let createLines = true;

    // sizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // use helper to paint the background via our API
      drawRectangle(ctx, 0, 0, canvas.width, canvas.height, "#111", 0);
    }
    window.addEventListener("resize", resizeCanvas);

    // random drawers
    const drawRandomRect = () =>{
      const W = canvas.width, H = canvas.height;
      const rw = getRandomInt(20, Math.max(40, Math.floor(W * 0.25)));
      const rh = getRandomInt(20, Math.max(40, Math.floor(H * 0.25)));
      const x  = getRandomInt(0, W - rw);
      const y  = getRandomInt(0, H - rh);
      drawRectangle(ctx, x, y, rw, rh, getRandomColor(), getRandomInt(1,6), getRandomColor());
    }

    const drawRandomArc = () => {
      const W = canvas.width, H = canvas.height;
      const r  = getRandomInt(8, Math.floor(Math.min(W, H) * 0.1));
      const x  = getRandomInt(r, W - r);
      const y  = getRandomInt(r, H - r);
      // full circle or random arc span
      const isFull = Math.random() < 0.6;
      const a1 = 0;
      const a2 = isFull ? Math.PI * 2 : Math.random() * Math.PI * 2;
      drawArc(ctx, x, y, r, getRandomColor(), getRandomInt(1,6), getRandomColor(), a1, a2);
    }

    const drawRandomLine = () =>{
      const W = canvas.width, H = canvas.height;
      const x1 = getRandomInt(0, W), y1 = getRandomInt(0, H);
      const x2 = getRandomInt(0, W), y2 = getRandomInt(0, H);
      drawLine(ctx, x1, y1, x2, y2, getRandomInt(1,6), getRandomColor());
    }

    // spraypaint
    const sprayPaint = (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;

      for (let i = 0; i < 10; i++){
        const dx = getRandomInt(-20, 20);
        const dy = getRandomInt(-20, 20);
        const rad = getRandomInt(6, 16);
        // randomize semi/full arcs for fun
        const full = Math.random() < 0.5;
        const start = 0;
        const end = full ? Math.PI * 2 : Math.PI; // full or semi-circle
        drawArc(ctx, mx + dx, my + dy, rad, getRandomColor(), getRandomInt(0,3), getRandomColor(), start, end);
      }
    }

    // animation
    const animate = (t) =>{
      if (!paused){
        if (t - lastTime > interval){
          if (createRectangles) drawRandomRect();
          if (createArcs)       drawRandomArc();
          if (createLines)      drawRandomLine();
          lastTime = t;
        }
      }
      requestAnimationFrame(animate);
    }

    // UI
    document.getElementById("btnPlay").onclick = () => {
      paused = false;
      if (!running){
        running = true;
        requestAnimationFrame(animate);
      }
    };
    document.getElementById("btnPause").onclick = () => { paused = true; };
    document.getElementById("btnClear").onclick = () => {
      // clear using the helper 
      drawRectangle(ctx, 0, 0, canvas.width, canvas.height, "#111", 0);
    };

    document.getElementById("cbRectangles").onchange = e => { createRectangles = e.target.checked; };
    document.getElementById("cbArcs").onchange       = e => { createArcs       = e.target.checked; };
    document.getElementById("cbLines").onchange      = e => { createLines      = e.target.checked; };

    canvas.addEventListener("click", sprayPaint);

    // init
    const init = () => {
      resizeCanvas();

      drawLine(ctx, 20, 20, 200, 20, 2, "#2a2a2a");
      drawRectangle(ctx, 20, 24, 12, 12, "#1a1a1a", 1, "#2a2a2a");
      drawArc(ctx, 60, 60, 10, "#1a1a1a", 2, "#2a2a2a"); // tiny sample arc

      // start once
      running = true;
      requestAnimationFrame(animate);
    }

    init();
  