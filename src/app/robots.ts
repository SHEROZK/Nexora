import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/config/site";

/**
 * With a production domain configured, everything except the API is crawlable.
 * Without one (local or preview builds), crawlers are asked to stay out entirely.
 */
export default function robots(): MetadataRoute.Robots {
  if (!site.url) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: site.url,
  };
}
