import { useEffect, useRef } from "react";

type Star = { x: number; y: number; z: number; vx: number; vy: number; tw: number; ts: number; c: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number };

const PALETTE: number[][] = [
  [255, 244, 235],
  [253, 164, 175],
  [196, 181, 253],
  [251, 207, 180],
];

function makeSprite(rgb: number[]) {
  const s = document.createElement("canvas");
  s.width = s.height = 64;
  const g = s.getContext("2d")!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  const c = rgb.join(",");
  gr.addColorStop(0, `rgba(${c},1)`);
  gr.addColorStop(0.16, `rgba(${c},0.85)`);
  gr.addColorStop(0.5, `rgba(${c},0.16)`);
  gr.addColorStop(1, `rgba(${c},0)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  return s;
}

const THREAD_POINTS = 34;

/**
 * Fixed full-page canvas:
 *  - drifting stardust (parallaxes with scroll)
 *  - the glowing Red Thread of Fate that trails the pointer / touch with a smooth, springy tail
 */
export default function Cosmos() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const sprites = PALETTE.map(makeSprite);
    const roseSprite = makeSprite([255, 80, 110]);

    let w = window.innerWidth;
    let h = window.innerHeight;
    let dpr = 1;
    let stars: Star[] = [];

    const seed = () => {
      const count = Math.round(Math.min(170, Math.max(60, (w * h) / 9500)));
      stars = Array.from({ length: count }, () => {
        const z = 0.25 + Math.random() * 0.75;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          vx: (Math.random() - 0.5) * 8 * z,
          vy: -(2 + Math.random() * 7) * z,
          tw: Math.random() * Math.PI * 2,
          ts: 0.5 + Math.random() * 1.6,
          c: Math.random() < 0.55 ? 0 : 1 + Math.floor(Math.random() * 3),
        };
      });
    };

    const resize = (force = false) => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      // ignore mobile URL-bar height jitter
      if (!force && nw === w && Math.abs(nh - h) < 160) return;
      w = nw;
      h = nh;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    resize(true);
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    // ---- pointer ----
    const target = { x: w / 2, y: h / 2 };
    let lastMove = -Infinity;
    const setTarget = (x: number, y: number) => {
      target.x = x;
      target.y = y;
      lastMove = performance.now();
    };
    const onMouse = (e: MouseEvent) => setTarget(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setTarget(t.clientX, t.clientY);
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    // ---- thread chain ----
    const pts = Array.from({ length: THREAD_POINTS }, () => ({ x: w / 2, y: h / 2 }));
    const sparks: Spark[] = [];
    let alpha = 0;
    let headSpeed = 0;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const time = now / 1000;
      const scrollY = window.scrollY;

      ctx.clearRect(0, 0, w, h);

      // ---------- stardust ----------
      const head = pts[0];
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (s.x < -10) s.x = w + 10;
        else if (s.x > w + 10) s.x = -10;
        if (s.y < -10) s.y = h + 10;
        else if (s.y > h + 10) s.y = -10;

        const py = (((s.y - scrollY * 0.14 * s.z) % h) + h) % h;

        // gentle repel from the thread head (screen space)
        const dx = s.x - head.x;
        const dy = py - head.y;
        const d2 = dx * dx + dy * dy;
        if (alpha > 0.05 && d2 < 8100) {
          const f = (1 - d2 / 8100) * 40 * dt * s.z;
          const d = Math.sqrt(d2) || 1;
          s.x += (dx / d) * f;
          s.y += (dy / d) * f;
        }
        const tw = 0.45 + 0.55 * Math.sin(time * s.ts + s.tw);
        const size = (0.9 + s.z * 2.6) * (0.75 + tw * 0.5) * 3.2;
        ctx.globalAlpha = Math.min(1, (0.25 + tw * 0.75) * (0.4 + s.z * 0.6));
        ctx.drawImage(sprites[s.c], s.x - size / 2, py - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      // ---------- thread ----------
      const idle = (now - lastMove) / 1000;
      const inHero = scrollY < h * 0.75;
      let tx = target.x;
      let ty = target.y;
      if (idle > 1.8 && inHero) {
        // elegant self-drawing wander so the thread is visible before any interaction
        tx = w / 2 + Math.sin(time * 0.6) * w * 0.3 + Math.sin(time * 1.7) * w * 0.05;
        ty = h * 0.52 + Math.cos(time * 0.85) * h * 0.2 + Math.sin(time * 2.1) * h * 0.03;
      }
      const wantAlpha = idle < 1.8 || inHero ? 1 : 0;
      alpha += (wantAlpha - alpha) * (1 - Math.exp(-dt * 3));

      const px = pts[0].x;
      const py0 = pts[0].y;
      const kHead = 1 - Math.exp(-dt * 11);
      pts[0].x += (tx - pts[0].x) * kHead;
      pts[0].y += (ty - pts[0].y) * kHead;
      headSpeed = Math.hypot(pts[0].x - px, pts[0].y - py0) / Math.max(dt, 0.001);
      const kTail = 1 - Math.exp(-dt * 20);
      for (let i = 1; i < pts.length; i++) {
        pts[i].x += (pts[i - 1].x - pts[i].x) * kTail;
        pts[i].y += (pts[i - 1].y - pts[i].y) * kTail;
      }

      if (alpha > 0.01) {
        const n = pts.length;
        const wob = (i: number) => Math.sin(time * 2.4 + i * 0.55) * (i / n) * 3;
        const X = (i: number) => pts[i].x + wob(i);
        const Y = (i: number) => pts[i].y + wob(i + 9);

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // soft glow: one wide path with a head → tail gradient
        const gr = ctx.createLinearGradient(X(0), Y(0), X(n - 1), Y(n - 1));
        gr.addColorStop(0, `rgba(244,63,94,${0.2 * alpha})`);
        gr.addColorStop(1, "rgba(244,63,94,0)");
        ctx.strokeStyle = gr;
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.moveTo(X(0), Y(0));
        for (let i = 1; i < n - 1; i++) {
          ctx.quadraticCurveTo(X(i), Y(i), (X(i) + X(i + 1)) / 2, (Y(i) + Y(i + 1)) / 2);
        }
        ctx.stroke();

        // tapered core
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 0; i < n - 1; i++) {
            const t = i / n;
            const fade = Math.pow(1 - t, 1.25) * alpha;
            const sx = i === 0 ? X(0) : (X(i - 1) + X(i)) / 2;
            const sy = i === 0 ? Y(0) : (Y(i - 1) + Y(i)) / 2;
            const ex = (X(i) + X(i + 1)) / 2;
            const ey = (Y(i) + Y(i + 1)) / 2;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.quadraticCurveTo(X(i), Y(i), ex, ey);
            if (pass === 0) {
              ctx.strokeStyle = `rgba(255,70,105,${0.9 * fade})`;
              ctx.lineWidth = 1 + (1 - t) * 3;
            } else {
              ctx.strokeStyle = `rgba(255,228,232,${0.85 * fade})`;
              ctx.lineWidth = 0.4 + (1 - t) * 1.1;
            }
            ctx.stroke();
          }
        }

        // glowing head
        ctx.globalCompositeOperation = "lighter";
        const hs = 54 + Math.sin(time * 5) * 6;
        ctx.globalAlpha = 0.9 * alpha;
        ctx.drawImage(roseSprite, X(0) - hs / 2, Y(0) - hs / 2, hs, hs);

        // sparks shed by the head
        if (headSpeed > 50 && sparks.length < 46 && Math.random() < 0.6) {
          sparks.push({
            x: X(0),
            y: Y(0),
            vx: (Math.random() - 0.5) * 30,
            vy: (Math.random() - 0.5) * 30 - 6,
            life: 1,
          });
        }
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.life -= dt * 0.9;
          if (s.life <= 0) {
            sparks.splice(i, 1);
            continue;
          }
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          const sz = 16 * s.life;
          ctx.globalAlpha = s.life * 0.9 * alpha;
          ctx.drawImage(roseSprite, s.x - sz / 2, s.y - sz / 2, sz, sz);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
    />
  );
}
