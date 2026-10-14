"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

interface Props {
  as?: "h2" | "h3" | "p";
  className?: string;
  id?: string;
  children: React.ReactNode;
}

/**
 * A heading whose lines rise from behind a mask when it scrolls into view.
 * The text is plain, visible HTML until GSAP takes over, so nothing depends on
 * JavaScript to be readable. Skipped entirely under reduced motion.
 */
export function SplitHeading({ as: Tag = "h2", className, id, children }: Props) {
  const ref = useRef<HTMLHeadingElement & HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let split: SplitText | undefined;
        let cancelled = false;

        // Line breaks are only correct once the web fonts have arrived.
        document.fonts.ready.then(() => {
          if (cancelled) return;
          split = SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: 1.15,
                ease: "expo.out",
                stagger: 0.09,
                scrollTrigger: { trigger: el, start: "top 90%", once: true },
              }),
          });
        });

        return () => {
          cancelled = true;
          split?.revert();
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
