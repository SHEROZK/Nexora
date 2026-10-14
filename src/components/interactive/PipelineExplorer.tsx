"use client";

import { useState } from "react";
import { Check, Pencil, Play, RotateCcw } from "lucide-react";
import { STAGES, approve, createRun, cursor, editArtifact, isComplete, run, type RunState } from "@/lib/pipeline";
import { cn } from "@/lib/cn";

/**
 * The Video Director stage machine as something you can operate: run until a checkpoint,
 * approve it, or edit an earlier artifact and watch everything after it reset.
 */
export function PipelineExplorer() {
  const [state, setState] = useState<RunState>(createRun);
  const [selected, setSelected] = useState(0);

  const at = cursor(state);
  const complete = isComplete(state);
  const waiting = at >= 0 && state.statuses[at] === "awaiting-approval";
  const stage = STAGES[selected];
  const status = state.statuses[selected];

  const announce = complete
    ? "Run complete. Thirteen stages finished and the export is written."
    : waiting
      ? `Stopped at ${STAGES[at].title}. A person needs to review the artifact and approve it.`
      : state.runs.every((count) => count === 0)
        ? "Nothing has run yet."
        : `Ready to continue from ${STAGES[at].title}.`;

  const step = () => {
    const next = run(state);
    setState(next);
    const stop = cursor(next);
    setSelected(stop >= 0 ? stop : STAGES.length - 1);
  };

  return (
    <div className="border-2 border-fg bg-surface">
      <div className="flex flex-col gap-4 border-b border-line p-5 md:flex-row md:items-center md:justify-between md:p-7">
        <p role="status" aria-live="polite" className={cn("text-[1.0625rem] leading-snug", waiting ? "text-accent" : "text-fg")}>
          {announce}
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          {waiting ? (
            <button
              type="button"
              onClick={() => {
                setState(approve(state, at));
                setSelected(at);
              }}
              className="btn btn-primary"
            >
              <Check aria-hidden="true" />
              Approve {STAGES[at].title.toLowerCase()}
            </button>
          ) : (
            <button type="button" onClick={step} disabled={complete} className="btn btn-primary">
              <Play aria-hidden="true" />
              {state.runs[0] === 0 ? "Run the pipeline" : "Continue"}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setState(createRun());
              setSelected(0);
            }}
            className="btn btn-ghost"
          >
            <RotateCcw aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12">
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:col-span-7 lg:border-r lg:border-line" aria-label="Pipeline stages">
          {STAGES.map((item, i) => {
            const itemStatus = state.statuses[i];
            const active = i === selected;
            return (
              <li key={item.id} className="border-b border-line sm:odd:border-r">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "flex min-h-14 w-full items-center gap-4 px-5 text-left transition-colors md:px-7",
                    active ? "bg-fg/[0.06]" : "hover:bg-fg/[0.03]",
                  )}
                >
                  <span className="t-data w-6 text-fg-3">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2.5 shrink-0 border transition-colors duration-300",
                      item.checkpoint ? "rotate-45" : "rounded-full",
                      itemStatus === "done" && "border-fg bg-fg",
                      itemStatus === "awaiting-approval" && "border-accent bg-accent",
                      itemStatus === "pending" && "border-fg-2",
                    )}
                  />
                  <span className={cn("flex-1 text-[0.9375rem]", itemStatus === "pending" ? "text-fg-2" : "text-fg")}>{item.title}</span>
                  <span className="t-data text-fg-3">
                    {itemStatus === "done" ? "Done" : itemStatus === "awaiting-approval" ? "Review" : item.checkpoint ? "Checkpoint" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="p-5 md:p-7 lg:col-span-5">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="t-title text-[clamp(1.5rem,2.4vw,2rem)]">{stage.title}</h3>
            <span className="t-data text-fg-3">
              Stage {selected + 1} of {STAGES.length}
            </span>
          </div>
          <p className="mt-4 text-fg-2">{stage.does}</p>

          <dl className="mt-6 border-t border-line">
            {[
              ["Writes", stage.artifact],
              ["When it goes wrong", stage.onTrouble],
              ["Stops for review", stage.checkpoint ? "Yes, by default" : "No"],
              ["Times run", String(state.runs[selected])],
            ].map(([term, value]) => (
              <div key={term} className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-line py-4">
                <dt className="text-[0.8125rem] text-fg-3">{term}</dt>
                <dd className="text-[0.9375rem]">{value}</dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            disabled={status !== "done"}
            onClick={() => setState(editArtifact(state, selected))}
            className="btn btn-ghost mt-6"
          >
            <Pencil aria-hidden="true" />
            Edit this artifact
          </button>
          <p className="mt-3 text-[0.8125rem] text-fg-3">
            {status === "done"
              ? "Editing a finished artifact resets every stage after it."
              : "Available once this stage has finished."}
          </p>
        </div>
      </div>
    </div>
  );
}
