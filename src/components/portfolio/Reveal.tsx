import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const v: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      variants={v}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <Reveal className="mb-16 flex items-end gap-6">
      <div>
        <p className="font-serif-italic text-lg md:text-xl text-foreground/60 mb-2 normal-case tracking-normal">{kicker}</p>
        <h2 className="font-display text-5xl md:text-7xl leading-[0.9]">
          {title}<span className="text-accent">.</span>
        </h2>
      </div>
      <div className="flex-1 h-px bg-foreground/30 mb-3" />
    </Reveal>
  );
}