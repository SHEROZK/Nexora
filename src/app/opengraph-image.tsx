import { site } from "@/config/site";
import { ogCard, ogContentType, ogSize } from "@/lib/og";

export const alt = `${site.name}: full-stack development and AI engineering in Dubai`;
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogCard({
    title: "Rough ideas in. Built software out.",
    subtitle: `${site.title} · ${site.positioning}`,
    detail: site.availability.open ? site.availability.label : site.availability.closedLabel,
  });
}
