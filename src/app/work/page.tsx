import type { Metadata } from "next";
import { groupLabels, projects, type ProjectGroup } from "@/content/projects";
import { ProjectIndex, type IndexItem } from "@/components/projects/ProjectIndex";
import Image from "next/image";
import { ProjectVisual } from "@/components/projects/ProjectVisual";
import { PageIntro } from "@/components/ui/PageIntro";
import { pageMetadata, workSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const description =
  "Products, AI systems and client websites by Nexora, each labelled as live, in development or experimental.";

export const metadata: Metadata = pageMetadata({ title: "Work: products, AI systems and client websites", description, path: "/work" });

export default function WorkPage() {
  const items: IndexItem[] = projects.map(({ slug, title, category, year, group, status }) => ({
    slug,
    title,
    category,
    year,
    group,
    status: { kind: status.kind, label: status.label },
  }));
  const groups = (Object.keys(groupLabels) as ProjectGroup[]).map((id) => ({ id, label: groupLabels[id] }));
  // A real screenshot where one exists; otherwise the diagram.
  const previews = Object.fromEntries(
    projects.map((project) => {
      const image = project.images.find((candidate) => candidate.width > candidate.height && candidate.width / candidate.height < 4);
      return [
        project.slug,
        image ? (
          <Image key={project.slug} src={image.src} width={image.width} height={image.height} alt="" sizes="22rem" className="h-full w-full object-cover object-top" />
        ) : (
          <ProjectVisual key={project.slug} project={project} />
        ),
      ];
    }),
  );

  return (
    <>
      <JsonLd data={workSchema(projects, description)} />
      <PageIntro
        heading={
          <>
            Everything, <em className="accent">labelled</em> honestly
          </>
        }
      >
        <p>
          {projects.length} projects. Some run in production, some are still being built, and some are experiments that
          taught me something. Each one says which.
        </p>
      </PageIntro>
      <div className="shell py-12 md:py-16">
        <ProjectIndex items={items} groups={groups} previews={previews} />
      </div>
    </>
  );
}
