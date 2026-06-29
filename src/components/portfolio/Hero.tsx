import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const roles = [
  "Full Stack Developer",
  "Java Developer",
  "Software Engineer",
  "Problem Solver",
  "Tech Creator"
];

function Typewriter() {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);

  useEffect(() => {
    const current = roles[i];
    const speed = del ? 30 : 70;
    const t = setTimeout(() => {
      if (!del) {
        setText(current.slice(0, text.length + 1));
        if (text.length + 1 === current.length) setTimeout(() => setDel(true), 1800);
      } else {
        setText(current.slice(0, text.length - 1));
        if (text.length - 1 === 0) {
          setDel(false);
          setI((i + 1) % roles.length);
        }
      }
    }, speed);
    return () => clearTimeout(t);
  }, [text, del, i]);

  return (
    <span className="text-foreground font-semibold font-mono tracking-tight">
      {text}
      <span className="animate-pulse text-foreground/50 font-bold ml-1">|</span>
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 md:px-16 pt-32 pb-24 border-b border-border/20">
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-6 pointer-events-none opacity-[0.02] dark:opacity-[0.05]">
        <div className="border-r border-foreground h-full" />
        <div className="border-r border-foreground h-full" />
        <div className="border-r border-foreground h-full" />
        <div className="border-r border-foreground h-full hidden md:block" />
        <div className="border-r border-foreground h-full hidden md:block" />
        <div className="border-r border-foreground h-full" />
      </div>

      {/* Top Corner Details */}
      <div className="absolute top-10 right-8 text-[9px] tracking-[0.4em] font-mono text-foreground/40 uppercase">
        Pavani Naidu &copy; 2026
      </div>

      <div className="relative max-w-7xl w-full mx-auto grid lg:grid-cols-[1.3fr_1fr] gap-16 items-center z-10">
        
        {/* Left Column: Heading & Copy */}
        <div className="space-y-8 text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary border border-border text-foreground text-xs font-semibold uppercase tracking-[0.2em] font-mono"
          >
            BTech CSE Student
          </motion.div>

          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-display text-[12vw] sm:text-[5rem] md:text-[6.5rem] lg:text-[7.5rem] leading-[0.9] tracking-tighter text-foreground"
            >
              PAVANI
              <br />
              NAIDU<span className="text-foreground/40">.</span>
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-muted-foreground flex items-center gap-2"
            >
              <span>I am a</span>
              <Typewriter />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-muted-foreground max-w-lg text-base md:text-lg leading-relaxed"
          >
            Building clean, responsive web applications and studying computer science. Third-year student at Malla Reddy University.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <a 
              href="#projects" 
              className="group relative px-8 py-3.5 rounded-full bg-foreground text-background font-semibold hover:opacity-90 transition-all duration-300 shadow-md flex items-center gap-2"
            >
              Explore Projects
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a 
              href="#contact" 
              className="px-8 py-3.5 rounded-full border border-foreground/30 font-semibold hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300"
            >
              Get In Touch
            </a>
          </motion.div>
        </div>

        {/* Right Column: Clean Text Stats Panel (No glass boxes / containers) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="hidden lg:flex flex-col justify-center space-y-10 border-l border-border/40 pl-16 py-4 text-left"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Institution</span>
            <h4 className="text-2xl font-display-sub text-foreground">Malla Reddy University</h4>
            <p className="text-xs text-muted-foreground">BTech CSE &middot; 3rd Year</p>
          </div>
          
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Focus Area</span>
            <h4 className="text-2xl font-display-sub text-foreground">Software Engineering</h4>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Live Web Projects</span>
            <h4 className="text-4xl font-bold font-display text-foreground tracking-tight">4+ Projects</h4>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Primary Language</span>
            <h4 className="text-4xl font-bold font-display text-foreground tracking-tight">Java</h4>
          </div>
        </motion.div>
      </div>

      {/* Floating Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none">
        <span className="text-[9px] uppercase tracking-[0.3em] text-foreground/40 font-mono">Scroll</span>
        <motion.div 
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-0.5 h-3 rounded-full bg-foreground/40"
        />
      </div>
    </section>
  );
}