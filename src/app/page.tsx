import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { mailto, site, whatsapp } from "@/config/site";
import { featuredProjects, projects } from "@/content/projects";
import { services } from "@/content/services";
import { Hero } from "@/components/hero/Hero";
import { Marquee } from "@/components/motion/Marquee";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { ProjectSpread } from "@/components/projects/Spreads";
import { ServiceRows } from "@/components/services/ServiceRows";
import { Status } from "@/components/ui/Status";

const NUMBER_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
/** Featured projects come from the code and the admin panel, so the count is worked out, never typed. */
const featuredCount = `${NUMBER_WORDS[featuredProjects.length] ?? featuredProjects.length} ${featuredProjects.length === 1 ? "project" : "projects"}`;

const callMessage = "Hi, I would like to book a short call about software for my business.";

const steps = [
  {
    title: "A short call",
    body: "You describe the business and what is slowing it down. I ask questions until I understand how the work actually happens.",
  },
  {
    title: "A written proposal",
    body: "What gets built, in what order, what it costs and when you see it working. Nothing starts until you agree to it.",
  },
  {
    title: "Built in pieces",
    body: "Each piece is tested and handed to you as it lands, so you try the real thing along the way instead of waiting for a reveal.",
  },
  {
    title: "Support after launch",
    body: "Fixes, changes and the questions your staff have once they start using it. The person who built it is the one who answers.",
  },
];

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

      {/* Work. A cropped heading, then the featured spreads that share nothing but the type. */}
      <section id="work" aria-labelledby="work-heading">
        <div className="overflow-hidden pt-[var(--spacing-section)]">
          <div className="shell grid gap-6 pb-10 md:grid-cols-12 md:items-end md:pb-14">
            <h2 id="work-heading" className="t-giant -ml-[0.03em] text-[min(14vw,21svh)] md:col-span-8">
              Work
            </h2>
            <p className="t-lead max-w-[30ch] md:col-span-4 md:pb-[2vw]" data-reveal="rise">
              {featuredCount} built for real businesses, described as they are: what is live, what is still being built,
              and what is an experiment.
            </p>
          </div>
        </div>

        {featuredProjects.map((project, i) => (
          <ProjectSpread key={project.slug} project={project} position={i + 1} />
        ))}

        <div className="shell flex flex-wrap items-baseline justify-between gap-6 border-b-2 border-fg py-12">
          <p className="t-body-lg max-w-[44ch] text-fg-2">
            More websites, stores and AI tools, each with what it is and how far along it is.
          </p>
          <Link href="/work" className="cta">
            All {projects.length} projects
            <ArrowRight className="size-[0.8em] self-center" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Custom builds. A contents page, ending in a quote. */}
      <section id="services" aria-labelledby="services-heading" className="py-[var(--spacing-section)]">
        <div className="shell grid gap-8 pb-16 md:grid-cols-12 md:items-end">
          <SplitHeading id="services-heading" className="t-display md:col-span-7 lg:col-span-8">
            Custom builds for <em className="accent">your</em> business
          </SplitHeading>
          <p className="t-body-lg text-fg-2 md:col-span-5 lg:col-span-4" data-reveal="rise">
            For when nothing off the shelf fits. Each kind of work names the problem it solves and points to a project
            where you can see it done.
          </p>
        </div>
        <ServiceRows services={services} projectTitles={projectTitles} />
        <div className="shell mt-12 flex flex-wrap items-center gap-x-10 gap-y-6">
          <Link href="/contact" className="btn btn-primary" data-arrow="up-right">
            Get a quote
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link href="/services" className="cta">
            Every service in full
            <ArrowRight className="size-[0.8em] self-center" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* How a project runs. Four steps in order, so the first one feels small. */}
      <section id="process" data-surface="ink" aria-labelledby="process-heading" className="py-[var(--spacing-section)]">
        <div className="shell grid gap-8 md:grid-cols-12 md:items-end">
          <SplitHeading id="process-heading" className="t-display md:col-span-7 lg:col-span-8">
            How a project <em className="accent">runs</em>
          </SplitHeading>
          <p className="t-body-lg text-fg-2 md:col-span-5 lg:col-span-4" data-reveal="rise">
            One person from the first call to the support after launch, so nothing gets lost in a hand-over.
          </p>
        </div>
        <ol className="shell mt-16 grid gap-x-10 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="border-t-2 border-fg pb-10 pt-6" data-reveal="rise" style={{ "--i": i } as React.CSSProperties}>
              <span className="t-giant block text-[3.25rem] text-accent" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="mt-5 font-sans text-[1.1875rem] font-bold leading-tight tracking-[-0.01em]">{step.title}</h3>
              <p className="mt-3 max-w-[38ch] text-[0.9375rem] leading-relaxed text-fg-2">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="shell mt-6">
          <a href={whatsapp(callMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-primary" data-icon="lead">
            <FaWhatsapp aria-hidden="true" />
            Start with a call
            <span className="sr-only">(opens WhatsApp)</span>
          </a>
        </div>
      </section>

      {/* Contact. WhatsApp first, because that is how most businesses here reach someone; the address is still the headline. */}
      <section id="contact" data-surface="cobalt" aria-labelledby="contact-heading" className="relative overflow-hidden pt-[var(--spacing-section)]">
        <div className="shell grid gap-x-8 gap-y-8 md:grid-cols-12 md:items-end">
          <SplitHeading id="contact-heading" className="t-display md:col-span-7 lg:col-span-8">
            Tell me what is <em className="accent">slowing</em> the business down
          </SplitHeading>
          <div className="md:col-span-5 lg:col-span-4" data-reveal="rise">
            <p className="t-body-lg text-fg-2">
              A message on WhatsApp is the quickest way. Say what the business does and where the work piles up, and I
              will reply myself.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a href={whatsapp(callMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-primary" data-icon="lead">
                <FaWhatsapp aria-hidden="true" />
                Message on WhatsApp
              </a>
              <Link href="/contact" className="btn btn-ghost">
                Send a brief
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-6">
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
            <a href={whatsapp()} target="_blank" rel="noopener noreferrer" className="link">
              WhatsApp {site.whatsapp.display}
            </a>{" "}
            · {site.location} · {site.timezone}
          </p>
          <p className="t-data">Replies come from me, not a form letter</p>
        </div>
      </section>
    </>
  );
}
