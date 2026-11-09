import { motion } from "framer-motion";

const COLORS = ["#FDE68A", "#FBBF24", "#FB923C", "#F9A8A8", "#F43F5E"];

const RAYS = Array.from({ length: 36 }, (_, i) => ({
  a: i * 10,
  len: i % 2 ? 360 : 480,
  w: i % 2 ? 6 : 12,
}));

const RAYS_SHORT = Array.from({ length: 18 }, (_, i) => ({
  a: i * 20 + 10,
  len: 250,
  w: 16,
}));

const SPARKS = Array.from({ length: 48 }, (_, i) => {
  const a = (i / 48) * Math.PI * 2 + (i % 3) * 0.07;
  const d = 180 + ((i * 53) % 280);
  return {
    x: Math.cos(a) * d,
    y: Math.sin(a) * d,
    r: 2 + (i % 4),
    c: COLORS[i % COLORS.length],
    delay: (i % 6) * 0.04,
  };
});

/** Warm SVG light explosion, centred on its parent (parent must be `relative`). */
export default function Starburst() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2">
      <svg viewBox="-500 -500 1000 1000" className="h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="sb-flash">
            <stop offset="0%" stopColor="#FFF7DD" stopOpacity="1" />
            <stop offset="35%" stopColor="#FBBF24" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#F43F5E" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sb-ray" gradientUnits="userSpaceOnUse" x1="0" y1="-24" x2="0" y2="-480">
            <stop offset="0%" stopColor="#FFF3C4" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#FBBF24" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.circle
          r="260"
          fill="url(#sb-flash)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.1, 2.6], opacity: [0, 1, 0] }}
          transition={{ duration: 2, ease: "easeOut", times: [0, 0.25, 1] }}
        />

        <motion.g
          initial={{ scale: 0.1, opacity: 0, rotate: 0 }}
          animate={{ scale: [0.1, 1, 1.18], opacity: [0, 1, 0], rotate: 28 }}
          transition={{ duration: 2.5, ease: "easeOut", times: [0, 0.3, 1] }}
        >
          {RAYS.map((r) => (
            <polygon
              key={r.a}
              points={`0,-24 ${-r.w},${-r.len} ${r.w},${-r.len}`}
              transform={`rotate(${r.a})`}
              fill="url(#sb-ray)"
            />
          ))}
        </motion.g>

        <motion.g
          initial={{ scale: 0.1, opacity: 0, rotate: 0 }}
          animate={{ scale: [0.1, 1, 1.1], opacity: [0, 0.9, 0], rotate: -35 }}
          transition={{ duration: 2.3, ease: "easeOut", delay: 0.1, times: [0, 0.35, 1] }}
        >
          {RAYS_SHORT.map((r) => (
            <polygon
              key={r.a}
              points={`0,-24 ${-r.w},${-r.len} ${r.w},${-r.len}`}
              transform={`rotate(${r.a})`}
              fill="url(#sb-ray)"
            />
          ))}
        </motion.g>

        {[0, 0.22, 0.44].map((d) => (
          <motion.circle
            key={d}
            r="50"
            fill="none"
            stroke="#FBBF77"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 9, opacity: [0, 1, 0] }}
            transition={{ duration: 1.9, delay: d, ease: "easeOut" }}
          />
        ))}

        {SPARKS.map((s, i) => (
          <motion.circle
            key={i}
            r={s.r}
            fill={s.c}
            initial={{ x: 0, y: 0, opacity: 0, scale: 1 }}
            animate={{ x: s.x, y: s.y, opacity: [0, 1, 1, 0], scale: [1, 1.2, 0.2] }}
            transition={{ duration: 1.9, delay: s.delay, ease: "easeOut" }}
          />
        ))}
      </svg>
    </div>
  );
}
