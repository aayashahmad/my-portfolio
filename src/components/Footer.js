import React, { useEffect, useState } from "react";
import { profile } from "../data/profile";

const nav = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

function useKashmirTime() {
  const format = () =>
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date());
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = setInterval(() => setTime(format()), 15000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Footer() {
  const time = useKashmirTime();
  const connect = [
    ...profile.socials.map((s) => ({ ...s, external: s.label !== "Email" })),
    { label: "Resume", href: profile.cv, icon: "fas fa-file-arrow-down", download: "Aayash_Ahmad_Bhat_Resume.pdf" },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <a href="#top" className="nav__logo">
              <span className="nav__logo-mark">AA</span>
              <span>{profile.name}</span>
            </a>
            <p>React and React Native developer from Kashmir, building web and mobile apps at Kupos.cl.</p>
            {profile.available && (
              <span className="status">
                <span className="status__dot" /> Open to work
              </span>
            )}
          </div>

          <nav className="footer__col" aria-label="Footer">
            <span className="mono footer__label">Navigate</span>
            <ul>
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__col">
            <span className="mono footer__label">Connect</span>
            <ul>
              {connect.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    {...(c.download ? { download: c.download } : {})}
                  >
                    <i className={c.icon} /> {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col footer__side">
            <span className="mono footer__label">Local time</span>
            <p className="footer__time">
              {time} <span>IST</span>
            </p>
            <a href="#top" className="footer__top">
              Back to top <i className="fas fa-arrow-up" />
            </a>
          </div>
        </div>
      </div>

      <div className="footer__base">
        <div className="container footer__base-inner mono">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>Built with React &amp; three.js</span>
        </div>
      </div>
    </footer>
  );
}
