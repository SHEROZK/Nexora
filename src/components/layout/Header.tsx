"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import { navigation } from "@/config/navigation";
import { mailto, site } from "@/config/site";
import { cn } from "@/lib/cn";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { OPEN_PALETTE_EVENT } from "@/components/navigation/CommandPalette";
import { Logo } from "@/components/brand/Logo";
import { brand } from "@/config/brand";

const subscribeToNothing = () => () => {};

/**
 * The masthead: a solid paper strip with a hard rule, like the running head of a magazine.
 * It stays paper over every coloured section, so it never needs to guess what is beneath it.
 * On the home page the links scroll to sections and mark the current one; elsewhere they are routes.
 */
export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [section, setSection] = useState<string | null>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const isMac = useSyncExternalStore(subscribeToNothing, () => /Mac|iPhone|iPad/.test(navigator.platform), () => false);

  // Scroll spy, home page only.
  useEffect(() => {
    if (!isHome) return;
    const sections = navigation
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setSection(entry.target.id);
          else setSection((current) => (current === entry.target.id ? null : current));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome]);

  const closeMenu = () => menu.current?.close();
  const openMenu = () => {
    menu.current?.showModal();
    lockScroll();
  };
  const openPalette = () => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));

  const isActive = (id: string, href: string) => (isHome ? section === id : pathname.startsWith(href));
  const hrefFor = (id: string, href: string) => (isHome ? `#${id}` : href);

  return (
    <header data-surface="paper" className="fixed inset-x-0 top-0 z-50 border-b-2 border-fg">
      <div className="shell flex h-[var(--spacing-header)] items-center justify-between gap-4">
        <Link href="/" className="flex h-11 shrink-0 items-center transition-opacity hover:opacity-80" aria-label={`${brand.name}, home`}>
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center">
            {navigation.map((item) => {
              const active = isActive(item.id, item.href);
              return (
                <li key={item.id}>
                  <Link
                    href={hrefFor(item.id, item.href)}
                    aria-current={active ? (isHome ? "location" : "page") : undefined}
                    className={cn(
                      "flex h-[var(--spacing-header)] items-center px-3.5 text-[0.9375rem] font-semibold transition-colors duration-150 xl:px-5",
                      active ? "bg-fg text-surface" : "hover:bg-fg hover:text-surface",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openPalette}
            className="flex h-11 items-center gap-2.5 border-2 border-fg px-3 transition-colors hover:bg-fg hover:text-surface"
            aria-label="Open the command menu"
            aria-keyshortcuts="Control+K Meta+K"
          >
            <Search className="size-4" aria-hidden="true" />
            <kbd className="t-data hidden whitespace-nowrap font-mono sm:inline lg:hidden xl:inline">{isMac ? "⌘K" : "Ctrl K"}</kbd>
          </button>
          <Link href="/contact" className="btn btn-primary hidden min-h-11 sm:inline-flex lg:px-5 xl:px-7" data-arrow="up-right">
            Start a project
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={openMenu}
            className="flex size-11 items-center justify-center border-2 border-fg transition-colors hover:bg-fg hover:text-surface lg:hidden"
            aria-label="Open the menu"
            aria-haspopup="dialog"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile menu. A modal dialog gives focus trapping and Escape for free. */}
      <dialog
        ref={menu}
        onClose={unlockScroll}
        aria-label="Menu"
        data-lenis-prevent
        data-surface="cobalt"
        className="m-0 h-dvh w-screen p-0 opacity-0 transition-opacity duration-300 open:opacity-100 starting:open:opacity-0"
      >
        <div className="shell flex h-full flex-col">
          <div className="flex h-[var(--spacing-header)] shrink-0 items-center justify-between">
            <Logo tone="mono" />
            <button
              type="button"
              onClick={closeMenu}
              className="flex size-11 items-center justify-center border-2 border-fg"
              aria-label="Close the menu"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Menu" className="flex-1 overflow-y-auto py-4 short:py-2">
            {/* Sideways on a phone the six links sit in two columns, so none of them needs scrolling to. */}
            <ul className="short:grid short:grid-cols-2 short:gap-x-12">
              {[{ id: "home", label: "Home", href: "/" }, ...navigation].map((item, i) => (
                <li key={item.id}>
                  <Link
                    href={item.id === "home" ? "/" : hrefFor(item.id, item.href)}
                    onClick={closeMenu}
                    className="enter t-giant flex items-baseline justify-between py-1.5 text-[clamp(2.25rem,11vw,3.5rem)] leading-[0.92] short:text-[2rem]"
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    {item.label}
                    <span className="t-data text-accent">{String(i).padStart(2, "0")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="shrink-0 space-y-3 border-t-2 border-fg py-6 short:py-4">
            <a href={mailto()} className="link text-[1.0625rem] font-semibold">
              {site.email}
            </a>
            <p className="t-data flex items-center gap-2.5">
              <span className="status-mark" data-kind={site.availability.open ? "live" : "development"} aria-hidden="true" />
              {site.availability.open ? site.availability.label : site.availability.closedLabel} · {site.location}
            </p>
          </div>
        </div>
      </dialog>
    </header>
  );
}
