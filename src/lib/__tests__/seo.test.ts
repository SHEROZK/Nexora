import { describe, expect, it } from "vitest";
import { projects } from "../../content/projects";
import { services } from "../../content/services";
import { siteUrl } from "../../config/site";
import { breadcrumbSchema, pageMetadata, projectSchema, servicesSchema, siteSchema, siteTitle, workSchema } from "../seo";

describe("page metadata", () => {
  const meta = pageMetadata({ title: "About: how I build", description: "A description.", path: "/about" });

  it("gives the page, Open Graph and Twitter the same title and description", () => {
    expect(meta.title).toBe("About: how I build");
    expect(meta.openGraph).toMatchObject({ title: "About: how I build", description: "A description." });
    expect(meta.twitter).toMatchObject({ title: "About: how I build", description: "A description." });
  });

  it("points the canonical address and the shared link at the page itself, not the home page", () => {
    expect(meta.alternates?.canonical).toBe("/about");
    expect(meta.openGraph?.url).toBe("/about");
  });

  it("keeps the home page title short enough to show whole in search results", () => {
    expect(siteTitle.length).toBeLessThanOrEqual(60);
  });
});

describe("structured data", () => {
  it("describes Nexora once and refers to that description from the site", () => {
    const [organization, website] = siteSchema(services)["@graph"];
    expect(organization["@type"]).toBe("Organization");
    expect(organization.name).toBe("Nexora");
    expect(website.publisher).toEqual({ "@id": organization["@id"] });
    expect(organization.knowsAbout).toHaveLength(services.length);
  });

  it("uses absolute addresses everywhere", () => {
    const blobs = [
      siteSchema(services),
      workSchema(projects, "d"),
      servicesSchema(services, "d"),
      breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }]),
      ...projects.map(projectSchema),
    ];
    for (const blob of blobs) {
      const addresses = JSON.stringify(blob).match(/"(?:url|item|@id|image)":"[^"]*"/g) ?? [];
      for (const address of addresses) expect(address).toContain(siteUrl);
    }
  });

  it("lists every project on the work page, in display order", () => {
    const items = workSchema(projects, "d").mainEntity.itemListElement;
    expect(items.map((item) => item.name)).toEqual(projects.map((project) => project.title));
    expect(items.map((item) => item.position)).toEqual(projects.map((_, i) => i + 1));
  });

  it("only states a creation date when the project gives one plain year", () => {
    for (const project of projects) {
      const schema = projectSchema(project) as { dateCreated?: string };
      if (schema.dateCreated) expect(schema.dateCreated).toMatch(/^\d{4}$/);
    }
  });

  it("numbers a breadcrumb trail from one", () => {
    const trail = breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }, { name: "X", path: "/work/x" }]);
    expect(trail.itemListElement.map((step) => step.position)).toEqual([1, 2, 3]);
    expect(trail.itemListElement[2].item).toBe(`${siteUrl}/work/x`);
  });
});
