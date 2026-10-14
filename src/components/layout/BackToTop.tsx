"use client";

import { ArrowUp } from "lucide-react";
import { scrollToTop } from "@/lib/scroll";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => {
        scrollToTop();
        // Move keyboard focus with the viewport, not just the scroll position.
        document.getElementById("main")?.focus({ preventScroll: true });
      }}
      className="t-data group flex min-h-11 items-center gap-2.5 self-start text-fg-2 transition-colors hover:text-fg sm:self-auto"
    >
      Back to top
      <ArrowUp className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true" />
    </button>
  );
}
