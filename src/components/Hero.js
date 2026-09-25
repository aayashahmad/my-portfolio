import React, { Suspense, lazy, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { MaskReveal } from "./ui/Reveal";
import Magnetic from "./ui/Magnetic";
import { profile, stats } from "../data/profile";

// three.js is ~120 KB gzipped, so it loads after the text is already on screen.
const DeviceScene = lazy(() => import("./three/DeviceScene"));

export default function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sceneY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const fade = (delay) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
        };

  return (
    <section className="hero" id="top" ref={ref}>
      <motion.div
        className="hero-scene-wrap"
        style={reduce ? undefined : { y: sceneY, scale: sceneScale, opacity: sceneOpacity }}
      >
        <Suspense fallback={null}>
          <DeviceScene />
        </Suspense>
      </motion.div>

      <div className="container hero__inner">
        <motion.div className="hero__meta" {...fade(0)}>
          <span className="mono">{profile.role}</span>
          <span className="hero__rule" />
          {profile.available && (
            <span className="status">
              <span className="status__dot" /> Open to work
            </span>
          )}
        </motion.div>

        <h1 className="hero__title">
          <MaskReveal onMount delay={0.1} className="line">I build web and</MaskReveal>
          <MaskReveal onMount delay={0.2} className="line">mobile apps</MaskReveal>
          <MaskReveal onMount delay={0.3} className="line">
            <em>with React.</em>
          </MaskReveal>
        </h1>

        <div className="hero__bottom">
          <motion.p className="hero__tagline" {...fade(0.55)}>
            {profile.tagline}
          </motion.p>

          <motion.div className="hero__cta" {...fade(0.65)}>
            <Magnetic>
              <a className="btn btn--primary" href={profile.cv} download="Aayash_Ahmad_Bhat_Resume.pdf">
                Download CV <i className="fas fa-arrow-down" />
              </a>
            </Magnetic>
            <Magnetic>
              <a className="btn btn--ghost" href="#projects">
                See my work
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </div>

      <div className="container">
        <motion.dl className="stats" {...fade(0.8)}>
          {stats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
