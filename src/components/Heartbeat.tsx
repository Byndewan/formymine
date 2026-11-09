import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { HEART_D, TinyHeart } from "./HeartPath";
import LoveLetter from "./LoveLetter";
import { cn } from "../utils/cn";

const HOLD_MS = 3000;
const gauss = (t: number, c: number, w: number) => Math.exp(-(((t - c) / w) ** 2));

const MINI = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37) % 86 + 7,
  delay: (i * 0.53) % 5,
  dur: 4 + (i % 4) * 0.7,
  dx: ((i % 5) - 2) * 22,
  size: 12 + (i % 3) * 8,
}));

export default function Heartbeat({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  const scale = useMotionValue(1);
  const glow = useMotionValue(0.4);
  const energy = useMotionValue(0);
  const progress = useMotionValue(0);

  const holding = useRef(false);
  const holdMs = useRef(0);
  const bpmRef = useRef<HTMLSpanElement>(null);

  const [beat, setBeat] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [hasRead, setHasRead] = useState(false);

  // derived visuals (all transform / opacity)
  const warmOpacity = useTransform(energy, [0, 0.15, 1], [0, 0.35, 1]);
  const warmScale = useTransform(energy, [0, 1], [0.5, 1.35]);
  const miniOpacity = useTransform(energy, [0.1, 0.6], [0, 1]);
  const haloScale = useTransform(scale, (s) => s * 1.15);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let phase = 0;
    let e = 0;
    let beats = 0;
    let letterShown = false;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const hold = holding.current;

      if (hold) holdMs.current += dt * 1000;
      else holdMs.current = 0;

      e += ((hold ? 1 : 0) - e) * (1 - Math.exp(-dt * (hold ? 1.7 : 1.1)));
      const bpm = 62 + e * 100;
      phase += (dt * bpm) / 60;
      if (phase >= 1) {
        phase -= 1;
        beats++;
        setBeat(beats);
        if (hold && "vibrate" in navigator) {
          try {
            navigator.vibrate(18);
          } catch {
            /* noop */
          }
        }
      }
      // "lub-dub"
      const pulse = gauss(phase, 0.04, 0.05) + 0.62 * gauss(phase, 0.27, 0.06);
      scale.set((1 + e * 0.5) * (1 + 0.13 * pulse));
      glow.set(Math.min(1, 0.35 + 0.5 * pulse + 0.35 * e));
      energy.set(e);
      progress.set(hold ? Math.min(1, holdMs.current / HOLD_MS) : progress.get() * Math.exp(-dt * 7));
      if (bpmRef.current) bpmRef.current.textContent = String(Math.round(bpm));

      if (hold && holdMs.current >= HOLD_MS && !letterShown) {
        letterShown = true;
        holding.current = false;
        holdMs.current = 0;
        setIsHolding(false);
        setHasRead(true);
        setLetterOpen(true);
        setTimeout(() => (letterShown = false), 1500);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scale, glow, energy, progress]);

  const start = () => {
    if (letterOpen) return;
    holding.current = true;
    setIsHolding(true);
  };
  const stop = () => {
    holding.current = false;
    setIsHolding(false);
  };

  const rings = [0, 1, 2, 3].map((i) => beat - i).filter((b) => b > 0);

  return (
    <section
      ref={sectionRef}
      id="heartbeat"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 py-16 text-center"
    >
      {/* warm rose-gold backdrop that blooms while holding */}
      <motion.div
        aria-hidden="true"
        className="gpu pointer-events-none absolute left-1/2 top-1/2 h-[110vmax] w-[110vmax] -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: warmOpacity,
          scale: warmScale,
          background:
            "radial-gradient(circle,rgba(255,214,170,0.95) 0%,rgba(246,184,168,0.8) 9%,rgba(244,63,94,0.6) 20%,rgba(120,20,70,0.35) 33%,transparent 50%)",
        }}
      />

      {/* floating mini hearts */}
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: miniOpacity }}>
        {MINI.map((m, i) => (
          <span
            key={i}
            className="float-up absolute bottom-[8%] text-rosegold"
            style={{
              left: `${m.left}%`,
              animationDelay: `${m.delay}s`,
              animationDuration: `${m.dur}s`,
              ["--dx" as string]: `${m.dx}px`,
            }}
          >
            <TinyHeart style={{ width: m.size, height: m.size }} />
          </span>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4 }}
        className="relative z-10 mb-4"
      >
        <p className="text-[0.65rem] uppercase tracking-[0.5em] text-rosegold/80 sm:text-xs">Chapter Four</p>
        <h2 className="mt-3 font-display text-4xl font-light italic text-cream sm:text-6xl" style={{ textShadow: "0 2px 30px rgba(10,14,26,0.6)" }}>
          The <span className="text-rose">Heartbeat</span> Sync
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm font-light leading-relaxed text-cream/70">
          This is what you do to me. Press and hold, and don't let go.
        </p>
      </motion.div>

      {/* ---- the heart ---- */}
      <div className="relative z-10 my-8 flex h-[min(60vw,330px)] w-[min(60vw,330px)] items-center justify-center sm:my-12">
        {/* ripples on each beat */}
        {rings.map((b) => (
          <span
            key={b}
            aria-hidden="true"
            className="ring-out pointer-events-none absolute inset-[8%] rounded-full border border-rosegold/60"
          />
        ))}

        <motion.div
          aria-hidden="true"
          className="gpu absolute inset-[-25%] rounded-full"
          style={{
            opacity: glow,
            scale: haloScale,
            background: "radial-gradient(circle,rgba(244,63,94,0.55) 0%,rgba(244,63,94,0.18) 38%,transparent 68%)",
          }}
        />

        <motion.div className="gpu relative w-[78%]" style={{ scale }}>
          <svg viewBox="0 0 100 90" className="block w-full overflow-visible" role="img" aria-label="A beating heart">
            <defs>
              <linearGradient id="hb-fill" x1="0" y1="0" x2="0.4" y2="1">
                <stop offset="0%" stopColor="#FF6B86" />
                <stop offset="55%" stopColor="#F43F5E" />
                <stop offset="100%" stopColor="#9F1239" />
              </linearGradient>
              <linearGradient id="hb-stroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFE1D6" />
                <stop offset="100%" stopColor="#F6B8A8" />
              </linearGradient>
              <radialGradient id="hb-shine" cx="30%" cy="22%" r="40%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path d={HEART_D} fill="url(#hb-fill)" stroke="url(#hb-stroke)" strokeWidth="1.2" strokeLinejoin="round" />
            <path d={HEART_D} fill="url(#hb-shine)" />
            <path
              d="M17 22 C 19 15, 25 11, 31 11"
              fill="none"
              stroke="#fff"
              strokeOpacity="0.6"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      </div>

      {/* ---- hold button ---- */}
      <div className="relative z-10 flex flex-col items-center">
        <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-cream/70">
          <TinyHeart className="mini-beat h-3 w-3 text-rose" />
          <span ref={bpmRef} className="tabular-nums">62</span> bpm
        </p>

        <button
          type="button"
          aria-label="Hold to feel my heartbeat"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId);
            start();
          }}
          onPointerUp={stop}
          onPointerCancel={stop}
          onLostPointerCapture={stop}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if ((e.key === " " || e.key === "Enter") && !e.repeat) {
              e.preventDefault();
              start();
            }
          }}
          onKeyUp={(e) => (e.key === " " || e.key === "Enter") && stop()}
          onBlur={stop}
          className={cn(
            "relative touch-none select-none overflow-hidden rounded-full border px-8 py-4 text-sm uppercase tracking-[0.25em] outline-none transition-[border-color,box-shadow,color] duration-500 focus-visible:ring-2 focus-visible:ring-rosegold sm:px-10 sm:text-base",
            isHolding
              ? "border-rosegold bg-midnight/40 text-white shadow-[0_0_50px_rgba(244,63,94,0.7)]"
              : "border-rosegold/50 bg-midnight/40 text-rosegold shadow-[0_0_30px_rgba(244,63,94,0.25)] hover:border-rosegold"
          )}
          style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
        >
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 origin-left bg-gradient-to-r from-rose/80 to-rosegold/90"
            style={{ scaleX: progress }}
          />
          <span className="relative">{isHolding ? "Keep holding..." : "Hold to feel my heartbeat"}</span>
        </button>

        <div className="mt-5 h-6">
          {hasRead && !letterOpen && (
            <button
              type="button"
              onClick={() => setLetterOpen(true)}
              className="text-xs uppercase tracking-[0.3em] text-rosegold/80 underline-offset-8 transition hover:text-white hover:underline"
            >
              Read my letter again
            </button>
          )}
        </div>
      </div>

      <LoveLetter open={letterOpen} onClose={() => setLetterOpen(false)} />
    </section>
  );
}
