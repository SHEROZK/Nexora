import { getProject } from "./projects";

/** Services, written as problems solved. `evidence` slugs must exist in projects.ts. */

export interface Service {
  id: string;
  title: string;
  /** The situation a client is in when they need this. */
  problem: string;
  /** What they get. */
  deliverables: string[];
  /** Why they can believe it. */
  proof: string;
  evidence: string[];
}

const allServices: Service[] = [
  {
    id: "product",
    title: "Full-stack product development",
    problem:
      "You have a product in your head, or a prototype that fell over when real users arrived, and you need one person who can carry it from screen to database.",
    deliverables: [
      "Web applications, dashboards, customer portals and admin tools",
      "Complete workflows: sign-up, the core task, payment, notifications, support",
      "Role-based areas for customers, staff and administrators",
      "A codebase with migrations, tests and a documented way to deploy it",
    ],
    proof:
      "PG India has four roles and 68 pages built by one developer. Food For Less runs a restaurant's ordering in production.",
    evidence: ["pg-india", "food-for-less", "ventureworld"],
  },
  {
    id: "ai",
    title: "AI applications and integration",
    problem:
      "You want AI inside a real product, where it has to be correct, affordable and safe to be wrong, and a chat box bolted on the side is not it.",
    deliverables: [
      "LLM features behind your own API, with keys kept on the server",
      "Structured output with validation, so a model cannot write where it should not",
      "Assistants that answer from your application's data",
      "Voice synthesis and document-reading steps where they fit the job",
    ],
    proof:
      "VentureWorld's listing assistant suggests and waits for approval. Video Director gives its language model a schema with no field for the text it must never change.",
    evidence: ["ventureworld", "video-director", "ai-voice-lab"],
  },
  {
    id: "backend",
    title: "Backend and API engineering",
    problem:
      "The interface is fine. The trouble is underneath: orders in the wrong state, payments counted twice, permissions that depend on which button someone found.",
    deliverables: [
      "Data models and migrations that can be applied to live data",
      "REST APIs with authentication, authorisation and rate limits",
      "Payment integrations with signed webhooks and idempotent handling",
      "State machines for workflows that must not skip steps",
    ],
    proof:
      "Food For Less records every payment once, even when a webhook and a browser redirect report it at the same moment.",
    evidence: ["food-for-less", "pg-india"],
  },
  {
    id: "automation",
    title: "AI automation and generative workflows",
    problem:
      "You are running a multi-step creative or data process by hand, and the steps that use models fail in ways nobody notices until the end.",
    deliverables: [
      "Pipelines with resumable stages and saved artifacts",
      "Human review gates where automation cannot be trusted",
      "Generative image, video and speech steps driven through an API",
      "Resource planning for local GPUs, and reports that say what really happened",
    ],
    proof: "Video Director runs thirteen stages, stops at six for review, and labels its own output honestly.",
    evidence: ["video-director", "comfy-lab"],
  },
  {
    id: "frontend",
    title: "Interface and creative frontend",
    problem:
      "The product works but feels like a form. You need an interface people trust in the first five seconds, on a phone, without it getting slow.",
    deliverables: [
      "Responsive interfaces designed for mobile first",
      "Motion systems with GSAP and CSS that respect reduced-motion settings",
      "Canvas and generative graphics where they explain or identify something",
      "Accessible components: keyboard paths, focus states, readable contrast",
    ],
    proof: "This site is the sample: its layout system, command palette, motion and generative canvas are written by hand.",
    evidence: ["pg-india"],
  },
  {
    id: "architecture",
    title: "Technical architecture and integration",
    problem:
      "Something already exists and has to keep running while it changes: a new channel, a third-party service, a safer way to release.",
    deliverables: [
      "Database and system design reviews with a written plan",
      "Integration of payments, messaging, maps, printing and identity checks",
      "Release processes that test before they switch and can roll back",
      "Security hardening: tenant isolation, audit trails, permission models",
    ],
    proof:
      "Food For Less updates itself on the restaurant's only machine by testing the new release before it stops the old one.",
    evidence: ["food-for-less", "pg-india"],
  },
];

/** Evidence links only point at projects that are currently on the site. */
export const services: Service[] = allServices.map((service) => ({
  ...service,
  evidence: service.evidence.filter((slug) => getProject(slug)),
}));
