import { motion, useTransform, type MotionValue } from "framer-motion";

/**
 * Fixed, scroll-reactive background. Colour shifts are done by cross-fading
 * stacked gradient layers via opacity (compositor-only → 60fps).
 */
export default function Backdrop({ progress }: { progress: MotionValue<number> }) {
  const purple = useTransform(progress, [0, 0.22], [0, 1]);
  const wine = useTransform(progress, [0.3, 0.55, 0.85], [0, 1, 0.15]);
  const indigo = useTransform(progress, [0.55, 0.95], [0, 1]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg,#0A0E1A 0%,#120a24 55%,#1A0B2E 100%)" }}
      />
      <motion.div
        className="absolute inset-0 gpu"
        style={{
          opacity: purple,
          background: "radial-gradient(120% 80% at 50% 25%,#2b1250 0%,#1A0B2E 55%,#0d0a1f 100%)",
        }}
      />
      <motion.div
        className="absolute inset-0 gpu"
        style={{
          opacity: wine,
          background:
            "radial-gradient(90% 65% at 72% 62%,#55173a 0%,#2c0d30 50%,rgba(26,11,46,0) 100%), radial-gradient(70% 50% at 20% 25%,#3a1250 0%,rgba(26,11,46,0) 100%)",
        }}
      />
      <motion.div
        className="absolute inset-0 gpu"
        style={{
          opacity: indigo,
          background: "linear-gradient(180deg,#0e1330 0%,#0A0E1A 60%,#160828 100%)",
        }}
      />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 100% at 50% 50%,transparent 55%,rgba(5,6,14,0.55) 100%)" }}
      />
    </div>
  );
}
