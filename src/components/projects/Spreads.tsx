import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Project, ProjectImage } from "@/content/projects";
import { cn } from "@/lib/cn";
import { Drift } from "@/components/motion/Drift";
import { RevealMedia } from "@/components/motion/RevealMedia";
import { Shot } from "@/components/ui/Shot";
import { Status } from "@/components/ui/Status";
import { ProjectVisual } from "./ProjectVisual";

/**
 * The four featured projects on the home page. Each is its own full-bleed composition:
 * a different colour, grid, mask and kind of picture. What they share is the type,
 * the hard frames and the facts each one states (status, role, what it is built with).
 */

interface SpreadProps {
  project: Project;
  number: string;
}

/** The enormous numeral behind each spread. Decorative; the list order is in the markup. */
function Numeral({ children, className, outline }: { children: string; className?: string; outline?: boolean }) {
  return (
    <Drift y={-26} aria-hidden className={cn("pointer-events-none absolute select-none", className)}>
      <span
        className="t-giant block text-[min(26vw,40svh)]"
        style={outline ? { WebkitTextStroke: "2px var(--fg)", color: "transparent" } : undefined}
      >
        {children}
      </span>
    </Drift>
  );
}

const isStrip = (image: ProjectImage) => image.width / image.height > 4;
const isTall = (image: ProjectImage) => image.width / image.height < 0.8;

/** A portrait picture chosen as the main one is kept to a phone's width instead of filling the column. */
const fit = (image: ProjectImage) => (isTall(image) ? "mx-auto max-w-[22rem]" : undefined);

function Facts({ project, className }: { project: Project; className?: string }) {
  return (
    <dl className={cn("border-t-2 border-fg", className)}>
      <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
        <dt className="t-data text-fg-2">Status</dt>
        <dd>
          <Status kind={project.status.kind} label={project.status.label} />
        </dd>
      </div>
      <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
        <dt className="t-data text-fg-2">Role</dt>
        <dd className="text-right font-semibold">{project.role.title}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
        <dt className="t-data shrink-0 text-fg-2">Built with</dt>
        <dd className="t-data text-right">{project.stack.slice(0, 4).join(" · ")}</dd>
      </div>
    </dl>
  );
}

function CaseLink({ project }: { project: Project }) {
  return (
    <Link href={`/work/${project.slug}`} className="cta">
      Read the case study
      <span className="sr-only">: {project.title}</span>
      <ArrowRight className="size-[0.8em] self-center" aria-hidden="true" />
    </Link>
  );
}

/** 01. Yellow. The live storefront, huge, opened through a circle. */
function FoodForLess({ project, number }: SpreadProps) {
  // The main picture fills the frame; the first phone-shaped one after it sits over its corner.
  const [storefront, ...rest] = project.images;
  if (!storefront || isStrip(storefront)) return <Generic project={project} number={number} />;
  const phone = isTall(storefront) ? undefined : rest.find(isTall);
  return (
    <article data-surface="yellow" className="relative overflow-hidden py-[var(--spacing-section)]">
      <Numeral outline className="right-[var(--spacing-gutter)] top-[2vw]">
        {number}
      </Numeral>
      <div className="shell relative grid gap-x-12 gap-y-14 lg:grid-cols-12 lg:items-end xl:gap-x-20 3xl:gap-x-28">
        <div className="max-w-2xl lg:col-span-4 lg:max-w-none">
          <h3 className="t-display" data-reveal="rise">
            {project.title}
          </h3>
          <p className="t-lead mt-7" data-reveal="rise" style={{ "--i": 1 } as React.CSSProperties}>
            {project.summary}
          </p>
          <Facts project={project} className="mt-10" />
          <div className="mt-10">
            <CaseLink project={project} />
          </div>
        </div>

        <div className="relative lg:col-span-8 lg:col-start-5">
          <RevealMedia mask="circle" className={fit(storefront)}>
            <Shot image={storefront} sizes="(min-width: 1024px) 60vw, 100vw" />
          </RevealMedia>
          {phone ? (
            <Drift y={18} className="absolute -bottom-[10%] left-[5%] w-[22%] lg:w-[19%]">
              <Shot image={phone} sizes="(min-width: 1024px) 12vw, 22vw" />
            </Drift>
          ) : null}
          {storefront.caption ? <p className={cn("t-data mt-4", phone && "pl-[31%] lg:pl-[27%]")}>Fig. 2: {storefront.caption}</p> : null}
        </div>
      </div>
    </article>
  );
}

/** 02. Paper with a cobalt slab. The dashboard beside a specification sheet, like a property listing. */
function PgIndia({ project, number }: SpreadProps) {
  const [dashboard] = project.images;
  return (
    <article data-surface="paper" className="relative overflow-hidden py-[var(--spacing-section)]">
      <div className="shell relative grid gap-x-12 gap-y-24 lg:grid-cols-12 lg:gap-y-14 xl:gap-x-20 3xl:gap-x-28">
        <div className="relative lg:col-span-8">
          <div className="absolute -left-[var(--spacing-gutter)] bottom-[-7%] top-[14%] w-[82%] bg-cobalt" aria-hidden="true" />
          <Drift y={-22} aria-hidden className="pointer-events-none absolute -top-[6vw] right-[4%] z-10 select-none md:right-[9%]">
            <span className="t-giant block text-[min(17vw,27svh)] text-red">{number}</span>
          </Drift>
          <RevealMedia mask="left" className="relative mt-[10%] w-[94%] md:ml-[6%]">
            {dashboard ? (
              <Shot image={dashboard} className={fit(dashboard)} sizes="(min-width: 1024px) 60vw, 94vw" />
            ) : (
              <div data-surface="paper" className="aspect-[16/10] border-2 border-ink">
                <ProjectVisual project={project} />
              </div>
            )}
          </RevealMedia>
          {dashboard?.caption ? <p className="t-data relative mt-4 max-w-[66%] text-paper md:ml-[6%]">Fig. 3: {dashboard.caption}</p> : null}
        </div>

        <div className="max-w-2xl lg:col-span-4 lg:max-w-none lg:pt-[8%]">
          <h3 className="t-display" data-reveal="rise">
            {project.title}
          </h3>
          <p className="mt-5 text-fg-2" data-reveal="rise" style={{ "--i": 1 } as React.CSSProperties}>
            {project.summary}
          </p>

          {/* Set like the particulars on a property listing. */}
          <dl className="mt-8 border-2 border-fg">
            <div className="flex items-baseline justify-between gap-4 border-b-2 border-fg bg-fg px-5 py-3.5 text-surface">
              <dt className="t-data">Particulars</dt>
              <dd>
                <Status kind={project.status.kind} label={project.status.label} />
              </dd>
            </div>
            {[["Role", project.role.title], ...project.facts.map((fact) => [fact.label, fact.value])].map(([term, value]) => (
              <div key={term} className="grid grid-cols-[5.5rem_1fr] gap-4 border-b border-line px-5 py-4 last:border-b-0">
                <dt className="t-data pt-0.5 text-fg-2">{term}</dt>
                <dd className="text-[0.9375rem] font-medium leading-snug">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10">
            <CaseLink project={project} />
          </div>
        </div>
      </div>
    </article>
  );
}

/** 03. Ink. A strip of real frames from a generated clip runs the full width and moves sideways with the scroll. */
function VideoDirector({ project, number }: SpreadProps) {
  // A panoramic strip runs the width; the first ordinary picture (the main one, if picked) stands beside the diagram.
  const sheet = project.images.find(isStrip);
  const page = project.images.find((image) => !isStrip(image));
  return (
    <article data-surface="ink" className="relative overflow-hidden py-[var(--spacing-section)]">
      <Numeral className="right-[var(--spacing-gutter)] top-[2vw] text-accent md:left-[var(--spacing-gutter)] md:right-auto md:top-[6vw]">{number}</Numeral>

      <div className="shell relative grid gap-x-8 gap-y-8 md:grid-cols-12">
        <h3 className="t-display md:col-span-7 md:col-start-6" data-reveal="rise">
          {project.title}
        </h3>
        <p className="t-lead md:col-span-6 md:col-start-6" data-reveal="rise" style={{ "--i": 1 } as React.CSSProperties}>
          {project.summary}
        </p>
      </div>

      {/* The film strip: one image, six frames. It fits the screen; on a phone it scrolls sideways instead of shrinking. */}
      {sheet ? (
        <div className="relative mt-14 md:mt-20">
          <div className="overflow-x-auto border-y-2 border-paper" tabIndex={0} role="group" aria-label={`${sheet.alt} Scroll sideways to see all of it.`}>
            <Image src={sheet.src} width={sheet.width} height={sheet.height} alt={sheet.alt} sizes="(min-width: 768px) 100vw, 230vw" className="block h-auto w-[230vw] max-w-none md:w-full" />
          </div>
          {sheet.caption ? <p className="shell t-data mt-4 text-fg-2">Fig. 4: {sheet.caption}</p> : null}
        </div>
      ) : null}

      <div className="shell relative mt-14 grid gap-x-8 gap-y-12 md:mt-20 md:grid-cols-12 md:items-end xl:gap-x-14 3xl:gap-x-20">
        {page ? (
          <RevealMedia mask="up" className="w-[62%] md:col-span-4 md:w-full lg:col-span-3">
            <div style={{ transform: "rotate(-3deg)" }}>
              <Shot image={page} sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 62vw" />
            </div>
            {page.caption ? <p className="t-data mt-5 text-fg-2">Fig. 5: {page.caption}</p> : null}
          </RevealMedia>
        ) : null}

        <figure className="md:col-span-8 lg:col-span-5">
          <div className="aspect-[16/10] border-2 border-paper">
            <ProjectVisual project={project} />
          </div>
          <figcaption className="t-data mt-4 text-fg-2">Fig. 6: diagram of the thirteen stages, drawn from the code</figcaption>
        </figure>

        <div className="md:col-span-12 lg:col-span-4">
          <Facts project={project} />
          <div className="mt-10">
            <CaseLink project={project} />
          </div>
        </div>
      </div>
    </article>
  );
}

/** 04. Vermilion. Its main photo, if it has one, cut on the diagonal, next to how listings are reviewed. */
function VentureWorld({ project, number }: SpreadProps) {
  const [gate] = project.images;
  return (
    <article data-surface="red" className="relative overflow-hidden py-[var(--spacing-section)]">
      <Numeral outline className="right-[var(--spacing-gutter)] top-[2vw] lg:bottom-[2vw] lg:top-auto">
        {number}
      </Numeral>
      <div className="shell relative grid gap-x-12 gap-y-14 lg:grid-cols-12 xl:gap-x-20 3xl:gap-x-28">
        <div className="max-w-2xl lg:col-span-6 lg:max-w-none">
          <h3 className="t-display" data-reveal="rise">
            {project.title}
          </h3>
          <p className="t-lead mt-6 max-w-[34ch]" data-reveal="rise" style={{ "--i": 1 } as React.CSSProperties}>
            {project.summary}
          </p>
          <Facts project={project} className="mt-10 max-w-md" />
          <div className="mt-10">
            <CaseLink project={project} />
          </div>
        </div>

        <div className="relative lg:col-span-6">
          {gate ? (
            <>
              {gate.caption ? <p className="t-data mb-3 md:ml-[30%]">Fig. 7: {gate.caption}</p> : null}
              <RevealMedia mask="diagonal" className={cn("md:ml-[30%]", fit(gate))}>
                <Shot image={gate} sizes="(min-width: 1024px) 34vw, (min-width: 768px) 70vw, 100vw" />
              </RevealMedia>
            </>
          ) : null}

          <figure data-surface="paper" className={cn("relative border-2 border-ink", gate ? "mt-8 md:mt-[-9%] md:w-[82%]" : "lg:mt-[8%]")}>
            <div className="aspect-[16/10]">
              <ProjectVisual project={project} />
            </div>
            <figcaption className="t-data border-t-2 border-ink px-3 py-2">Fig. 8: diagram of the listing review flow</figcaption>
          </figure>
        </div>
      </div>
    </article>
  );
}

/** Any other featured project, including ones added in the admin panel. Uses the project's own colour. */
function Generic({ project, number }: SpreadProps) {
  const [image] = project.images;
  return (
    <article data-surface={project.surface} className="relative overflow-hidden py-[var(--spacing-section)]">
      <Numeral outline className="right-[var(--spacing-gutter)] top-[2vw]">
        {number}
      </Numeral>
      <div className="shell relative grid gap-x-12 gap-y-14 lg:grid-cols-12 lg:items-end xl:gap-x-20 3xl:gap-x-28">
        <div className="max-w-2xl lg:col-span-5 lg:max-w-none">
          <h3 className="t-display" data-reveal="rise">
            {project.title}
          </h3>
          <p className="t-lead mt-7" data-reveal="rise" style={{ "--i": 1 } as React.CSSProperties}>
            {project.summary}
          </p>
          <Facts project={project} className="mt-10" />
          <div className="mt-10">
            <CaseLink project={project} />
          </div>
        </div>
        <figure className="lg:col-span-7">
          <RevealMedia mask="up" className={image ? fit(image) : undefined}>
            {image ? (
              <Shot image={image} sizes="(min-width: 1024px) 56vw, 100vw" />
            ) : (
              <div data-surface="paper" className="aspect-[16/10] border-2 border-ink">
                <ProjectVisual project={project} />
              </div>
            )}
          </RevealMedia>
          {image?.caption ? <figcaption className="t-data mt-4">{image.caption}</figcaption> : null}
        </figure>
      </div>
    </article>
  );
}

const SPREADS: Record<string, (props: SpreadProps) => React.ReactNode> = {
  "food-for-less": FoodForLess,
  "pg-india": PgIndia,
  "video-director": VideoDirector,
  ventureworld: VentureWorld,
};

export function ProjectSpread({ project, position }: { project: Project; position: number }) {
  const Spread = SPREADS[project.slug] ?? Generic;
  return <Spread project={project} number={String(position).padStart(2, "0")} />;
}
