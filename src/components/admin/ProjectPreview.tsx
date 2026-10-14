import type { StoredProject } from "@/content/store";
import { cn } from "@/lib/cn";

const GROUP_LABELS: Record<StoredProject["group"], string> = {
  product: "Products",
  ai: "AI and generative",
  website: "Client websites",
  marketing: "Marketing and content",
};

/**
 * A small, faithful picture of how a project will appear on the site, built from the
 * same colour tokens and type styles the real pages use. The top block is its colour
 * spread (home page and case-study header); the bottom strip is its row in the work list.
 */
export function ProjectPreview({ project, dimmed }: { project: StoredProject; dimmed?: boolean }) {
  const title = project.title.trim() || "Project name";
  const stack = project.stack.filter(Boolean).slice(0, 4);

  return (
    <figure className={cn("transition-opacity", dimmed && "opacity-45")}>
      <div className="border-2 border-ink">
        <div data-surface={project.surface} className="p-6 md:p-8">
          <div className="grid gap-7 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] sm:items-end">
            <div className="min-w-0">
              <p className="t-title break-words">{title}</p>
              <p className={cn("mt-3 text-[0.9375rem] leading-relaxed", !project.summary && "text-fg-3")}>
                {project.summary || "Your one-sentence summary appears here."}
              </p>
              <dl className="mt-5 border-t-2 border-fg text-[0.875rem]">
                <div className="flex items-baseline justify-between gap-4 border-b border-line py-2">
                  <dt className="t-data text-fg-2">Status</dt>
                  <dd className="t-data flex items-center gap-2">
                    <span className="status-mark" data-kind={project.statusKind} aria-hidden="true" />
                    {project.statusLabel || { live: "Live", development: "In development", experiment: "Experiment" }[project.statusKind]}
                  </dd>
                </div>
                {project.roleTitle ? (
                  <div className="flex items-baseline justify-between gap-4 border-b border-line py-2">
                    <dt className="t-data text-fg-2">Role</dt>
                    <dd className="text-right font-semibold">{project.roleTitle}</dd>
                  </div>
                ) : null}
                {stack.length > 0 ? (
                  <div className="flex items-baseline justify-between gap-4 border-b border-line py-2">
                    <dt className="t-data shrink-0 text-fg-2">Built with</dt>
                    <dd className="t-data text-right">{stack.join(" · ")}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            {project.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- a panel preview of a local file
              <img src={project.image.src} alt="" className="max-h-64 w-full border-2 border-ink bg-paper object-cover object-top" />
            ) : (
              <div className="flex aspect-[16/10] items-end border-2 border-fg p-4">
                <p className="t-data">
                  No screenshot
                  <span className="block text-fg-2">A title plate is shown instead</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <div data-surface="paper" className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 border-t-2 border-ink px-6 py-4 md:px-8">
          <p className="truncate font-display text-[1.25rem] font-bold tracking-[-0.02em]">{title}</p>
          <p className="t-data flex items-center gap-2">
            <span className="status-mark" data-kind={project.statusKind} aria-hidden="true" />
            {project.statusLabel || { live: "Live", development: "In development", experiment: "Experiment" }[project.statusKind]}
          </p>
          <p className="col-span-2 truncate text-[0.875rem] text-fg-2">{project.category || "What kind of thing it is"}</p>
        </div>
      </div>
      <figcaption className="mt-3 text-[0.8125rem] leading-relaxed text-fg-3">
        Top: its colour block on the home page{project.featured ? "" : " (if featured)"} and its case-study header. Bottom: its row in
        the work list, under {GROUP_LABELS[project.group]}.
      </figcaption>
    </figure>
  );
}
