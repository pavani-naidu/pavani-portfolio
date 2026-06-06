import { useEffect, useRef } from "react";

export function Background() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let w = (c.width = window.innerWidth);
    let h = (c.height = window.innerHeight);

    const mouse = { x: w / 2, y: h / 2, tx: w / 2, ty: h / 2 };

    const onMouseMove = (e: MouseEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    };

    const onResize = () => {
      if (!c) return;
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    // Wave parameters
    let phase = 0;
    let raf = 0;

    const tick = () => {
      // Smooth mouse coordinates
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      ctx.clearRect(0, 0, w, h);

      const isDark = document.documentElement.classList.contains("dark");

      // Define wave styling colors based on current mode
      let wave1Color, wave2Color, wave3Color;

      if (isDark) {
        // Dark theme: deep dark neutral grays
        wave1Color = "rgba(255, 255, 255, 0.015)"; 
        wave2Color = "rgba(255, 255, 255, 0.02)";  
        wave3Color = "rgba(255, 255, 255, 0.01)"; 
      } else {
        // Light theme: clean light neutral grays
        wave1Color = "rgba(0, 0, 0, 0.01)";  
        wave2Color = "rgba(0, 0, 0, 0.015)"; 
        wave3Color = "rgba(0, 0, 0, 0.007)";  
      }
      
      phase += 0.005;

      // Draw Wave 1 (Back, slow, large)
      drawSineWave(
        ctx,
        w,
        h,
        h * 0.45 + (mouse.y - h / 2) * 0.1, // Offset influenced by mouse
        0.0015,                             // Frequency
        55 + (mouse.x - w / 2) * 0.02,      // Amplitude
        phase * 0.8,                        // Phase
        wave1Color
      );

      // Draw Wave 2 (Middle, medium, different phase)
      drawSineWave(
        ctx,
        w,
        h,
        h * 0.6 + (mouse.y - h / 2) * 0.15,
        0.0025,
        40 - (mouse.x - w / 2) * 0.01,
        -phase * 1.2,
        wave2Color
      );

      // Draw Wave 3 (Front, fast, shallow, glow highlight)
      drawSineWave(
        ctx,
        w,
        h,
        h * 0.75 + (mouse.y - h / 2) * 0.2,
        0.004,
        25 + Math.abs(mouse.x - w / 2) * 0.03,
        phase * 1.5,
        wave3Color
      );

      raf = requestAnimationFrame(tick);
    };

    const drawSineWave = (
      context: CanvasRenderingContext2D,
      width: number,
      height: number,
      yOffset: number,
      frequency: number,
      amplitude: number,
      wavePhase: number,
      color: string
    ) => {
      context.beginPath();
      context.moveTo(0, height);

      for (let x = 0; x <= width; x += 15) {
        // Calculate curve height
        const y = yOffset + Math.sin(x * frequency + wavePhase) * amplitude;
        context.lineTo(x, y);
      }

      context.lineTo(width, height);
      context.closePath();
      context.fillStyle = color;
      context.fill();
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[var(--gradient-hero)]" />
      {/* Dynamic backdrop glows */}
      <div
        className="pointer-events-none fixed -z-10 top-1/4 -left-32 w-96 h-96 rounded-full animate-blob opacity-[0.03] dark:opacity-[0.05]"
        style={{
          background: "var(--foreground)",
          filter: "blur(120px)",
        }}
      />
      <div
        className="pointer-events-none fixed -z-10 bottom-0 -right-32 w-[28rem] h-[28rem] rounded-full animate-blob opacity-[0.02] dark:opacity-[0.04]"
        style={{
          background: "var(--foreground)",
          filter: "blur(130px)",
          animationDelay: "4s",
        }}
      />
      <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10" />
    </>
  );
}