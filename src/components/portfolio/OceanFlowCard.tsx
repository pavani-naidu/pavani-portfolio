import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Instagram, Compass } from "lucide-react";

export function OceanFlowCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const mouse = { x: width / 2, y: height / 2, tx: width / 2, ty: height / 2, vx: 0, vy: 0 };

    // Define particles
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      life: number;
      maxLife: number;
    }

    const particles: Particle[] = [];
    const maxParticles = 140;

    // Neutral monochrome particle colors
    const colors = [
      "rgba(255, 255, 255, ",  // White
      "rgba(220, 220, 220, ",  // Off-white
      "rgba(180, 180, 180, ",  // Light gray
      "rgba(140, 140, 140, ",  // Medium gray
      "rgba(200, 200, 200, "   // Silver
    ];

    const createParticle = (x: number, y: number, force = 1): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 0.5;
      return {
        x,
        y,
        vx: Math.cos(angle) * speed * force + mouse.vx * 0.15,
        vy: Math.sin(angle) * speed * force + mouse.vy * 0.15,
        size: Math.random() * 2.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.5,
        life: 0,
        maxLife: Math.random() * 100 + 60,
      };
    };

    // Populate initial particles
    for (let i = 0; i < 60; i++) {
      particles.push(createParticle(Math.random() * width, Math.random() * height, 0.5));
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - rect.left;
      mouse.ty = e.clientY - rect.top;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", onMouseMove);

    const render = () => {
      // Calculate mouse velocities
      mouse.vx = mouse.tx - mouse.x;
      mouse.vy = mouse.ty - mouse.y;
      mouse.x += mouse.vx * 0.15;
      mouse.y += mouse.vy * 0.15;

      const mouseSpeed = Math.hypot(mouse.vx, mouse.vy);

      // Fade canvas for motion trails
      const isDark = document.documentElement.classList.contains("dark");
      if (isHovered) {
        ctx.fillStyle = isDark ? "rgba(20, 20, 20, 0.15)" : "rgba(255, 255, 255, 0.15)";
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      // Draw background glow around mouse (neutral white/gray)
      if (isHovered) {
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          110
        );
        gradient.addColorStop(0, isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.03)");
        gradient.addColorStop(0.5, isDark ? "rgba(200, 200, 200, 0.02)" : "rgba(0, 0, 0, 0.01)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Inject particles on mouse movement
      if (isHovered && mouseSpeed > 1 && particles.length < maxParticles) {
        const count = Math.min(3, Math.floor(mouseSpeed / 3) + 1);
        for (let i = 0; i < count; i++) {
          particles.push(
            createParticle(
              mouse.x + (Math.random() - 0.5) * 12,
              mouse.y + (Math.random() - 0.5) * 12,
              mouseSpeed * 0.08
            )
          );
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Water flow physics: swirling vector field
        const swirlX = Math.sin(p.y * 0.025 + animationFrameId * 0.01) * 0.45;
        const swirlY = Math.cos(p.x * 0.025 + animationFrameId * 0.01) * 0.45;

        // Pull particles toward mouse when hovered
        let pullX = 0;
        let pullY = 0;
        if (isHovered) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            const pullForce = (150 - dist) * 0.003;
            pullX = (dx / dist) * pullForce;
            pullY = (dy / dist) * pullForce;
          }
        }

        p.vx += swirlX + pullX;
        p.vy += swirlY + pullY;

        // Apply friction
        p.vx *= 0.96;
        p.vy *= 0.96;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Calculate opacity based on life
        const ageRatio = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - ageRatio);

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Use dark particles for light mode, light particles for dark mode
        const strokeColor = isDark ? "rgba(240, 240, 240, " : "rgba(40, 40, 40, ";
        ctx.fillStyle = strokeColor + currentAlpha + ")";
        ctx.fill();

        // Kill dead particles
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          // Recirculate some particles naturally
          if (particles.length < 50) {
            particles.push(createParticle(Math.random() * width, Math.random() * height, 0.2));
          }
        }
      }

      // Draw subtle connective vector lines
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pi = particles[i];
          const pj = particles[j];
          const dist = Math.hypot(pi.x - pj.x, pi.y - pj.y);
          if (dist < 45) {
            const opacity = (1 - dist / 45) * 0.12 * Math.min(pi.alpha, pj.alpha);
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            
            const lineColor = isDark ? "rgba(220, 220, 220, " : "rgba(60, 60, 60, ";
            ctx.strokeStyle = lineColor + opacity + ")";
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", onMouseMove);
    };
  }, [isHovered]);

  const handleCardClick = () => {
    window.open("https://www.instagram.com/ocean__flow__/", "_blank", "noopener,noreferrer");
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative mx-auto mt-16 max-w-2xl overflow-hidden rounded-3xl border border-border bg-card p-1 text-card-foreground shadow-md transition-all duration-500 hover:border-foreground/30 hover:shadow-[0_0_40px_rgba(0,0,0,0.06)]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      data-cursor-hover
      style={{ cursor: "pointer" }}
    >
      {/* Dynamic Background Shader-like Fluid Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full rounded-[22px] pointer-events-none"
      />

      {/* Glossy Overlay Grid */}
      <div className="absolute inset-0 bg-gradient-to-tr from-card/60 via-transparent to-foreground/[0.02] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-10">
        <div className="text-left space-y-4 max-w-md">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary border border-border text-foreground/80 text-xs font-semibold uppercase tracking-[0.2em]">
            <Compass className="w-3.5 h-3.5" /> Spotlight Link
          </div>
          
          <h3 className="text-3xl font-bold tracking-tight text-foreground font-display">
            ocean<span className="text-foreground/40">__</span>flow<span className="text-foreground/40">__</span>
          </h3>

          <p className="text-muted-foreground text-sm leading-relaxed">
            We craft digital experiences. Follow the flow of our latest work in Web Design, Web Development, and Video Editing. Visit our Instagram for a professional look at our projects, client builds, and creative process.
          </p>
          
          <div className="flex items-center gap-2 text-foreground text-xs font-semibold">
            <span>EXPLORE THE CURRENT</span>
            <span className="animate-bounce-h">→</span>
          </div>
        </div>

        {/* Big Social Button Badge */}
        <div className="relative group flex items-center justify-center">
          <div className="absolute -inset-2 rounded-full bg-foreground opacity-5 blur-lg transition-transform duration-500 group-hover:scale-125" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-secondary border border-border text-foreground transition-all duration-300 group-hover:border-foreground/30 group-hover:scale-110">
            <Instagram className="w-9 h-9 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
          </div>
        </div>
      </div>

      {/* Extra styles for bounce horizontal */}
      <style>{`
        @keyframes bounceH {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        .animate-bounce-h {
          animation: bounceH 1.2s infinite;
        }
      `}</style>
    </motion.div>
  );
}
