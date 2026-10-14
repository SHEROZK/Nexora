"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { motion, motionSpeed } from "@/config/site";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/** Elements that have already been revealed, so a route change never replays them. */
const revealed = new WeakSet<HTMLElement>();

const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Plays an element's entrance with the Web Animations API.
 *
 * It deliberately changes no attribute on the element: no class, no inline style.
 * These elements are rendered by React on the server, and parts of the page hydrate
 * later than this provider does. Editing their attributes before then makes React
 * report a hydration mismatch. An animation that holds its final frame achieves the
 * same result and leaves the markup exactly as the server sent it.
 */
function reveal(el: HTMLElement) {
  if (revealed.has(el)) return;
  revealed.add(el);

  const kind = el.dataset.reveal;
  const wipe = [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }];
  let frames: Keyframe[];
  if (kind === "rule") frames = [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }];
  else if (kind === "wipe" || motion.reveal === "wipe") frames = wipe;
  else if (motion.reveal === "fade") frames = [{ opacity: 0 }, { opacity: 1 }];
  else frames = [{ opacity: 0, transform: "translateY(22px)" }, { opacity: 1, transform: "none" }];

  // --i is the element's place in a staggered group, set inline where the group is rendered.
  const order = Number(getComputedStyle(el).getPropertyValue("--i")) || 0;
  el.animate(frames, {
    duration: (frames === wipe ? 1200 : 900) / motionSpeed,
    delay: (order * 80) / motionSpeed,
    easing: EASE_OUT_EXPO,
    fill: "both",
  });
}

/**
 * Owns the three site-wide motion concerns so no other component has to:
 *  1. smooth scrolling (Lenis, driven by GSAP's ticker, fine pointers only),
 *  2. the [data-reveal] scroll reveals (IntersectionObserver + CSS),
 *  3. the reading-progress line.
 * Component-level timelines live in their own components and are scoped there.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const progress = useRef<HTMLDivElement>(null);

  // 1. Smooth scrolling.
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!motion.smoothScroll || !finePointer || reduced) return;

    const lenis = new Lenis({ lerp: 0.12, anchors: { offset: -72 }, autoRaf: false });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // A fresh load of /#section makes the browser start gliding to that section, and Lenis
    // taking over the scroll cancels the glide a few pixels in. Finish the jump ourselves.
    // Reloads and back/forward are left alone: there the browser restores the old position.
    let cancelled = false;
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const hash = window.location.hash.slice(1);
    if (hash && navigation?.type === "navigate") {
      const jump = () => {
        const target = document.getElementById(decodeURIComponent(hash));
        if (target && !cancelled) lenis.scrollTo(target, { immediate: true, force: true, offset: -72 });
      };
      jump();
      // Web fonts change line breaks and so the section's position: land again once they are in,
      // unless the visitor has already started scrolling somewhere else.
      const landed = window.scrollY;
      document.fonts.ready.then(() => {
        if (Math.abs(window.scrollY - landed) < 4) jump();
      });
    }

    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  // Timed animations run faster or slower by the speed chosen in the admin panel.
  useEffect(() => {
    gsap.globalTimeline.timeScale(motionSpeed);
    return () => {
      gsap.globalTimeline.timeScale(1);
    };
  }, []);

  // 2. Scroll reveals. Re-scanned whenever the route changes.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-ready");

    // Nothing to play: the stylesheet already shows everything in these two cases.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || motion.reveal === "none") return;

    const targets = [...document.querySelectorAll<HTMLElement>("[data-reveal]")].filter((el) => !revealed.has(el));
    if (!("IntersectionObserver" in window)) {
      root.classList.add("reveal-all");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          reveal(entry.target as HTMLElement);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    targets.forEach((el) => observer.observe(el));

    // New route, new document height: let ScrollTrigger and Lenis re-measure.
    const frame = requestAnimationFrame(() => {
      window.__lenis?.resize();
      ScrollTrigger.refresh();
    });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  // 3. Reading progress.
  useGSAP(
    () => {
      if (!progress.current) return;
      gsap.to(progress.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.25, invalidateOnRefresh: true },
      });
    },
    { dependencies: [] },
  );

  return (
    <>
      <div ref={progress} className="scroll-progress" aria-hidden="true" />
      {children}
    </>
  );
}
