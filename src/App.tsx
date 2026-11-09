import { useCallback, useEffect, useRef, useState } from "react";
import { useScroll } from "framer-motion";
import Backdrop from "./components/Backdrop";
import Cosmos from "./components/Cosmos";
import Hero from "./components/Hero";
import Journey from "./components/Journey";
import Vault from "./components/Vault";
import Heartbeat from "./components/Heartbeat";

export default function App() {
  const journeyRef = useRef<HTMLElement>(null);
  const heartRef = useRef<HTMLElement>(null);
  const [unlocked, setUnlocked] = useState(false);

  // drives the background colour shift
  const { scrollYProgress } = useScroll({ target: journeyRef, offset: ["start end", "end end"] });

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  const goToHeart = useCallback(() => {
    heartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // the final section only exists once the vault is open, so the scroll is "halted" at the vault until then
  useEffect(() => {
    if (!unlocked) return;
    const id = setTimeout(goToHeart, 250);
    return () => clearTimeout(id);
  }, [unlocked, goToHeart]);

  return (
    <div className="relative min-h-screen bg-midnight text-cream">
      <Backdrop progress={scrollYProgress} />
      <Cosmos />
      <main className="relative z-10">
        <Hero />
        <Journey sectionRef={journeyRef} />
        <Vault onUnlocked={() => setUnlocked(true)} onContinue={goToHeart} />
        {unlocked && <Heartbeat sectionRef={heartRef} />}
      </main>
    </div>
  );
}
