import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { featuredProjects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="shell flex min-h-[100svh] flex-col justify-center py-[calc(var(--spacing-header)+3rem)]">
      <h1 className="t-display max-w-[16ch]">
        Nothing <em className="accent">lives</em> at this address
      </h1>
      <p className="t-lead mt-7 max-w-[44ch] text-fg-2">
        That is a 404. The link may be old, or the page may have moved. These exist:
      </p>
      <ul className="mt-8 max-w-xl border-t border-line">
        {featuredProjects.map((project) => (
          <li key={project.slug} className="border-b border-line">
            <Link href={`/work/${project.slug}`} className="group flex min-h-14 items-center justify-between gap-6">
              <span className="text-[1.0625rem]">{project.title}</span>
              <ArrowRight className="size-4 text-fg-2 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-9 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary">
          Back to the start
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link href="/work" className="btn btn-ghost">
          All work
        </Link>
      </div>
    </div>
  );
}
