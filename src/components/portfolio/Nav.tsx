import { motion } from "framer-motion";

const links = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2.3, duration: 0.6 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass rounded-full px-2 py-2 hidden md:flex items-center gap-1"
    >
      <span className="px-4 py-1.5 text-sm font-semibold text-foreground">PN</span>
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-full transition-colors"
        >
          {l.label}
        </a>
      ))}
    </motion.nav>
  );
}