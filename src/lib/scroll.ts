import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

let locks = 0;

/** Stops the page behind an open overlay from scrolling. Calls nest safely. */
export function lockScroll() {
  locks += 1;
  if (locks > 1) return;
  window.__lenis?.stop();
  document.documentElement.style.overflow = "hidden";
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  window.__lenis?.start();
  document.documentElement.style.overflow = "";
}

export function scrollToTop() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.__lenis) window.__lenis.scrollTo(0, { immediate: reduced });
  else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
}
