import type { Metadata } from "next";
import { absoluteUrl, site, siteUrl } from "@/config/site";
import type { Project } from "@/content/projects";
import type { Service } from "@/content/services";

/**
 * Everything search engines and link previews read that is not visible page content:
 * per-page metadata and the schema.org descriptions of the site, its author and its pages.
 */

/** The home page title, and the fallback for any page that sets none. Kept under 60 characters. */
export const siteTitle = `${site.name} — Full-Stack Development & AI Engineering in Dubai`;

const ORG_ID = `${siteUrl}/#organization`;
const WEBSITE_ID = `${siteUrl}/#website`;

interface PageMeta {
  /** Without the site name: the root layout appends it to the <title>. */
  title: string;
  description: string;
  /** Path from the root, e.g. "/about". */
  path: string;
  type?: "website" | "article" | "profile";
}

/**
 * Metadata for one page. Next.js merges metadata shallowly, so a page that sets only a title
 * would inherit the home page's Open Graph title, description and URL, and every shared link
 * would preview as the home page. This sets all three places (page, Open Graph, Twitter) together.
 */
export function pageMetadata({ title, description, path, type = "website" }: PageMeta): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type, siteName: site.name, locale: "en_US", title, description, url: path },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Nexora and the site, described once in the root layout and referred to by id everywhere else. */
export function siteSchema(services: Service[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: site.name,
        description: site.description,
        logo: absoluteUrl("/icons/icon-512.png"),
        url: siteUrl,
        email: `mailto:${site.email}`,
        address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
        knowsAbout: services.map((service) => service.title),
        sameAs: [site.links.github, site.links.linkedin].filter(Boolean),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: site.name,
        description: site.description,
        url: siteUrl,
        inLanguage: "en",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

/** The trail shown above a search result instead of the raw address. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: absoluteUrl(step.path),
    })),
  };
}

function webPage(type: string, path: string, name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${absoluteUrl(path)}#page`,
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
  };
}

export function profilePageSchema(description: string) {
  return {
    ...webPage("ProfilePage", "/about", `About ${site.name}`, description),
    about: { "@id": ORG_ID },
    mainEntity: { "@id": ORG_ID },
  };
}

export function contactPageSchema(description: string) {
  return {
    ...webPage("ContactPage", "/contact", `Contact ${site.name}`, description),
    about: { "@id": ORG_ID },
  };
}

/** The work index: a list of case studies, in display order. */
export function workSchema(projects: Project[], description: string) {
  return {
    ...webPage("CollectionPage", "/work", `Work by ${site.name}`, description),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((project, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: project.title,
        url: absoluteUrl(`/work/${project.slug}`),
      })),
    },
  };
}

/** One case study. The year is only stated when the content gives a single plain year. */
export function projectSchema(project: Project) {
  const path = `/work/${project.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${absoluteUrl(path)}#project`,
    url: absoluteUrl(path),
    name: project.title,
    headline: `${project.title}: ${project.category}`,
    description: project.summary,
    genre: project.category,
    keywords: project.stack.join(", "),
    inLanguage: "en",
    ...(/^\d{4}$/.test(project.year) ? { dateCreated: project.year } : {}),
    ...(project.images.length > 0 ? { image: project.images.map((image) => absoluteUrl(image.src)) } : {}),
    creator: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

export function servicesSchema(services: Service[], description: string) {
  return {
    ...webPage("WebPage", "/services", `Services by ${site.name}`, description),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: services.length,
      itemListElement: services.map((service, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          name: service.title,
          description: service.problem,
          provider: { "@id": ORG_ID },
          url: absoluteUrl("/services"),
        },
      })),
    },
  };
}
