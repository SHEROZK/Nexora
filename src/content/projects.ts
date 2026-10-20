/**
 * Every project on the site, in display order. Case-study pages, the work index,
 * the command palette, the sitemap and the service evidence links all read from here.
 *
 * Ground rules for editing:
 * - `status` says what is true today. Never upgrade it without checking.
 * - Numbers go in `outcomes` with a `source` that says where they come from.
 * - Sections that are left empty are simply not rendered.
 */

import { store, type ProjectGroup, type StatusKind, type StoredLink, type StoredProject, type StoredVideo, type Surface } from "./store";

export type { ProjectGroup, StatusKind, Surface };
export type VisualKind =
  | "orders"
  | "beds"
  | "pipeline"
  | "listings"
  | "nodes"
  | "voice"
  | "plate";

/** A real image: a screenshot of the product or an artifact it produced. Never a mock-up. */
export interface ProjectImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Says exactly what the picture is and when it was taken. */
  caption: string;
}

export interface Project {
  slug: string;
  title: string;
  /** One line on what kind of thing it is. */
  category: string;
  /** One sentence used on cards, in metadata and in the palette. */
  summary: string;
  group: ProjectGroup;
  featured: boolean;
  year: string;
  status: { kind: StatusKind; label: string; note: string };
  role: { title: string; note: string };
  stack: string[];
  visual: VisualKind;
  surface: Surface;
  /** Real screenshots and artifacts, most important first. Empty when none exist. */
  images: ProjectImage[];
  /** One video, added in the panel. Shown after the images. */
  video?: StoredVideo;
  links: { label: string; href: string; note?: string }[];
  facts: { label: string; value: string }[];
  problem: string[];
  goals: string[];
  constraints: string[];
  contribution: string[];
  overview: string[];
  features: { title: string; body: string }[];
  decisions: { title: string; body: string; tradeoff: string }[];
  implementation: string[];
  challenges: { problem: string; solution: string }[];
  outcomes: { value: string; label: string; source: string }[];
  limitations: string[];
  /** Which in-page demo to embed on the case study, if any. */
  demo?: "orders" | "pipeline";
  /** True for projects added through the admin panel. */
  custom?: boolean;
}

export const statusLabels: Record<StatusKind, string> = {
  live: "Live",
  development: "In development",
  experiment: "Experiment",
};

export const groupLabels: Record<ProjectGroup, string> = {
  product: "Products",
  ai: "AI & generative",
  website: "Client websites",
  marketing: "Marketing and content",
};

/** The hand-written case studies. Projects added in the admin panel are merged in below. */
export const builtInProjects: Project[] = [
  {
    slug: "food-for-less",
    title: "Food For Less",
    category: "Commerce and restaurant operations platform",
    summary:
      "One backend behind a restaurant's website, Telegram Mini App, kitchen, drivers and till, so every channel agrees on the order and the money.",
    group: "product",
    featured: true,
    year: "2026",
    status: {
      kind: "live",
      label: "Live",
      note: "Running at food-for-less.com. Its health endpoint reported release V777-045 when checked on 13 October 2026.",
    },
    role: {
      title: "Co-developer",
      note: "The repository has two contributors. My commits cover the releases from V777-015 to V777-045: the storefront rebuild, payments, the delivery engine, finance, roles, printing and the installer.",
    },
    stack: [
      "Python",
      "FastAPI",
      "SQLite",
      "aiogram",
      "Telegram Mini Apps",
      "Stripe",
      "Twilio",
      "ESC/POS",
      "pytest",
      "GitHub Actions",
      "Cloudflare Tunnel",
    ],
    visual: "orders",
    surface: "yellow",
    images: [
      {
        src: "/shots/ffl-storefront.webp",
        width: 1424,
        height: 900,
        alt: "The Food For Less storefront: a search bar, a hero banner and a row of food categories.",
        caption: "The public storefront at food-for-less.com, captured 13 October 2026.",
      },
      {
        src: "/shots/ffl-mobile.webp",
        width: 376,
        height: 844,
        alt: "The Food For Less storefront on a phone, with a bottom navigation bar.",
        caption: "The same storefront at phone width.",
      },
      {
        src: "/shots/ffl-menu.webp",
        width: 1424,
        height: 1500,
        alt: "Category and popular-item sections of the Food For Less storefront.",
        caption: "Further down the storefront: categories and popular items.",
      },
      {
        src: "/shots/ffl-links.webp",
        width: 390,
        height: 844,
        alt: "The Food For Less link page with buttons for ordering and contact.",
        caption: "The link page that the QR code on the packaging opens.",
      },
    ],
    links: [{ label: "food-for-less.com", href: "https://food-for-less.com/" }],
    facts: [
      { label: "Channels", value: "Website, Telegram bot, Mini App, WhatsApp, phone orders" },
      { label: "Database", value: "44 additive migrations" },
      { label: "Tests", value: "86 test modules plus browser tests" },
    ],
    problem: [
      "A restaurant that takes orders from a website, a Telegram bot, a Mini App and the phone ends up with several versions of the truth. Who is this customer? What do they owe? Has the food left the building?",
      "Each channel had grown its own answer. The work was to give all of them one order lifecycle, one ledger and one set of rules, without stopping service to do it.",
    ],
    goals: [
      "One order lifecycle that behaves the same on every channel.",
      "Money recorded once, from confirmed transactions only, and never edited afterwards.",
      "Kitchen staff and drivers can only take the action that is legal right now.",
      "Updates the owner can run by double-clicking, with a way back if anything fails.",
    ],
    constraints: [
      "It runs as a single process on one Windows machine at the restaurant, with SQLite as the database.",
      "The receipt printer sits on the local network and must never be exposed to the internet.",
      "The people running it are restaurant staff, not engineers.",
      "It was already taking real orders, so every release had to migrate live data in place.",
    ],
    contribution: [
      "Rebuilt the web storefront and checkout against the live catalogue, with SMS one-time-code sign-in.",
      "Built the payment model: append-only transactions, Stripe Checkout confirmed by signed webhooks, partial payments, refunds and corrections.",
      "Built the delivery engine as a single state machine shared by the Telegram bot, the driver web app and the admin panel.",
      "Added admin roles and permissions, the finance and cash ledgers, scheduled orders, customer accounts and delivery pricing rules.",
      "Added thermal receipt printing with a job queue and an outbound-only print agent.",
      "Wrote the installer that tests a release before it stops the running one, and set up the GitHub Actions deployment workflow.",
    ],
    overview: [
      "Customers order from the website, the Telegram bot or the Mini App and pick delivery or pickup, now or at a scheduled time. The restaurant approves the order, the kitchen prepares it, a driver accepts it, and the customer confirms delivery with a PIN.",
      "Behind that sits an admin panel for live orders, menu editing, finance, customers, drivers, printers and support. Every surface calls the same server-side services, which is the point of the project.",
    ],
    features: [
      {
        title: "Ordering on every channel",
        body: "Website, Telegram bot and Mini App offer the same enabled payment methods and the same server-side rules. The Mini App verifies Telegram's signed init data instead of relying on an SMS provider.",
      },
      {
        title: "Delivery engine",
        body: "Assigned, accepted, picked up, out for delivery, PIN verified, delivered. Batches of two or three orders, driver handovers and structured delivery problems are all part of the same machine.",
      },
      {
        title: "Finance ledger",
        body: "Selected and actual payment methods are tracked separately. Payments are separate records, so an order is unpaid, partially paid or paid by arithmetic rather than by a flag.",
      },
      {
        title: "Invoice revisions",
        body: "Changing an order writes a new invoice revision. A delivered order is financially locked: only a refund or an explicit, reasoned correction can touch it.",
      },
      {
        title: "Roles and audit",
        body: "Seven default roles with per-admin grant and deny overrides. Permissions are checked on the route and again in the service layer, and sensitive actions need a reason.",
      },
      {
        title: "Receipt printing",
        body: "Orders insert print jobs and move on. A worker or the restaurant's print agent talks to the printer afterwards, with retries and a visible failure reason.",
      },
      {
        title: "One customer across channels",
        body: "Telegram chats, WhatsApp numbers and website sign-ins are channel identities that resolve to a single customer record.",
      },
      {
        title: "Driver payroll",
        body: "Effective-dated salary and commission rules, one immutable commission entry per delivered order, and payroll runs that a second admin has to approve.",
      },
    ],
    decisions: [
      {
        title: "Money is append-only",
        body: "A wrong payment is never edited. The original stays, a reversal is added, and the corrected payment is recorded next to it with a reason. Cash 100 becomes cash 80 plus card 20 without losing the fact that someone first entered 100.",
        tradeoff:
          "More rows and more interface to explain them. In exchange, the question \"who changed this and why\" always has an answer.",
      },
      {
        title: "Order status and payment status are separate",
        body: "An accepted online order is not a confirmed order until the ledger holds the money. The kitchen cannot start it, and the customer is never shown \"payment received\" early.",
        tradeoff:
          "Two status fields to reason about in every screen, instead of one combined state that would have been simpler and wrong.",
      },
      {
        title: "One state machine, written as compare-and-set",
        body: "Every delivery step checks the actor, the current state, the payment and the PIN on the server, and writes only if the state is still what the caller saw. A stale Telegram button or a crafted form request is refused.",
        tradeoff:
          "Admin overrides lost the ability to force a driver stage. That was the intent, but it meant building explicit, audited exception paths.",
      },
      {
        title: "Printing never blocks an order",
        body: "The print agent on the restaurant PC connects outwards over HTTPS with a per-printer token and prints on the local network. No inbound port, and a dead printer cannot fail a checkout.",
        tradeoff:
          "A receipt can arrive a few seconds late, and failed jobs need their own screen and retry button.",
      },
      {
        title: "Tests run before the old version stops",
        body: "The installer checks dependencies, rehearses the migration on a copy of the database and runs the full suite while the current release keeps serving. Only then does it stop, back up, deploy, migrate and wait for the health check.",
        tradeoff: "Updates take longer end to end, but the window where the site is down stays short.",
      },
    ],
    implementation: [
      "A FastAPI application with server-rendered pages for the storefront, admin and driver app, and an aiogram bot in the same process.",
      "SQLite with numbered, additive migrations. Append-only tables are protected by database triggers that refuse UPDATE and DELETE, and time-slot capacity is enforced by a trigger inside the write that takes the slot.",
      "A single finance module is the only place totals, VAT and breakdowns are computed. Checkout, order pages, the Mini App and invoices all call it.",
      "Stripe Checkout in test or live mode, with keys, objects and webhook events required to match the mode.",
      "Messaging goes through one notification service with channel adapters for Telegram and WhatsApp.",
    ],
    challenges: [
      {
        problem:
          "A Stripe webhook and the customer's return page can both report the same payment at the same moment.",
        solution:
          "Payment recording is idempotent and keyed to the Stripe objects, so whichever arrives first writes the transaction and the second is a no-op. Amount mismatches are flagged for review instead of being trusted.",
      },
      {
        problem:
          "The same person appears as a Telegram account, a WhatsApp number and a phone order. Merging them by name or address would eventually merge two different people.",
        solution:
          "The only automatic join is a phone number the person has just proved they own, and only when exactly one customer holds it. Everything else raises a possible-duplicate alert for a human, and merges are side-by-side, reasoned and recorded.",
      },
      {
        problem: "Two customers can try to book the last place in the same delivery slot.",
        solution:
          "Capacity is checked by a database trigger inside the transaction that takes the place. A rolled-back or cancelled order holds nothing.",
      },
      {
        problem: "An update that fails halfway on the restaurant's only machine means no orders.",
        solution:
          "Preflight on a copy of the data, a single-instance lock, a verified backup, and a rollback that removes what the new version deployed and restores the database by checksum.",
      },
    ],
    outcomes: [
      {
        value: "1,419",
        label: "automated tests passing, 0 failing",
        source: "Release notes for V777-038, recorded 8 October 2026.",
      },
      {
        value: "44",
        label: "database migrations, all additive",
        source: "Migration history in the repository at V777-045.",
      },
      {
        value: "V777-045",
        label: "release serving the public site",
        source: "food-for-less.com health endpoint, checked 13 October 2026.",
      },
    ],
    limitations: [
      "It is designed for one restaurant on one machine. Multi-branch or multi-tenant use would need a different database and deployment story.",
      "The WhatsApp channel is implemented against Twilio's sandbox and has not been proven end to end.",
      "Thermal receipts were validated by tests of the ESC/POS command stream; real-printer behaviour is tuned on site.",
      "The repository is private, so there is no public code to link.",
    ],
    demo: "orders",
  },
  {
    slug: "pg-india",
    title: "PG India",
    category: "Property marketplace and management platform",
    summary:
      "A marketplace for paying-guest housing joined to the software owners use to run the building, so a listing reflects real beds instead of a stale advert.",
    group: "product",
    featured: true,
    year: "2026",
    status: {
      kind: "development",
      label: "In development",
      note: "Not publicly launched. There are no user, listing or transaction numbers to report, so none are shown.",
    },
    role: {
      title: "Sole developer",
      note: "Every commit in the web application's repository is mine: product decisions, schema, security rules, interface and integration work.",
    },
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "Row Level Security",
      "Razorpay",
      "Leaflet",
      "Tesseract.js",
      "Tailwind CSS",
      "GSAP",
    ],
    visual: "beds",
    surface: "cobalt",
    images: [],
    links: [],
    facts: [
      { label: "Surface", value: "68 pages, 46 API route handlers" },
      { label: "Database", value: "20 SQL migrations, 5 isolation test suites" },
      { label: "Roles", value: "Tenant, owner, guardian, admin" },
    ],
    problem: [
      "Finding a PG room in India and running a PG are two separate worlds. Listings live on one side. Rent registers, mess counts and WhatsApp threads live on the other.",
      "Because the two are not connected, listings go stale. A marketplace cannot say a bed is free if the owner's own records are in a notebook.",
    ],
    goals: [
      "Let tenants search, compare, book a visit and reserve a place without their details being passed around.",
      "Give owners a working management system: rooms, beds, tenancies, rent, utilities and meals.",
      "Make the marketplace read availability from the management data rather than from a form someone filled in once.",
      "Keep one owner's residents and finances invisible to every other owner.",
    ],
    constraints: [
      "Four roles with very different permissions share one database.",
      "Identity documents are involved, so verification and storage had to be designed, not bolted on.",
      "The exact address of a property is sensitive until a visit is confirmed.",
    ],
    contribution: [
      "Designed the schema and wrote the migrations, including the Row Level Security policies and the isolation tests that check them.",
      "Built the tenant, owner, guardian and admin areas end to end.",
      "Built the visit-booking workflow as a role-aware state machine with an audit trail.",
      "Integrated Razorpay payments with a webhook, and a permanent, printable receipt system.",
      "Built the owner management modules: rooms and beds, tenancies, rent engine, utility splitting, mess manager and late-fee automation.",
    ],
    overview: [
      "Tenants search and compare listings, request a visit, book, pay, and then live in a dashboard with rent, meals, complaints, agreements and notices. A guardian can follow along through a tokenised link.",
      "Owners register, pass KYC, and then run their property: capacity by room and bed, who is in which bed, what rent is due, how the electricity bill splits, how many plates the kitchen needs tonight.",
      "Admins verify owners and tenants, moderate listings, mediate visits and handle disputes, payments and support.",
    ],
    features: [
      {
        title: "Visit booking with mediation",
        body: "Requested, admin review, waiting on owner, waiting on tenant, confirmed. Owner and tenant can bounce a proposed time back and forth, and every transition is validated before any write.",
      },
      {
        title: "Address privacy boundary",
        body: "Before confirmation a tenant sees only the city and area. The exact address, map pin and a temporary owner contact token are revealed once the visit is confirmed, enforced on the server.",
      },
      {
        title: "Rooms and beds",
        body: "Capacity is modelled as rooms containing beds, and tenancies occupy beds. Vacancy is derived from that, not typed in.",
      },
      {
        title: "Rent engine",
        body: "Rent configuration, invoice generation, mark-as-received, late-fee automation and a duplicate guard on the rent ledger.",
      },
      {
        title: "Utility bill splitter",
        body: "Splits a bill between AC and non-AC residents and applies each share to that tenant's rent.",
      },
      {
        title: "Mess manager",
        body: "Tenants opt in or out of meals from their dashboard and the owner sees real plate counts.",
      },
      {
        title: "Verification",
        body: "Owner and tenant KYC with in-browser OCR to pre-read documents. A human admin makes the decision; the provider interface is written so an automatic check can replace manual review later.",
      },
      {
        title: "Payments and receipts",
        body: "Razorpay checkout with a webhook, and booking receipts that are permanent, printable and visible to admins.",
      },
    ],
    decisions: [
      {
        title: "A listing is not a property",
        body: "The marketplace listing is an advert. The managed property is the operational truth. They began as one table and were split into two, with a reconciliation step between them.",
        tradeoff:
          "A migration across live relationships and an extra concept to explain to owners. Without it, the management side could never correct the marketplace.",
      },
      {
        title: "Authorisation lives in the database",
        body: "Row Level Security policies decide who can read each row. Each stage of the multi-tenant work shipped with an SQL isolation test that tries to read across owners and expects to fail.",
        tradeoff:
          "Policies are harder to debug than application checks, and server-side reads that use the service role must prove ownership first, in one place.",
      },
      {
        title: "Visits are a state machine, not a status column",
        body: "Each action belongs to exactly one role and is legal only from listed states. The table of transitions is the single source of truth for the API.",
        tradeoff: "Adding a new step means editing the machine, which is slower than adding an if statement and much harder to get wrong.",
      },
      {
        title: "Heuristics are labelled as heuristics",
        body: "Vacancy Radar and Rent Optimizer are rule-based estimates from the owner's own data. They are named that way in the product and in the code.",
        tradeoff: "Less impressive than calling it AI. It is also accurate.",
      },
    ],
    implementation: [
      "Next.js App Router with Server Components for data reads and route handlers for writes.",
      "Supabase for authentication (including phone sign-in), Postgres and storage, accessed through separate browser, server and service-role clients.",
      "Property-scoped reads filter on the property id and run only after ownership has been resolved once.",
      "A notification table with an in-app bell centre and event hooks, and a support system with queues and an admin inbox.",
    ],
    challenges: [
      {
        problem: "A registration bug let an owner's role fail to persist, sending new owners to a 404.",
        solution:
          "Traced it to where the role was written relative to the auth callback, fixed the persistence, and added a role-isolation migration so a profile cannot drift between roles.",
      },
      {
        problem: "Financial tables for the management system were readable more widely than intended.",
        solution:
          "A hardening migration tightened the policies on the rent and billing tables, and the isolation tests were extended to cover them.",
      },
      {
        problem: "Moving from listing-level capacity to rooms and beds without losing existing bookings.",
        solution:
          "Staged migrations: organisation foundation, property split, rooms and beds, tenancies, then notice and vacancy. Each stage had its own snapshot and test before the next began.",
      },
    ],
    outcomes: [
      {
        value: "68",
        label: "pages across four roles",
        source: "Counted from the application's route tree.",
      },
      {
        value: "46",
        label: "API route handlers",
        source: "Counted from the application's route tree.",
      },
      {
        value: "5",
        label: "SQL isolation test suites",
        source: "One per stage of the multi-tenant migration.",
      },
    ],
    limitations: [
      "Pre-launch. Nothing here has been tested by real tenants or owners at volume.",
      "Document verification is a manual admin decision today.",
      "The payment flow is built and wired to a webhook; live-mode operation has not been verified for this write-up.",
      "The repository is private.",
    ],
  },
  {
    slug: "video-director",
    title: "Video Director",
    category: "AI-assisted animation and manga production pipeline",
    summary:
      "A local pipeline that takes comic pages to a voiced, subtitled episode, with a human review gate wherever a model can be confidently wrong.",
    group: "ai",
    featured: true,
    year: "2026",
    status: {
      kind: "experiment",
      label: "Experiment",
      note: "Runs locally on one laptop GPU. It has produced one complete 58.9-second run from an original page. No finished episode has been validated, and the film itself is not published.",
    },
    role: {
      title: "Designer and developer",
      note: "A personal research project. The pipeline, the review tooling and the benchmarks are mine; the models it drives are third-party and open-weight.",
    },
    stack: [
      "Python",
      "ComfyUI API",
      "Wan 2.2",
      "Z-Image Turbo",
      "Ollama",
      "Qwen",
      "Kokoro",
      "GPT-SoVITS",
      "FFmpeg",
      "ONNX Runtime",
    ],
    visual: "pipeline",
    surface: "ink",
    images: [
      {
        src: "/shots/vd-review-sheet.webp",
        width: 1920,
        height: 192,
        alt: "Six consecutive frames of one generated animation clip, laid side by side.",
        caption: "A review sheet from the first complete run: six sampled frames of one generated clip, as shown to the person approving it.",
      },
      {
        src: "/shots/vd-source-page.webp",
        width: 820,
        height: 1230,
        alt: "A twelve-panel comic page in colour.",
        caption: "The source page for that run: an original twelve-panel page made to test the pipeline.",
      },
    ],
    links: [],
    facts: [
      { label: "Pipeline", value: "13 resumable stages, 6 review checkpoints" },
      { label: "Workflows", value: "24 ComfyUI workflows" },
      { label: "Hardware", value: "One laptop GPU, fully local" },
    ],
    problem: [
      "Turning a comic page into animation is a long chain of steps, and each step uses a model that is sometimes wrong in ways that look fine at a glance: a merged panel, an invented prop, a face that drifts by frame 30.",
      "Chaining those models end to end and trusting the output produces something that plays and is quietly wrong. The interesting problem is where to put the checks.",
    ],
    goals: [
      "Go from pages to an episode file with subtitles and production metadata.",
      "Never change a line of dialogue. The source text is copied, not regenerated.",
      "Stop for a person at the stages where automation cannot be trusted.",
      "Survive interruptions: a run can stop anywhere and resume.",
      "Label the result for what it is.",
    ],
    constraints: [
      "Everything runs on a single laptop GPU, so only one model family can be loaded at a time.",
      "Heat and power are real limits. Language-model inference is treated as GPU load, with the same checks as video generation.",
      "Open models come with mixed licences, which restricts what can be shown.",
    ],
    contribution: [
      "Built the bridge that drives ComfyUI over its HTTP API and verifies every output file.",
      "Built the thirteen-stage manga pipeline with artifacts, checkpoints and downstream invalidation.",
      "Built panel detection, text removal, shot planning and the assembly step that performs camera moves.",
      "Built the review gate, the calibration report and a local web studio for one-click runs.",
      "Benchmarked seven local language models on the director's tasks and chose the architecture from the results.",
    ],
    overview: [
      "Pages go in as a PDF or images. The pipeline finds panels and reading order, reads the text, writes a screenplay, plans one shot per panel, removes lettering, optionally colourises, builds plates, animates what it is allowed to, voices the lines, assembles the film and reports on quality.",
      "At six of those stages it stops and waits. A person reviews the artifact, edits it if needed, and approves. Editing an artifact re-runs everything downstream of it.",
    ],
    features: [
      {
        title: "Resumable stage machine",
        body: "Each stage writes an artifact and re-runs only when something upstream changed. Failures are recorded per stage and retried on the next run.",
      },
      {
        title: "Verbatim dialogue",
        body: "A fidelity check fails the screenplay stage if a line is lost or altered. The language model's schema has no field for dialogue text, so it cannot rewrite one.",
      },
      {
        title: "Review gate",
        body: "Every clip review answers three questions: does it match the panel, does it match the prompt beat by beat, and does it need more movement. A rejection can carry a direction that is written into the next attempt.",
      },
      {
        title: "Resource planning",
        body: "A pre-flight check downgrades or rejects a clip that cannot fit in memory before any model loads. On an out-of-memory error it steps down a ladder instead of retrying blindly.",
      },
      {
        title: "Voice chain",
        body: "Kokoro first, then GPT-SoVITS, then the system voice, then silence. A line one engine rejects falls back for that line only.",
      },
      {
        title: "Honest labels",
        body: "The export is called animation only when every shot is a generated clip. Otherwise it is labelled a motion comic, or mixed with the exact count.",
      },
    ],
    decisions: [
      {
        title: "Rules for anything with one right answer",
        body: "Scene grouping, panel ids, durations, camera defaults and backend choice stay in code. The language model only adds direction: movement, beats, end pose, voice direction. This came from a benchmark rather than a preference.",
        tradeoff:
          "Less magic. The model could do more, but none of the seven tested grouped scenes correctly, and the top four were within 0.03 of each other on the rest.",
      },
      {
        title: "Automated quality checks are advisory",
        body: "Frame-similarity metrics pass a static or partly melted picture, and the vision model tested rejected none of the bad pilot clips. So automation only catches broken files. A person decides the rest.",
        tradeoff: "A run is not unattended. That is the honest state of the tools.",
      },
      {
        title: "The camera moves in assembly, not in the model",
        body: "The video model ignored a planned slow dolly in every clip, and prompts for camera motion made it lurch. Clips are now always requested with a static camera, and assembly performs the push, pan or shake.",
        tradeoff: "Camera moves are 2D operations on a clip, so there is no true parallax.",
      },
      {
        title: "Blocked means blocked",
        body: "When a stage cannot run, because a workflow is missing or a safety interlock refuses, the pipeline stops with instructions or falls back to a labelled animatic. It never silently substitutes something else under the same name.",
        tradeoff: "More stopped runs, fewer surprises in the output.",
      },
    ],
    implementation: [
      "A Python package with a standard-library core, driving an existing ComfyUI server through its API with API-format workflows and small parameter maps.",
      "Stage state and artifacts are written atomically, with retries, after a real run exposed a file-replace race on Windows.",
      "Voices run as worker processes in their own virtual environments so their dependencies never collide with the pipeline's.",
      "A local web studio bound to localhost handles generate, pause, resume, per-shot re-render and a panel-box editor.",
    ],
    challenges: [
      {
        problem: "Panel detection found 3 panels on a page that has 12, because the panels touch and one gutter is slanted.",
        solution:
          "Higher analysis resolution, a smaller minimum gutter, a search for leaning gutters, and tolerance for one crossing in a wide band. On that page it now finds 12 of 12 within 8 pixels of the hand-set boxes, with unchanged counts on the other test pages.",
      },
      {
        problem: "At low resolution the video model lost a character's face in wide shots.",
        solution:
          "Measured it: around 40 pixels of face height failed and around 55 held. Start frames are now cropped to fill the frame, centred on the largest drawn face.",
      },
      {
        problem: "A custom node broke against a newer ComfyUI core and failed before sampling.",
        solution:
          "Found the open upstream issues, applied the correct fix as a local patch, and documented why the shorter workaround silently drops an activation function.",
      },
      {
        problem: "Removing lettering from pure noise made the inpainting model paint a new speech balloon and a second face.",
        solution: "A pre-fill pass plus partial denoising strength, so the model repairs a region instead of inventing one.",
      },
    ],
    outcomes: [
      {
        value: "58.9 s",
        label: "first complete run, 20 lines voiced",
        source: "Project log, 11 October 2026. One original page, 12 panels.",
      },
      {
        value: "6 of 7",
        label: "generated shots approved on the first attempt",
        source: "Same run. The seventh used its three attempts and fell back to a still.",
      },
      {
        value: "7",
        label: "local language models benchmarked as director",
        source: "Nine tasks each, scored and logged with timing, memory and temperature.",
      },
    ],
    limitations: [
      "Not validated. Thresholds were tuned on a handful of pages and are unmeasured elsewhere.",
      "Emptied speech balloons, held last frames and soft upscaled panels are all still visible in the output.",
      "One colouriser model has no licence file, so its results are for local testing only and are not shown here.",
      "The stills on this page come from that one run. The film itself is not published.",
    ],
    demo: "pipeline",
  },
  {
    slug: "ventureworld",
    title: "VentureWorld",
    category: "Business listings marketplace",
    summary:
      "A marketplace where businesses for sale or seeking investment are listed, reviewed and matched with investors, with AI assistance for writing the listing.",
    group: "product",
    featured: true,
    year: "2025 to 2026",
    status: {
      kind: "development",
      label: "Private, pre-launch",
      note: "Deployed at ventureworld.net behind a site password. The client has not opened it to the public, so nothing beyond the gate can be checked yet.",
    },
    role: {
      title: "Lead developer",
      note: "224 of the 226 commits in the repository are mine, from October 2025 to May 2026. The business, its positioning and its content belong to the client.",
    },
    stack: [
      "Next.js",
      "React 19",
      "TypeScript",
      "Supabase",
      "TanStack Query",
      "Tailwind CSS",
      "Framer Motion",
      "ImageKit",
      "Resend",
      "OpenAI-compatible APIs",
    ],
    visual: "listings",
    surface: "red",
    images: [],
    links: [
      {
        label: "ventureworld.net",
        href: "https://ventureworld.net/",
        note: "Password required",
      },
    ],
    facts: [
      { label: "History", value: "226 commits over seven months" },
      { label: "Areas", value: "Public site, seller dashboard, admin console" },
      { label: "AI", value: "Listing assistant and site chatbot" },
    ],
    problem: [
      "Selling a business or raising investment starts with a listing that most owners find hard to write: financials, assets, reasons for sale, what is actually on offer.",
      "The platform needed to make that listing easy to produce, keep its quality under editorial control, and stay closed to the public until the client was ready.",
    ],
    goals: [
      "A guided listing form that owners can finish.",
      "Editorial control: nothing reaches the marketplace, or changes on it, without review.",
      "AI help that suggests rather than overwrites.",
      "A way to run the site privately in production.",
    ],
    constraints: [
      "The client iterated on positioning and compliance wording throughout, so content had to be cheap to change.",
      "Financial details in listings are sensitive and editing them needed an audit path.",
    ],
    contribution: [
      "Built the public site, listing pages, the create and edit flow, the seller dashboard and the admin console.",
      "Built the review workflow for new listings and for edits to approved ones.",
      "Built the AI listing assistant and the site chatbot behind server-side API routes.",
      "Added the questionnaire and matching logic, the environment-controlled password gate and maintenance mode.",
    ],
    overview: [
      "Owners create a listing through a structured form covering the business, its financials and the offer. Admins review it. Once approved, later edits go through a change-request flow instead of altering the live listing directly.",
      "Investors browse opportunities by industry, complete a profile questionnaire and receive recommended listings.",
    ],
    features: [
      {
        title: "Listing change requests",
        body: "An edit to an approved listing is stored as a proposed change and reviewed by an admin before it replaces what the public sees.",
      },
      {
        title: "AI listing assistant",
        body: "Suggests titles, descriptions, highlights and field-level wording from the draft so far. Suggestions appear as a preview the owner accepts or discards.",
      },
      {
        title: "Questionnaire and matching",
        body: "Investor and seller profile flows feed the logic that recommends listings.",
      },
      {
        title: "Password gate and maintenance mode",
        body: "Both are controlled by environment variables, so the production site can be closed or paused without a code change.",
      },
      {
        title: "Admin console",
        body: "Approvals, listing management and platform statistics.",
      },
      {
        title: "Mobile navigation",
        body: "A bottom navigation bar that hides on scroll, built for the way the site is used on phones.",
      },
    ],
    decisions: [
      {
        title: "Edits are proposals",
        body: "Treating every post-approval edit as a change request keeps the public listing stable while it is being revised.",
        tradeoff: "Owners wait for review on small corrections. Word limits and database constraints reduce how often that is needed.",
      },
      {
        title: "AI calls stay on the server",
        body: "The assistant and chatbot run through API routes that hold the key and choose the provider. The same code works against OpenAI or an OpenAI-compatible router.",
        tradeoff: "An extra hop per request, in exchange for keys that never reach the browser.",
      },
      {
        title: "Suggest, then confirm",
        body: "The assistant never writes into a field directly. It shows what it would change.",
        tradeoff: "One more click per suggestion. Financial listings are not a place for silent edits.",
      },
    ],
    implementation: [
      "Next.js with the Pages Router, Supabase for auth and data, TanStack Query for client-side data.",
      "ImageKit for listing media, Resend for contact and inquiry email.",
      "Database constraints mirror the form's word limits so the rule holds whichever path writes the row.",
    ],
    challenges: [
      {
        problem: "An upgrade to Next.js 16 left a deprecated middleware file returning 503 for the whole site.",
        solution: "Removed the deprecated middleware and moved the gate and maintenance checks to the supported convention.",
      },
      {
        problem: "Builds failed when environment variables were absent at build time.",
        solution:
          "Stopped the Supabase client from throwing during build and separated public build-time variables from server-only secrets.",
      },
    ],
    outcomes: [],
    limitations: [
      "The site is password-protected, so the link above will ask for a password.",
      "Marketplace figures shown on the client's site are theirs and are not repeated here.",
      "The repository is private.",
    ],
  },
  {
    slug: "comfy-lab",
    title: "Comfy Lab",
    category: "Generative workflow automation",
    summary:
      "ComfyUI driven as an API from Python: parameterised workflows, verified outputs, and a planner that keeps video generation inside one GPU's memory.",
    group: "ai",
    featured: false,
    year: "2026",
    status: {
      kind: "experiment",
      label: "Experiment",
      note: "Local tooling and measurements. Nothing is hosted.",
    },
    role: {
      title: "Developer",
      note: "A personal lab. The workflows wrap third-party models; the bridge, planner and measurements are mine.",
    },
    stack: ["Python", "ComfyUI API", "Wan 2.2", "Z-Image Turbo", "LTX-Video", "GGUF", "FFmpeg"],
    visual: "nodes",
    surface: "ink",
    images: [],
    links: [],
    facts: [
      { label: "Workflows", value: "24, in API format" },
      { label: "Models", value: "Text-to-image, text-to-video, image-to-video" },
      { label: "Interface", value: "Command line, JSON in and out" },
    ],
    problem: [
      "ComfyUI is a good place to design a generation workflow and an awkward thing to call from a program. Node ids are opaque, failures are quiet, and a video model can exhaust memory several minutes into a job.",
    ],
    goals: [
      "Call any workflow by name with readable parameters.",
      "Know whether a job really produced a playable file.",
      "Fit generation into the memory that is actually free.",
    ],
    constraints: ["One laptop GPU.", "Models with different frame-count and resolution grids."],
    contribution: [
      "Wrote the bridge: submit, poll, fetch, verify.",
      "Wrote the parameter-map convention and the workflows that use it.",
      "Wrote the resource planner, the out-of-memory ladder and the telemetry capture.",
    ],
    overview: [
      "Each workflow is exported from ComfyUI in API format and paired with a small file that maps friendly names such as prompt or seed onto node inputs. A command returns one JSON object and a non-zero exit code on failure.",
    ],
    features: [
      {
        title: "Parameter maps",
        body: "A workflow's inputs are addressed by name. A mapped seed is randomised when omitted and reported back.",
      },
      {
        title: "Verified output",
        body: "A missing, empty or undecodable file fails the job at a named verify stage, with codec, size, frame rate and frame count read from the file.",
      },
      {
        title: "Out-of-memory ladder",
        body: "Tiled decode, then a lower resolution tier, then fewer frames, each tried once with the same seed and prompt.",
      },
      {
        title: "Backends own their grids",
        body: "Each video backend knows its own legal frame counts and resolutions, so a plan is valid before it is submitted.",
      },
    ],
    decisions: [
      {
        title: "The planner picks settings; ComfyUI manages memory",
        body: "The planner only chooses workflows and parameters. Loading and unloading models stays with the tool that owns the GPU.",
        tradeoff: "Estimates are provisional until history replaces them, and plans say which they used.",
      },
      {
        title: "Named profiles record what was tried",
        body: "A profile is a bundle of settings with the date it was tested and what happened.",
        tradeoff: "Profiles are specific to this hardware.",
      },
    ],
    implementation: [
      "Standard-library Python talking to ComfyUI's HTTP API.",
      "Telemetry sampled during runs and stored beside the outputs.",
    ],
    challenges: [
      {
        problem: "Posting a workflow in the editor's format, or with the wrong text encoding, is rejected before queueing with little explanation.",
        solution: "All submissions go through the bridge, which enforces API format and UTF-8.",
      },
      {
        problem: "A prompt that describes an action without an ending produces a pose that keeps drifting.",
        solution: "Every action phrase now names the final pose. The test clips recovered to a stable stance once it did.",
      },
    ],
    outcomes: [],
    limitations: [
      "Measurements come from a small number of clips on one machine.",
      "Generated footage is not published here because of model licence terms.",
    ],
  },
  {
    slug: "ai-voice-lab",
    title: "AI Voice Lab",
    category: "Local speech synthesis",
    summary:
      "A chain of local text-to-speech engines with per-character voices, voice cloning from a reference clip, and a fallback for every line.",
    group: "ai",
    featured: false,
    year: "2026",
    status: {
      kind: "experiment",
      label: "Experiment",
      note: "Local only. This is speech synthesis, not a conversational agent, and no hosted demo exists.",
    },
    role: {
      title: "Developer",
      note: "Integration and orchestration around open-source engines. I did not train the models.",
    },
    stack: ["Python", "Kokoro-82M", "GPT-SoVITS", "Qwen TTS", "Windows SAPI", "FFmpeg"],
    visual: "voice",
    surface: "cobalt",
    images: [],
    links: [],
    facts: [
      { label: "Engines", value: "Kokoro, GPT-SoVITS, Qwen TTS, system voice" },
      { label: "Runs on", value: "CPU for the default path" },
      { label: "Used by", value: "Video Director" },
    ],
    problem: [
      "Voicing a script with several characters needs distinct, consistent voices and has to finish even when one engine refuses a line.",
    ],
    goals: [
      "One distinct voice per character.",
      "A cloned voice when a reference recording exists.",
      "A complete audio track every time, with gaps reported.",
    ],
    constraints: ["Each engine has its own dependency set.", "The GPU is usually busy with image or video work."],
    contribution: [
      "Wrote the engine chain and the per-line fallback.",
      "Wrapped each engine as a worker in its own environment.",
      "Wired voice assignment into the production pipeline's configuration.",
    ],
    overview: [
      "Lines are sent to the first available engine. A line that fails is passed down the chain on its own; the rest of the track is unaffected. Silent placeholders are retried on the next run.",
    ],
    features: [
      {
        title: "Fallback per line",
        body: "Kokoro, then GPT-SoVITS, then the system voice, then silence. An engine choking on punctuation does not cost the whole scene.",
      },
      {
        title: "Voice cloning",
        body: "A character with a reference clip and its transcript is voiced by GPT-SoVITS in that voice.",
      },
      {
        title: "Isolated workers",
        body: "Each engine runs in its own virtual environment and is started on demand.",
      },
    ],
    decisions: [
      {
        title: "CPU first",
        body: "The default engine runs on the CPU so speech never competes with the video model for memory.",
        tradeoff: "Slower than GPU synthesis.",
      },
      {
        title: "Silence is a valid result",
        body: "A missing line becomes a labelled silent placeholder, not a failed run.",
        tradeoff: "The report has to be read to know the track is incomplete.",
      },
    ],
    implementation: ["Worker processes with a small request protocol.", "FFmpeg for assembly and timing."],
    challenges: [
      {
        problem: "Without a real reference clip, the cloning engine copies the system voice and sounds robotic.",
        solution: "Cloning is only used when a reference and its transcript are supplied. Otherwise the natural built-in voices are preferred.",
      },
    ],
    outcomes: [],
    limitations: [
      "Source pages do not say what a character sounds like, so voices are assigned by configuration.",
      "No audio samples are published here.",
    ],
  },
  {
    slug: "vega-ventures",
    title: "Vega Ventures",
    category: "Corporate website for an investment firm",
    summary: "Website work for a private investment firm, built on WordPress.",
    group: "website",
    featured: false,
    year: "2025",
    status: {
      kind: "live",
      label: "Live",
      note: "vegaventures.group is online. The site's content and claims are the client's.",
    },
    role: {
      title: "Website build",
      note: "My involvement was the website. This entry is kept short until the exact scope is written up; edit it in the project content file.",
    },
    stack: ["WordPress", "Theme customisation", "Responsive layout"],
    visual: "plate",
    surface: "paper",
    images: [],
    links: [{ label: "vegaventures.group", href: "https://vegaventures.group/" }],
    facts: [
      { label: "Type", value: "Corporate website" },
      { label: "Platform", value: "WordPress" },
    ],
    problem: [
      "An investment firm needed a corporate site that presents its approach, sectors and strategy clearly and can be maintained without a developer.",
    ],
    goals: ["A clear structure for a firm with several sectors.", "Content the client can edit."],
    constraints: [],
    contribution: ["Website build and theme work on WordPress.", "Brand and logo explorations during the project."],
    overview: [
      "A multi-page corporate site covering the firm, its approach by sector, its strategies and a contact route.",
    ],
    features: [],
    decisions: [],
    implementation: [],
    challenges: [],
    outcomes: [],
    limitations: ["This is client website work, not a software product. It is listed for range, not depth."],
  },
  {
    slug: "vega-trade",
    title: "Vega Trade",
    category: "Website for a trade business",
    summary: "Website work for a trade-focused business, built on WordPress with Elementor.",
    group: "website",
    featured: false,
    year: "2026",
    status: {
      kind: "live",
      label: "Live",
      note: "vegaventures.co is online. The site's content and claims are the client's.",
    },
    role: {
      title: "Website build",
      note: "My involvement was the website. This entry is kept short until the exact scope is written up; edit it in the project content file.",
    },
    stack: ["WordPress", "Elementor", "Responsive layout"],
    visual: "plate",
    surface: "paper",
    images: [],
    links: [{ label: "vegaventures.co", href: "https://vegaventures.co/" }],
    facts: [
      { label: "Type", value: "Business website" },
      { label: "Platform", value: "WordPress, Elementor" },
    ],
    problem: [
      "A trade business needed to explain an unfamiliar operating model to counterparties, with a direct route to make an inquiry.",
    ],
    goals: ["Explain the model in plain steps.", "Lead to one inquiry form."],
    constraints: [],
    contribution: ["Website build on WordPress with Elementor."],
    overview: ["A site covering the company, its model, its advantages, governance pages and an inquiry form."],
    features: [],
    decisions: [],
    implementation: [],
    challenges: [],
    outcomes: [],
    limitations: ["This is client website work, not a software product. It is listed for range, not depth."],
  },
];

/** A project added through the admin panel, expanded to the full case-study shape. */
/** A panel link's label, or the site's host name when it was left empty. */
function linkLabel(link: StoredLink) {
  if (link.label) return link.label;
  try {
    return new URL(link.href).hostname.replace(/^www\./, "");
  } catch {
    return "Visit";
  }
}

/** The pictures with the chosen main one moved to the front. An unknown choice leaves the order alone. */
function coverFirst<T extends { src: string }>(images: T[], cover: string): T[] {
  const main = images.find((image) => image.src === cover);
  return main ? [main, ...images.filter((image) => image !== main)] : images;
}

function fromStore(p: StoredProject): Project {
  return {
    slug: p.slug,
    title: p.title,
    category: p.category,
    summary: p.summary,
    group: p.group,
    featured: p.featured,
    year: p.year,
    status: { kind: p.statusKind, label: p.statusLabel, note: p.statusNote },
    role: { title: p.roleTitle, note: p.roleNote },
    stack: p.stack,
    visual: "plate",
    surface: p.surface,
    images: coverFirst(p.images, p.cover),
    video: p.video ?? undefined,
    links: p.links.map((link) => ({ label: linkLabel(link), href: link.href })),
    facts: [],
    problem: [],
    goals: [],
    constraints: [],
    contribution: p.points,
    overview: p.overview,
    features: [],
    decisions: [],
    implementation: [],
    challenges: [],
    outcomes: [],
    limitations: [],
    custom: true,
  };
}

/**
 * A built-in project in the flat shape the admin panel edits. Its written screenshots stay
 * in this file, so `images` starts empty: photos added in the panel are shown after them.
 */
export function toStored(project: Project): StoredProject {
  return {
    slug: project.slug,
    title: project.title,
    category: project.category,
    summary: project.summary,
    group: project.group,
    featured: project.featured,
    year: project.year,
    statusKind: project.status.kind,
    statusLabel: project.status.label,
    statusNote: project.status.note,
    roleTitle: project.role.title,
    roleNote: project.role.note,
    stack: project.stack,
    surface: project.surface,
    links: project.links.map(({ label, href }) => ({ label, href })),
    overview: project.overview,
    points: project.contribution,
    images: [],
    cover: "",
    video: project.video ?? null,
  };
}

/** A built-in project with the edits made to it in the panel. The long sections are left as written. */
function withOverride(project: Project): Project {
  const edit = store.overrides[project.slug];
  if (!edit) return project;
  return {
    ...project,
    title: edit.title,
    category: edit.category || project.category,
    summary: edit.summary || project.summary,
    group: edit.group,
    featured: edit.featured,
    year: edit.year || project.year,
    status: { kind: edit.statusKind, label: edit.statusLabel, note: edit.statusNote || project.status.note },
    role: { title: edit.roleTitle || project.role.title, note: edit.roleNote || project.role.note },
    stack: edit.stack.length > 0 ? edit.stack : project.stack,
    surface: edit.surface,
    // The panel starts from the written links, so the edited list replaces them. A note survives on a link kept unchanged.
    links: edit.links.map((link) => ({ label: linkLabel(link), href: link.href, note: project.links.find((written) => written.href === link.href)?.note })),
    images: coverFirst([...project.images, ...edit.images], edit.cover),
    video: edit.video ?? project.video,
    overview: edit.overview.length > 0 ? edit.overview : project.overview,
    contribution: edit.points.length > 0 ? edit.points : project.contribution,
  };
}

/** Everything shown on the site: built-in projects that are not hidden (with any panel edits), then the ones added in the panel. */
export const projects: Project[] = [
  ...builtInProjects.filter((project) => !store.hidden.includes(project.slug)).map(withOverride),
  ...store.projects.map(fromStore),
];

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function projectIndex(slug: string) {
  return String(projects.findIndex((p) => p.slug === slug) + 1).padStart(2, "0");
}

export function adjacentProjects(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return {
    previous: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
}
