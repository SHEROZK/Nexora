import { videoEmbed } from "@/lib/video";
import raw from "./store.json";

/**
 * Everything the admin panel can change. The panel (/admin) saves it to Supabase; every
 * build first copies it into store.json, next to this file (scripts/pull-store.mjs), and
 * the site imports that file. Saving on the live site triggers a rebuild, so a change is
 * live a minute or two later. This module is the single place that defines its shape.
 */

export type Surface = "paper" | "ink" | "cobalt" | "yellow" | "red";
export type StatusKind = "live" | "development" | "experiment";
export type ProjectGroup = "product" | "ai" | "website" | "marketing";

export interface StoredImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
}

export interface StoredLink {
  label: string;
  href: string;
}

/** A YouTube, Vimeo or Loom address, an https link to an MP4/WebM, or a file uploaded to /videos. */
export interface StoredVideo {
  src: string;
  caption: string;
}

/** Where files uploaded in the panel are served from: the public "media" bucket in Supabase Storage. */
export const MEDIA_URL = `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "")}/storage/v1/object/public/media`;

/** An image the panel uploaded: in Supabase Storage, or in /public/shots from before it was used. */
function isUploadedImage(src: string) {
  const file = src.startsWith(`${MEDIA_URL}/`) ? src.slice(MEDIA_URL.length) : src;
  return /^\/shots\/[a-z0-9-]+\.(png|jpe?g|webp)$/.test(file);
}

export const MAX_LINKS = 4;
export const MAX_IMAGES = 3;

/** Social profiles, in the order their icons appear. An empty address hides the icon. */
export const SOCIALS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "github", label: "GitHub" },
  { id: "x", label: "X" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
] as const;
export type SocialId = (typeof SOCIALS)[number]["id"];

/** A project added through the panel. Simpler than the hand-written case studies. */
export interface StoredProject {
  slug: string;
  title: string;
  category: string;
  summary: string;
  group: ProjectGroup;
  featured: boolean;
  year: string;
  statusKind: StatusKind;
  statusLabel: string;
  statusNote: string;
  roleTitle: string;
  roleNote: string;
  stack: string[];
  surface: Surface;
  /** Live links, up to MAX_LINKS. An empty label shows the site's host name instead. */
  links: StoredLink[];
  /** Paragraphs describing what it is. */
  overview: string[];
  /** One line each: what you did. */
  points: string[];
  /**
   * Photos, up to MAX_IMAGES. On a project added here they are its pictures; on one of the
   * original case studies they are shown after the screenshots already written into it.
   */
  images: StoredImage[];
  /**
   * The picture shown first: on the home page, in the work list and at the top of the case
   * study. Any of its pictures, written or added; empty keeps the usual order.
   */
  cover: string;
  video: StoredVideo | null;
}

export const REVEALS = ["rise", "fade", "wipe", "none"] as const;
export const MASKS = ["varied", "up", "left", "circle", "diagonal", "none"] as const;
export const HERO_MODES = ["full", "scroll", "still"] as const;
export const SPEEDS = ["slow", "normal", "fast"] as const;

export interface MotionSettings {
  smoothScroll: boolean;
  reveal: (typeof REVEALS)[number];
  imageMask: (typeof MASKS)[number];
  hero: (typeof HERO_MODES)[number];
  drift: boolean;
  speed: (typeof SPEEDS)[number];
  flowField: boolean;
  magnetic: boolean;
}

export interface Store {
  hero: { wordOne: string; wordTwo: string; heading: string; caption: string };
  about: { intro: string; background: string };
  availability: { open: boolean; label: string };
  social: Record<SocialId, string>;
  motion: MotionSettings;
  /** Slugs of built-in projects taken off the site. */
  hidden: string[];
  /**
   * Edits made in the panel to built-in projects, keyed by slug. Only the summary-level
   * fields are replaced; the long case-study sections stay as written in projects.ts.
   */
  overrides: Record<string, StoredProject>;
  projects: StoredProject[];
}

/** How much faster or slower timed animations run. Scroll-linked motion is unaffected. */
export const SPEED_FACTOR: Record<MotionSettings["speed"], number> = { slow: 0.7, normal: 1, fast: 1.45 };

/** Labels and help text for the panel, kept beside the types they describe. */
export const MOTION_HELP = {
  reveal: {
    label: "How text and lists appear as you scroll",
    options: { rise: "Rise and fade in", fade: "Fade in only", wipe: "Wipe open from the top", none: "No entrance, always visible" },
  },
  imageMask: {
    label: "How project images open",
    options: {
      varied: "A different shape for each project",
      up: "Wipe upward",
      left: "Wipe from the left",
      circle: "Grow from a circle",
      diagonal: "Diagonal cut",
      none: "No reveal",
    },
  },
  hero: {
    label: "Hero screenshots",
    options: { full: "Level out on scroll and follow the pointer", scroll: "Level out on scroll only", still: "Stay still" },
  },
  speed: { label: "Animation speed", options: { slow: "Slow and calm", normal: "Normal", fast: "Quick" } },
  smoothScroll: { label: "Smooth scrolling", hint: "Eases mouse-wheel scrolling. Never applied on touch screens." },
  drift: { label: "Parallax drift", hint: "Large numbers, the phone screenshot and the moving line of type slide against the scroll." },
  flowField: { label: "Generative canvas in the lab", hint: "Off shows a single still frame instead." },
  magnetic: { label: "Magnetic buttons", hint: "Main buttons lean slightly toward the mouse." },
} as const;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SURFACES: Surface[] = ["paper", "ink", "cobalt", "yellow", "red"];
const KINDS: StatusKind[] = ["live", "development", "experiment"];
const GROUPS: ProjectGroup[] = ["product", "ai", "website", "marketing"];

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const lines = (value: unknown, maxItems: number, maxLength: number) =>
  Array.isArray(value) ? value.map((item) => text(item, maxLength)).filter(Boolean).slice(0, maxItems) : [];
const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

export function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    // Drop the accents that normalising split off, so "Café" becomes "cafe" and not "cafe-".
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function cleanImage(value: unknown): StoredImage | null {
  if (!value || typeof value !== "object") return null;
  const image = value as Record<string, unknown>;
  const src = text(image.src, 300);
  const width = Number(image.width);
  const height = Number(image.height);
  // Only files the upload route stored are accepted.
  if (!isUploadedImage(src) || !(width > 0) || !(height > 0)) return null;
  return { src, width: Math.round(width), height: Math.round(height), alt: text(image.alt, 200), caption: text(image.caption, 240) };
}

const https = (value: unknown) => {
  const href = text(value, 300);
  return /^https:\/\/[^\s]+$/.test(href) ? href : "";
};

function cleanLinks(p: Record<string, unknown>): StoredLink[] {
  // Older saves held a single linkLabel/linkHref pair.
  const source = Array.isArray(p.links) ? p.links : [{ label: p.linkLabel, href: p.linkHref }];
  return source
    .map((link) => {
      const item = (link && typeof link === "object" ? link : {}) as Record<string, unknown>;
      return { label: text(item.label, 60), href: https(item.href) };
    })
    .filter((link) => link.href)
    .slice(0, MAX_LINKS);
}

function cleanImages(p: Record<string, unknown>): StoredImage[] {
  // Older saves held a single image.
  const source = Array.isArray(p.images) ? p.images : [p.image];
  return source.map(cleanImage).filter((image): image is StoredImage => image !== null).slice(0, MAX_IMAGES);
}

function cleanVideo(value: unknown): StoredVideo | null {
  if (!value || typeof value !== "object") return null;
  const video = value as Record<string, unknown>;
  const src = text(video.src, 300);
  return videoEmbed(src) ? { src, caption: text(video.caption, 240) } : null;
}

function cleanProject(value: unknown, forcedSlug?: string): StoredProject | null {
  if (!value || typeof value !== "object") return null;
  const p = value as Record<string, unknown>;
  const title = text(p.title, 60);
  const slug = forcedSlug ?? (text(p.slug, 60) || slugify(title));
  if (!title || !SLUG.test(slug)) return null;
  const statusKind = oneOf(p.statusKind, KINDS, "development");
  return {
    slug,
    title,
    category: text(p.category, 90),
    summary: text(p.summary, 260),
    group: oneOf(p.group, GROUPS, "product"),
    featured: p.featured === true,
    year: text(p.year, 20),
    statusKind,
    statusLabel: text(p.statusLabel, 40) || { live: "Live", development: "In development", experiment: "Experiment" }[statusKind],
    statusNote: text(p.statusNote, 400),
    roleTitle: text(p.roleTitle, 60),
    roleNote: text(p.roleNote, 500),
    stack: lines(p.stack, 16, 40),
    surface: oneOf(p.surface, SURFACES, "paper"),
    links: cleanLinks(p),
    overview: lines(p.overview, 8, 900),
    points: lines(p.points, 12, 300),
    images: cleanImages(p),
    cover: isUploadedImage(text(p.cover, 300)) ? text(p.cover, 300) : "",
    video: cleanVideo(p.video),
  };
}

/**
 * Turns anything (a request body, a hand-edited file) into a valid Store.
 * Unknown fields are dropped, text is trimmed and capped, and bad values fall back
 * to the defaults, so a malformed save can never break the build.
 */
export function sanitizeStore(input: unknown, builtInSlugs: string[] = []): Store {
  const source = (input && typeof input === "object" ? input : {}) as Record<string, Record<string, unknown> | unknown>;
  const hero = (source.hero ?? {}) as Record<string, unknown>;
  const about = (source.about ?? {}) as Record<string, unknown>;
  const availability = (source.availability ?? {}) as Record<string, unknown>;
  const motion = (source.motion ?? {}) as Record<string, unknown>;

  const seen = new Set(builtInSlugs);
  const projects: StoredProject[] = [];
  for (const candidate of Array.isArray(source.projects) ? source.projects : []) {
    const project = cleanProject(candidate);
    if (!project || seen.has(project.slug)) continue;
    seen.add(project.slug);
    projects.push(project);
  }

  // Edits to built-in projects: only for slugs that exist. Their images are extras, shown after the written ones.
  const overrides: Record<string, StoredProject> = {};
  const rawOverrides = (source.overrides && typeof source.overrides === "object" ? source.overrides : {}) as Record<string, unknown>;
  for (const slug of builtInSlugs.length > 0 ? builtInSlugs : Object.keys(rawOverrides)) {
    if (!SLUG.test(slug) || !(slug in rawOverrides)) continue;
    const project = cleanProject(rawOverrides[slug], slug);
    if (project) overrides[slug] = project;
  }

  const social = (source.social ?? {}) as Record<string, unknown>;

  return {
    hero: {
      wordOne: text(hero.wordOne, 14) || "Nexora",
      wordTwo: text(hero.wordTwo, 14),
      heading: text(hero.heading, 120),
      caption: text(hero.caption, 400),
    },
    about: { intro: text(about.intro, 900), background: text(about.background, 900) },
    availability: { open: availability.open !== false, label: text(availability.label, 60) || "Taking on new projects" },
    social: Object.fromEntries(SOCIALS.map(({ id }) => [id, https(social[id])])) as Record<SocialId, string>,
    motion: {
      smoothScroll: motion.smoothScroll !== false,
      reveal: oneOf(motion.reveal, REVEALS, "rise"),
      imageMask: oneOf(motion.imageMask, MASKS, "varied"),
      hero: oneOf(motion.hero, HERO_MODES, "full"),
      drift: motion.drift !== false,
      speed: oneOf(motion.speed, SPEEDS, "normal"),
      flowField: motion.flowField !== false,
      magnetic: motion.magnetic !== false,
    },
    hidden: lines(source.hidden, 50, 60).filter((slug) => builtInSlugs.length === 0 || builtInSlugs.includes(slug)),
    overrides,
    projects,
  };
}

/** The store as the site sees it: always valid, whatever is in the file. */
export const store: Store = sanitizeStore(raw);
