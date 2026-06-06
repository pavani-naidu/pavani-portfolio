import { motion } from "framer-motion";
import { Reveal, SectionTitle } from "./Reveal";

export function About() {
  return (
    <section id="about" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionTitle kicker="01 — Who I Am" title="About Me" />
        <Reveal>
          <div className="glass rounded-3xl p-8 md:p-14 space-y-6 text-lg leading-relaxed text-foreground/90">
            <p>
              I'm <span className="text-accent font-semibold font-display-sub">Pavani Naidu</span>, a Full Stack Developer driven by curiosity, creativity, and continuous learning. Currently pursuing Computer Science Engineering (Blockchain Technology) at Malla Reddy University, I enjoy building modern web applications that combine functionality with great user experiences.
            </p>
            <p className="text-muted-foreground">
              From crafting responsive websites to strengthening my problem-solving skills through DSA and Java, I believe every line of code is a step toward something bigger. My journey is fueled by the ambition to become a software engineer who builds products that people love to use and remember.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const skillGroups = [
  { title: "Languages", items: ["Java", "JavaScript", "Python"] },
  { title: "Frontend", items: ["HTML5", "CSS3", "JavaScript", "Responsive Design"] },
  { title: "Backend", items: ["Java", "REST APIs"] },
  { title: "Database", items: ["SQL"] },
  { title: "Tools", items: ["Git", "GitHub", "VS Code"] },
  { title: "Core Concepts", items: ["DSA", "OOP", "System Design"] },
];

export function Skills() {
  return (
    <section id="skills" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionTitle kicker="02 — Toolkit" title="Skills" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillGroups.map((g, i) => (
            <Reveal key={g.title} delay={i * 0.08}>
              <div className="glass rounded-2xl p-6 h-full hover:bg-accent/5 hover:-translate-y-1 transition-all duration-300 group">
                <h3 className="text-sm uppercase tracking-[0.2em] text-accent mb-4 font-display-sub">{g.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <span key={s} className="px-3 py-1.5 rounded-full text-sm bg-secondary/60 border border-border group-hover:border-accent/40 transition-colors">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const projects = [
  { title: "Ember Placement", desc: "A modern placement preparation platform designed to help students prepare effectively for placements.", url: "https://ember-placementt.netlify.app", tech: ["HTML", "CSS", "JavaScript"] },
  { title: "Green Family Salon", desc: "A professional salon and spa website featuring modern UI, service showcases, and responsive design.", url: "https://greensfamilysalonn.netlify.app", tech: ["HTML", "CSS", "JavaScript"] },
  { title: "Summer Bistro Cafe", desc: "A stylish cafe website with elegant design, menu presentation, and responsive user experience.", url: "https://summer-bistro-cafe.netlify.app", tech: ["HTML", "CSS", "JavaScript"] },
  { title: "Mobixo", desc: "A modern refurbished mobile marketplace concept with user-friendly design and product showcase.", url: "https://mobixo.netlify.app", tech: ["HTML", "CSS", "JavaScript"] },
];

export function Projects() {
  return (
    <section id="projects" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionTitle kicker="03 — Selected Work" title="Projects" />
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <a 
                href={p.url} 
                target="_blank" 
                rel="noreferrer" 
                className="group block glass rounded-3xl overflow-hidden hover:-translate-y-1 hover:border-foreground/30 transition-all duration-300 p-8 md:p-10" 
                data-cursor-hover
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-bold font-display-sub group-hover:text-foreground/70 transition-colors">{p.title}</h3>
                  <span className="text-foreground/45 text-2xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</span>
                </div>
                <p className="mt-3 text-muted-foreground leading-relaxed">{p.desc}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">{t}</span>
                  ))}
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const milestones = [
  "Full Stack Development Learning Journey",
  "Computer Science Engineering Focus",
  "Multiple Real-World Website Projects",
  "Continuous DSA Practice",
  "Open Source Learning with GitHub",
];

export function Achievements() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionTitle kicker="04 — Milestones" title="Achievements" />
        <div className="relative pl-8 border-l border-accent/40">
          {milestones.map((m, i) => (
            <Reveal key={m} delay={i * 0.1}>
              <div className="relative mb-10 last:mb-0">
                <div className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full bg-accent glow-accent" />
                <p className="text-lg text-foreground/90">{m}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Education() {
  return (
    <section id="education" className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <SectionTitle kicker="05 — Academic" title="Education" />
        <Reveal>
          <div className="glass rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
            <p className="text-sm uppercase tracking-[0.3em] text-accent font-mono">2023 — Present</p>
            <h3 className="mt-3 text-3xl md:text-4xl font-bold font-display-sub">Malla Reddy University</h3>
            <p className="mt-2 text-xl text-foreground/90">Bachelor of Technology</p>
            <p className="text-muted-foreground">Computer Science Engineering (Blockchain Technology)</p>
            <div className="mt-6 inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-medium">
              Current Year: 3rd Year
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Contact() {
  const email = "pavaninaidu76@gmail.com";
  
  return (
    <section id="contact" className="relative py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionTitle kicker="06 — Let's Connect" title="Get In Touch" />
        <Reveal>
          <div className="glass rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-accent/20 blur-3xl" />
            <p className="text-muted-foreground text-lg">Open to internships, collaborations, and professional conversations.</p>
            <p className="mt-6 text-2xl md:text-3xl font-bold text-foreground break-all font-display-sub">{email}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a 
                href={`mailto:${email}`} 
                className="px-6 py-3 rounded-full bg-accent text-accent-foreground font-semibold hover:scale-105 transition-transform glow-accent" 
                data-cursor-hover
              >
                Email Me
              </a>
              <a 
                href="https://www.linkedin.com/in/pavani-mandela" 
                target="_blank" 
                rel="noreferrer" 
                className="px-6 py-3 rounded-full glass font-semibold hover:bg-accent/10 transition-colors" 
                data-cursor-hover
              >
                LinkedIn
              </a>
            </div>
          </div>
        </Reveal>
        <motion.footer
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-20 text-center text-sm text-muted-foreground"
        >
          <p>© 2026 Pavani Naidu</p>
          <p className="mt-1">Crafted with passion, creativity, and code.</p>
        </motion.footer>
      </div>
    </section>
  );
}