import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { projects } from "@/content/projects";
import { services } from "@/content/services";
import { PageIntro } from "@/components/ui/PageIntro";
import { pageMetadata, servicesSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const description =
  "Full-stack product development, AI integration, backend engineering, generative workflows, creative frontend and architecture, each tied to a real project.";

export const metadata: Metadata = pageMetadata({ title: "Services: full-stack, AI and backend development", description, path: "/services" });

const projectTitles = Object.fromEntries(projects.map((project) => [project.slug, project.title]));

const process = [
  {
    title: "You describe the problem",
    body: "What you are making, who it is for, what exists today and when you need it. A few paragraphs is enough.",
  },
  {
    title: "I ask what I need to know",
    body: "Usually a short call or a list of questions. If I am not the right person for it, I say so at this point.",
  },
  {
    title: "You get a written scope",
    body: "What I would build, in what order, what I am assuming, and a figure for it. Nothing starts before you have agreed to that page.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={servicesSchema(services, description)} />
      <PageIntro
        surface="yellow"
        heading={
          <>
            What you can <em className="accent">hire me</em> for
          </>
        }
      >
        <p>
          Six kinds of work, each tied to a project where you can see it done. There are no packages and no price list:
          every estimate starts from your actual problem.
        </p>
      </PageIntro>

      <div className="shell">
        {services.map((service) => (
          <section key={service.id} id={service.id} className="grid gap-x-6 gap-y-8 border-t border-line py-12 md:grid-cols-12 md:py-20">
            <div className="md:col-span-5">
              <h2 className="t-title" data-reveal="rise">
                {service.title}
              </h2>
              <p className="t-body-lg mt-6 max-w-[40ch] text-fg-2" data-reveal="rise" style={{ "--i": 1 } as React.CSSProperties}>
                {service.problem}
              </p>
            </div>
            <div className="md:col-span-6 md:col-start-7" data-reveal="rise" style={{ "--i": 2 } as React.CSSProperties}>
              <h3 className="text-[0.875rem] text-fg-3">What you get</h3>
              <ul className="mt-3 border-t border-line">
                {service.deliverables.map((item) => (
                  <li key={item} className="border-b border-line py-4">
                    {item}
                  </li>
                ))}
              </ul>
              <h3 className="mt-9 text-[0.875rem] text-fg-3">Where you can see it</h3>
              <p className="mt-3 max-w-[56ch] text-fg-2">{service.proof}</p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                {service.evidence.map((slug) => (
                  <Link key={slug} href={`/work/${slug}`} className="link inline-flex items-center gap-1.5 text-[0.9375rem]">
                    {projectTitles[slug]}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <Link href={`/contact?topic=${service.id}`} className="btn btn-ghost mt-8">
                Request a project estimate
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </section>
        ))}
      </div>

      <section className="shell grid gap-x-6 gap-y-10 border-t border-line py-[var(--spacing-section)] md:grid-cols-12">
        <h2 className="t-display md:col-span-5">
          How an estimate <em className="accent">works</em>
        </h2>
        <div className="md:col-span-6 md:col-start-7">
          <ol className="border-t border-line">
            {process.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-line py-6" data-reveal="rise">
                <span className="t-data pt-1.5 text-fg-3">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="t-lead">{step.title}</h3>
                  <p className="mt-2 max-w-[52ch] text-fg-2">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/contact" className="btn btn-primary mt-9">
            Describe your project
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
