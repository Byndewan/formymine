import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Dial from "./Dial";
import Starburst from "./Starburst";
import { cn } from "../utils/cn";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TARGET_DAY = 17;
const TARGET_MONTH = 10;

type Phase = "locked" | "bursting" | "open";

export default function Vault({ onUnlocked, onContinue }: { onUnlocked: () => void; onContinue: () => void }) {
  const [day, setDay] = useState(8);
  const [month, setMonth] = useState(3);
  const [phase, setPhase] = useState<Phase>("locked");
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(() =>
    typeof window === "undefined" ? 400 : Math.min(window.innerWidth * 0.92, window.innerHeight * 0.52, 520)
  );

  useEffect(() => {
    const el = boxRef.current!;
    const ro = new ResizeObserver(([e]) => setSize(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const itemH = Math.max(34, Math.round(size * 0.13));

  const dayOk = day === TARGET_DAY;
  const monthOk = month === TARGET_MONTH;

  useEffect(() => {
    if (phase !== "locked" || !dayOk || !monthOk) return;
    setPhase("bursting");
    const id = setTimeout(() => {
      setPhase("open");
      onUnlocked();
    }, 2100);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayOk, monthOk, phase]);

  const ticks = useMemo(
    () =>
      Array.from({ length: 72 }, (_, i) => {
        const a = (i / 72) * Math.PI * 2;
        const long = i % 6 === 0;
        const r1 = 190;
        const r2 = long ? 178 : 184;
        return { x1: 200 + Math.cos(a) * r1, y1: 200 + Math.sin(a) * r1, x2: 200 + Math.cos(a) * r2, y2: 200 + Math.sin(a) * r2, long };
      }),
    []
  );
  const bolts = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        return { x: 200 + Math.cos(a) * 158, y: 200 + Math.sin(a) * 158 };
      }),
    []
  );

  const opened = phase !== "locked";
  const matchCount = Number(dayOk) + Number(monthOk);

  return (
    <section id="vault" className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 py-14 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.2 }}
        className="mb-6 sm:mb-8"
      >
        <p className="text-[0.65rem] uppercase tracking-[0.5em] text-rosegold/70 sm:text-xs">Chapter Three</p>
        <h2 className="mt-3 font-display text-4xl font-light italic text-cream sm:text-6xl">
          The <span className={cn("transition-colors duration-1000", opened ? "text-amber-300" : "text-rose")}>17th October</span> Vault
        </h2>
      </motion.div>

      {/* ---- the vault ---- */}
      <motion.div
        ref={boxRef}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-5%" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative aspect-square w-[min(92vw,52svh,520px)]"
      >
        {/* glow */}
        <div
          aria-hidden="true"
          className="breathe absolute -inset-[12%] rounded-full transition-colors duration-1000"
          style={{
            background: opened
              ? "radial-gradient(circle,rgba(251,191,36,0.45) 0%,rgba(244,63,94,0.22) 40%,transparent 68%)"
              : "radial-gradient(circle,rgba(244,63,94,0.3) 0%,rgba(124,58,237,0.14) 42%,transparent 68%)",
          }}
        />

        {/* rotating ticks */}
        <svg viewBox="0 0 400 400" aria-hidden="true" className={cn("spin-cw absolute inset-0 transition-colors duration-1000", opened ? "text-amber-300" : "text-rose")}>
          {ticks.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="currentColor" strokeOpacity={t.long ? 0.9 : 0.45} strokeWidth={t.long ? 2 : 1} strokeLinecap="round" />
          ))}
        </svg>

        {/* counter-rotating dashed ring */}
        <svg viewBox="0 0 400 400" aria-hidden="true" className={cn("spin-ccw absolute inset-0 transition-colors duration-1000", opened ? "text-amber-200" : "text-rosegold")}>
          <circle cx="200" cy="200" r="170" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 9" strokeLinecap="round" />
        </svg>

        {/* static body */}
        <svg viewBox="0 0 400 400" aria-hidden="true" className={cn("absolute inset-0 transition-colors duration-1000", opened ? "text-amber-300" : "text-rose")}>
          <defs>
            <radialGradient id="vault-disc" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#1d0f35" />
              <stop offset="100%" stopColor="#090b17" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="196" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="148" fill="url(#vault-disc)" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="142" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
          {bolts.map((b, i) => (
            <circle key={i} cx={b.x} cy={b.y} r="4.5" fill="currentColor" fillOpacity={opened ? 1 : 0.75} />
          ))}
        </svg>

        {/* dials */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ gap: itemH * 0.25 }}>
          <Dial label="Day" count={31} initial={8} itemH={itemH} disabled={opened} matched={dayOk} onSettle={setDay} />
          <span aria-hidden="true" className="mb-6 font-display text-3xl text-rosegold/50">/</span>
          <Dial label="Month" count={12} initial={3} itemH={itemH} disabled={opened} matched={monthOk} onSettle={setMonth} />
        </div>

        <AnimatePresence>{phase === "bursting" && <Starburst key="burst" />}</AnimatePresence>
      </motion.div>

      {/* ---- readout ---- */}
      <div className="mt-6 min-h-[7.5rem] sm:mt-8">
        <AnimatePresence mode="wait">
          {phase === "locked" ? (
            <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-display text-3xl text-cream tabular-nums sm:text-4xl">
                {day} <span className="text-rosegold">{MONTHS[month - 1]}</span>
              </p>
              <p className="mt-3 max-w-sm px-2 text-sm font-light leading-relaxed text-cream/60">
                {matchCount === 1
                  ? "One of them is right... keep turning."
                  : "Turn the dials to the day we began. Drag, scroll, or tap the arrows."}
              </p>
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <p className="font-display text-3xl italic text-amber-200 sm:text-4xl">The vault opens.</p>
              <p className="mt-2 text-sm font-light text-cream/70">17 October. Our day. Always.</p>
              {phase === "open" && (
                <button
                  type="button"
                  onClick={onContinue}
                  className="mt-5 rounded-full border border-amber-300/50 bg-amber-300/10 px-7 py-3 text-xs uppercase tracking-[0.3em] text-amber-100 transition hover:bg-amber-300/20"
                >
                  Continue ↓
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
