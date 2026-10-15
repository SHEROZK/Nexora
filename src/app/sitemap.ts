import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { projects } from "@/content/projects";

/** Generated from the route list and the project content, so new case studies appear on their own. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: "/", priority: 1 },
    { path: "/work", priority: 0.9 },
    { path: "/services", priority: 0.8 },
    { path: "/e-invoicing", priority: 0.9 },
    { path: "/about", priority: 0.7 },
    { path: "/experiments", priority: 0.6 },
    { path: "/contact", priority: 0.8 },
  ];

  return [
    ...pages.map((page) => ({ url: absoluteUrl(page.path), changeFrequency: "monthly" as const, priority: page.priority })),
    ...projects.map((project) => ({
      url: absoluteUrl(`/work/${project.slug}`),
      changeFrequency: "monthly" as const,
      priority: project.featured ? 0.8 : 0.5,
      // Real screenshots, so they can be found through image search with their page attached.
      ...(project.images.length > 0 ? { images: project.images.map((image) => absoluteUrl(image.src)) } : {}),
    })),
  ];
}
