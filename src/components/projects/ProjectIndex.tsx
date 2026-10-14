"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import type { ProjectGroup, StatusKind } from "@/content/projects";
import { cn } from "@/lib/cn";
import { Status } from "@/components/ui/Status";

gsap.registerPlugin(useGSAP);

export interface IndexItem {
  slug: string;
  title: string;
  category: string;
  year: string;
  group: ProjectGroup;
  status: { kind: StatusKind; label: string };
}

interface Props {
  items: IndexItem[];
  groups: { id: ProjectGroup; label: string }[];
  /** Server-rendered schematics, keyed by slug. */
  previews: Record<string, React.ReactNode>;
}

/**
 * The full project list. With a mouse, a preview follows the pointer over each row.
 * On touch there is no hover, so each row carries its own thumbnail instead.
 */
export function ProjectIndex({ items, groups, previews }: Props) {
  const [filter, setFilter] = useState<ProjectGroup | "all">("all");
  const [hovered, setHovered] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const floater = useRef<HTMLDivElement>(null);
  const visible = items.filter((item) => filter === "all" || item.group === filter);

  const move = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);

  // The setters are created inside the GSAP context, so they are reverted with it on unmount.
  useGSAP(
    () => {
      if (!floater.current) return;
      move.current = {
        x: gsap.quickTo(floater.current, "x", { duration: 0.7, ease: "power3.out" }),
        y: gsap.quickTo(floater.current, "y", { duration: 0.7, ease: "power3.out" }),
      };
      return () => {
        move.current = null;
      };
    },
    { scope: root },
  );

  const follow = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    move.current?.x(event.clientX + 28);
    move.current?.y(event.clientY - 110);
  };

  return (
    <div ref={root}>
      <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
        {[{ id: "all" as const, label: "All" }, ...groups].map((group) => {
          const pressed = filter === group.id;
          const count = group.id === "all" ? items.length : items.filter((item) => item.group === group.id).length;
          return (
            <button
              key={group.id}
              type="button"
              aria-pressed={pressed}
              onClick={() => setFilter(group.id)}
              className={cn(
                "flex min-h-11 items-center gap-2.5 border px-4 text-[0.9375rem] transition-colors",
                pressed ? "border-fg bg-fg text-surface" : "border-line text-fg-2 hover:border-line-strong hover:text-fg",
              )}
            >
              {group.label}
              <span className={cn("t-data", pressed ? "text-surface/70" : "text-fg-3")}>{count}</span>
            </button>
          );
        })}
      </div>

      <ul className="mt-10 border-t border-line" onPointerMove={follow} onPointerLeave={() => setHovered(null)}>
        {visible.map((item) => (
          <li key={item.slug} className="border-b border-line">
            <Link
              href={`/work/${item.slug}`}
              onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(item.slug)}
              onFocus={() => setHovered(null)}
              className="group grid grid-cols-[5.5rem_1fr_auto] items-center gap-x-6 gap-y-2 py-7 md:grid-cols-12 md:gap-x-8 md:py-9"
            >
              <span className="block aspect-[16/10] overflow-hidden border border-line fine:hidden md:col-span-1" aria-hidden="true">
                {previews[item.slug]}
              </span>
              <span className="fine:col-span-2 md:col-span-5 fine:md:col-span-6">
                <span className="block text-[clamp(1.375rem,3vw,2.5rem)] font-medium leading-tight tracking-tight transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2">
                  {item.title}
                </span>
                <span className="mt-1 block text-[0.9375rem] text-fg-2 md:hidden">{item.category}</span>
              </span>
              <span className="hidden text-[0.9375rem] text-fg-2 md:col-span-3 md:block">{item.category}</span>
              <span className="hidden md:col-span-2 md:block">
                <Status kind={item.status.kind} label={item.status.label} />
              </span>
              <span className="flex items-center justify-end gap-4 md:col-span-1">
                <span className="t-data hidden text-fg-3 lg:inline">{item.year.slice(-4)}</span>
                <ArrowUpRight
                  className="size-5 text-fg-2 transition-[transform,color] duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  aria-hidden="true"
                />
              </span>
              <span className="col-span-3 md:hidden">
                <Status kind={item.status.kind} label={item.status.label} className="text-fg-2" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="sr-only" role="status" aria-live="polite">
        Showing {visible.length} of {items.length} projects.
      </p>

      {/* Pointer-following preview. Decorative: the same link is the row itself. */}
      <div
        ref={floater}
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-40 hidden aspect-[16/10] w-[22rem] overflow-hidden border-2 border-ink bg-paper transition-[opacity,scale] duration-300",
          "fine:block",
          hovered ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
      >
        {items.map((item) => (
          <div key={item.slug} className={cn("absolute inset-0 transition-opacity duration-300", hovered === item.slug ? "opacity-100" : "opacity-0")}>
            {previews[item.slug]}
          </div>
        ))}
      </div>
    </div>
  );
}
