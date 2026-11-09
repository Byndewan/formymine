import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const L1 = "To my little world,";
const L2 = "Azlia Nisrina Afifah...";

function Caret() {
  return (
    <span className="relative inline-block w-0 align-baseline" aria-hidden="true">
      <span className="caret absolute -top-[0.78em] left-[0.06em] h-[0.95em] w-[2px] rounded-full bg-rose shadow-[0_0_10px_2px_rgba(244,63,94,0.7)]" />
    </span>
  );
}

export default function Hero() {
  const [n, setN] = useState(0);
  const total = L1.length + L2.length;
  const done = n >= total;

  useEffect(() => {
    if (n >= total) return;
    const delay = n === 0 ? 900 : n === L1.length ? 650 : 62 + Math.random() * 55;
    const id = setTimeout(() => setN((v) => v + 1), delay);
    return () => clearTimeout(id);
  }, [n, total]);

  const t1 = L1.slice(0, Math.min(n, L1.length));
  const r1 = L1.slice(t1.length);
  const t2 = L2.slice(0, Math.max(0, n - L1.length));
  const r2 = L2.slice(t2.length);
  const caretOnFirst = n <= L1.length;

  return (
    <section
      id="thread"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.6, delay: 0.3 }}
        className="mb-8 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.5em] text-rosegold/70 sm:text-xs"
      >
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-rosegold/60" />
        The Invisible Thread
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-rosegold/60" />
      </motion.div>

      <h1
        className="font-display text-[clamp(1.9rem,7vw,5rem)] font-light leading-[1.18] text-cream"
        style={{ textShadow: "0 0 40px rgba(244,63,94,0.35)" }}
        aria-label={`${L1} ${L2}`}
      >
        <span className="block" aria-hidden="true">
          {t1}
          {caretOnFirst && <Caret />}
          <span className="opacity-0">{r1}</span>
        </span>
        <span
          className="mt-1 block bg-gradient-to-r from-rosegold via-rose to-rosegold bg-clip-text font-medium italic text-transparent sm:mt-2"
          aria-hidden="true"
          style={{ textShadow: "none", filter: "drop-shadow(0 0 22px rgba(244,63,94,0.45))" }}
        >
          {t2}
          {!caretOnFirst && <Caret />}
          <span className="opacity-0">{r2}</span>
        </span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={done ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="mt-8 max-w-md font-display text-lg italic leading-relaxed text-cream/70 sm:text-xl"
      >
        Move your cursor, or drag a finger, and follow the thread that has always tied me to you.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={done ? { opacity: 1 } : {}}
        transition={{ duration: 1.5, delay: 0.8 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="text-pulse text-xs uppercase tracking-[0.45em] text-rosegold">Scroll slowly...</span>
        <span className="hint-pulse block h-10 w-px bg-gradient-to-b from-rosegold to-transparent" />
      </motion.div>
    </section>
  );
}
