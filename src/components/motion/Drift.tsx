"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "@/config/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Props {
  children: React.ReactNode;
  className?: string;
  /** Travel across one pass through the viewport, in percent of the element's own size. */
  x?: number;
  y?: number;
  /** Degrees turned across the pass. */
  rotate?: number;
  /**
   * Start at rest and travel the full distance one way, finishing while the element is
   * still mid-screen. For content that must end up fully readable, like a long line of type.
   */
  oneWay?: boolean;
  "aria-hidden"?: boolean;
}

/**
 * Moves its content against the scroll, independently of everything around it.
 * Used for the oversized numerals and annotations, so they slide past the layout
 * instead of sitting in it. Still under reduced motion.
 */
export function Drift({ children, className, x = 0, y = 0, rotate = 0, oneWay = false, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!motion.drift) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const from = oneWay ? 0 : -0.5;
        const to = oneWay ? 1 : 0.5;
        gsap.fromTo(
          ref.current,
          { xPercent: x * from, yPercent: y * from, rotation: rotate * from },
          {
            xPercent: x * to,
            yPercent: y * to,
            rotation: rotate * to,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top bottom", end: oneWay ? "center 42%" : "bottom top", scrub: 0.4 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [x, y, rotate, oneWay] },
  );

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
