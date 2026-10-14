"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CapabilityLayer } from "@/content/capabilities";
import type { Surface } from "@/content/projects";
import { cn } from "@/lib/cn";

interface Props {
  layers: CapabilityLayer[];
  /** slug to title, resolved on the server. */
  projectTitles: Record<string, string>;
}

/** One colour per stratum, top (what users touch) to bottom (what keeps it running). */
const STRATA: Surface[] = ["yellow", "red", "cobalt", "ink", "paper"];

/**
 * Skills drawn as a cross-section: five full-width bands of flat colour, like strata
 * in a core sample. The selected band opens to show what lives in that layer and
 * which projects prove it. A tablist: arrow keys move between layers.
 */
export function CapabilityMap({ layers, projectTitles }: Props) {
  const [selected, setSelected] = useState(0);
  const id = useId();

  const onKeyDown = (event: React.KeyboardEvent) => {
    const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (selected + delta + layers.length) % layers.length;
    setSelected(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  return (
    <div role="tablist" aria-label="Layers of a product" aria-orientation="vertical" onKeyDown={onKeyDown} className="border-y-2 border-ink">
      {layers.map((layer, i) => {
        const open = i === selected;
        return (
          <div key={layer.id} data-surface={STRATA[i % STRATA.length]} className={cn(i > 0 && "border-t-2 border-ink")}>
            <button
              id={`${id}-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={open}
              aria-controls={`${id}-panel-${i}`}
              tabIndex={open ? 0 : -1}
              onClick={() => setSelected(i)}
              className="shell group flex w-full items-baseline justify-between gap-8 py-7 text-left md:py-9"
            >
              <span
                className={cn(
                  "t-display transition-[font-size,letter-spacing] duration-500 ease-[var(--ease-out-expo)]",
                  open ? "text-[clamp(1.875rem,4.2vw,4rem)]" : "text-[clamp(1.375rem,2.4vw,2.25rem)] group-hover:tracking-[-0.015em]",
                )}
              >
                {layer.title}
              </span>
              <span className="t-data shrink-0">
                Layer {i + 1} of {layers.length}
              </span>
            </button>

            <div id={`${id}-panel-${i}`} role="tabpanel" aria-labelledby={`${id}-tab-${i}`} className="fold" data-open={open} inert={!open}>
              <div>
                <div className="shell grid gap-x-12 gap-y-10 pb-14 md:grid-cols-12 md:pb-20">
                  <p className="t-lead md:col-span-5">{layer.role}</p>
                  <div className="md:col-span-6 md:col-start-7">
                    <dl className="border-t-2 border-fg">
                      {layer.groups.map((group) => (
                        <div key={group.label} className="grid gap-x-6 gap-y-1 border-b border-line py-4 sm:grid-cols-[8rem_1fr]">
                          <dt className="t-data pt-1 text-fg-2">{group.label}</dt>
                          <dd className="font-medium leading-snug">{group.items.join(", ")}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                      <span className="t-data text-fg-2">Seen in</span>
                      {layer.evidence.map((slug) => (
                        <Link key={slug} href={`/work/${slug}`} className="link inline-flex items-center gap-1.5 font-semibold">
                          {projectTitles[slug]}
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
