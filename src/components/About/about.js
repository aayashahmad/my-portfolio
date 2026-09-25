import React from "react";
import Reveal, { SectionHeader } from "../ui/Reveal";
import Tilt from "../ui/Tilt";
import { profile, education } from "../../data/profile";

const highlights = [
  { title: "Web and mobile", text: "I work on the React website and the React Native app, not just one of them." },
  { title: "I like reusable parts", text: "If I have to build something twice, I turn it into a component." },
  { title: "I don't mind bugs", text: "Tracking bugs down has taught me more than any tutorial." },
];

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <SectionHeader index="01" eyebrow="About" title={<>A bit <em>about me</em></>} />

        <div className="about__grid">
          <Reveal className="about__photo-wrap">
            <Tilt className="about__photo" max={10}>
              <img src={profile.photo} alt={profile.name} loading="lazy" />
              <div className="about__photo-caption mono">
                <span>{profile.location}</span>
              </div>
            </Tilt>
          </Reveal>

          <div className="about__text">
            <Reveal className="about__bio">
              {profile.about.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Reveal>

            <ul className="about__list">
              {highlights.map((h, i) => (
                <Reveal as="li" key={h.title} delay={i * 0.06}>
                  <span className="mono">0{i + 1}</span>
                  <div>
                    <h3>{h.title}</h3>
                    <p>{h.text}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>

        <Reveal className="edu">
          {education.map((e) => (
            <div key={e.title} className="edu__item">
              <span className="mono">{e.cert ? "Certificate" : "Degree"}</span>
              <strong>{e.title}</strong>
              <span>{e.place}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
