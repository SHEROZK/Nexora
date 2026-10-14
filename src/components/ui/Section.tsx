import { cn } from "@/lib/cn";
import { SplitHeading } from "@/components/motion/SplitHeading";

interface Props {
  id?: string;
  /** The heading. Use <em className="accent"> for the one emphasised phrase. */
  heading: React.ReactNode;
  /** Supporting copy, set beside the heading on wide screens. */
  intro?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Standard page section: a display heading on the left, its intro on the right, content below. */
export function Section({ id, heading, intro, className, children }: Props) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-heading` : undefined} className={cn("py-[var(--spacing-section)]", className)}>
      <div className="shell">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <SplitHeading id={id ? `${id}-heading` : undefined} className="t-display max-w-[16ch] md:col-span-7">
            {heading}
          </SplitHeading>
          {intro ? (
            <p className="t-body-lg max-w-[44ch] text-fg-2 md:col-span-4 md:col-start-9 md:pb-2" data-reveal="rise">
              {intro}
            </p>
          ) : null}
        </div>
        <div className="mt-14 md:mt-20">{children}</div>
      </div>
    </section>
  );
}
