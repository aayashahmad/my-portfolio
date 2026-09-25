import React from "react";

// Endless horizontal strip. The list is rendered twice so the loop is seamless.
export default function Marquee({ items }) {
  const row = (hidden) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item}>
          {item}
          <span className="marquee__sep">✦</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee" role="region" aria-label="Technologies I use">
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
