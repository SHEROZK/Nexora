"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, Minus, Plus } from "lucide-react";
import type { Service } from "@/content/services";
import { cn } from "@/lib/cn";

interface Props {
  services: Service[];
  projectTitles: Record<string, string>;
}

/**
 * Services as a contents page, not a set of cards. Six lines of large type; the open one
 * turns into an ink band and shows the problem it solves, what you get and where to see it.
 */
export function ServiceRows({ services, projectTitles }: Props) {
  const [open, setOpen] = useState<string | null>(services[0]?.id ?? null);
  const id = useId();

  return (
    <div className="border-b-2 border-ink">
      {services.map((service, i) => {
        const expanded = open === service.id;
        const panelId = `${id}-${service.id}`;
        return (
          <div
            key={service.id}
            data-surface={expanded ? "ink" : "paper"}
            className="border-t-2 border-ink transition-colors duration-300"
          >
            <h3 className="shell font-sans">
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : service.id)}
                className="group grid w-full grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-4 py-7 text-left md:grid-cols-[4rem_1fr_auto] md:gap-x-8 md:py-9"
              >
                <span className="t-data text-fg-2">{String(i + 1).padStart(2, "0")}</span>
                <span className="t-display text-[clamp(1.375rem,2.7vw,2.625rem)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2">
                  {service.title}
                </span>
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center self-center border-2 border-fg transition-colors duration-200",
                    expanded ? "bg-accent text-accent-fg" : "group-hover:bg-fg group-hover:text-surface",
                  )}
                  aria-hidden="true"
                >
                  {expanded ? <Minus className="size-5" /> : <Plus className="size-5" />}
                </span>
              </button>
            </h3>

            <div id={panelId} className="fold" data-open={expanded} inert={!expanded}>
              <div>
                <div className="shell grid gap-x-12 gap-y-10 pb-16 md:grid-cols-12">
                  <p className="t-lead md:col-span-5 md:col-start-2">{service.problem}</p>
                  <div className="md:col-span-5 md:col-start-8">
                    <ul className="border-t-2 border-fg">
                      {service.deliverables.map((item) => (
                        <li key={item} className="border-b border-line py-4 text-[0.9375rem]">
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-[0.9375rem] text-fg-2">{service.proof}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                      {service.evidence.map((slug) => (
                        <Link key={slug} href={`/work/${slug}`} className="link inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold">
                          {projectTitles[slug]}
                          <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                    <Link href={`/contact?topic=${service.id}`} className="btn btn-primary mt-7">
                      Request a project estimate
                      <ArrowRight aria-hidden="true" />
                    </Link>
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
