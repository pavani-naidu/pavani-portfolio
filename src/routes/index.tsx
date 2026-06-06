import { createFileRoute } from "@tanstack/react-router";
import { Loader } from "@/components/portfolio/Loader";
import { SmoothScroll } from "@/components/portfolio/SmoothScroll";
import { Background } from "@/components/portfolio/Background";
import { Nav } from "@/components/portfolio/Nav";
import { Hero } from "@/components/portfolio/Hero";
import { About, Skills, Projects, Achievements, Education, Contact } from "@/components/portfolio/Sections";
import { OceanFlowCard } from "@/components/portfolio/OceanFlowCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pavani Naidu — Full Stack Developer" },
      { name: "description", content: "Portfolio of Pavani Naidu — Full Stack Developer, CSE student at Malla Reddy University." },
      { property: "og:title", content: "Pavani Naidu — Full Stack Developer" },
      { property: "og:description", content: "Building tomorrow through code. Projects, skills, and the journey of a future software engineer." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <SmoothScroll />
      <Background />
      <Loader />
      <Nav />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Achievements />
      <Education />
      <div className="py-10 px-6 relative max-w-5xl mx-auto">
        <OceanFlowCard />
      </div>
      <Contact />
    </main>
  );
}


