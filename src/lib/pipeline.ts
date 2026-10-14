/**
 * A model of the Video Director stage machine: thirteen stages, six default
 * checkpoints, and the rule that editing an artifact invalidates everything after it.
 * No models run here. It exists to make the control flow visible.
 */

export interface Stage {
  id: string;
  title: string;
  does: string;
  artifact: string;
  checkpoint: boolean;
  /** What happens when the stage cannot do its job. */
  onTrouble: string;
}

export const STAGES: Stage[] = [
  {
    id: "ingest",
    title: "Ingest",
    does: "Reads a PDF or a folder of images into ordered pages.",
    artifact: "Page images in reading order",
    checkpoint: false,
    onTrouble: "Unsupported page encodings stop with a request to export the pages as PNG or JPG.",
  },
  {
    id: "panels",
    title: "Panels",
    does: "Finds gutters, crops panels and works out reading order for the page layout.",
    artifact: "Panel boxes per page",
    checkpoint: true,
    onTrouble: "A borderless page becomes one full-page panel and is flagged for review.",
  },
  {
    id: "read",
    title: "Read",
    does: "Collects dialogue, narration, sound effects and who is speaking for each panel.",
    artifact: "Per-panel transcript",
    checkpoint: true,
    onTrouble: "A human transcript wins over a vision model. With neither, the panel is flagged.",
  },
  {
    id: "screenplay",
    title: "Screenplay",
    does: "Groups panels into scenes and beats, keeping every line word for word.",
    artifact: "Characters, scenes and verbatim lines",
    checkpoint: true,
    onTrouble: "The stage fails if a single line was lost or changed.",
  },
  {
    id: "shotplan",
    title: "Shot plan",
    does: "Plans one shot per panel: size, camera move, duration and how it will be animated.",
    artifact: "Shot list with backends",
    checkpoint: true,
    onTrouble: "A direction that fails validation is dropped and the rule-based plan is kept.",
  },
  {
    id: "clean",
    title: "Clean",
    does: "Removes lettering that will be voiced or subtitled, so plates do not show it twice.",
    artifact: "Cleaned panels and masks",
    checkpoint: true,
    onTrouble: "Text that cannot be removed safely is kept and flagged.",
  },
  {
    id: "colorize",
    title: "Colourise",
    does: "Colours black-and-white panels from references or a written colour sheet.",
    artifact: "Coloured panels",
    checkpoint: true,
    onTrouble: "Without a reference or palette the panel is flagged: the colours would be invented.",
  },
  {
    id: "build",
    title: "Build project",
    does: "Turns panels into 16:9 plates and registers them as shot keyframes.",
    artifact: "Project file and plates",
    checkpoint: false,
    onTrouble: "Tall panels get a scroll plate instead of being letterboxed into a sliver.",
  },
  {
    id: "animate",
    title: "Animate",
    does: "Sends the shots that are allowed to a video model, one at a time.",
    artifact: "Clips, held for review",
    checkpoint: false,
    onTrouble: "A shot that spends its attempts falls back to a directed still, and is labelled as one.",
  },
  {
    id: "audio",
    title: "Audio",
    does: "Voices each line with the character's voice and adds ambience.",
    artifact: "Voice and sound files",
    checkpoint: false,
    onTrouble: "A line one engine rejects falls back to the next engine for that line only.",
  },
  {
    id: "assemble",
    title: "Assemble",
    does: "Cuts clips and stills to length, performs camera moves and lays in subtitles.",
    artifact: "Draft film",
    checkpoint: false,
    onTrouble: "Assembly refuses to run while any clip is still waiting for a review decision.",
  },
  {
    id: "qc",
    title: "Quality report",
    does: "Checks source fidelity, panel coverage and what each shot really is.",
    artifact: "QC report",
    checkpoint: false,
    onTrouble: "It reports. It does not judge taste, anatomy or whether the action happened.",
  },
  {
    id: "export",
    title: "Export",
    does: "Writes the video, the subtitles and the production metadata.",
    artifact: "MP4, SRT and metadata",
    checkpoint: false,
    onTrouble: "The label is computed: animation, motion comic, or mixed with the exact count.",
  },
];

export type StageStatus = "pending" | "awaiting-approval" | "done";

export interface RunState {
  /** One entry per stage, same order as STAGES. */
  statuses: StageStatus[];
  /** How many times each stage has run. */
  runs: number[];
}

export function createRun(): RunState {
  return { statuses: STAGES.map(() => "pending"), runs: STAGES.map(() => 0) };
}

/** Index of the stage the run is stopped at, or -1 when everything is done. */
export function cursor(state: RunState) {
  return state.statuses.findIndex((s) => s !== "done");
}

/**
 * Runs forward until the next checkpoint that needs a person, or to the end.
 * A stage already waiting for approval blocks the run.
 */
export function run(state: RunState): RunState {
  const statuses = [...state.statuses];
  const runs = [...state.runs];
  for (let i = 0; i < STAGES.length; i++) {
    if (statuses[i] === "done") continue;
    if (statuses[i] === "awaiting-approval") break;
    runs[i] += 1;
    if (STAGES[i].checkpoint) {
      statuses[i] = "awaiting-approval";
      break;
    }
    statuses[i] = "done";
  }
  return { statuses, runs };
}

export function approve(state: RunState, index: number): RunState {
  if (state.statuses[index] !== "awaiting-approval") return state;
  const statuses = [...state.statuses];
  statuses[index] = "done";
  return { ...state, statuses };
}

/**
 * Editing a finished stage's artifact keeps that stage's output but sends it back
 * for approval if it is a checkpoint, and resets every stage after it.
 */
export function editArtifact(state: RunState, index: number): RunState {
  if (state.statuses[index] !== "done") return state;
  const statuses = state.statuses.map((status, i) => {
    if (i < index) return status;
    if (i === index) return STAGES[i].checkpoint ? "awaiting-approval" : "done";
    return "pending";
  }) as StageStatus[];
  return { ...state, statuses };
}

export function isComplete(state: RunState) {
  return state.statuses.every((s) => s === "done");
}
