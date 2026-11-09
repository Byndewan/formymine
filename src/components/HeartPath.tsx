/** Shared SVG heart outline (viewBox 0 0 100 90) */
export const HEART_D =
  "M50 87 C22 64 3 47 3 27 C3 13 14 3 28 3 C38 3 46 8 50 17 C54 8 62 3 72 3 C86 3 97 13 97 27 C97 47 78 64 50 87 Z";

export function TinyHeart({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 90" className={className} style={style} aria-hidden="true">
      <path d={HEART_D} fill="currentColor" />
    </svg>
  );
}
