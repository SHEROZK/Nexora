"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowUpRight, Check, Copy, CornerDownLeft, FileText, Mail, Search } from "lucide-react";
import { navigation } from "@/config/navigation";
import { mailto, site, socialProfiles } from "@/config/site";
import { projects } from "@/content/projects";
import { cn } from "@/lib/cn";
import { lockScroll, scrollToTop, unlockScroll } from "@/lib/scroll";

export const OPEN_PALETTE_EVENT = "palette:open";

interface Command {
  id: string;
  group: "Go to" | "Projects" | "Actions";
  label: string;
  hint?: string;
  keywords?: string;
  icon?: React.ReactNode;
  /** Return false to keep the palette open (used by copy, which confirms in place). */
  run: () => void | false;
}

/**
 * Cmd/Ctrl + K. Every entry does something real: navigate, open a link,
 * copy the address, or scroll. Follows the WAI-ARIA combobox-with-listbox pattern.
 */
export function CommandPalette() {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const close = useCallback(() => dialog.current?.close(), []);
  const open = useCallback(() => {
    const el = dialog.current;
    if (!el || el.open) return;
    setQuery("");
    setIndex(0);
    setCopied(false);
    el.showModal();
    lockScroll();
    input.current?.focus();
  }, []);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => router.push(href);
    const external = (href: string) => () => {
      window.open(href, "_blank", "noopener,noreferrer");
    };

    const items: Command[] = [
      { id: "home", group: "Go to", label: "Home", run: go("/") },
      ...navigation.map((item) => ({
        id: item.id,
        group: "Go to" as const,
        label: item.label,
        run: go(item.href),
      })),
      ...projects.map((project) => ({
        id: `project-${project.slug}`,
        group: "Projects" as const,
        label: project.title,
        hint: project.status.label,
        keywords: `${project.category} ${project.stack.join(" ")}`,
        run: go(`/work/${project.slug}`),
      })),
      {
        id: "email",
        group: "Actions",
        label: "Write an email",
        hint: site.email,
        keywords: "contact hire message",
        icon: <Mail className="size-4" aria-hidden="true" />,
        run: () => {
          window.location.href = mailto();
        },
      },
      {
        id: "copy-email",
        group: "Actions",
        label: copied ? "Address copied" : "Copy email address",
        hint: site.email,
        keywords: "copy email address contact clipboard",
        icon: copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />,
        run: () => {
          navigator.clipboard?.writeText(site.email).then(
            () => setCopied(true),
            () => setCopied(false),
          );
          return false;
        },
      },
      ...socialProfiles.map((profile) => ({
        id: profile.id,
        group: "Actions" as const,
        label: `Open ${profile.label}`,
        hint: profile.href.replace(/^https:\/\/(www\.)?/, ""),
        keywords: "social profile",
        icon: <ArrowUpRight className="size-4" aria-hidden="true" />,
        run: external(profile.href),
      })),
    ];

    if (site.resume) {
      items.push({
        id: "resume",
        group: "Actions",
        label: "View résumé",
        keywords: "cv",
        icon: <FileText className="size-4" aria-hidden="true" />,
        run: external(site.resume),
      });
    }
    items.push({
      id: "top",
      group: "Actions",
      label: "Back to top",
      keywords: "scroll start",
      icon: <ArrowUp className="size-4" aria-hidden="true" />,
      run: scrollToTop,
    });
    return items;
  }, [router, copied]);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return commands;
    return commands.filter((command) => {
      const haystack = `${command.label} ${command.group} ${command.hint ?? ""} ${command.keywords ?? ""}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [commands, query]);

  const active = Math.min(index, Math.max(0, results.length - 1));

  // Global shortcut and the header button.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.current?.open) close();
        else open();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, open);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, open);
    };
  }, [open, close]);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!dialog.current?.open) return;
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, results]);

  const execute = useCallback(
    (command: Command | undefined) => {
      if (!command) return;
      if (command.run() !== false) close();
    },
    [close],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = results.length - 1;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex(active >= last ? 0 : active + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex(active <= 0 ? last : active - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setIndex(last);
    } else if (event.key === "Enter") {
      event.preventDefault();
      execute(results[active]);
    }
  };

  // One delegated handler for the whole list, instead of a closure per row.
  const onListClick = (event: React.MouseEvent) => {
    const row = (event.target as HTMLElement).closest<HTMLElement>("[data-index]");
    if (row) execute(results[Number(row.dataset.index)]);
  };

  // A group heading is shown above the first result of each group.
  const rows = results.map((command, i) => ({
    command,
    heading: i === 0 || results[i - 1].group !== command.group ? command.group : null,
  }));

  return (
    <dialog
      ref={dialog}
      onClose={unlockScroll}
      onClick={(event) => {
        if (event.target === dialog.current) close();
      }}
      aria-label="Command menu"
      data-lenis-prevent
      data-surface="paper"
      className="m-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] border-2 border-fg p-0 opacity-0 transition-[opacity,transform] duration-200 open:opacity-100 starting:open:translate-y-2 starting:open:opacity-0"
    >
      <div onKeyDown={onKeyDown}>
        <div className="flex items-center gap-3 border-b-2 border-fg px-4">
          <Search className="size-4 shrink-0 text-fg-2" aria-hidden="true" />
          <input
            ref={input}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIndex(0);
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
            aria-autocomplete="list"
            aria-label="Search pages, projects and actions"
            placeholder="Search pages, projects and actions"
            autoComplete="off"
            spellCheck={false}
            className="h-14 w-full bg-transparent text-[1.0625rem] outline-none placeholder:text-fg-3"
          />
          <kbd className="t-data shrink-0 border border-fg px-1.5 py-1">Esc</kbd>
        </div>

        <ul ref={list} id={listId} role="listbox" aria-label="Results" onClick={onListClick} className="max-h-[min(24rem,52vh)] overflow-y-auto overscroll-contain p-2">
          {results.length === 0 ? (
            <li role="presentation" className="px-3 py-8 text-center text-fg-2">
              Nothing matches &ldquo;{query}&rdquo;. Try a project name or &ldquo;email&rdquo;.
            </li>
          ) : (
            rows.map(({ command, heading }, i) => {
              const selected = i === active;
              return (
                <li key={command.id} role="presentation">
                  {heading ? (
                    <div role="presentation" className="t-data px-3 pb-1.5 pt-3 text-fg-3">
                      {heading}
                    </div>
                  ) : null}
                  <div
                    id={`${listId}-${command.id}`}
                    role="option"
                    aria-selected={selected}
                    data-index={i}
                    onPointerMove={() => setIndex(i)}
                    className={cn(
                      "flex min-h-11 cursor-pointer items-center gap-3 px-3",
                      selected ? "bg-fg text-surface" : "text-fg",
                    )}
                  >
                    <span className="flex-1 truncate text-[0.9375rem]">{command.label}</span>
                    {command.hint ? <span className="t-data hidden truncate opacity-70 sm:inline">{command.hint}</span> : null}
                    <span className="flex w-4 justify-center">
                      {selected ? (command.icon ?? <CornerDownLeft className="size-4" aria-hidden="true" />) : null}
                    </span>
                  </div>
                </li>
              );
            })
          )}
        </ul>

        <p className="t-data flex items-center justify-between border-t border-line px-4 py-2.5 text-fg-3" aria-hidden="true">
          <span>↑ ↓ to move</span>
          <span>Enter to select</span>
        </p>
        <p className="sr-only" role="status" aria-live="polite">
          {copied ? "Email address copied." : `${results.length} results.`}
        </p>
      </div>
    </dialog>
  );
}
