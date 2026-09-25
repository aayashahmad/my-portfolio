import React from "react";
import Reveal, { SectionHeader } from "../ui/Reveal";
import { skills } from "../../data/profile";

export default function Skills() {
  return (
    <section className="section" id="skills">
      <div className="container">
        <SectionHeader index="04" eyebrow="Skills" title={<>Tools I <em>use</em></>} />

        <div className="skills">
          {skills.map((g, i) => (
            <Reveal key={g.group} delay={i * 0.05} className="skill-row">
              <h3 className="mono">{g.group}</h3>
              <div className="tags">
                {g.items.map((s) => (
                  <span key={s} className="tag tag--lg">{s}</span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
