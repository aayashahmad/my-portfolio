import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { profile } from "../data/profile";

const links = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

export default function Navbar({ theme, onToggleTheme }) {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the nav link for whichever section is in the middle of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // The swarm engine is only downloaded the first time someone presses Motion.
  const playMotion = async (e) => {
    const button = e.currentTarget;
    const menuWasOpen = open;
    setOpen(false);
    const [{ runSwarm }] = await Promise.all([
      import("./swarm/swarm"),
      new Promise((r) => setTimeout(r, menuWasOpen ? 350 : 0)), // let the mobile menu close first
    ]);
    runSwarm({ returnFocus: button });
  };

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <div className="nav__inner container">
        <a href="#top" className="nav__logo" onClick={() => setOpen(false)}>
          <span className="nav__logo-mark">AA</span>
          <span>{profile.shortName}</span>
        </a>

        <nav className={`nav__links ${open ? "is-open" : ""}`} aria-label="Primary">
          {links.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? "is-active" : ""}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <button
            type="button"
            className="btn btn--ghost btn--sm nav__motion"
            onClick={playMotion}
            aria-label="Motion: watch this page get rebuilt by a swarm of cursors"
            title="Watch this page get rebuilt"
          >
            <i className="fas fa-wand-magic-sparkles" aria-hidden="true" />
            <span className="nav__motion-label">Motion</span>
          </button>
          <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle color theme">
            <i className={theme === "dark" ? "fas fa-sun" : "fas fa-moon"} />
          </button>
          <a className="btn btn--primary btn--sm nav__cta" href={profile.cv} download="Aayash_Ahmad_Bhat_Resume.pdf">
            Resume
          </a>
          <button
            className="icon-btn nav__burger"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <i className={open ? "fas fa-xmark" : "fas fa-bars"} />
          </button>
        </div>
      </div>
      <motion.span className="nav__progress" style={{ scaleX: progress }} aria-hidden="true" />
    </header>
  );
}
