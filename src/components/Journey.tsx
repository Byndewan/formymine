import { useRef, type RefObject } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "../utils/cn";

const CHAPTERS = [
  {
    no: "I",
    kicker: "Where it began",
    title: "You walked into my life so quietly",
    body: "Over two years ago, the universe moved a few small pieces and placed you in my path. I didn't know it then, but that was the day my life split into before you, and with you.",
  },
  {
    no: "II",
    kicker: "Through every season",
    title: "Thank you for staying",
    body: "We've shared long nights, ridiculous laughter, small fights that taught us big lessons, and quiet moments that said more than words ever could. Thank you for every single one, even the messy ones. Especially the messy ones.",
  },
  {
    no: "III",
    kicker: "What you gave me",
    title: "You turned someone I love into home",
    body: "You gave me patience when I was restless, softness when I was tired, and a place to rest when the world felt too loud. You made me want to be better, not for show, but for you.",
  },
  {
    no: "IV",
    kicker: "My promise, plainly",
    title: "I am not here for a season",
    body: "I want to be clear, because you deserve clarity and not just poetry. My commitment to you is unconditional: on the easy days, on the heavy ones, today, and every tomorrow I'm lucky enough to get. I am serious about us.",
  },
  {
    no: "V",
    kicker: "One date",
    title: "Written across my heart in permanent ink",
    body: "Every year it comes back around, and every year I fall a little more. Keep going. A vault is waiting, and only you know its combination.",
  },
];

function Card({ i, ch }: { i: number; ch: (typeof CHAPTERS)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start 98%", "end 2%"] });

  const opacity = useTransform(p, [0, 0.28, 0.72, 1], [0, 1, 1, 0]);
  const y = useTransform(p, [0, 1], [90, -90]);
  const scale = useTransform(p, [0, 0.3, 0.7, 1], [0.9, 1, 1, 0.95]);
  const ghostY = useTransform(p, [0, 1], [-150, 150]);
  const ghostOpacity = useTransform(p, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);
  const right = i % 2 === 1;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex min-h-[88vh] items-center justify-center",
        right ? "md:justify-end" : "md:justify-start"
      )}
    >
      {/* parallax ghost numeral */}
      <motion.span
        aria-hidden="true"
        style={{ y: ghostY, opacity: ghostOpacity }}
        className={cn(
          "gpu pointer-events-none absolute top-1/2 -translate-y-1/2 select-none font-display text-[clamp(9rem,34vw,22rem)] font-light italic leading-none text-rose/[0.07]",
          right ? "left-0 md:left-[6%]" : "right-0 md:right-[6%]"
        )}
      >
        {ch.no}
      </motion.span>

      <motion.article
        style={{ opacity, y, scale }}
        className="gpu relative w-full max-w-md overflow-hidden rounded-3xl border border-rose/20 p-7 shadow-[0_0_80px_-20px_rgba(244,63,94,0.45)] sm:p-9 md:max-w-lg"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{ background: "linear-gradient(150deg,rgba(38,16,64,0.92),rgba(10,14,26,0.9))" }}
        />
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full"
          style={{ background: "radial-gradient(circle,rgba(244,63,94,0.28),transparent 70%)" }}
        />
        <div className="mb-5 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.4em] text-rosegold/80 sm:text-xs">
          <span className="font-display text-base italic tracking-normal text-rose sm:text-lg">{ch.no}</span>
          <span className="h-px flex-1 bg-gradient-to-r from-rosegold/40 to-transparent" />
          {ch.kicker}
        </div>
        <h3 className="font-display text-[1.75rem] font-medium leading-tight text-cream sm:text-4xl">
          {ch.title}
        </h3>
        <p className="mt-4 text-[0.95rem] font-light leading-[1.85] text-cream/75 sm:text-base">{ch.body}</p>
      </motion.article>
    </div>
  );
}

export default function Journey({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 70%", "end 55%"] });
  const draw = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const statsRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={sectionRef} id="journey" className="relative px-5 pb-24 pt-16 sm:px-8">
      {/* the thread keeps drawing itself as you scroll */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 1000"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <motion.path
          d="M50 0 C 92 90, 8 190, 50 290 S 92 490, 50 590 S 8 790, 50 890 S 70 960, 50 1000"
          fill="none"
          stroke="rgba(244,63,94,0.22)"
          strokeWidth="9"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: draw }}
        />
        <motion.path
          d="M50 0 C 92 90, 8 190, 50 290 S 92 490, 50 590 S 8 790, 50 890 S 70 960, 50 1000"
          fill="none"
          stroke="#F43F5E"
          strokeWidth="1.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: draw }}
        />
      </svg>

      <div className="relative mx-auto max-w-5xl">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="mx-auto mb-10 max-w-xl pt-10 text-center"
        >
          <p className="text-[0.65rem] uppercase tracking-[0.5em] text-rosegold/70 sm:text-xs">Chapter Two</p>
          <h2 className="mt-4 font-display text-4xl font-light italic text-cream sm:text-6xl">
            The <span className="text-rose">2 Years</span> Journey
          </h2>
        </motion.header>

        {CHAPTERS.map((ch, i) => (
          <Card key={ch.no} i={i} ch={ch} />
        ))}

        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="mx-auto mt-6 grid max-w-2xl grid-cols-3 gap-3 text-center sm:gap-6"
        >
          {[
            ["2+", "years together"],
            ["1", "heart, yours"],
            ["∞", "tomorrows"],
          ].map(([big, small]) => (
            <div key={small} className="rounded-2xl border border-rose/15 bg-midnight/70 px-2 py-5 sm:py-7">
              <div className="font-display text-4xl text-rose sm:text-5xl">{big}</div>
              <div className="mt-1 text-[0.6rem] uppercase tracking-[0.25em] text-cream/60 sm:text-xs">{small}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
