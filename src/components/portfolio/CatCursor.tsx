import { useEffect, useRef, useState } from "react";

export function CatCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState(false);
  const [blink, setBlink] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Canvas dimensions and setup
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    interface Bubble {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      wobble: number;
      wobbleSpeed: number;
    }

    const bubbles: Bubble[] = [];

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };

      // Spawn bubbles on mouse movement
      if (Math.random() < 0.25) {
        bubbles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -Math.random() * 1.6 - 0.4, // Float upwards
          size: Math.random() * 4 + 1.5,
          alpha: Math.random() * 0.4 + 0.4,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.08 + 0.02,
        });
      }
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setHover(!!el.closest("a, button, [data-cursor-hover], [style*='cursor: pointer']"));
    };

    const onResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("resize", onResize);

    let raf = 0;

    const tick = () => {
      // Smoothly interpolate cursor position
      pos.current.x += (target.current.x - pos.current.x) * 0.16;
      pos.current.y += (target.current.y - pos.current.y) * 0.16;

      // Position the cat head
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.current.x - 18}px, ${pos.current.y - 18}px, 0) scale(${hover ? 1.3 : 1.0})`;
      }

      // Clear canvas
      ctx.clearRect(0, 0, w, h);

      // Update and draw bubble trail
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.wobble += b.wobbleSpeed;
        b.x += b.vx + Math.sin(b.wobble) * 0.4;
        b.y += b.vy;
        b.alpha -= 0.008; // gradual fade

        if (b.alpha <= 0) {
          bubbles.splice(i, 1);
          continue;
        }

        // Draw bubble (circle with reflective arc highlight)
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 211, 238, ${b.alpha * 0.7})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Highlighting shine dot inside bubble
        ctx.beginPath();
        ctx.arc(
          b.x - b.size * 0.3,
          b.y - b.size * 0.3,
          b.size * 0.15,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.8})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const blinkInt = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      clearInterval(blinkInt);
    };
  }, [hover]);

  return (
    <>
      {/* Bubble trail canvas in the layer just below the custom cursor */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[9998] hidden md:block"
      />

      {/* Cat Head Custom Cursor */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block transition-all duration-75 ease-out"
        style={{ willChange: "transform" }}
        aria-hidden
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          className="drop-shadow-[0_2px_8px_rgba(34,211,238,0.25)]"
        >
          {/* Glowing Cat head outline */}
          <path
            d="M6 12 L10 4 L14 10 L22 10 L26 4 L30 12 L30 22 Q30 30 18 30 Q6 30 6 22 Z"
            fill={hover ? "oklch(0.208 0.042 265.755)" : "oklch(0.85 0.18 180)"}
            stroke={hover ? "oklch(0.82 0.17 82)" : "oklch(0.08 0 0)"}
            strokeWidth="1.8"
            className="transition-colors duration-200"
          />
          {/* Eyes (dilate/expand when hovering over clickable element) */}
          <ellipse
            cx="13"
            cy="18"
            rx={hover ? 2.2 : 1.4}
            ry={blink ? 0.2 : hover ? 2.5 : 1.8}
            fill={hover ? "oklch(0.82 0.17 82)" : "oklch(0.08 0 0)"}
            className="transition-all duration-200"
          />
          <ellipse
            cx="23"
            cy="18"
            rx={hover ? 2.2 : 1.4}
            ry={blink ? 0.2 : hover ? 2.5 : 1.8}
            fill={hover ? "oklch(0.82 0.17 82)" : "oklch(0.08 0 0)"}
            className="transition-all duration-200"
          />
          {/* Nose */}
          <path
            d="M17 21 L19 21 L18 22.2 Z"
            fill={hover ? "oklch(0.82 0.17 82)" : "oklch(0.08 0 0)"}
            className="transition-all duration-200"
          />
          {/* Whiskers */}
          <line
            x1="7"
            y1="21"
            x2="12"
            y2="22"
            stroke={hover ? "oklch(0.82 0.17 82)" : "oklch(0.08 0 0)"}
            strokeWidth="0.8"
            className="transition-colors duration-200"
          />
          <line
            x1="24"
            y1="22"
            x2="29"
            y2="21"
            stroke={hover ? "oklch(0.82 0.17 82)" : "oklch(0.08 0 0)"}
            strokeWidth="0.8"
            className="transition-colors duration-200"
          />
        </svg>
      </div>
    </>
  );
}