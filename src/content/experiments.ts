/** The lab archive. `href` points somewhere real or the entry has no link. */

export interface Experiment {
  title: string;
  kind: "Runs on this site" | "Local tool" | "Measurement";
  year: string;
  body: string;
  finding?: string;
  href?: string;
  linkLabel?: string;
}

export const experiments: Experiment[] = [
  {
    title: "Order rules simulator",
    kind: "Runs on this site",
    year: "2026",
    body: "The order and payment rules from Food For Less, reduced to a pure function you can drive from buttons. Illegal moves are refused with the reason.",
    href: "/experiments#order-rules",
    linkLabel: "Open the simulator",
  },
  {
    title: "Stage machine explorer",
    kind: "Runs on this site",
    year: "2026",
    body: "The thirteen stages of the Video Director pipeline with their review checkpoints. Approve a stage, edit an earlier one, and watch what has to run again.",
    href: "/experiments#stage-machine",
    linkLabel: "Open the explorer",
  },
  {
    title: "Director model benchmark",
    kind: "Measurement",
    year: "2026",
    body: "Seven local language models scored on nine direction tasks, with timing, memory and peak temperature logged for each.",
    finding:
      "The four best were within 0.03 of each other, and none grouped scenes correctly. Structure stayed in code; the smallest capable model became the default.",
    href: "/work/video-director",
    linkLabel: "Read the case study",
  },
  {
    title: "Resolution against face retention",
    kind: "Measurement",
    year: "2026",
    body: "Image-to-video trials at several resolutions to find where a character's face stops surviving a wide shot.",
    finding: "Around 40 pixels of face height failed. Around 55 held for the full clip.",
    href: "/work/comfy-lab",
    linkLabel: "Read about Comfy Lab",
  },
  {
    title: "Task router for language models",
    kind: "Local tool",
    year: "2026",
    body: "A small router that sends a request to a local or hosted model depending on the kind of task, with a reviewer pass and an MCP server in front of it. A prototype, kept as a prototype.",
  },
  {
    title: "Lettering removal on comic panels",
    kind: "Local tool",
    year: "2026",
    body: "Speech-balloon detection and fill on the CPU, with inpainting for text over artwork.",
    finding:
      "Started from pure noise, the inpainting model drew a new balloon and a second face. A pre-fill pass and partial strength stopped that.",
    href: "/work/video-director",
    linkLabel: "Read the case study",
  },
];
