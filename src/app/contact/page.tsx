import { Suspense } from "react";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { mailto, site } from "@/config/site";
import { formBackendConfigured } from "@/lib/contact";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageIntro } from "@/components/ui/PageIntro";
import { contactPageSchema, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const description =
  "Start a project or a conversation with Nexora: product builds, AI features and engineering work.";

export const metadata: Metadata = pageMetadata({ title: "Contact: start a project", description, path: "/contact" });

const helpful = [
  "What the product is and who uses it",
  "What exists today: nothing, a design, a prototype, a live system",
  "The part that is stuck or missing",
  "Any date that matters",
];

export default function ContactPage() {
  // Decided at build time from server-only environment variables.
  const serverDelivery = formBackendConfigured();

  const elsewhere = [
    { label: "GitHub", href: site.links.github as string | null },
    { label: "LinkedIn", href: site.links.linkedin },
    { label: "Résumé", href: site.links.resume },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  return (
    <>
      <JsonLd data={contactPageSchema(description)} />
      <PageIntro
        surface="red"
        heading={
          <>
            Have something <em className="accent">ambitious</em> in mind?
          </>
        }
      >
        <p>
          I take on product builds, AI features and the engineering underneath them, and I am open to conversations
          about roles where that mix is useful.
        </p>
      </PageIntro>

      <div className="shell grid gap-x-8 gap-y-16 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-7">
          <Suspense fallback={<p className="text-fg-2">Loading the form.</p>}>
            <ContactForm serverDelivery={serverDelivery} />
          </Suspense>
        </div>

        <aside className="md:col-span-4 md:col-start-9" aria-label="Other ways to reach me">
          <dl className="border-t border-line">
            <div className="border-b border-line py-5">
              <dt className="text-[0.875rem] text-fg-3">Email</dt>
              <dd className="mt-2">
                <a href={mailto()} className="link break-all text-[1.0625rem]">
                  {site.email}
                </a>
              </dd>
            </div>
            <div className="border-b border-line py-5">
              <dt className="text-[0.875rem] text-fg-3">Availability</dt>
              <dd className="t-data mt-2 flex items-center gap-2.5">
                <span className="status-mark" data-kind={site.availability.open ? "live" : "development"} aria-hidden="true" />
                {site.availability.open ? site.availability.label : site.availability.closedLabel}
              </dd>
            </div>
            <div className="border-b border-line py-5">
              <dt className="text-[0.875rem] text-fg-3">Where</dt>
              <dd className="mt-2">
                {site.location} · {site.timezone}. Remote by default.
              </dd>
            </div>
            <div className="border-b border-line py-5">
              <dt className="text-[0.875rem] text-fg-3">Elsewhere</dt>
              <dd className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                {elsewhere.map((link) => (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5">
                    {link.label}
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ))}
              </dd>
            </div>
          </dl>

          <h2 className="mt-10 text-[1.0625rem] font-medium">A useful first message covers</h2>
          <ul className="mt-4 border-t border-line">
            {helpful.map((item) => (
              <li key={item} className="border-b border-line py-4 text-[0.9375rem] text-fg-2">
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
