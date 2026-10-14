"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { mailto } from "@/config/site";

/** Route-level error boundary. Keeps the header and footer; replaces only the broken page. */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="shell flex min-h-[80svh] flex-col justify-center py-[calc(var(--spacing-header)+3rem)]">
      <h1 className="t-display max-w-[14ch]">
        This page <em className="accent">failed</em> to load
      </h1>
      <p className="t-lead mt-6 max-w-[46ch] text-fg-2">
        Something went wrong while rendering it. Trying again usually works. If it keeps happening, I would like to
        know.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          <RotateCcw aria-hidden="true" />
          Try again
        </button>
        <Link href="/" className="btn btn-ghost">
          Back to the start
        </Link>
        <a href={mailto("A page on your site failed to load", error.digest ? `Reference: ${error.digest}` : undefined)} className="btn btn-ghost">
          Report it
        </a>
      </div>
    </div>
  );
}
