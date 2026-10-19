import { site } from "@/config/site";
import { ogBrandCard, ogContentType, ogSize } from "@/lib/og";

export const alt = `${site.name} logo: full-stack development and AI engineering in Dubai`;
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogBrandCard({
    subtitle: `${site.title} · AI Engineering`,
    detail: site.availability.open ? site.availability.label : site.availability.closedLabel,
  });
}
