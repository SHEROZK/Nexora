import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import { capabilityLayers } from "@/content/capabilities";
import { projects } from "@/content/projects";
import { CapabilityMap } from "@/components/interactive/CapabilityMap";
import { PageIntro } from "@/components/ui/PageIntro";
import { Section } from "@/components/ui/Section";
import { pageMetadata, profilePageSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const description =
  "How Nexora approaches product engineering, full-stack architecture and AI integration, and the skills behind it.";

export const metadata: Metadata = pageMetadata({ title: "About: how Nexora builds products and AI systems", description, path: "/about", type: "profile" });

const projectTitles = Object.fromEntries(projects.map((project) => [project.slug, project.title]));

const principles = [
  {
    title: "Start from what must never happen",
    body: "Before any screen, I write down the sentences the system has to keep true. An order is never delivered without payment. A tenant never sees an address before the visit is confirmed. A model never rewrites a line of dialogue. Those sentences become the architecture.",
  },
  {
    title: "One source of truth for each fact",
    body: "Totals are computed in one module. Transitions are decided by one state machine. When the website, the bot and the admin panel all call the same code, they cannot disagree about what a customer owes.",
  },
  {
    title: "AI is a component, not a product",
    body: "A model gets a narrow job, a schema it cannot step outside, and a person downstream wherever it is known to fail. I benchmark before I choose one, and I keep plain rules for anything that has a single right answer.",
  },
  {
    title: "Automate the boring, gate the risky",
    body: "A pipeline should resume after a crash, record what it did, and stop where a mistake would be expensive. The stopping points are part of the design, not an admission of failure.",
  },
  {
    title: "The interface is part of the system",
    body: "A state the server would refuse should never be a button someone can press. Interface design and backend design are the same decision made twice, so I prefer to make it once.",
  },
  {
    title: "Finished means operable",
    body: "Migrations, tests, a release that can roll back, and instructions the next person can follow. A feature without those is a demo.",
  },
  {
    title: "Say what is true",
    body: "Experiments are labelled experiments. Rule-based estimates are not called AI. A motion comic is not called animation. Clients make better decisions when the status is accurate.",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={profilePageSchema(description)} />
      <PageIntro
        surface="cobalt"
        heading={
          <>
            I work across the whole stack, because that is where products <em className="accent">break</em>
          </>
        }
      >
        <p>{site.about.intro}</p>
      </PageIntro>

      <div className="shell">
        <ol className="border-t border-line">
          {principles.map((principle, i) => (
            <li
              key={principle.title}
              className="grid gap-x-6 gap-y-3 border-b border-line py-9 md:grid-cols-12 md:py-12"
              data-reveal="rise"
            >
              <span className="t-data text-fg-3 md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="t-title text-[clamp(1.5rem,2.6vw,2.25rem)] md:col-span-5">{principle.title}</h2>
              <p className="max-w-[58ch] text-fg-2 md:col-span-6">{principle.body}</p>
            </li>
          ))}
        </ol>
      </div>

      <Section
        id="skills"
        heading={
          <>
            Skills, by the layer they <em className="accent">live</em> in
          </>
        }
        intro="No percentage bars. Each layer lists what I have used on real work and links to where you can see it."
      >
        <CapabilityMap layers={capabilityLayers} projectTitles={projectTitles} />
      </Section>

      <section className="shell grid gap-x-6 gap-y-10 border-t border-line py-[var(--spacing-section)] md:grid-cols-12">
        <h2 className="t-title md:col-span-4">Background</h2>
        <div className="md:col-span-7 md:col-start-6">
          {site.about.background ? <p className="t-body-lg max-w-[60ch] text-fg">{site.about.background}</p> : null}
          <dl className="mt-10 max-w-[60ch] border-t border-line">
            {site.background.map((fact) => (
              <div key={fact.label} className="grid gap-x-6 gap-y-1 border-b border-line py-4 sm:grid-cols-[9rem_1fr]">
                <dt className="text-[0.875rem] text-fg-3">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/work" className="btn btn-ghost">
              See the work
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/contact" className="btn btn-primary">
              Get in touch
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
