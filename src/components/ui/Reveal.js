import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1];

// Fades + lifts children into view once as they scroll on screen.
export default function Reveal({ children, delay = 0, as = "div", className, ...rest }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Slides text up from behind an invisible edge, like a line being "printed".
export function MaskReveal({ children, delay = 0, onMount = false, className = "" }) {
  const reduce = useReducedMotion();
  const trigger = onMount ? { animate: { y: "0%" } } : { whileInView: { y: "0%" }, viewport: { once: true, margin: "-60px" } };

  return (
    <span className={`mask ${className}`}>
      <motion.span
        className="mask__inner"
        initial={reduce ? false : { y: "110%" }}
        transition={{ duration: 1, delay, ease }}
        {...trigger}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function SectionHeader({ index, eyebrow, title, children }) {
  return (
    <div className="section-header">
      <Reveal className="section-header__label mono">
        <span>{index}</span>
        <span className="section-header__line" />
        <span>{eyebrow}</span>
      </Reveal>
      <h2>
        <MaskReveal delay={0.05}>{title}</MaskReveal>
      </h2>
      {children && (
        <Reveal delay={0.15}>
          <p className="section-lead">{children}</p>
        </Reveal>
      )}
    </div>
  );
}
