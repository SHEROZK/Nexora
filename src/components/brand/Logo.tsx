import { MARK, WORDMARK, brand } from "@/config/brand";
import { cn } from "@/lib/cn";

type Tone = "colour" | "mono";

/**
 * The mark. In colour the stems take the text colour and the steps keep the brand colours.
 * In mono everything takes the text colour, for dark and coloured surfaces, where the
 * cobalt step would disappear.
 */
export function LogoMark({ tone = "colour", className }: { tone?: Tone; className?: string }) {
  return (
    <svg viewBox={MARK.viewBox} className={cn("block aspect-square w-auto shrink-0", className)} aria-hidden="true" focusable="false">
      {tone === "mono" ? (
        <path fill="currentColor" d={MARK.silhouette} />
      ) : (
        <>
          {MARK.stems.map((stem) => (
            <rect key={stem.x} {...stem} fill="currentColor" />
          ))}
          {MARK.steps.map(({ fill, ...step }) => (
            <rect key={step.x} {...step} fill={fill} />
          ))}
        </>
      )}
    </svg>
  );
}

function Wordmark({ className }: { className?: string }) {
  return (
    <svg viewBox={WORDMARK.viewBox} className={cn("block w-auto", className)} aria-hidden="true" focusable="false">
      <path fill="currentColor" fillRule="evenodd" d={WORDMARK.d} />
    </svg>
  );
}

/**
 * The logo. "inline" is the mark and the name, for the header and menu, where the tagline
 * would be too small to read. "full" adds the tagline under the name, as drawn.
 */
export function Logo({ variant = "inline", tone = "colour", className }: { variant?: "inline" | "full"; tone?: Tone; className?: string }) {
  if (variant === "full") {
    return (
      <span className={cn("inline-flex items-start gap-4 sm:gap-5", className)} role="img" aria-label={`${brand.name}: ${brand.tagline}`}>
        <LogoMark tone={tone} className="h-16 sm:h-[5.5rem]" />
        <span className="flex h-16 flex-col justify-between pt-0.5 sm:h-[5.5rem]">
          <Wordmark className="h-[2.95rem] sm:h-[4rem]" />
          <span
            className={cn(
              "whitespace-nowrap font-sans text-[0.5625rem] font-semibold uppercase leading-none tracking-[0.14em] sm:text-[0.625rem] sm:tracking-[0.24em]",
              tone === "colour" ? "text-cobalt" : "text-fg-2",
            )}
            aria-hidden="true"
          >
            {brand.tagline}
          </span>
        </span>
      </span>
    );
  }
  return (
    <span className={cn("inline-flex h-8 items-center gap-2.5", className)}>
      <LogoMark tone={tone} className="h-8" />
      <Wordmark className="h-[1.375rem]" />
    </span>
  );
}
