"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "@/config/site";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Props {
  /** Shown repeated end to end. Decorative: pass the same words to a real heading nearby. */
  words: string[];
  className?: string;
  /** Percent of the row's width travelled across one pass. Negative runs right to left. */
  travel?: number;
}

/**
 * One line of type too long for the screen, pushed sideways by the scroll and by nothing else.
 * It does not run on a timer, so it is still whenever the reader is.
 */
export function Marquee({ words, className, travel = -22 }: Props) {
  const row = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!motion.drift) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          row.current,
          { xPercent: travel < 0 ? 0 : travel * -1 },
          {
            xPercent: travel < 0 ? travel : 0,
            ease: "none",
            scrollTrigger: { trigger: row.current, start: "top bottom", end: "bottom top", scrub: 0.6 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: row, dependencies: [travel] },
  );

  return (
    <div className="overflow-hidden" aria-hidden="true">
      <div ref={row} className={cn("flex w-max whitespace-nowrap", className)}>
        {[0, 1, 2].map((copy) => (
          <span key={copy} className="flex shrink-0">
            {words.map((word) => (
              <span key={word} className="flex items-center">
                <span className="px-[0.14em]">{word}</span>
                <span className="mx-[0.1em] inline-block size-[0.28em] shrink-0 rounded-full bg-accent" />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
