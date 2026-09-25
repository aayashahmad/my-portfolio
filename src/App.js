import React, { useEffect, useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About/about";
import Experience from "./components/Experience/experience";
import Projects from "./components/myProjects/projects";
import Skills from "./components/Skills/skills";
import Contact from "./components/contact";
import Footer from "./components/Footer";
import Marquee from "./components/ui/Marquee";
import AIAssistButton from "./components/aiAgent/aiAssistAgent";
import { skills } from "./data/profile";

const marqueeItems = skills.slice(0, 3).flatMap((g) => g.items).slice(0, 12);

function initialTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
  } catch {}
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function App() {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  return (
    <>
      <Navbar theme={theme} onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />
      <main>
        <Hero />
        <Marquee items={marqueeItems} />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
      <AIAssistButton />
    </>
  );
}

export default App;
