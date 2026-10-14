import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { experiments } from "@/content/experiments";
import { FlowField } from "@/components/interactive/FlowField";
import { OrderMachine } from "@/components/interactive/OrderMachine";
import { PipelineExplorer } from "@/components/interactive/PipelineExplorer";
import { PageIntro } from "@/components/ui/PageIntro";
import { pageMetadata } from "@/lib/seo";

const description =
  "Working models of real systems that run in the browser, plus an archive of local AI tools and measurements.";

export const metadata: Metadata = pageMetadata({ title: "Experiments: working models of real systems", description, path: "/experiments" });

export default function ExperimentsPage() {
  return (
    <>
      <PageIntro
        surface="ink"
        heading={
          <>
            Small <em className="accent">working</em> models of real systems
          </>
        }
      >
        <p>
          Three things here run in your browser. None is a recording, and none pretends to be a production system:
          they are ideas reduced until you can hold them.
        </p>
      </PageIntro>

      <section id="flow-field" aria-labelledby="flow-field-heading" data-surface="ink" className="scroll-mt-24 pb-14 md:pb-20">
        <FlowField className="h-[70svh] min-h-[24rem]" />
        <div className="shell mt-8 grid gap-6 md:grid-cols-12">
          <h2 id="flow-field-heading" className="t-title md:col-span-5">
            Flow field
          </h2>
          <p className="max-w-[58ch] text-fg-2 md:col-span-6 md:col-start-7">
            A few hundred particles following a noise field. Move the pointer to the right and their headings are
            snapped harder and harder to right angles, until drift becomes circuitry. The readout shows the one number
            the simulation is reading. It is the idea behind this whole site, drawn live: rough in, built out.
          </p>
        </div>
      </section>

      <section id="order-rules" aria-labelledby="order-rules-heading" className="shell scroll-mt-24 border-t border-line py-14 md:py-20">
        <div className="grid gap-6 md:grid-cols-12">
          <h2 id="order-rules-heading" className="t-title md:col-span-5">
            Order rules simulator
          </h2>
          <p className="max-w-[58ch] text-fg-2 md:col-span-6 md:col-start-7">
            The order and payment rules from Food For Less as a pure function. Start an online order and try to send it
            to the kitchen before it is paid, or try to complete a delivery without the PIN. Every attempt, allowed or
            refused, is appended to the timeline.
          </p>
        </div>
        <div className="mt-10">
          <OrderMachine />
        </div>
        <Link href="/work/food-for-less" className="link mt-8 inline-flex items-center gap-1.5">
          The system these rules come from
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      <section id="stage-machine" aria-labelledby="stage-machine-heading" className="shell scroll-mt-24 border-t border-line py-14 md:py-20">
        <div className="grid gap-6 md:grid-cols-12">
          <h2 id="stage-machine-heading" className="t-title md:col-span-5">
            Stage machine explorer
          </h2>
          <p className="max-w-[58ch] text-fg-2 md:col-span-6 md:col-start-7">
            Thirteen stages, six of which stop for a person. Run it, approve the checkpoints, then go back and edit an
            early artifact to see what has to run again. No models are involved: this shows the control flow.
          </p>
        </div>
        <div className="mt-10">
          <PipelineExplorer />
        </div>
        <Link href="/work/video-director" className="link mt-8 inline-flex items-center gap-1.5">
          The pipeline this models
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      <section aria-labelledby="archive-heading" className="shell border-t border-line py-[var(--spacing-section)]">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 id="archive-heading" className="t-display md:col-span-7">
            The <em className="accent">archive</em>
          </h2>
          <p className="t-body-lg max-w-[44ch] text-fg-2 md:col-span-4 md:col-start-9">
            Tools and measurements from local AI work. Where something was learned, the finding is written down.
          </p>
        </div>
        <ul className="mt-14 border-t border-line">
          {experiments.map((experiment) => (
            <li key={experiment.title} className="grid gap-x-6 gap-y-3 border-b border-line py-8 md:grid-cols-12" data-reveal="rise">
              <div className="md:col-span-4">
                <h3 className="t-lead">{experiment.title}</h3>
                <p className="t-data mt-2 text-fg-3">
                  {experiment.kind} · {experiment.year}
                </p>
              </div>
              <div className="md:col-span-7 md:col-start-6">
                <p className="max-w-[60ch] text-fg-2">{experiment.body}</p>
                {experiment.finding ? (
                  <p className="mt-3 max-w-[60ch] text-fg">
                    <span className="accent text-[1.125rem] text-accent">Finding. </span>
                    {experiment.finding}
                  </p>
                ) : null}
                {experiment.href ? (
                  <Link href={experiment.href} className="link mt-4 inline-flex items-center gap-1.5 text-[0.9375rem]">
                    {experiment.linkLabel}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
