import React, { useState } from "react";
import { MaskReveal } from "./ui/Reveal";
import Magnetic from "./ui/Magnetic";
import { profile } from "../data/profile";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="contact">
          <div className="section-header__label mono">
            <span>05</span>
            <span className="section-header__line" />
            <span>Contact</span>
          </div>
          <h2>
            <MaskReveal>Want to</MaskReveal>
            <MaskReveal delay={0.1}>
              <em>work together?</em>
            </MaskReveal>
          </h2>
          <p className="section-lead">
            I'm looking for full-time roles and freelance work in React or React Native. Email is the best way to reach me.
          </p>

          <div className="contact__actions">
            <Magnetic>
              <a className="btn btn--primary btn--lg" href={`mailto:${profile.email}`}>
                Send an email <i className="fas fa-arrow-right arrow-ne" />
              </a>
            </Magnetic>
            <button className="btn btn--ghost" onClick={copyEmail}>
              <i className={copied ? "fas fa-check" : "far fa-copy"} /> {copied ? "Copied!" : profile.email}
            </button>
          </div>

          <div className="contact__meta">
            <a href={`tel:${profile.phone.replace(/\s/g, "")}`}>
              <i className="fas fa-phone" /> {profile.phone}
            </a>
            {profile.socials
              .filter((s) => s.label !== "Email")
              .map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                  <i className={s.icon} /> {s.label}
                </a>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
