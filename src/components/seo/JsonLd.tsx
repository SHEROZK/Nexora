import { site } from "@/config/site";

/**
 * A schema.org description of the page for search engines. Rendered only once a production
 * domain is configured, because every address inside it has to be the real one.
 */
export function JsonLd({ data }: { data: object }) {
  if (!site.url) return null;
  // "<" is escaped so no string in the content can close the script element.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
