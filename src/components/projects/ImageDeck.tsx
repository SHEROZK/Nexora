"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ProjectImage } from "@/content/projects";

/**
 * A project's photos as a pile of prints: the front one nearly square to the page, the
 * ones behind it knocked crooked so their edges show. "Next" lifts the front print out to
 * the side and tucks it under the pile while the rest move up a place; "Previous" pulls
 * the bottom print out and lays it back on top. Everything is a CSS transition on
 * transform, so a second press mid-shuffle retargets instead of restarting.
 */

/** Where a print sits at each depth. Deeper than the last entry, prints wait hidden behind it. */
const SLOTS = [
  { x: 0, y: 0, rotate: -1.5 },
  { x: 3.5, y: -3, rotate: 3.5 },
  { x: -3, y: 2, rotate: -4.5 },
  { x: 2, y: 3, rotate: 5.5 },
];
/** Out beside the pile, mid-shuffle. Percentages of the print's own size. */
const LIFTED = { x: 78, y: -6, rotate: 11 };
/** How long a print stays out to the side before it changes layer and settles. */
const LIFT_MS = 220;

const place = ({ x, y, rotate }: { x: number; y: number; rotate: number }) => `translate(${x}%, ${y}%) rotate(${rotate}deg)`;

export function ImageDeck({ images }: { images: ProjectImage[] }) {
  const count = images.length;
  // order[depth] = index of the image at that depth; order[0] is on top.
  const [order, setOrder] = useState(() => images.map((_, i) => i));
  // The print currently out to the side, and whether it is on its way under the pile or onto it.
  const [lifted, setLifted] = useState<{ index: number; toBack: boolean } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const shuffle = (direction: 1 | -1) => {
    window.clearTimeout(timer.current);
    const moving = direction === 1 ? order[0] : order[count - 1];
    setOrder((current) => (direction === 1 ? [...current.slice(1), current[0]] : [current[count - 1], ...current.slice(0, -1)]));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLifted(null);
      return;
    }
    setLifted({ index: moving, toBack: direction === 1 });
    timer.current = window.setTimeout(() => setLifted(null), LIFT_MS);
  };

  const front = images[order[0]];
  const position = order[0] + 1;

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Project photos"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") shuffle(1);
        else if (event.key === "ArrowLeft") shuffle(-1);
        else return;
        event.preventDefault();
      }}
      className="outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent"
    >
      {/* Room on the right for the print that is lifted out, so it never runs off the page. */}
      {/* isolate keeps the prints' layers inside the pile, so a tilted corner never sits over the controls. */}
      <div className="relative isolate mx-auto aspect-[4/3] w-[78%] md:mr-[26%] md:w-[56%]">
        {images.map((image, i) => {
          const depth = order.indexOf(i);
          const isLifted = lifted?.index === i;
          const slot = SLOTS[Math.min(depth, SLOTS.length - 1)];
          // While out to the side, a print keeps the layer it is leaving; once it settles it takes its new one.
          const layer = isLifted ? (lifted.toBack ? count + 1 : 0) : count - depth;
          return (
            <button
              key={image.src}
              type="button"
              tabIndex={-1}
              aria-hidden={depth !== 0}
              onClick={() => depth === 0 && shuffle(1)}
              className="mount absolute inset-0 flex cursor-pointer items-center justify-center overflow-hidden p-[2.5%] shadow-[0_1px_0_var(--ink)] transition-[transform,opacity] duration-[420ms] ease-[var(--ease-in-out-cubic)] will-change-transform"
              style={{
                zIndex: layer,
                pointerEvents: depth === 0 && !isLifted ? "auto" : "none",
                transform: place(isLifted ? LIFTED : slot),
                opacity: depth < SLOTS.length || isLifted ? 1 : 0,
                transitionTimingFunction: isLifted ? "var(--ease-out-expo)" : undefined,
                transitionDuration: isLifted ? `${LIFT_MS + 80}ms` : undefined,
              }}
            >
              <span className="relative block size-full">
                <Image src={image.src} alt={depth === 0 ? image.alt : ""} fill sizes="(min-width: 768px) 46vw, 78vw" className="object-contain" preload={i === 0} />
              </span>
              <span className="sr-only">Next photo</span>
            </button>
          );
        })}
      </div>

      {/* Clear of the lowest tilted corner (about a tenth of the print's height). */}
      <div className="relative mt-[clamp(4rem,9vw,6rem)] flex flex-wrap items-start justify-between gap-x-8 gap-y-4 md:ml-[18%] md:mr-[26%]">
        <p className="t-data max-w-[60ch] text-fg-2" aria-live="polite">
          Fig. {position}: {front.caption}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <span className="t-data mr-2 tabular-nums text-fg-2">
            {position} / {count}
          </span>
          <button type="button" onClick={() => shuffle(-1)} className="inline-flex size-11 items-center justify-center border-2 border-fg transition-colors duration-150 hover:bg-fg hover:text-surface" aria-label="Previous photo">
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => shuffle(1)} className="inline-flex size-11 items-center justify-center border-2 border-fg transition-colors duration-150 hover:bg-fg hover:text-surface" aria-label="Next photo">
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
