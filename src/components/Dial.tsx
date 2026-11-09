import { useCallback, useEffect, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { cn } from "../utils/cn";

const mod = (a: number, n: number) => ((a % n) + n) % n;

function DrumItem({ k, n, pos, itemH }: { k: number; n: number; pos: MotionValue<number>; itemH: number }) {
  // signed, wrapped distance from the centre of the drum (in items)
  const delta = useTransform(pos, (p) => {
    let d = mod(k - p, n);
    if (d > n / 2) d -= n;
    return d;
  });
  const y = useTransform(delta, (d) => d * itemH);
  const opacity = useTransform(delta, (d) => Math.max(0, 1 - Math.abs(d) / 2.1) ** 1.4);
  const scale = useTransform(delta, (d) => 1 - Math.min(Math.abs(d), 2) * 0.17);
  const rotateX = useTransform(delta, (d) => Math.max(-70, Math.min(70, d * -26)));

  return (
    <motion.div
      aria-hidden="true"
      className="absolute left-0 top-1/2 flex w-full items-center justify-center font-display font-light tabular-nums text-cream"
      style={{
        height: itemH,
        marginTop: -itemH / 2,
        fontSize: itemH * 0.8,
        y,
        opacity,
        scale,
        rotateX,
        willChange: "transform, opacity",
      }}
    >
      {String(k + 1).padStart(2, "0")}
    </motion.div>
  );
}

type DialProps = {
  label: string;
  count: number;
  initial: number; // 1-based
  itemH: number;
  disabled?: boolean;
  matched?: boolean;
  onSettle: (value: number) => void;
};

/**
 * A vertical rotary drum. Drag, mouse-wheel/scroll, arrow keys or the chevrons all spin it.
 * Reports its (1-based) value once it has come to rest.
 */
export default function Dial({ label, count, initial, itemH, disabled, matched, onSettle }: DialProps) {
  const pos = useMotionValue(initial - 1);
  const targetRef = useRef(initial - 1);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const settleCb = useRef(onSettle);
  settleCb.current = onSettle;
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; pos: number; lastY: number; lastT: number; v: number } | null>(null);

  const settle = useCallback(
    (target: number) => {
      anim.current?.stop();
      targetRef.current = target;
      anim.current = animate(pos, target, {
        type: "spring",
        stiffness: 240,
        damping: 28,
        mass: 0.8,
        onComplete: () => settleCb.current(mod(target, count) + 1),
      });
    },
    [pos, count]
  );

  const step = useCallback((dir: number) => settle(targetRef.current + dir), [settle]);

  // wheel needs a non-passive listener so we can stop the page from scrolling while hovering the dial
  useEffect(() => {
    const el = boxRef.current!;
    let lastStep = 0;
    const onWheel = (e: WheelEvent) => {
      if (disabledRef.current) return;
      e.preventDefault();
      const now = performance.now();
      if (now - lastStep < 130 || Math.abs(e.deltaY) < 2) return;
      lastStep = now;
      step(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [step]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    anim.current?.stop();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, pos: pos.get(), lastY: e.clientY, lastT: performance.now(), v: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    pos.set(d.pos - (e.clientY - d.y) / itemH);
    const now = performance.now();
    const dt = Math.max(1, now - d.lastT);
    d.v = d.v * 0.6 + (((d.lastY - e.clientY) / itemH) / dt) * 1000 * 0.4;
    d.lastY = e.clientY;
    d.lastT = now;
  };
  const endDrag = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const inertia = Math.max(-5, Math.min(5, d.v * 0.2));
    settle(Math.round(pos.get() + inertia));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "ArrowUp") (e.preventDefault(), step(-1));
    if (e.key === "ArrowDown") (e.preventDefault(), step(1));
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={boxRef}
        role="spinbutton"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={count}
        aria-valuenow={initial}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn(
          "relative touch-none select-none overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-rosegold/70",
          disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        )}
        style={{ width: itemH * 1.85, height: itemH * 4 }}
      >
        {/* centre selection band */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-xl border-y transition-all duration-700",
            matched
              ? "border-amber-300/80 bg-amber-300/15 shadow-[0_0_40px_rgba(251,191,36,0.55)]"
              : "border-rose/40 bg-rose/10"
          )}
          style={{ height: itemH }}
        />
        <div
          className="absolute inset-0"
          style={{
            WebkitMaskImage: "linear-gradient(180deg,transparent 0%,#000 32%,#000 68%,transparent 100%)",
            maskImage: "linear-gradient(180deg,transparent 0%,#000 32%,#000 68%,transparent 100%)",
            perspective: itemH * 7,
          }}
        >
          {Array.from({ length: count }, (_, k) => (
            <DrumItem key={k} k={k} n={count} pos={pos} itemH={itemH} />
          ))}
        </div>

        {/* tap zones */}
        {!disabled && (
          <>
            <button
              type="button"
              aria-label={`${label} previous`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => step(-1)}
              className="absolute inset-x-0 top-0 z-10 flex h-[22%] items-start justify-center pt-1 text-rosegold/50 transition-colors hover:text-rosegold"
            >
              <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true">
                <path d="M2 8l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={`${label} next`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => step(1)}
              className="absolute inset-x-0 bottom-0 z-10 flex h-[22%] items-end justify-center pb-1 text-rosegold/50 transition-colors hover:text-rosegold"
            >
              <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true">
                <path d="M2 2l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>
      <span className="mt-3 text-[0.65rem] uppercase tracking-[0.4em] text-rosegold/70 sm:text-xs">{label}</span>
    </div>
  );
}
