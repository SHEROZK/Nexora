import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { adjacentProjects, getProject, projectIndex, projects } from "@/content/projects";
import { OrderMachine } from "@/components/interactive/OrderMachine";
import { PipelineExplorer } from "@/components/interactive/PipelineExplorer";
import { ImageDeck } from "@/components/projects/ImageDeck";
import { ProjectVisual, visualCaption } from "@/components/projects/ProjectVisual";
import { Shot } from "@/components/ui/Shot";
import { Status } from "@/components/ui/Status";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { cn } from "@/lib/cn";
import { breadcrumbSchema, pageMetadata, projectSchema } from "@/lib/seo";
import { alt as caseStudyCardAlt } from "./opengraph-image";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return pageMetadata({
    title: `${project.title}: ${project.category}`,
    description: project.summary,
    path: `/work/${project.slug}`,
    type: "article",
    image: { url: `/work/${project.slug}/opengraph-image`, alt: caseStudyCardAlt },
  });
}

/** One row of the case study: a heading that stays put on wide screens, content beside it. */
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-x-12 gap-y-8 border-t-2 border-fg py-16 md:grid-cols-12 md:py-24">
      <h2 className="t-title text-[clamp(1.5rem,2.3vw,2.125rem)] md:sticky md:top-24 md:col-span-4 md:self-start">{title}</h2>
      <div className="md:col-span-7 md:col-start-6">{children}</div>
    </section>
  );
}

function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="max-w-[66ch] space-y-6">
      {paragraphs.map((text, i) => (
        <p key={i} className={i === 0 ? "t-body-lg text-fg" : "text-fg-2"}>
          {text}
        </p>
      ))}
    </div>
  );
}

function Lines({ items }: { items: string[] }) {
  return (
    <ul className="max-w-[66ch] border-t border-line">
      {items.map((item) => (
        <li key={item} className="border-b border-line py-4 text-fg-2">
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * The address is read inside a loading boundary, so moving between case studies
 * starts at once instead of waiting for it. Known slugs are still fully prerendered.
 */
export default function CaseStudyPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="min-h-[70svh]" aria-busy="true" />}>
      <CaseStudy params={params} />
    </Suspense>
  );
}

async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { previous, next } = adjacentProjects(project.slug);
  const number = projectIndex(project.slug);
  // Photos and the video are numbered first; the diagram or title plate comes after them.
  const media = project.images.length + (project.video ? 1 : 0);
  // Two or more ordinary photos become a shuffleable pile; panoramic strips keep their own scrolling row.
  const strips = project.images.filter((image) => image.width / image.height > 4);
  const prints = project.images.filter((image) => image.width / image.height <= 4);

  return (
    <article>
      <JsonLd data={projectSchema(project)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
          { name: project.title, path: `/work/${project.slug}` },
        ])}
      />
      {/* The opening spread takes the project's own colour. */}
      <header data-surface={project.surface} className="relative overflow-hidden border-b-2 border-ink pt-[calc(var(--spacing-header)+clamp(1.5rem,4vw,3.5rem))]">
        <div className="shell">
          <Link href="/work" className="t-data enter inline-flex min-h-11 items-center gap-2 transition-colors hover:text-accent">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            All work · {number} of {String(projects.length).padStart(2, "0")}
          </Link>
        </div>

        {/* One line on wide screens. A phone keeps a readable size and lets a long title wrap instead. */}
        <h1
          className="t-giant mt-3 break-words px-[var(--spacing-gutter)] leading-[0.9]"
          style={{ fontSize: `max(clamp(2.25rem, 11.5vw, 3rem), min(${Math.min(10.5, 105 / project.title.length).toFixed(1)}vw, 20svh))` }}
        >
          <span className="mask-line">
            <span>{project.title}</span>
          </span>
        </h1>

        <div className="shell mt-8 grid gap-x-8 gap-y-8 pb-12 md:mt-12 md:grid-cols-12 md:pb-16">
          <p className="enter t-lead md:col-span-6" style={{ "--i": 3 } as React.CSSProperties}>
            {project.summary}
          </p>
          <dl className="enter border-t-2 border-fg md:col-span-5 md:col-start-8" style={{ "--i": 5 } as React.CSSProperties}>
            {(
              [
                ["Status", <Status key="status" kind={project.status.kind} label={project.status.label} />],
                ["Role", project.role.title],
                ["Year", project.year],
                ["Type", project.category],
              ] as const
            ).map(([term, value]) => (
              <div key={term} className="grid grid-cols-[5rem_1fr] gap-4 border-b border-line py-4">
                <dt className="t-data pt-0.5 text-fg-2">{term}</dt>
                <dd className="font-semibold leading-snug">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Pictures first: real screens and artifacts where they exist, then the diagram. */}
      <div className="shell py-12 md:py-20">
        {prints.length >= 2 ? (
          <>
            <ImageDeck images={prints} />
            {strips.map((image, i) => (
              <figure key={image.src} className="mt-14 min-w-0 md:mt-20">
                <div className="-mx-[var(--spacing-gutter)] overflow-x-auto border-y-2 border-ink" tabIndex={0} role="group" aria-label={`${image.alt} Scroll sideways to see all of it.`}>
                  <Image src={image.src} width={image.width} height={image.height} alt={image.alt} sizes="160vw" className="block h-auto w-[160vw] max-w-none md:w-full" />
                </div>
                <figcaption className="t-data mt-3 text-fg-2">
                  Fig. {prints.length + i + 1}: {image.caption}
                </figcaption>
              </figure>
            ))}
          </>
        ) : project.images.length > 0 ? (
          <div className="grid items-start gap-x-8 gap-y-12 md:grid-cols-12">
            {project.images.map((image, i) => {
              const ratio = image.width / image.height;
              const strip = ratio > 4;
              const tall = ratio < 0.8;
              return (
                <figure
                  key={image.src}
                  className={cn(
                    strip ? "min-w-0 md:col-span-12" : tall ? "w-[58%] md:col-span-3 md:w-auto" : "md:col-span-8",
                    !strip && !tall && i % 2 === 1 && "md:col-start-5",
                    tall && i % 2 === 1 && "md:mt-[18%]",
                  )}
                >
                  {strip ? (
                    <div className="-mx-[var(--spacing-gutter)] overflow-x-auto border-y-2 border-ink" tabIndex={0} role="group" aria-label={`${image.alt} Scroll sideways to see all of it.`}>
                      <Image src={image.src} width={image.width} height={image.height} alt={image.alt} sizes="160vw" className="block h-auto w-[160vw] max-w-none md:w-full" />
                    </div>
                  ) : (
                    <Shot image={image} sizes={tall ? "(min-width: 768px) 22vw, 58vw" : "(min-width: 768px) 62vw, 100vw"} preload={i === 0} />
                  )}
                  <figcaption className="t-data mt-3 text-fg-2">
                    Fig. {i + 1}: {image.caption}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        ) : null}

        {project.video ? (
          <figure className={cn("md:w-[84%]", project.images.length > 0 && "mt-14 md:mt-20")}>
            <VideoPlayer video={project.video} title={project.title} />
            <figcaption className="t-data mt-3 text-fg-2">
              Fig. {project.images.length + 1}: {project.video.caption || "Video"}
            </figcaption>
          </figure>
        ) : null}

        <figure className={cn("md:w-[72%]", media > 0 && "mt-14 md:ml-auto md:mt-20")}>
          <div className="aspect-[16/10] overflow-hidden border-2 border-ink">
            <ProjectVisual project={project} />
          </div>
          <figcaption className="t-data mt-3 text-fg-2">
            {media > 0 ? `Fig. ${media + 1}: ` : ""}
            {visualCaption(project)}
          </figcaption>
        </figure>
      </div>

      <div className="shell">
        <Block title="Where it stands">
          {project.status.note ? <p className="t-body-lg max-w-[66ch] text-fg">{project.status.note}</p> : null}
          <dl className="mt-8 max-w-[66ch] border-t border-line">
            {project.facts.map((fact) => (
              <div key={fact.label} className="grid gap-x-6 gap-y-1 border-b border-line py-4 sm:grid-cols-[9rem_1fr]">
                <dt className="text-[0.875rem] text-fg-3">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          {project.links.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {project.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="btn btn-ghost max-w-full flex-wrap whitespace-normal py-2.5 text-left" data-arrow="up-right">
                  {link.label}
                  {link.note ? <span className="text-fg-3">· {link.note}</span> : null}
                  <ArrowUpRight aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-[0.9375rem] text-fg-3">There is no public link for this project.</p>
          )}
        </Block>

        {project.problem.length > 0 ? (
          <Block title="The problem">
            <Prose paragraphs={project.problem} />
          </Block>
        ) : null}

        {project.goals.length > 0 ? (
          <Block title="Goals and constraints">
            <h3 className="text-[0.875rem] text-fg-3">It had to</h3>
            <div className="mt-3">
              <Lines items={project.goals} />
            </div>
            {project.constraints.length > 0 ? (
              <>
                <h3 className="mt-10 text-[0.875rem] text-fg-3">Within these limits</h3>
                <div className="mt-3">
                  <Lines items={project.constraints} />
                </div>
              </>
            ) : null}
          </Block>
        ) : null}

        {project.role.note || project.contribution.length > 0 ? (
          <Block title="My part">
            {project.role.note ? <p className="t-body-lg max-w-[66ch] text-fg">{project.role.note}</p> : null}
            {project.contribution.length > 0 ? (
              <div className="mt-8">
                <Lines items={project.contribution} />
              </div>
            ) : null}
          </Block>
        ) : null}

        <Block title="What it is">
          <Prose paragraphs={project.overview} />
          {project.features.length > 0 ? (
            <dl className="mt-10 grid gap-x-10 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              {project.features.map((feature) => (
                <div key={feature.title} className="border-t border-line py-5">
                  <dt className="text-[1.0625rem] font-medium">{feature.title}</dt>
                  <dd className="mt-2 text-[0.9375rem] text-fg-2">{feature.body}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Block>

        {project.decisions.length > 0 ? (
          <Block title="Decisions and trade-offs">
            <ol className="max-w-[66ch]">
              {project.decisions.map((decision, i) => (
                <li key={decision.title} className="border-t border-line py-7">
                  <h3 className="flex items-baseline gap-4 text-[1.25rem] font-medium tracking-tight">
                    <span className="t-data text-fg-3">{String(i + 1).padStart(2, "0")}</span>
                    {decision.title}
                  </h3>
                  <p className="mt-3 text-fg-2">{decision.body}</p>
                  <p className="mt-4 text-[0.9375rem] text-fg">
                    <span className="accent text-[1.125rem] text-accent">The cost. </span>
                    {decision.tradeoff}
                  </p>
                </li>
              ))}
            </ol>
          </Block>
        ) : null}

        {project.demo ? (
          <section className="border-t border-line py-12 md:py-16">
            <div className="grid gap-6 md:grid-cols-12">
              <h2 className="t-title text-[clamp(1.5rem,2.3vw,2.125rem)] md:col-span-4">Try it</h2>
              <p className="max-w-[60ch] text-fg-2 md:col-span-7 md:col-start-6">
                {project.demo === "orders"
                  ? "A small model of the order and payment rules, written for this site. It runs in your browser and is not connected to the restaurant. Every button is live, including the ones the server would refuse."
                  : "A model of the stage machine. No AI runs here. It shows the control flow: where the pipeline stops for a person, and what an edit sends back to be redone."}
              </p>
            </div>
            <div className="mt-10">{project.demo === "orders" ? <OrderMachine /> : <PipelineExplorer />}</div>
          </section>
        ) : null}

        {project.implementation.length > 0 ? (
          <Block title="How it is built">
            <Lines items={project.implementation} />
            <p className="t-data mt-8 max-w-[66ch] leading-relaxed text-fg-2">{project.stack.join(" · ")}</p>
          </Block>
        ) : (
          <Block title="Built with">
            <p className="t-data max-w-[66ch] leading-relaxed text-fg-2">{project.stack.join(" · ")}</p>
          </Block>
        )}

        {project.challenges.length > 0 ? (
          <Block title="Hard problems">
            <ol className="max-w-[66ch]">
              {project.challenges.map((challenge) => (
                <li key={challenge.problem} className="border-t border-line py-7">
                  <p className="t-body-lg text-fg">{challenge.problem}</p>
                  <p className="mt-3 text-fg-2">{challenge.solution}</p>
                </li>
              ))}
            </ol>
          </Block>
        ) : null}

        {project.outcomes.length > 0 ? (
          <Block title="What can be verified">
            <dl className="max-w-[66ch]">
              {project.outcomes.map((outcome) => (
                <div key={outcome.label} className="grid gap-x-8 gap-y-1 border-t border-line py-6 sm:grid-cols-[10rem_1fr]">
                  <dt className="order-2 sm:col-start-2">
                    <span className="block text-[1.0625rem]">{outcome.label}</span>
                    <span className="mt-1 block text-[0.875rem] text-fg-3">{outcome.source}</span>
                  </dt>
                  <dd className="t-title order-1 tabular-nums sm:col-start-1 sm:row-start-1">{outcome.value}</dd>
                </div>
              ))}
            </dl>
          </Block>
        ) : null}

        {project.limitations.length > 0 ? (
          <Block title="Limits and open work">
            <Lines items={project.limitations} />
          </Block>
        ) : null}
      </div>

      <nav aria-label="More projects" data-surface="ink" className="mt-8">
        <div className="shell grid sm:grid-cols-2">
          <Link href={`/work/${previous.slug}`} className="group flex flex-col gap-3 py-10 sm:border-r sm:border-line sm:pr-8 md:py-14">
            <span className="t-data flex items-center gap-2 text-fg-2">
              <ArrowLeft className="size-3.5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-x-1" aria-hidden="true" />
              Previous
            </span>
            <span className="t-title transition-colors group-hover:text-accent">{previous.title}</span>
          </Link>
          <Link href={`/work/${next.slug}`} className="group flex flex-col gap-3 border-t border-line py-10 sm:items-end sm:border-t-0 sm:pl-8 sm:text-right md:py-14">
            <span className="t-data flex items-center gap-2 text-fg-2">
              Next
              <ArrowRight className="size-3.5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1" aria-hidden="true" />
            </span>
            <span className="t-title transition-colors group-hover:text-accent">{next.title}</span>
          </Link>
        </div>
      </nav>

      <section data-surface="yellow" className="py-[var(--spacing-section)]">
        <div className="shell">
        <h2 className="t-display max-w-[18ch]">
          Need something like <em className="accent">this</em> built?
        </h2>
        <p className="t-lead mt-6 max-w-[44ch] text-fg-2">
          Tell me what you are making. I will tell you how I would approach it, and whether I am the right person.
        </p>
        <Link href="/contact" className="btn btn-primary mt-9">
          Start a conversation
          <ArrowRight aria-hidden="true" />
        </Link>
        </div>
      </section>
    </article>
  );
}
