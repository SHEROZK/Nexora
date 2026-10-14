"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "@/config/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The hero's motion, chosen in the admin panel:
 *  - "full":   screens level out as the page scrolls, and shift by depth with the pointer
 *  - "scroll": screens level out on scroll only
 *  - "still":  nothing moves
 * With a mouse and "full", each [data-depth] layer follows the pointer; on scroll every
 * tilted [data-square] rotates to dead level and the two words ease apart.
 * Nothing here is needed to read the hero; it is all additive.
 */
export function HeroMotion({ children, className }: { children: React.ReactNode; className?: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || motion.hero === "still") return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scroll = { trigger: el, start: "top top", end: "bottom top", scrub: 0.5 };
        gsap.to("[data-word='1']", { xPercent: -6, ease: "none", scrollTrigger: scroll });
        gsap.to("[data-word='2']", { xPercent: 6, ease: "none", scrollTrigger: scroll });
        gsap.to("[data-square]", {
          rotation: 0,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "45% top", scrub: 0.5 },
        });
      });

      if (motion.hero === "full") {
        mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
          const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", el).map((layer) => ({
            depth: Number(layer.dataset.depth),
            x: gsap.quickTo(layer, "x", { duration: 0.9, ease: "power3.out" }),
            y: gsap.quickTo(layer, "y", { duration: 0.9, ease: "power3.out" }),
          }));
          const onMove = (event: PointerEvent) => {
            const dx = event.clientX / window.innerWidth - 0.5;
            const dy = event.clientY / window.innerHeight - 0.5;
            for (const layer of layers) {
              layer.x(dx * layer.depth);
              layer.y(dy * layer.depth);
            }
          };
          el.addEventListener("pointermove", onMove);
          return () => el.removeEventListener("pointermove", onMove);
        });
      }

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className={className}>
      {children}
    </section>
  );
}
