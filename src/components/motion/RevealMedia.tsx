"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "@/config/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Mask = "up" | "left" | "circle" | "diagonal";

/** Start and end clip-paths. Each pair has the same shape and point count so it can be tweened. */
const MASKS: Record<Mask, [string, string]> = {
  up: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"],
  left: ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"],
  circle: ["circle(0% at 50% 50%)", "circle(75% at 50% 50%)"],
  diagonal: ["polygon(0% 0%, 0% 0%, -30% 100%, -30% 100%)", "polygon(0% 0%, 130% 0%, 100% 100%, -30% 100%)"],
};

/**
 * Opens its content through a mask when it scrolls into view. Each project uses a
 * different mask, which is most of what makes the spreads feel unlike each other.
 * The starting state is set by GSAP, so without JavaScript the content is simply visible.
 */
export function RevealMedia({ children, className, mask = "up" }: { children: React.ReactNode; className?: string; mask?: Mask }) {
  const frame = useRef<HTMLDivElement>(null);
  // The panel can force one mask everywhere, or switch the reveal off.
  const chosen = motion.imageMask === "varied" ? mask : motion.imageMask;

  useGSAP(
    () => {
      if (chosen === "none") return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const [from, to] = MASKS[chosen];
        gsap.fromTo(
          frame.current,
          { clipPath: from },
          {
            clipPath: to,
            duration: chosen === "circle" ? 1.7 : 1.4,
            ease: "expo.out",
            clearProps: "clipPath",
            scrollTrigger: { trigger: frame.current, start: "top 86%", once: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: frame, dependencies: [chosen] },
  );

  return (
    <div ref={frame} className={className}>
      {children}
    </div>
  );
}
