import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, X } from "lucide-react";
import { mailto, site, socialProfiles } from "@/config/site";
import { PageIntro } from "@/components/ui/PageIntro";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { Status } from "@/components/ui/Status";
import { pageMetadata } from "@/lib/seo";

/**
 * The page linked from e-invoicing outreach. Every date on it points to the Ministry of
 * Finance document it comes from, so a reader can check it without trusting us.
 */

const description =
  "Technical e-invoicing implementation for UAE businesses: readiness checks, invoice-data cleanup and connecting your existing accounting system to the accredited service provider you choose.";

export const metadata: Metadata = pageMetadata({
  title: "UAE e-invoicing implementation for businesses and accounting firms",
  description,
  path: "/e-invoicing",
});

/** Official Ministry of Finance sources. Re-check these whenever the dates change. */
const sources = {
  aspList: {
    label: "MoF list of Accredited Service Providers",
    href: "https://mof.gov.ae/en/about-us/initiatives/einvoicing/pre-approved-einvoicing-service-providers/",
  },
  decision66: {
    label: "Ministerial Decision No. 66 of 2026",
    href: "https://mof.gov.ae/wp-content/uploads/2026/05/Ministerial-Resolution-No.-66-of-2026-Amending-Certain-Provisions-of-Ministerial-Resolution-No.-244-of-2025-Regarding-the-Implementation-of-the-Electronic-Invoicing-System-En-20260514.pdf",
  },
  decision244: {
    label: "MoF announcement of Ministerial Decision No. 244 of 2025",
    href: "https://mof.gov.ae/en/news/ministry-of-finance-announces-the-issuance-of-two-ministerial-decisions-on-the-scope-of-obligations-and-the-timelines-for-implementing-the-electronic-invoicing-system-2/",
  },
  mandatoryFields: {
    label: "MoF Electronic Invoice Mandatory Fields, v1.0",
    href: "https://mof.gov.ae/wp-content/uploads/2026/02/UAE-Electronic-Invoice-mandatory-fields_V-1.0-23Feb2026.pdf",
  },
};

const audiences = [
  {
    title: "Accounting and bookkeeping firms",
    body: "Your clients need technical help getting their invoice data to an accredited provider. You keep the client relationship and the tax advice; we do the systems work.",
  },
  {
    title: "SMEs on everyday systems",
    body: "QuickBooks, Xero, Excel, or a legacy or custom ERP. You keep the software you already use.",
  },
];

const steps = [
  {
    title: "Readiness check",
    body: "We go through an export of your invoices and list which mandatory fields are missing or malformed: TRNs, tax codes, buyer and seller master data.",
  },
  { title: "Invoice-data cleanup", body: "We fix the gaps at the source, in your system's master data and templates, so new invoices come out complete." },
  { title: "Connector configuration", body: "We connect your accounting system to the accredited service provider you have chosen." },
  { title: "Integration testing", body: "We send test invoices end to end, and work through every rejection until the cause is fixed." },
  { title: "Go-live support", body: "We stay with you through the first live invoices and the rejections that real data brings." },
];

const process = ["Scoping call", "Fixed-scope proposal", "Implementation", "Testing", "Go-live"];

const deadlines = [
  {
    who: "Revenue of AED 50 million or more",
    appoint: "30 October 2026",
    live: "1 January 2027",
    source: sources.decision66,
  },
  {
    who: "Revenue below AED 50 million",
    appoint: "31 March 2027",
    live: "1 July 2027",
    source: sources.decision244,
  },
];

/** Each line must stay true. Change it here the moment the practice changes. */
const dataHandling = [
  "We will sign your NDA, or send ours, before you share any data.",
  "For a readiness check, an export of your invoices is enough. We do not need logins to your accounting system.",
  "We work on your files only for the engagement and do not use them for anything else.",
  "When the work ends we delete your files, and we confirm it in writing. We keep only the proposal and our invoice.",
];

export default function EInvoicingPage() {
  return (
    <>
      <PageIntro
        surface="cobalt"
        heading={
          <>
            Technical e-invoicing implementation for <em className="accent">UAE</em> businesses
          </>
        }
      >
        <p>
          We connect your existing accounting system to the accredited service provider you choose. No software
          replacement required.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {site.booking ? (
            <a href={site.booking} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              Book a 20-minute call
              <ArrowUpRight aria-hidden="true" />
            </a>
          ) : null}
          <a href={mailto("E-invoicing")} className={site.booking ? "btn btn-ghost" : "btn btn-primary"}>
            Email {site.email}
            <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </PageIntro>

      <section className="shell grid gap-x-6 gap-y-10 py-[var(--spacing-section)] md:grid-cols-12">
        <h2 className="t-display md:col-span-5">Who it&rsquo;s for</h2>
        <ul className="border-t border-line md:col-span-6 md:col-start-7">
          {audiences.map((audience) => (
            <li key={audience.title} className="border-b border-line py-6" data-reveal="rise">
              <h3 className="t-lead">{audience.title}</h3>
              <p className="mt-2 max-w-[52ch] text-fg-2">{audience.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="shell grid gap-x-6 gap-y-10 border-t border-line py-[var(--spacing-section)] md:grid-cols-12">
        <h2 className="t-display md:col-span-5">
          What we <em className="accent">do</em>
        </h2>
        <ol className="border-t border-line md:col-span-6 md:col-start-7">
          {steps.map((step, i) => (
            <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-line py-6" data-reveal="rise">
              <span className="t-data pt-1.5 text-fg-3">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="t-lead">{step.title}</h3>
                <p className="mt-2 max-w-[52ch] text-fg-2">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* What we are and are not. Accountants ask this first. */}
      <section data-surface="yellow" className="border-y-2 border-ink">
        <div className="shell grid gap-x-6 gap-y-10 py-[var(--spacing-section)] md:grid-cols-12">
          <h2 className="t-display md:col-span-5">What we are, and what we&rsquo;re not</h2>
          <ul className="border-t-2 border-fg md:col-span-6 md:col-start-7">
            <li className="flex gap-4 border-b-2 border-fg py-6">
              <Check className="mt-1 size-5 shrink-0" aria-hidden="true" />
              <span className="sr-only">We are:</span>
              <p className="t-lead">An independent integration studio.</p>
            </li>
            <li className="flex gap-4 border-b-2 border-fg py-6">
              <X className="mt-1 size-5 shrink-0" aria-hidden="true" />
              <span className="sr-only">We are not:</span>
              <p className="t-lead">
                Not an Accredited Service Provider. We work with providers on the{" "}
                <a href={sources.aspList.href} className="link" target="_blank" rel="noopener noreferrer">
                  Ministry of Finance list
                </a>
                .
              </p>
            </li>
            <li className="flex gap-4 border-b-2 border-fg py-6">
              <X className="mt-1 size-5 shrink-0" aria-hidden="true" />
              <span className="sr-only">We are not:</span>
              <p className="t-lead">We don&rsquo;t give tax advice. That stays with your accountant.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="shell grid gap-x-6 gap-y-10 py-[var(--spacing-section)] md:grid-cols-12">
        <h2 className="t-display md:col-span-5">How it works</h2>
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-4 md:col-span-6 md:col-start-7">
          {process.map((stage, i) => (
            <li key={stage} className="t-lead flex items-center gap-3">
              {i > 0 ? <ArrowRight className="size-4 text-fg-3" aria-hidden="true" /> : null}
              {stage}
            </li>
          ))}
        </ol>
      </section>

      <section className="shell grid gap-x-6 gap-y-10 border-t border-line py-[var(--spacing-section)] md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 className="t-display">Key dates</h2>
          <p className="mt-6 max-w-[40ch] text-fg-2">
            Each date links to the Ministry of Finance document that sets it. Check it there, not here.
          </p>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <dl className="border-t border-line">
            {deadlines.map((deadline) => (
              <div key={deadline.who} className="border-b border-line py-6">
                <dt className="t-lead">{deadline.who}</dt>
                <dd className="mt-3 grid gap-1 text-fg-2">
                  <span>
                    Appoint an accredited provider by <strong className="text-fg">{deadline.appoint}</strong>
                  </span>
                  <span>
                    Live on e-invoicing from <strong className="text-fg">{deadline.live}</strong>
                  </span>
                  <a
                    href={deadline.source.href}
                    className="link mt-2 inline-flex w-fit items-center gap-1.5 text-[0.9375rem]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source: {deadline.source.label}
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </a>
                </dd>
              </div>
            ))}
          </dl>
          <a
            href={sources.aspList.href}
            className="link mt-6 inline-flex items-center gap-1.5"
            target="_blank"
            rel="noopener noreferrer"
          >
            {sources.aspList.label}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* Proof, labelled for what it is. */}
      <section className="shell grid gap-x-6 gap-y-10 border-t border-line py-[var(--spacing-section)] md:grid-cols-12">
        <div className="md:col-span-5">
          <Status kind="development" label="Prototype" />
          <h2 className="t-display mt-4">The readiness checker</h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="t-body-lg max-w-[56ch]">
            The readiness check runs on a validator we built: it reads a CSV or Excel invoice export and reports,
            invoice by invoice, which mandatory fields are missing or malformed, and what to fix first.
          </p>
          <ul className="mt-6 border-t border-line text-fg-2">
            <li className="border-b border-line py-4">
              Works today: checks against the{" "}
              <a href={sources.mandatoryFields.href} className="link" target="_blank" rel="noopener noreferrer">
                {sources.mandatoryFields.label}
              </a>
              , including tax numbers damaged by spreadsheet software.
            </li>
            <li className="border-b border-line py-4">Tested so far on a fictional sample dataset, not on client data.</li>
            <li className="border-b border-line py-4">Not yet: the full PINT AE schema rules.</li>
          </ul>
          <Link href="/work/e-invoicing-copilot" className="link mt-6 inline-flex items-center gap-1.5">
            How the validator is built
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="shell grid gap-x-6 gap-y-10 border-t border-line py-[var(--spacing-section)] md:grid-cols-12">
        <h2 className="t-display md:col-span-5">How we handle your data</h2>
        <ul className="border-t border-line md:col-span-6 md:col-start-7">
          {dataHandling.map((line) => (
            <li key={line} className="border-b border-line py-4">
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section data-surface="ink" className="py-[var(--spacing-section)]">
        <div className="shell grid gap-x-6 gap-y-10 md:grid-cols-12">
          <div className="flex items-start gap-6 md:col-span-5">
            {site.founder.photo ? (
              <Image
                src={site.founder.photo}
                alt={`Portrait of ${site.founder.name}`}
                width={160}
                height={160}
                className="size-28 shrink-0 object-cover md:size-36"
              />
            ) : null}
            <div>
              <p className="t-data text-fg-2">{site.founder.role}</p>
              <h2 className="t-display mt-2">{site.founder.name}</h2>
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="t-body-lg max-w-[56ch]">
              I studied computer science in Mumbai, built websites for clients, and spent time in business development,
              which is where I learned to read a problem from the owner&rsquo;s side. I now build software in Dubai,
              including the validator above. On an e-invoicing project, I&rsquo;m the person who does the work.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <SocialLinks profiles={socialProfiles} />
              <Link href="/work" className="link inline-flex items-center gap-1.5">
                Other work
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" data-surface="cobalt" className="py-[var(--spacing-section)]">
        <div className="shell grid gap-x-6 gap-y-8 md:grid-cols-12 md:items-end">
          <h2 className="t-display md:col-span-7">
            Talk it through in <em className="accent">20 minutes</em>
          </h2>
          <div className="md:col-span-5">
            <div className="flex flex-wrap gap-3">
              {site.booking ? (
                <a href={site.booking} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                  Book a call
                  <ArrowUpRight aria-hidden="true" />
                </a>
              ) : null}
              <a href={mailto("E-invoicing")} className={site.booking ? "btn btn-ghost" : "btn btn-primary"}>
                Email us
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
            <p className="t-data mt-6">
              <a href={mailto("E-invoicing")} className="link">
                {site.email}
              </a>{" "}
              · {site.location} · {site.timezone}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
