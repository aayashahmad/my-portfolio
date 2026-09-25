import React from "react";
import Reveal, { SectionHeader } from "../ui/Reveal";
import Tilt from "../ui/Tilt";
import { projects, privateWork } from "../../data/profile";

const repoName = (url) => url.split("/").pop();
const host = (url) => url.replace(/^https?:\/\//, "");

// Screenshot in a browser frame for live sites; a terminal card for code-only repos.
function Media({ p }) {
  if (p.image) {
    return (
      <div className="media media--browser">
        <div className="media__bar">
          <span /><span /><span />
          <em className="mono">{host(p.live)}</em>
        </div>
        <div className="media__shot">
          <img src={p.image} alt={`${p.title} home page`} loading="lazy" />
        </div>
      </div>
    );
  }
  const name = repoName(p.repo);
  return (
    <div className="media media--terminal mono" aria-hidden="true">
      <div className="media__bar">
        <span /><span /><span />
        <em>zsh</em>
      </div>
      <div className="media__code">
        <p><b>~</b> git clone github.com/aayashahmad/{name}</p>
        <p><b>~</b> cd {name} &amp;&amp; npm start</p>
        <p className="media__out">✓ {p.stack.join(" · ")}</p>
        <p><b>~</b> <span className="caret" /></p>
      </div>
    </div>
  );
}

function ProjectCard({ p, index }) {
  const href = p.live || p.repo;
  return (
    <Tilt as="article" max={4} className="project">
      <a href={href} target="_blank" rel="noreferrer" className="project__media-link" tabIndex={-1} aria-hidden="true">
        <Media p={p} />
      </a>
      <div className="project__body">
        <div className="project__top mono">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{p.kind}</span>
        </div>
        <h3>{p.title}</h3>
        <p>{p.description}</p>
        <div className="tags">
          {p.stack.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
        <div className="project__links">
          <a href={p.repo} target="_blank" rel="noreferrer">
            Code <i className="fas fa-arrow-right arrow-ne" />
          </a>
          {p.live && (
            <a href={p.live} target="_blank" rel="noreferrer">
              Live site <i className="fas fa-arrow-right arrow-ne" />
            </a>
          )}
        </div>
      </div>
    </Tilt>
  );
}

function PrivateCard({ p, index }) {
  return (
    <article className="project project--private">
      <div className="project__body">
        <div className="project__top mono">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>
            <i className="fas fa-lock" /> {p.kind}
          </span>
        </div>
        <h3>{p.title}</h3>
        <p>{p.description}</p>
        <div className="tags">
          {p.stack.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  return (
    <section className="section" id="projects">
      <div className="container">
        <SectionHeader index="03" eyebrow="Projects" title={<>Things I've <em>built</em></>}>
          Side projects and college work. The rest are on{" "}
          <a href="https://github.com/aayashahmad" target="_blank" rel="noreferrer">GitHub</a>.
        </SectionHeader>

        <div className="projects">
          {projects.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 0.1} className="project-wrap">
              <ProjectCard p={p} index={i} />
            </Reveal>
          ))}
        </div>

        <Reveal className="private-head">
          <h3>
            <i className="fas fa-lock" /> Private work
          </h3>
          <p>
            Most of the code I write at work is in private company repos, so you won't see it on my GitHub.
            Here's what I work on there.
          </p>
        </Reveal>

        <div className="projects projects--private">
          {privateWork.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08} className="project-wrap">
              <PrivateCard p={p} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
