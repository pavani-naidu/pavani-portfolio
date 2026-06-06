import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function Loader() {
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 900);
    const t2 = setTimeout(() => setDone(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-background"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-display text-foreground uppercase"
            >
              Pavani Naidu
            </motion.h1>
            <motion.p
              key={stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-sm uppercase tracking-[0.3em] text-muted-foreground"
            >
              {stage === 0 ? "Initializing..." : "Building the Future..."}
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "12rem" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="mx-auto mt-8 h-px bg-accent glow-accent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}