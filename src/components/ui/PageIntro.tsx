import type { Surface } from "@/content/projects";

interface Props {
  heading: React.ReactNode;
  /** Each inner page opens on its own colour. */
  surface?: Surface;
  children?: React.ReactNode;
}

/** Opening block for every inner page: one large statement on a field of flat colour. */
export function PageIntro({ heading, surface = "paper", children }: Props) {
  return (
    <header data-surface={surface} className="border-b-2 border-ink">
      <div className="shell pb-16 pt-[calc(var(--spacing-header)+clamp(3rem,8vw,7rem))] md:pb-24">
        <h1 className="t-display max-w-[18ch] text-[clamp(2.25rem,5.4vw,5.25rem)] leading-[0.98]">
          <span className="mask-line">
            <span>{heading}</span>
          </span>
        </h1>
        {children ? (
          <div className="enter t-lead mt-9 max-w-[48ch] md:mt-12" style={{ "--i": 3 } as React.CSSProperties}>
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
}
