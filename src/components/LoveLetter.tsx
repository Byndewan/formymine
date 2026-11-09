import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TinyHeart } from "./HeartPath";

const PARAGRAPHS = [
  "Two years, and then some. I've tried to find the right words for this so many times, and every time they feel too small, because you are the biggest thing that has ever happened to me.",
  "You didn't arrive in my life loudly. You arrived like the first star at dusk, quietly, and then suddenly I couldn't imagine the sky without you.",
  "Thank you for staying on the days I was hard to love. Thank you for your patience, your laugh, and the way you make an ordinary day feel like something worth remembering. You taught me that home isn't a place. It's a person. It's you.",
  "I want you to hear this clearly, because you deserve certainty and not just pretty words: I am serious about you. About us. Not for a season, and not until it gets easy. For the long run, for the quiet years, for the hard ones, for all of it.",
  "My commitment to you is not a feeling that comes and goes. It's a decision I make every single morning, and I will keep making it for the rest of my life.",
  "Whatever tomorrow brings, my hand is already in yours. Every 17th of October, and every ordinary day in between, I will choose you.",
  "You are my little world, Azlia. And I promise to protect it, cherish it, and love it, always.",
];

export default function LoveLetter({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="letter"
          role="dialog"
          aria-modal="true"
          aria-label="A love letter for Azlia"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain"
          style={{
            background:
              "radial-gradient(120% 70% at 50% 0%,rgba(246,184,168,0.28) 0%,rgba(92,22,56,0.9) 35%,#14081f 75%,#0A0E1A 100%)",
          }}
        >
          <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center px-6 pb-20 pt-16 text-center sm:pt-24">
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3, type: "spring", damping: 12 }}
            >
              <TinyHeart className="mini-beat h-12 w-12 text-rose drop-shadow-[0_0_18px_rgba(244,63,94,0.8)]" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.7 }}
              className="mt-8 font-display text-3xl italic text-rosegold sm:text-4xl"
            >
              My dearest Azlia,
            </motion.p>

            <div className="mt-8 space-y-6 sm:space-y-7">
              {PARAGRAPHS.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                  transition={{ duration: 1.4, delay: Math.min(i, 2) * 0.7 + 1.1, ease: "easeOut" }}
                  className="font-display text-xl font-light leading-[1.7] text-cream/90 sm:text-[1.65rem] sm:leading-[1.7]"
                >
                  {p}
                </motion.p>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 1.6 }}
              className="mt-10 font-display text-xl italic text-rosegold sm:text-2xl"
            >
              Forever yours,
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
              className="shimmer-text mt-8 bg-gradient-to-r from-rosegold via-white to-rose bg-clip-text font-display text-[clamp(2.2rem,8vw,4.5rem)] font-medium italic leading-tight text-transparent"
            >
              Happy Anniversary, Azlia.
            </motion.h2>

            <motion.button
              type="button"
              onClick={onClose}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 1.5 }}
              className="mt-14 rounded-full border border-rosegold/40 px-7 py-3 text-xs uppercase tracking-[0.3em] text-rosegold transition hover:bg-rosegold/10"
            >
              Close ♡
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
