import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { mailto, site } from "@/config/site";
import { capabilityLayers } from "@/content/capabilities";
import { featuredProjects, otherProjects, projects } from "@/content/projects";
import { services } from "@/content/services";
import { Hero } from "@/components/hero/Hero";
import { CapabilityMap } from "@/components/interactive/CapabilityMap";
import { FlowField } from "@/components/interactive/FlowField";
import { OrderMachine } from "@/components/interactive/OrderMachine";
import { Marquee } from "@/components/motion/Marquee";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { ProjectSpread } from "@/components/projects/Spreads";
import { ServiceRows } from "@/components/services/ServiceRows";
import { Status } from "@/components/ui/Status";

const projectTitles = Object.fromEntries(projects.map((project) => [project.slug, project.title]));

const claims = [
  {
    title: "Products that run a business",
    body: "Ordering, payments, deliveries and the till for a working restaurant, in production.",
    slug: "food-for-less",
  },
  {
    title: "AI with a job description",
    body: "Models given a narrow task, a schema they cannot step outside, and a person where they fail.",
    slug: "video-director",
  },
  {
    title: "Interfaces people trust",
    body: "Four roles, sixty-eight pages and one design language, built by one developer.",
    slug: "pg-india",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Statement. Cobalt, with one line of type pushed sideways by the scroll. */}
      <section id="statement" data-surface="cobalt" className="overflow-hidden pb-[var(--spacing-section)] pt-10 md:pt-14">
        <Marquee words={["Product", "System", "Intelligence"]} className="t-giant text-[min(11vw,17svh)] leading-[0.9]" />
        <div className="shell mt-16 grid gap-x-12 gap-y-14 md:mt-24 lg:grid-cols-12">
          <SplitHeading as="p" className="t-display max-w-[26ch] text-[clamp(1.5rem,2.9vw,2.875rem)] leading-[1.06] lg:col-span-7 lg:max-w-none">
            I build the product, the system behind it and the <em className="accent">intelligence</em> inside it, from the
            interface down to the database.
          </SplitHeading>
          <ol className="max-w-2xl lg:col-span-4 lg:col-start-9 lg:max-w-none">
            {claims
              .filter((claim) => projectTitles[claim.slug])
              .map((claim, i) => (
              <li key={claim.slug} className="grid grid-cols-[3.25rem_1fr] gap-x-5 border-t-2 border-fg py-7" data-reveal="rise" style={{ "--i": i } as React.CSSProperties}>
                <span className="t-giant text-[3.25rem] text-accent" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h2 className="font-sans text-[1.1875rem] font-bold leading-tight tracking-[-0.01em]">{claim.title}</h2>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-2">{claim.body}</p>
                  <Link href={`/work/${claim.slug}`} className="link mt-3 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold">
                    {projectTitles[claim.slug]}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Work. A cropped heading, then four spreads that share nothing but the type. */}
      <section id="work" aria-labelledby="work-heading">
        <div className="overflow-hidden pt-[var(--spacing-section)]">
          <div className="shell grid gap-6 pb-10 md:grid-cols-12 md:items-end md:pb-14">
            <h2 id="work-heading" className="t-giant -ml-[0.03em] text-[min(14vw,21svh)] md:col-span-8">
              Work
            </h2>
            <p className="t-lead max-w-[30ch] md:col-span-4 md:pb-[2vw]" data-reveal="rise">
              Four projects, described as they are: what is live, what is still being built, and what is an experiment.
            </p>
          </div>
        </div>

        {featuredProjects.map((project, i) => (
          <ProjectSpread key={project.slug} project={project} position={i + 1} />
        ))}

        {/* The rest, as an index. */}
        <div className="shell py-[var(--spacing-section)]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h3 className="t-display">Also built</h3>
            <Link href="/work" className="cta">
              All {projects.length} projects
              <ArrowRight className="size-[0.8em] self-center" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-10 border-t-2 border-fg">
            {otherProjects.map((project, i) => (
              <li key={project.slug} className="border-b-2 border-fg">
                <Link
                  href={`/work/${project.slug}`}
                  className="group grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-4 gap-y-2 py-7 transition-colors duration-150 hover:bg-fg hover:text-surface md:grid-cols-[3rem_1fr_auto] md:px-4 lg:grid-cols-[4rem_5fr_4fr_3fr_auto] lg:gap-x-8"
                >
                  <span className="t-data">{String(featuredProjects.length + i + 1).padStart(2, "0")}</span>
                  <span className="t-title">{project.title}</span>
                  <span className="col-start-2 text-[0.9375rem] lg:col-start-3">{project.category}</span>
                  <span className="col-start-2 lg:col-start-4">
                    <Status kind={project.status.kind} label={project.status.label} />
                  </span>
                  <ArrowUpRight className="col-start-3 row-start-1 size-6 self-center lg:col-start-5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Services. A contents page. */}
      <section id="services" aria-labelledby="services-heading" className="pb-[var(--spacing-section)]">
        <div className="shell grid gap-8 pb-16 md:grid-cols-12 md:items-end">
          <SplitHeading id="services-heading" className="t-display md:col-span-7 lg:col-span-8">
            What you can <em className="accent">hire me</em> for
          </SplitHeading>
          <p className="t-body-lg text-fg-2 md:col-span-5 lg:col-span-4" data-reveal="rise">
            Six kinds of work. Each names the problem it solves and points to a project where you can see it done.
          </p>
        </div>
        <ServiceRows services={services} projectTitles={projectTitles} />
        <div className="shell mt-9">
          <Link href="/services" className="cta">
            Every service in full
            <ArrowRight className="size-[0.8em] self-center" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Skills. A cross-section in five colours. */}
      <section id="about" aria-labelledby="about-heading">
        <div className="shell grid gap-8 pb-16 md:grid-cols-12 md:items-end">
          <SplitHeading id="about-heading" className="t-display md:col-span-7 lg:col-span-8">
            Products break at the <em className="accent">joins</em>
          </SplitHeading>
          <p className="t-body-lg text-fg-2 md:col-span-5 lg:col-span-4" data-reveal="rise">
            Where the screen meets the API, where the API meets the money, where a model meets real input. I work on
            both sides of each one. Here is the whole stack, cut through.
          </p>
        </div>
        <CapabilityMap layers={capabilityLayers} projectTitles={projectTitles} />
        <div className="shell py-9">
          <Link href="/about" className="cta">
            How I think about building
            <ArrowRight className="size-[0.8em] self-center" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Lab. Dark, with a live specimen and a machine you can operate. */}
      <section id="experiments" data-surface="ink" aria-labelledby="lab-heading" className="relative overflow-hidden pb-[var(--spacing-section)]">
        <div className="relative">
          <FlowField className="h-[72svh] min-h-[26rem]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <div className="shell pb-6 md:pb-9">
              <h2 id="lab-heading" className="t-giant text-[min(11vw,17svh)] text-paper mix-blend-difference">
                The lab
              </h2>
            </div>
          </div>
        </div>
        <div className="shell mt-12 grid gap-x-8 gap-y-6 md:mt-16 md:grid-cols-12">
          <p className="t-lead md:col-span-6">
            Above: drift turning into circuitry as you move right. Below: the order logic from Food For Less, rewritten
            as a small model that runs in your browser. Try to break it.
          </p>
          <p className="text-fg-2 md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9">
            Neither is a recording, and neither is connected to a production system. Dashed buttons are moves the
            server would refuse; press them to see why.
          </p>
        </div>
        <div className="shell mt-10">
          <OrderMachine />
          <div className="mt-9">
            <Link href="/experiments" className="cta">
              More experiments
              <ArrowRight className="size-[0.8em] self-center" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact. The address itself is the headline. */}
      <section id="contact" data-surface="cobalt" aria-labelledby="contact-heading" className="relative overflow-hidden pt-[var(--spacing-section)]">
        <div className="shell grid gap-x-8 gap-y-8 md:grid-cols-12 md:items-end">
          <SplitHeading id="contact-heading" className="t-display md:col-span-7 lg:col-span-8">
            Have something <em className="accent">ambitious</em> in mind?
          </SplitHeading>
          <div className="md:col-span-5 lg:col-span-4" data-reveal="rise">
            <p className="t-body-lg text-fg-2">
              I take on product builds, AI features, and the unglamorous engineering underneath them. Tell me what you
              are making and where it is stuck.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href="/contact" className="btn btn-primary">
                Start a project
                <ArrowRight aria-hidden="true" />
              </Link>
              <Status
                kind={site.availability.open ? "live" : "development"}
                label={site.availability.open ? site.availability.label : site.availability.closedLabel}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-16">
          <a
            href={mailto()}
            className="t-giant block px-[var(--spacing-gutter)] pb-[0.25em] text-[min(7.2vw,13svh)] normal-case leading-[1] transition-colors duration-200 hover:text-accent"
            aria-label={`Email ${site.email}`}
          >
            {site.email}
          </a>
        </div>
        <div className="shell flex flex-wrap justify-between gap-4 border-t-2 border-fg py-5">
          <p className="t-data">
            <a href={mailto()} className="link">
              {site.email}
            </a>{" "}
            · {site.location} · {site.timezone}
          </p>
          <p className="t-data">Replies come from me, not a form letter</p>
        </div>
      </section>
    </>
  );
}
