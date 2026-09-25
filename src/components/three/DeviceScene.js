import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// A laptop and a phone, modelled from primitives, showing real screenshots of
// my live projects. The lid opens on load, the screens cycle between projects,
// and the rig leans toward the pointer. Rendering pauses when off screen.

const base = process.env.PUBLIC_URL;
const SCREENS = [
  { desktop: `${base}/projects/ai-security-scanner.jpg`, mobile: `${base}/projects/ai-security-scanner-mobile.jpg` },
  { desktop: `${base}/projects/ricky-restaurants.jpg`, mobile: `${base}/projects/ricky-restaurants-mobile.jpg` },
];
const CYCLE_MS = 5000;
const LID_OPEN = -0.26;
const LID_CLOSED = Math.PI / 2 - 0.04;

const screenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Crossfades two screenshots and adds a faint diagonal glare, like real glass.
const screenFragment = /* glsl */ `
  uniform sampler2D uA;
  uniform sampler2D uB;
  uniform float uMix;
  uniform float uPower;
  varying vec2 vUv;
  void main() {
    vec3 a = texture2D(uA, vUv).rgb;
    vec3 b = texture2D(uB, vUv).rgb;
    vec3 col = mix(a, b, smoothstep(0.0, 1.0, uMix)) * uPower;
    float glare = smoothstep(0.35, 0.0, abs(vUv.x - vUv.y * 0.6 - 0.25)) * 0.05;
    gl_FragColor = vec4(col + glare, 1.0);
  }
`;

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const geo = new THREE.ShapeGeometry(s, 12);
  // ShapeGeometry UVs are raw coordinates; remap them to 0..1.
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
  }
  return geo;
}

function keyboardTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 400;
  const g = c.getContext("2d");
  g.fillStyle = "#0b0b0c";
  g.fillRect(0, 0, c.width, c.height);
  const cols = 14;
  const rows = 5;
  const pad = 10;
  const kw = (c.width - pad * (cols + 1)) / cols;
  const kh = (c.height - pad * (rows + 1)) / rows;
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      // Space bar on the last row.
      if (r === rows - 1 && k > 4 && k < 10) {
        if (k === 5) {
          g.fillStyle = "#1c1c1f";
          g.beginPath();
          g.roundRect(pad + k * (kw + pad), pad + r * (kh + pad), kw * 5 + pad * 4, kh, 8);
          g.fill();
        }
        continue;
      }
      g.fillStyle = "#1c1c1f";
      g.beginPath();
      g.roundRect(pad + k * (kw + pad), pad + r * (kh + pad), kw, kh, 8);
      g.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(0,0,0,0.85)");
  grad.addColorStop(0.5, "rgba(0,0,0,0.35)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

const easeOut = (t) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 4);

export default function DeviceScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the hero still works without the devices.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 1.5, 10.6);
    camera.lookAt(0, 0.35, 0);

    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(-4, 6, 5);
    scene.add(key);
    const rim = new THREE.PointLight(0xff6a3d, 18, 12, 2);
    rim.position.set(3.5, 2.5, -3);
    scene.add(rim);

    const disposables = [];
    const track = (o) => {
      disposables.push(o);
      return o;
    };

    // ---------- Materials ----------
    const metal = track(
      new THREE.MeshPhysicalMaterial({ color: 0x2b2b2e, metalness: 0.9, roughness: 0.33, clearcoat: 0.4, clearcoatRoughness: 0.4 })
    );
    const glass = track(new THREE.MeshPhysicalMaterial({ color: 0x050506, metalness: 0.1, roughness: 0.08, clearcoat: 1 }));
    const keysMat = track(new THREE.MeshStandardMaterial({ map: track(keyboardTexture()), roughness: 0.7, metalness: 0.2 }));
    const padMat = track(new THREE.MeshPhysicalMaterial({ color: 0x323236, metalness: 0.6, roughness: 0.45, clearcoat: 0.6 }));

    const blank = track(new THREE.DataTexture(new Uint8Array([14, 14, 16, 255]), 1, 1));
    blank.needsUpdate = true;
    const makeScreenMat = () =>
      track(
        new THREE.ShaderMaterial({
          vertexShader: screenVertex,
          fragmentShader: screenFragment,
          uniforms: { uA: { value: blank }, uB: { value: blank }, uMix: { value: 0 }, uPower: { value: 1 } },
          toneMapped: false,
        })
      );
    const laptopScreenMat = makeScreenMat();
    const phoneScreenMat = makeScreenMat();

    // ---------- Laptop ----------
    const W = 3.4;
    const D = 2.3;
    const T = 0.1;
    const LH = 2.2;
    const LT = 0.06;
    const laptop = new THREE.Group();

    const baseMesh = new THREE.Mesh(track(new RoundedBoxGeometry(W, T, D, 4, 0.045)), metal);
    baseMesh.position.y = T / 2;
    laptop.add(baseMesh);

    const keys = new THREE.Mesh(track(new THREE.PlaneGeometry(W * 0.86, 1.05)), keysMat);
    keys.rotation.x = -Math.PI / 2;
    keys.position.set(0, T + 0.002, -0.33);
    laptop.add(keys);

    const trackpad = new THREE.Mesh(track(roundedRect(1.25, 0.72, 0.06)), padMat);
    trackpad.rotation.x = -Math.PI / 2;
    trackpad.position.set(0, T + 0.002, 0.62);
    laptop.add(trackpad);

    const hinge = new THREE.Group();
    hinge.position.set(0, T, -D / 2 + 0.02);
    laptop.add(hinge);

    const lid = new THREE.Mesh(track(new RoundedBoxGeometry(W, LH, LT, 4, 0.04)), metal);
    lid.position.set(0, LH / 2, -LT / 2);
    hinge.add(lid);

    const bezel = new THREE.Mesh(track(roundedRect(W - 0.02, LH - 0.02, 0.04)), glass);
    bezel.position.set(0, LH / 2, 0.002);
    hinge.add(bezel);

    const SW = W - 0.2;
    const laptopScreen = new THREE.Mesh(track(new THREE.PlaneGeometry(SW, SW / 1.6)), laptopScreenMat);
    laptopScreen.position.set(0, LH / 2 + 0.05, 0.004);
    hinge.add(laptopScreen);

    const shadowTex = track(shadowTexture());
    const shadowMat = track(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.9 }));
    const laptopShadow = new THREE.Mesh(track(new THREE.PlaneGeometry(W * 1.6, D * 1.5)), shadowMat);
    laptopShadow.rotation.x = -Math.PI / 2;
    laptopShadow.position.y = -0.02;
    laptop.add(laptopShadow);

    // ---------- Phone ----------
    const PW = 1.0;
    const PH = 2.06;
    const phone = new THREE.Group();

    const phoneBody = new THREE.Mesh(track(new RoundedBoxGeometry(PW, PH, 0.1, 6, 0.045)), metal);
    phone.add(phoneBody);
    const phoneGlass = new THREE.Mesh(track(roundedRect(PW - 0.02, PH - 0.02, 0.14)), glass);
    phoneGlass.position.z = 0.051;
    phone.add(phoneGlass);
    const PSW = PW - 0.09;
    const phoneScreen = new THREE.Mesh(track(roundedRect(PSW, PSW / 0.462, 0.11)), phoneScreenMat);
    phoneScreen.position.z = 0.053;
    phone.add(phoneScreen);
    const island = new THREE.Mesh(track(roundedRect(0.26, 0.075, 0.037)), glass);
    island.position.set(0, PSW / 0.462 / 2 - 0.08, 0.055);
    phone.add(island);

    // ---------- Rig ----------
    const rig = new THREE.Group();
    laptop.position.set(-0.55, -0.6, 0);
    laptop.rotation.y = 0.38;
    phone.position.set(1.7, 0.35, 1.35);
    phone.rotation.set(-0.04, -0.32, 0.06);
    rig.add(laptop, phone);
    scene.add(rig);

    // ---------- Theme ----------
    const applyTheme = () => {
      const light = document.documentElement.dataset.theme === "light";
      metal.color.set(light ? 0xc8c8cc : 0x2b2b2e);
      padMat.color.set(light ? 0xd4d4d8 : 0x323236);
      shadowMat.opacity = light ? 0.35 : 0.9;
      renderer.toneMappingExposure = light ? 1.0 : 1.05;
    };
    applyTheme();
    const mo = new MutationObserver(applyTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // ---------- Screens ----------
    const loader = new THREE.TextureLoader();
    const aniso = renderer.capabilities.getMaxAnisotropy();
    const load = (url) =>
      new Promise((resolve) =>
        loader.load(url, (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = aniso;
          track(t);
          resolve(t);
        }, undefined, () => resolve(blank))
      );
    let textures = null;
    let current = 0;
    let fadeStart = null;
    Promise.all(SCREENS.map(async (s) => ({ desktop: await load(s.desktop), mobile: await load(s.mobile) }))).then((t) => {
      textures = t;
      laptopScreenMat.uniforms.uA.value = laptopScreenMat.uniforms.uB.value = t[0].desktop;
      phoneScreenMat.uniforms.uA.value = phoneScreenMat.uniforms.uB.value = t[0].mobile;
    });
    const cycle = setInterval(() => {
      if (!textures || reduceMotion || document.hidden) return;
      const next = (current + 1) % textures.length;
      laptopScreenMat.uniforms.uB.value = textures[next].desktop;
      phoneScreenMat.uniforms.uB.value = textures[next].mobile;
      fadeStart = performance.now();
      current = next;
    }, CYCLE_MS);

    // ---------- Sizing & input ----------
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const pointer = { x: 0, y: 0 };
    const onPointer = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(mount);

    // ---------- Loop ----------
    const start = performance.now();
    let frame;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible) return;
      const now = performance.now();
      const t = (now - start) / 1000;

      // Intro: lid swings open, devices rise.
      const intro = reduceMotion ? 1 : easeOut((t - 0.3) / 1.8);
      hinge.rotation.x = LID_CLOSED + (LID_OPEN - LID_CLOSED) * intro;
      laptopScreenMat.uniforms.uPower.value = reduceMotion ? 1 : easeOut((t - 1.2) / 0.8);
      phoneScreenMat.uniforms.uPower.value = reduceMotion ? 1 : easeOut((t - 1.4) / 0.8);
      const rise = reduceMotion ? 1 : easeOut((t - 0.1) / 1.4);
      laptop.position.y = -0.6 - (1 - rise) * 0.6;
      phone.position.y = 0.35 - (1 - easeOut((t - 0.5) / 1.4)) * 1.2 * (reduceMotion ? 0 : 1);

      if (!reduceMotion) {
        // Idle float.
        laptop.position.y += Math.sin(t * 0.9) * 0.04;
        phone.position.y += Math.sin(t * 1.1 + 1.2) * 0.06;
        phone.rotation.z = 0.06 + Math.sin(t * 0.7) * 0.015;
        // Lean toward pointer, turn slightly with scroll.
        const scroll = Math.min(window.scrollY / window.innerHeight, 1.2);
        rig.rotation.y += (pointer.x * 0.18 - scroll * 0.35 - rig.rotation.y) * 0.05;
        rig.rotation.x += (pointer.y * 0.06 + scroll * 0.12 - rig.rotation.x) * 0.05;
      }

      if (fadeStart !== null) {
        const f = Math.min((now - fadeStart) / 900, 1);
        laptopScreenMat.uniforms.uMix.value = f;
        phoneScreenMat.uniforms.uMix.value = f;
        if (f === 1) {
          laptopScreenMat.uniforms.uA.value = laptopScreenMat.uniforms.uB.value;
          phoneScreenMat.uniforms.uA.value = phoneScreenMat.uniforms.uB.value;
          laptopScreenMat.uniforms.uMix.value = phoneScreenMat.uniforms.uMix.value = 0;
          fadeStart = null;
        }
      }

      renderer.render(scene, camera);
    };
    tick();
    requestAnimationFrame(() => mount.classList.add("is-ready"));

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(cycle);
      window.removeEventListener("pointermove", onPointer);
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
      disposables.forEach((d) => d.dispose());
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="hero-scene" aria-hidden="true" />;
}
