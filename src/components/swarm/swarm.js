// "Swarm" build animation.
//
// Press the Motion button: the visible page dissolves to a blank canvas and a crew of
// multiplayer-style cursors rebuilds it piece by piece. They drag out boxes with a live
// W × H badge, type the text back in, and sweep the images into place. Then the overlay
// fades away and the real, clickable page is underneath.
//
// Inspired by Joel Califa's Swarm (https://califa.github.io/swarm-site/). This is an
// independent implementation; no code from that site or from swarm-Antigravity is used.
//
// The module is self-contained and lazy-loaded, so it adds nothing to the initial bundle.

import "./swarm.css";

const CREW = [
  { name: "Aayash's Agent 1", color: "#ff6a3d", ink: "#111" },
  { name: "Aayash's Agent 2", color: "#7c5cff", ink: "#fff" },
  { name: "Aayash's Agent 3", color: "#22a6f2", ink: "#fff" },
  { name: "Aayash's Agent 4", color: "#2fbf71", ink: "#fff" },
  { name: "Aayash's Agent 5", color: "#ffc933", ink: "#111" },
  { name: "Aayash's Agent 6", color: "#ff4d8d", ink: "#fff" },
  { name: "Aayash's Agent 7", color: "#14c8b4", ink: "#111" },
  { name: "Aayash's Agent 8", color: "#a3e635", ink: "#111" },
];

const MAX_TASKS = 220; // everything past this appears on its own, without a cursor
const TINY = 10; // px — smaller than this isn't worth a cursor trip
const TARGET_MS = 7000; // roughly how long the build should take, before speed-up

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "LINK", "META", "HEAD", "TITLE"]);
const MEDIA_TAGS = new Set(["IMG", "CANVAS", "VIDEO", "IFRAME", "PICTURE", "svg"]);
const FIELD_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "ArrowUp", "ArrowDown", "Home", "End"]);

const TEXT_PROPS = [
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-stretch",
  "font-variant",
  "font-feature-settings",
  "font-variation-settings",
  "line-height",
  "letter-spacing",
  "word-spacing",
  "text-transform",
  "text-decoration-line",
  "text-decoration-color",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-underline-offset",
  "text-shadow",
  "-webkit-text-fill-color",
  "-webkit-text-stroke-width",
  "-webkit-text-stroke-color",
];
const BLOCK_TEXT_PROPS = ["text-align", "text-indent", "white-space", "word-break", "overflow-wrap", "hyphens", "direction"];
const SIDES = ["top", "right", "bottom", "left"];
const CORNERS = ["top-left", "top-right", "bottom-right", "bottom-left"];
const PADDING = SIDES.map((s) => `padding-${s}`);
const BORDER_WIDTHS = SIDES.map((s) => `border-${s}-width`);
const INLINE_BOX_PROPS = [
  "display",
  "vertical-align",
  ...PADDING,
  ...SIDES.map((s) => `margin-${s}`),
  "background-color",
  ...CORNERS.map((c) => `border-${c}-radius`),
  ...SIDES.flatMap((s) => [`border-${s}-width`, `border-${s}-style`, `border-${s}-color`]),
];
const FLEX_PROPS = ["flex-direction", "flex-wrap", "justify-content", "align-items", "align-content", "row-gap", "column-gap"];
const BOX_PROPS = [
  "background-color",
  "background-image",
  "background-size",
  "background-position",
  "background-repeat",
  "background-origin",
  "background-clip",
  "box-shadow",
  "backdrop-filter",
  "-webkit-backdrop-filter",
  "filter",
  ...CORNERS.map((c) => `border-${c}-radius`),
  ...SIDES.flatMap((s) => [`border-${s}-width`, `border-${s}-style`, `border-${s}-color`]),
];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const linear = (t) => t;
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

let active = null;

/** Start the animation. Resolves when the page is live again. Calling it while running is a no-op. */
export function runSwarm(options = {}) {
  if (active) return active.finished;
  active = new Swarm(options);
  active.finished.finally(() => (active = null));
  return active.finished;
}

export function stopSwarm() {
  active?.abort();
}

// ─────────────────────────────────────────────────────────── snapshot ──

function alphaOf(color) {
  if (!color || color === "transparent") return 0;
  const slash = color.match(/\/\s*([\d.]+)(%?)\s*\)$/);
  if (slash) return slash[2] ? parseFloat(slash[1]) / 100 : parseFloat(slash[1]);
  const rgba = color.match(/^rgba\(([^)]+)\)$/);
  if (rgba) return parseFloat(rgba[1].split(",")[3]);
  return 1;
}

const sameColor = (a, b) => a.replace(/\s/g, "") === b.replace(/\s/g, "");
const clipsText = (cs) => `${cs.backgroundClip} ${cs.webkitBackgroundClip}`.includes("text");

function intersect(a, b) {
  return { l: Math.max(a.l, b.l), t: Math.max(a.t, b.t), r: Math.min(a.r, b.r), b: Math.min(a.b, b.b) };
}
const toBox = (r) => ({ l: r.left, t: r.top, r: r.right, b: r.bottom });
const isEmpty = (c) => c.r - c.l < 1 || c.b - c.t < 1;

function copyProps(target, cs, props) {
  for (const p of props) {
    const v = cs.getPropertyValue(p);
    if (v) target.style.setProperty(p, v);
  }
}

function hasDirectText(el) {
  for (const n of el.childNodes) if (n.nodeType === 3 && /\S/.test(n.data)) return true;
  return false;
}

function childrenAreInline(el) {
  for (const c of el.children) {
    if (c.tagName === "BR") continue;
    const d = getComputedStyle(c).display;
    if (d === "none") continue;
    if (!d.startsWith("inline") && d !== "contents") return false;
  }
  return true;
}

const isIcon = (el) => /\bfa[a-z-]*\b/.test(el.getAttribute("class") || "") && !el.textContent.trim();

function isBox(el, cs, rect, pageBg, vw) {
  const bg = alphaOf(cs.backgroundColor) > 0.03;
  const img = cs.backgroundImage !== "none" && !clipsText(cs);
  const border = SIDES.some((s) => {
    const k = s[0].toUpperCase() + s.slice(1);
    return parseFloat(cs[`border${k}Width`]) > 0 && cs[`border${k}Style`] !== "none" && alphaOf(cs[`border${k}Color`]) > 0.03;
  });
  const shadow = cs.boxShadow && cs.boxShadow !== "none";
  const blur = (cs.backdropFilter || cs.webkitBackdropFilter || "none") !== "none";
  if (!(bg || img || border || shadow || blur)) return false;
  // A full-width band painted the same colour as the page adds nothing visible.
  if (!img && !border && !shadow && !blur && sameColor(cs.backgroundColor, pageBg) && rect.width >= vw * 0.9) return false;
  return true;
}

/** Deep-clone an inline text run, baking each element's computed style in (selectors won't match inside the overlay). */
function cloneText(el) {
  const clone = el.cloneNode(true);
  const src = [el, ...el.querySelectorAll("*")];
  const dst = [clone, ...clone.querySelectorAll("*")];
  dst.forEach((node, i) => {
    const orig = src[i];
    if (!orig) return;
    node.removeAttribute("id");
    node.removeAttribute("href");
    node.removeAttribute("style");
    node.removeAttribute("tabindex");
    // Keep only icon-font classes so their glyphs still resolve; drop the rest so page CSS can't leak in.
    const cls = (node.getAttribute("class") || "").split(/\s+/).filter((c) => /^fa/.test(c));
    if (cls.length) node.setAttribute("class", cls.join(" "));
    else node.removeAttribute("class");
    if (i === 0) return;
    const cs = getComputedStyle(orig);
    copyProps(node, cs, TEXT_PROPS);
    copyProps(node, cs, INLINE_BOX_PROPS);
    if (cs.display !== "inline") {
      const r = orig.getBoundingClientRect();
      node.style.width = `${r.width}px`;
      node.style.height = `${r.height}px`;
      node.style.boxSizing = "border-box";
    }
    if (clipsText(cs)) {
      copyProps(node, cs, ["background-image", "background-size", "background-position"]);
      node.style.setProperty("-webkit-background-clip", "text");
      node.style.setProperty("background-clip", "text");
    }
  });
  clone.setAttribute("aria-hidden", "true");
  return clone;
}

function styleTextRoot(node, el, cs, rect) {
  copyProps(node, cs, TEXT_PROPS);
  copyProps(node, cs, BLOCK_TEXT_PROPS);
  copyProps(node, cs, PADDING);
  copyProps(node, cs, BORDER_WIDTHS);
  node.style.borderStyle = "solid";
  node.style.borderColor = "transparent";
  node.style.margin = "0";
  node.style.boxSizing = "border-box";
  node.style.width = "100%";
  node.style.height = "100%";
  node.style.overflow = "visible";
  const d = cs.display;
  if (d.includes("flex")) {
    node.style.display = "flex";
    copyProps(node, cs, FLEX_PROPS);
  } else if (d.includes("grid")) {
    node.style.display = "grid";
    copyProps(node, cs, [...FLEX_PROPS, "grid-template-columns", "grid-template-rows"]);
  } else {
    node.style.display = "block";
  }
  // A one-line label must stay one line even if sub-pixel rounding shaves a hair off the width.
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3;
  if (rect.height < lh * 1.6) node.style.whiteSpace = "nowrap";
  if (clipsText(cs)) {
    copyProps(node, cs, ["background-image", "background-size", "background-position"]);
    node.style.setProperty("-webkit-background-clip", "text");
    node.style.setProperty("background-clip", "text");
  } else {
    node.style.background = "none";
  }
}

function fieldText(el, cs) {
  if (el.type === "hidden" || el.type === "checkbox" || el.type === "radio") return null;
  const value = el.tagName === "SELECT" ? el.selectedOptions?.[0]?.text : el.value;
  const text = value || el.placeholder || "";
  if (!text.trim()) return null;
  const node = document.createElement("div");
  node.textContent = text;
  copyProps(node, cs, TEXT_PROPS);
  copyProps(node, cs, PADDING);
  copyProps(node, cs, BORDER_WIDTHS);
  Object.assign(node.style, {
    borderStyle: "solid",
    borderColor: "transparent",
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    whiteSpace: el.tagName === "TEXTAREA" ? "pre-wrap" : "nowrap",
    overflow: "hidden",
    display: el.tagName === "TEXTAREA" ? "block" : "flex",
    alignItems: "center",
    textAlign: cs.textAlign,
  });
  if (!value) node.style.opacity = "0.55";
  return node;
}

function mediaNode(el, cs, rect, mirrors) {
  const tag = el.tagName;
  const radius = {};
  CORNERS.forEach((c) => (radius[c] = cs.getPropertyValue(`border-${c}-radius`)));
  const applyRadius = (n) => CORNERS.forEach((c) => n.style.setProperty(`border-${c}-radius`, radius[c]));

  if (tag === "IMG" || tag === "PICTURE") {
    const img = tag === "IMG" ? el : el.querySelector("img");
    if (!img) return null;
    const n = new Image();
    n.src = img.currentSrc || img.src;
    n.alt = "";
    n.decoding = "async";
    n.draggable = false;
    Object.assign(n.style, {
      width: "100%",
      height: "100%",
      display: "block",
      objectFit: getComputedStyle(img).objectFit,
      objectPosition: getComputedStyle(img).objectPosition,
    });
    applyRadius(n);
    return n;
  }
  if (tag === "svg") {
    const n = el.cloneNode(true);
    n.removeAttribute("id");
    n.setAttribute("width", rect.width);
    n.setAttribute("height", rect.height);
    n.setAttribute("aria-hidden", "true");
    n.style.color = cs.color;
    n.style.display = "block";
    ["fill", "stroke", "stroke-width"].forEach((p) => n.style.setProperty(p, cs.getPropertyValue(p)));
    return n;
  }
  if (tag === "CANVAS" || tag === "VIDEO") {
    // Live mirror: copied every frame, so WebGL scenes and videos keep moving during the build.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const n = document.createElement("canvas");
    n.width = Math.max(1, Math.round(rect.width * dpr));
    n.height = Math.max(1, Math.round(rect.height * dpr));
    Object.assign(n.style, { width: "100%", height: "100%", display: "block" });
    applyRadius(n);
    mirrors.push({ source: el, target: n, ctx: n.getContext("2d") });
    return n;
  }
  return null; // iframes and anything else: placeholder only
}

/**
 * Walk the DOM and turn everything visible in the viewport into build tasks:
 *   box   — anything that paints a background, border, or shadow
 *   text  — a run of inline content, cloned with its computed style
 *   icon  — icon-font glyphs
 *   media — images, inline SVG, canvas, video
 */
function snapshot(pageBg) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tasks = [];
  const mirrors = [];
  let order = 0;

  const push = (kind, el, rect, ctx, node, parent, extra = {}) => {
    const visible = intersect(toBox(rect), ctx.clip);
    const task = {
      kind,
      el,
      node,
      parent,
      rect: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
      visible,
      clip: ctx.clip,
      opacity: ctx.opacity,
      z: clamp(Math.round(ctx.layer), -50, 50) * 10000 + order++,
      state: "todo",
      ...extra,
    };
    tasks.push(task);
    return task;
  };

  const walk = (el, ctx) => {
    if (el.nodeType !== 1 || SKIP_TAGS.has(el.tagName)) return;
    if (el.classList?.contains("swarm")) return;
    const cs = getComputedStyle(el);
    if (cs.display === "none") return;
    if (cs.display === "contents") {
      for (const c of el.children) walk(c, ctx);
      return;
    }
    const opacity = ctx.opacity * parseFloat(cs.opacity || "1");
    if (opacity < 0.02) return;

    let layer = ctx.layer;
    if (cs.position !== "static" && cs.zIndex !== "auto") layer += parseInt(cs.zIndex, 10) || 0;
    else if (cs.position === "fixed" || cs.position === "sticky") layer += 1;

    const rect = el.getBoundingClientRect();
    const here = { opacity, layer, clip: ctx.clip, parent: ctx.parent };
    const shows = cs.visibility !== "hidden" && rect.width >= 1 && rect.height >= 1 && !isEmpty(intersect(toBox(rect), ctx.clip));
    const tag = el.tagName;

    if (MEDIA_TAGS.has(tag)) {
      if (shows) push("media", el, rect, here, mediaNode(el, cs, rect, mirrors), ctx.parent);
      return;
    }

    let parent = ctx.parent;
    if (shows && isBox(el, cs, rect, pageBg, vw)) {
      const box = document.createElement("div");
      copyProps(box, cs, BOX_PROPS);
      Object.assign(box.style, { width: "100%", height: "100%", boxSizing: "border-box" });
      parent = push("box", el, rect, here, box, ctx.parent);
    }

    if (FIELD_TAGS.has(tag)) {
      const node = shows && fieldText(el, cs);
      if (node) push("text", el, rect, here, node, parent);
      return;
    }

    if (isIcon(el)) {
      if (shows) {
        const node = cloneText(el);
        styleTextRoot(node, el, cs, rect);
        push("icon", el, rect, here, node, parent);
      }
      return;
    }

    if (hasDirectText(el) && childrenAreInline(el)) {
      if (shows) {
        const node = cloneText(el);
        styleTextRoot(node, el, cs, rect);
        push("text", el, rect, here, node, parent);
      }
      return;
    }

    let clip = ctx.clip;
    if (cs.overflowX !== "visible" || cs.overflowY !== "visible") clip = intersect(clip, toBox(rect));
    if (isEmpty(clip)) return;
    for (const c of el.children) walk(c, { opacity, layer, clip, parent });
  };

  walk(document.body, { opacity: 1, layer: 0, clip: { l: 0, t: 0, r: vw, b: vh }, parent: null });

  // Too small, or past the budget: these pop in on their own once their parent box is built.
  const area = (t) => (t.visible.r - t.visible.l) * (t.visible.b - t.visible.t);
  tasks.forEach((t) => {
    const w = t.visible.r - t.visible.l;
    const h = t.visible.b - t.visible.t;
    if (t.kind !== "text" && t.kind !== "icon" && (w < TINY || h < TINY)) t.auto = true;
  });
  const manual = tasks.filter((t) => !t.auto);
  if (manual.length > MAX_TASKS) {
    manual
      .slice()
      .sort((a, b) => area(a) - area(b))
      .slice(0, manual.length - MAX_TASKS)
      .forEach((t) => (t.auto = true));
  }

  return { tasks, mirrors };
}

// ───────────────────────────────────────────────────────────── engine ──

class Swarm {
  constructor({ returnFocus } = {}) {
    this.returnFocus = returnFocus || document.activeElement;
    this.reduce = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    this.tweens = [];
    this.aborted = false;
    this.speed = 1;
    this.mouse = null;
    this.finished = new Promise((resolve) => (this.resolveFinished = resolve));
    this.loop = this.loop.bind(this);
    this.onKey = this.onKey.bind(this);
    this.onBlockScroll = (e) => e.preventDefault();
    this.onResize = () => this.abort();
    this.onPointer = (e) => (this.mouse = { x: e.clientX, y: e.clientY });
    this.start();
  }

  // ── tweens ──
  tween(ms, update, ease = easeInOut, { raw = false } = {}) {
    if (this.aborted) return Promise.resolve();
    const dur = Math.max(1, raw ? ms : ms / this.speed);
    return new Promise((res) => this.tweens.push({ t0: performance.now(), dur, update, ease, res }));
  }
  wait(ms, opts) {
    return this.tween(ms, () => {}, linear, opts);
  }

  loop(now) {
    if (!this.root) return;
    const live = [];
    for (const tw of this.tweens) {
      const p = clamp((now - tw.t0) / tw.dur, 0, 1);
      tw.update(tw.ease(p), p);
      if (p >= 1) tw.res();
      else live.push(tw);
    }
    this.tweens = live;
    for (const m of this.mirrors) {
      if (m.dead || !m.target.isConnected) continue;
      try {
        m.ctx.clearRect(0, 0, m.target.width, m.target.height);
        m.ctx.drawImage(m.source, 0, 0, m.target.width, m.target.height);
      } catch (_) {
        m.dead = true; // tainted or not ready: leave the placeholder
      }
    }
    this.raf = requestAnimationFrame(this.loop);
  }

  // ── lifecycle ──
  async start() {
    const pageBg = getComputedStyle(document.body).backgroundColor;
    const { tasks, mirrors } = snapshot(pageBg);
    this.tasks = tasks;
    this.mirrors = mirrors;
    this.manual = tasks.filter((t) => !t.auto);

    const vw = window.innerWidth;
    const crewSize = vw < 640 ? 5 : vw < 1024 ? 6 : CREW.length;
    const estimate = this.manual.reduce((sum, t) => sum + 450 + (t.kind === "text" ? 500 : 650), 0);
    this.speed = clamp(estimate / crewSize / TARGET_MS, 1.5, 4) * (this.reduce ? 2.5 : 1);

    this.build(pageBg);
    this.cursors = CREW.slice(0, crewSize).map((c) => this.makeCursor(c));

    window.addEventListener("keydown", this.onKey, true);
    window.addEventListener("resize", this.onResize);
    this.root.addEventListener("wheel", this.onBlockScroll, { passive: false });
    this.root.addEventListener("touchmove", this.onBlockScroll, { passive: false });
    this.root.addEventListener("pointermove", this.onPointer);
    this.raf = requestAnimationFrame(this.loop);

    try {
      await this.intro();
      await Promise.all(this.cursors.map((c) => this.work(c)));
      if (!this.aborted) await this.finale();
    } finally {
      await this.teardown();
    }
  }

  build(pageBg) {
    const root = document.createElement("div");
    root.className = "swarm";
    root.innerHTML = `
      <div class="swarm__bg"></div>
      <div class="swarm__stage" aria-hidden="true" inert></div>
      <div class="swarm__ui" aria-hidden="true"></div>
      <div class="swarm__hud" role="status">
        <span class="swarm__dot"></span>
        <span class="swarm__label">Clearing the page…</span>
        <button type="button" class="swarm__skip">Skip <kbd>Esc</kbd></button>
      </div>`;
    root.querySelector(".swarm__bg").style.background = pageBg;
    this.root = root;
    this.stage = root.querySelector(".swarm__stage");
    this.ui = root.querySelector(".swarm__ui");
    this.label = root.querySelector(".swarm__label");
    const skip = root.querySelector(".swarm__skip");
    skip.addEventListener("click", () => this.abort());
    document.body.appendChild(root);
    skip.focus({ preventScroll: true });
  }

  setLabel(text) {
    if (this.label) this.label.textContent = text;
  }

  progress() {
    const done = this.manual.filter((t) => t.state === "done").length;
    this.setLabel(`Rebuilding · ${done} / ${this.manual.length}`);
  }

  async intro() {
    await nextFrame();
    this.root.classList.add("is-in");
    await this.wait(this.reduce ? 150 : 500, { raw: true });

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const R = Math.min(window.innerWidth, window.innerHeight) * 0.13;
    const n = this.cursors.length;
    const angle = (i, a = 0) => (i / n) * Math.PI * 2 + a;

    // Fly in from the edges.
    this.cursors.forEach((c, i) => {
      const a = angle(i);
      c.set(cx + Math.cos(a) * (cx + 120), cy + Math.sin(a) * (cy + 120));
      c.show();
    });
    this.setLabel("Assembling the crew…");
    await Promise.all(this.cursors.map((c, i) => this.moveTo(c, cx + Math.cos(angle(i)) * R, cy + Math.sin(angle(i)) * R, 600, { raw: true })));
    if (this.reduce || this.aborted) return;

    // Orbit for a moment, then fan out.
    await this.tween(
      800,
      (e) => this.cursors.forEach((c, i) => {
        const r = R * (1 - 0.25 * Math.sin(e * Math.PI));
        c.set(cx + Math.cos(angle(i, e * Math.PI * 1.2)) * r, cy + Math.sin(angle(i, e * Math.PI * 1.2)) * r);
      }),
      easeInOut,
      { raw: true }
    );
  }

  async finale() {
    this.setLabel("Rebuilt ✓");
    const target = this.mouse || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const n = this.cursors.length;
    const R = 46;
    if (!this.reduce) {
      await Promise.all(
        this.cursors.map((c, i) => {
          c.mode("arrow");
          const a = (i / n) * Math.PI * 2;
          return this.moveTo(c, target.x + Math.cos(a) * R, target.y + Math.sin(a) * R, 650, { raw: true });
        })
      );
      await this.tween(
        900,
        (e) => this.cursors.forEach((c, i) => {
          const a = (i / n) * Math.PI * 2 + e * Math.PI * 1.5;
          c.set(target.x + Math.cos(a) * R, target.y + Math.sin(a) * R);
        }),
        easeInOut,
        { raw: true }
      );
    }
    this.setLabel("Going live");
    this.cursors.forEach((c) => c.hide());
    await this.wait(250, { raw: true });
  }

  abort() {
    if (this.aborted) return;
    this.aborted = true;
    for (const tw of this.tweens) tw.res();
    this.tweens = [];
  }

  async teardown() {
    if (!this.root) return;
    this.root.classList.add("is-out");
    await new Promise((r) => setTimeout(r, this.aborted ? 250 : 600));
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKey, true);
    window.removeEventListener("resize", this.onResize);
    this.root.remove();
    this.root = null;
    if (this.returnFocus?.isConnected) this.returnFocus.focus({ preventScroll: true });
    this.resolveFinished();
  }

  onKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      this.abort();
      return;
    }
    if (e.key === "Tab") {
      // Only the Skip button is focusable while the overlay is up.
      e.preventDefault();
      this.root?.querySelector(".swarm__skip")?.focus({ preventScroll: true });
      return;
    }
    const onButton = e.target?.classList?.contains("swarm__skip");
    if (SCROLL_KEYS.has(e.key) && !(onButton && e.key === " ")) e.preventDefault();
  }

  // ── cursors ──
  makeCursor({ name, color, ink }) {
    const el = document.createElement("div");
    el.className = "swarm-cursor";
    el.dataset.mode = "arrow";
    el.style.setProperty("--c", color);
    el.style.setProperty("--ink", ink);
    el.innerHTML = `
      <svg class="g g-arrow" width="20" height="22" viewBox="0 0 20 22"><path d="M2 1.5 L2 18 L6.6 13.8 L9.6 20.6 L12.6 19.3 L9.7 12.6 L16 12.4 Z" fill="${color}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>
      <svg class="g g-cross" width="22" height="22" viewBox="0 0 22 22"><path d="M11 1v20M1 11h20" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/><path d="M11 1v20M1 11h20" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/></svg>
      <svg class="g g-beam" width="12" height="22" viewBox="0 0 12 22"><path d="M2 1.5h3a1 1 0 0 1 1 1v17a1 1 0 0 1 1-1h3M10 1.5H7a1 1 0 0 0-1 1v17a1 1 0 0 0-1-1H2" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/><path d="M2 1.5h3a1 1 0 0 1 1 1v17a1 1 0 0 1 1-1h3M10 1.5H7a1 1 0 0 0-1 1v17a1 1 0 0 0-1-1H2" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/></svg>
      <span class="swarm-cursor__tag">${name}<span class="swarm-cursor__dim"></span></span>`;
    this.ui.appendChild(el);
    const dim = el.querySelector(".swarm-cursor__dim");
    const cursor = {
      el,
      color,
      x: -100,
      y: -100,
      set(x, y) {
        cursor.x = x;
        cursor.y = y;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      },
      mode(m) {
        el.dataset.mode = m;
      },
      press(on) {
        el.classList.toggle("is-pressed", on);
      },
      dims(w, h) {
        dim.textContent = w == null ? "" : `${Math.round(w)} × ${Math.round(h)}`;
      },
      show() {
        el.classList.add("is-on");
      },
      hide() {
        el.classList.remove("is-on");
      },
    };
    return cursor;
  }

  /** Curved, eased move — straight lines look robotic. */
  moveTo(c, x, y, ms, opts) {
    const x0 = c.x;
    const y0 = c.y;
    const dx = x - x0;
    const dy = y - y0;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return Promise.resolve();
    const bend = (Math.random() - 0.5) * 0.35 * dist;
    const mx = x0 + dx / 2 + (-dy / dist) * bend;
    const my = y0 + dy / 2 + (dx / dist) * bend;
    const dur = ms ?? clamp(160 + dist * 0.5, 220, 800);
    return this.tween(
      dur,
      (t) => {
        const u = 1 - t;
        c.set(u * u * x0 + 2 * u * t * mx + t * t * x, u * u * y0 + 2 * u * t * my + t * t * y);
      },
      easeInOut,
      opts
    );
  }

  // ── scheduling ──
  ready(t) {
    return t.state === "todo" && (!t.parent || t.parent.state === "done");
  }

  /** Auto tasks (tiny or over budget) appear on their own as soon as their parent exists. */
  flushAuto() {
    for (const t of this.tasks) {
      if (t.auto && this.ready(t)) {
        this.mount(t);
        t.state = "done";
        requestAnimationFrame(() => {
          t.layer.classList.add("is-in");
          t.inner.classList.add("is-in");
        });
      }
    }
  }

  pick(c) {
    const candidates = [];
    for (const t of this.manual) {
      if (this.ready(t)) candidates.push(t);
      if (candidates.length >= 6) break;
    }
    if (!candidates.length) return null;
    candidates.sort((a, b) => Math.hypot(a.visible.l - c.x, a.visible.t - c.y) - Math.hypot(b.visible.l - c.x, b.visible.t - c.y));
    return candidates[0];
  }

  async work(c) {
    while (!this.aborted) {
      this.flushAuto();
      const task = this.pick(c);
      if (!task) {
        if (this.manual.every((t) => t.state !== "todo")) break;
        await this.wait(70, { raw: true });
        continue;
      }
      task.state = "doing";
      if (task.kind === "text" || task.kind === "icon") await this.typeText(c, task);
      else await this.drawRect(c, task);
      task.state = "done";
      this.progress();
    }
    // Anything left over (e.g. auto tasks whose parent just finished).
    this.flushAuto();
    c.mode("arrow");
    c.dims(null);
  }

  // ── rendering ──
  mount(t) {
    if (t.layer) return t.layer;
    const layer = document.createElement("div");
    layer.className = "swarm-layer";
    const { x, y, w, h } = t.rect;
    Object.assign(layer.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, zIndex: t.z });
    layer.style.setProperty("--o", t.opacity);
    // Respect ancestors with overflow: hidden.
    const c = t.clip;
    const inset = [c.t - y, x + w - c.r, y + h - c.b, c.l - x].map((v) => `${Math.max(0, v)}px`);
    if (inset.some((v) => v !== "0px")) layer.style.clipPath = `inset(${inset.join(" ")})`;
    const inner = t.node || placeholder();
    if (t.kind === "media") inner.classList.add("swarm-sweep");
    layer.appendChild(inner);
    t.layer = layer;
    t.inner = inner;
    this.stage.appendChild(layer);
    return layer;
  }

  draft(c, kind) {
    const d = document.createElement("div");
    d.className = `swarm-draft swarm-draft--${kind}`;
    d.style.setProperty("--c", c.color);
    this.ui.prepend(d);
    return d;
  }

  async drawRect(c, t) {
    const v = t.visible;
    const x0 = clamp(v.l, 2, window.innerWidth - 6);
    const y0 = clamp(v.t, 2, window.innerHeight - 6);
    const x1 = clamp(v.r, x0 + 4, window.innerWidth - 2);
    const y1 = clamp(v.b, y0 + 4, window.innerHeight - 2);

    c.mode("arrow");
    await this.moveTo(c, x0, y0);
    if (this.aborted) return;
    c.mode("cross");
    c.press(true);
    const d = this.draft(c, t.kind === "media" ? "media" : "box");
    d.style.left = `${x0}px`;
    d.style.top = `${y0}px`;
    const span = (x1 - x0) + (y1 - y0);
    await this.tween(clamp(240 + span * 0.35, 280, 850), (e) => {
      const w = (x1 - x0) * e;
      const h = (y1 - y0) * e;
      d.style.width = `${w}px`;
      d.style.height = `${h}px`;
      c.set(x0 + w, y0 + h);
      c.dims(t.rect.w * e, t.rect.h * e);
    });
    c.press(false);
    c.dims(null);
    if (this.aborted) return d.remove();

    const layer = this.mount(t);
    await nextFrame();
    layer.classList.add("is-in");
    if (t.kind === "media") {
      t.inner.classList.add("is-in");
      await this.wait(260);
    }
    d.classList.add("is-out");
    setTimeout(() => d.remove(), 400);
    c.mode("arrow");
    await this.wait(90);
  }

  textUnits(node) {
    const units = [];
    const walk = (n) => {
      for (const ch of n.childNodes) {
        if (ch.nodeType === 3) {
          units.push({ node: ch, full: ch.data, size: /\S/.test(ch.data) ? ch.data.length : 1 });
        } else if (ch.nodeType === 1) {
          if (!ch.textContent.trim()) units.push({ atom: ch, size: 1 });
          else walk(ch);
        }
      }
    };
    walk(node);
    return units;
  }

  revealAllText(t) {
    if (t.units) t.units.forEach((u) => (u.atom ? (u.atom.style.visibility = "") : (u.node.data = u.full)));
  }

  async typeText(c, t) {
    const v = t.visible;
    const x0 = clamp(v.l, 2, window.innerWidth - 6);
    const y0 = clamp(v.t, 2, window.innerHeight - 6);
    const x1 = clamp(v.r, x0 + 4, window.innerWidth - 2);
    const y1 = clamp(v.b, y0 + 4, window.innerHeight - 2);

    c.mode("arrow");
    await this.moveTo(c, x0, y0);
    if (this.aborted) return;

    if (t.kind === "icon") {
      c.press(true);
      await this.wait(80);
      c.press(false);
      const layer = this.mount(t);
      layer.classList.add("swarm-pop");
      await nextFrame();
      layer.classList.add("is-in");
      await this.wait(120);
      return;
    }

    // Drag out the text box…
    c.mode("cross");
    c.press(true);
    const d = this.draft(c, "text");
    d.style.left = `${x0}px`;
    d.style.top = `${y0}px`;
    await this.tween(clamp(160 + (x1 - x0) * 0.25, 180, 420), (e) => {
      d.style.width = `${(x1 - x0) * e}px`;
      d.style.height = `${(y1 - y0) * e}px`;
      c.set(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e);
    });
    c.press(false);
    if (this.aborted) return d.remove();

    // …then type into it.
    const layer = this.mount(t);
    t.units = this.textUnits(t.inner);
    const total = t.units.reduce((s, u) => s + u.size, 0);
    t.units.forEach((u) => (u.atom ? (u.atom.style.visibility = "hidden") : (u.node.data = "")));
    layer.classList.add("is-in", "is-instant");

    const caret = document.createElement("div");
    caret.className = "swarm-caret";
    caret.style.setProperty("--c", c.color);
    this.ui.appendChild(caret);
    c.mode("beam");

    const range = document.createRange();
    let shown = -1;
    await this.tween(
      clamp(total * 24, 220, 1400),
      (e) => {
        const n = Math.round(e * total);
        if (n === shown) return;
        shown = n;
        let left = n;
        let last = null;
        for (const u of t.units) {
          const take = clamp(left, 0, u.size);
          left -= take;
          if (u.atom) u.atom.style.visibility = take ? "" : "hidden";
          else {
            u.node.data = u.size === 1 && !/\S/.test(u.full) ? (take ? u.full : "") : u.full.slice(0, take);
            if (take && /\S/.test(u.full)) last = { node: u.node, k: take };
          }
        }
        let pos = null;
        if (last) {
          try {
            range.setStart(last.node, last.k - 1);
            range.setEnd(last.node, last.k);
            const rects = range.getClientRects();
            pos = rects[rects.length - 1];
          } catch (_) {}
        }
        const h = pos ? pos.height : Math.min(t.rect.h, 24);
        const cx = pos ? pos.right : x0 + 2;
        const cy = pos ? pos.top : y0 + 2;
        caret.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        caret.style.height = `${h}px`;
        c.set(cx + 8, cy + h * 0.6);
      },
      linear
    );
    this.revealAllText(t);
    caret.remove();
    d.classList.add("is-out");
    setTimeout(() => d.remove(), 400);
    c.mode("arrow");
    await this.wait(80);
  }
}

function placeholder() {
  const n = document.createElement("div");
  n.className = "swarm-placeholder";
  return n;
}
