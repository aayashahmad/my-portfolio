import React from "react";
import Reveal, { SectionHeader } from "../ui/Reveal";
import { experience } from "../../data/profile";

export default function Experience() {
  return (
    <section className="section" id="experience">
      <div className="container">
        <SectionHeader index="02" eyebrow="Experience" title={<>Where I've <em>worked</em></>} />

        <ol className="jobs">
          {experience.map((job) => (
            <Reveal as="li" key={job.company} className="job">
              <div className="job__side">
                <span className="mono">{job.period}</span>
                {job.current && (
                  <span className="status">
                    <span className="status__dot" /> Current
                  </span>
                )}
              </div>
              <div className="job__main">
                <h3>
                  {job.role}{" "}
                  <span className="job__at">
                    at{" "}
                    {job.href ? (
                      <a href={job.href} target="_blank" rel="noreferrer">{job.company}</a>
                    ) : (
                      job.company
                    )}
                  </span>
                </h3>
                <ul className="job__points">
                  {job.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <div className="tags">
                  {job.tags.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
