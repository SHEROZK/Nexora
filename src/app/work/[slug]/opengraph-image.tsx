import { site } from "@/config/site";
import { getProject, projects } from "@/content/projects";
import { ogCard, ogContentType, ogSize } from "@/lib/og";

export const alt = `Case study by ${site.name}: the project's name, type, status and role`;
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  return ogCard({
    title: project?.title ?? "Case study",
    subtitle: project?.category ?? "",
    detail: project ? `${project.status.label} · ${project.role.title}` : "",
  });
}
