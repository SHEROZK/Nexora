import { getProject } from "./projects";

/**
 * Skills grouped by the layer of a product they belong to, bottom of the list = closest
 * to the metal. Each layer names the projects where the work can be seen.
 * No proficiency scores: either it has been used on something real or it is not listed.
 */

export interface CapabilityLayer {
  id: string;
  title: string;
  /** What this layer is responsible for, in one sentence. */
  role: string;
  groups: { label: string; items: string[] }[];
  evidence: string[];
}

const allLayers: CapabilityLayer[] = [
  {
    id: "interface",
    title: "Interface",
    role: "What people see and touch: layout, state, motion, and whether it works on a phone.",
    groups: [
      { label: "Build", items: ["React", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS"] },
      { label: "Motion", items: ["GSAP", "ScrollTrigger", "Framer Motion", "Canvas graphics"] },
      { label: "Practice", items: ["Responsive design", "Accessibility", "Server-rendered UI"] },
    ],
    evidence: ["pg-india", "ventureworld"],
  },
  {
    id: "application",
    title: "Application and API",
    role: "The rules of the business, written once on the server and shared by every screen.",
    groups: [
      { label: "Build", items: ["Python", "FastAPI", "Node.js", "REST APIs", "Route handlers"] },
      { label: "Access", items: ["Authentication", "Role-based access control", "Signed links", "Rate limiting"] },
      { label: "Integrations", items: ["Stripe", "Razorpay", "Webhooks", "Telegram bots and Mini Apps", "Twilio SMS"] },
    ],
    evidence: ["food-for-less", "pg-india"],
  },
  {
    id: "data",
    title: "Data",
    role: "Where the truth is kept, and the guarantees that stop it being quietly rewritten.",
    groups: [
      { label: "Stores", items: ["PostgreSQL", "Supabase", "SQLite"] },
      { label: "Design", items: ["Schema design", "Migrations on live data", "SQLAlchemy and Alembic", "Row Level Security"] },
      { label: "Integrity", items: ["Append-only ledgers", "Database triggers", "Idempotency keys", "Audit trails"] },
    ],
    evidence: ["food-for-less", "pg-india"],
  },
  {
    id: "intelligence",
    title: "AI and automation",
    role: "Models used as components: given a narrow job, a schema, and a human check where they fail.",
    groups: [
      { label: "Language", items: ["LLM integration", "Structured output", "Local models with Ollama", "Model benchmarking"] },
      { label: "Generative", items: ["ComfyUI workflows", "Image and video generation", "Inference pipelines"] },
      { label: "Voice", items: ["Text-to-speech", "Voice cloning", "Per-line fallback chains"] },
      { label: "Orchestration", items: ["Resumable stages", "Review gates", "Background jobs"] },
    ],
    evidence: ["video-director", "comfy-lab", "ai-voice-lab", "ventureworld"],
  },
  {
    id: "delivery",
    title: "Delivery",
    role: "Getting it onto a real machine, keeping it there, and changing it without breaking it.",
    groups: [
      { label: "Ship", items: ["Git and GitHub", "GitHub Actions", "Vercel", "Cloudflare"] },
      { label: "Verify", items: ["Automated tests", "Browser tests", "Migration rehearsal", "Health checks"] },
      { label: "Harden", items: ["Backups and rollback", "Debugging in production", "Security reviews"] },
    ],
    evidence: ["food-for-less", "ventureworld"],
  },
];

/** Evidence links only point at projects that are currently on the site. */
export const capabilityLayers: CapabilityLayer[] = allLayers.map((layer) => ({
  ...layer,
  evidence: layer.evidence.filter((slug) => getProject(slug)),
}));
