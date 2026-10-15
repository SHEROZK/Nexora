/**
 * Single source of truth for personal details, links and feature flags.
 * Everything a visitor can read about you that is not project content lives here.
 *
 * Rule used throughout the site: a value of `null` means "not provided", and the
 * UI hides the element rather than showing a placeholder.
 */

import { SPEED_FACTOR, store } from "@/content/store";

const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || null;
const productionUrl = "https://nexoratechnology.me";

export const site = {
  name: "Nexora",
  monogram: "N",
  title: "Full-Stack Development",
  positioning: "AI Engineering & Creative Technology",
  /** Used in metadata and the social preview. */
  description:
    "Nexora is a full-stack development and AI engineering practice in Dubai, building digital products, the systems behind them, and the AI workflows inside them.",
  location: "Dubai, UAE",
  timezone: "GST (UTC+4)",

  /**
   * Production origin, without a trailing slash. NEXT_PUBLIC_SITE_URL overrides it (for a
   * preview domain, say); production builds fall back to nexoratechnology.me. While it is
   * null (development), canonical URLs point at localhost and robots.txt asks crawlers to stay away.
   */
  url: envUrl ?? (process.env.NODE_ENV === "production" ? productionUrl : null),
  fallbackUrl: "http://localhost:3000",

  /** The public business address, on the site's own domain. */
  email: "sheroz@nexoratechnology.me",

  /** The person behind Nexora, named on the e-invoicing page. */
  founder: {
    name: "Sheroze Khan",
    role: "Founder and developer",
    /** Not provided yet. Put a square photo in /public and set e.g. "/founder.webp". */
    photo: null as string | null,
  },

  /** Not provided yet. A Cal.com or Calendly link for 20-minute calls; the button is hidden while null. */
  booking: null as string | null,

  /** Shown in the hero and the contact section. Edited in the admin panel. */
  availability: {
    open: store.availability.open,
    label: store.availability.label,
    closedLabel: "Not taking new projects right now",
  },

  /** The big words, headline and caption of the first screen. Edited in the admin panel. */
  hero: store.hero,

  /** The opening and background paragraphs of the About page. Edited in the admin panel. */
  about: store.about,

  links: {
    github: "https://github.com/SHEROZK",
    /** Not provided yet. Add the full profile URL to show the link. */
    linkedin: null as string | null,
    /** Not provided yet. Put a PDF in /public and set e.g. "/nexora-profile.pdf". */
    resume: null as string | null,
  },

  /** Facts that appear on the About page. Only what can be backed up. */
  background: [
    { label: "Based in", value: "Dubai, UAE" },
    { label: "Education", value: "B.Sc. Computer Science, Mumbai University" },
    { label: "Languages", value: "English, Hindi, Urdu" },
  ],
} as const;

/** Motion choices made in the admin panel. Turning something off never removes content. */
export const motion = store.motion;

/** Multiplier for timed animations: above 1 is quicker. Scroll-linked motion ignores it. */
export const motionSpeed = SPEED_FACTOR[store.motion.speed];

export const siteUrl = site.url ?? site.fallbackUrl;

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function mailto(subject?: string, body?: string) {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString().replace(/\+/g, "%20");
  return `mailto:${site.email}${query ? `?${query}` : ""}`;
}
