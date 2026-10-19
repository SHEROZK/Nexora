import { describe, expect, it } from "vitest";
import { createOrder, isLegal, paymentLabel, transition, type OrderAction, type OrderState } from "../orderMachine";
import { STAGES, approve, createRun, cursor, editArtifact, isComplete, run } from "../pipeline";
import { PROJECT_TYPES, emailBody, emailSubject, hasErrors, normalise, validate } from "../contact";
import { projects, builtInProjects, adjacentProjects, getProject } from "../../content/projects";
import { sanitizeStore, slugify } from "../../content/store";
import { videoEmbed } from "../video";
import { services } from "../../content/services";
import { capabilityLayers } from "../../content/capabilities";

const play = (state: OrderState, ...actions: OrderAction[]) => actions.reduce(transition, state);

describe("order rules", () => {
  it("refuses payment before the restaurant has accepted", () => {
    const order = play(createOrder("online"), "pay");
    expect(order.paid).toBe(false);
    expect(order.events.at(-1)?.ok).toBe(false);
  });

  it("keeps the kitchen waiting until an online order is paid", () => {
    const unpaid = play(createOrder("online"), "accept", "prepare");
    expect(unpaid.status).toBe("ACCEPTED");
    const paid = play(unpaid, "pay", "prepare");
    expect(paid.status).toBe("PREPARING");
  });

  it("records an online payment exactly once", () => {
    const order = play(createOrder("online"), "accept", "pay", "pay");
    expect(order.events.filter((event) => event.action === "pay" && event.ok)).toHaveLength(1);
  });

  it("never lets a driver record cash for an online order", () => {
    const order = play(createOrder("online"), "accept", "pay", "prepare", "ready", "assign", "start", "collect");
    expect(order.events.at(-1)?.ok).toBe(false);
  });

  it("requires cash, then the PIN, before a cash order completes", () => {
    const atDoor = play(createOrder("cash"), "accept", "prepare", "ready", "assign", "start");
    expect(play(atDoor, "complete").status).toBe("OUT_FOR_DELIVERY");
    expect(play(atDoor, "pin").pinVerified).toBe(false);
    expect(play(atDoor, "collect", "pin", "complete").status).toBe("DELIVERED");
  });

  it("locks a delivered order", () => {
    const delivered = play(createOrder("cash"), "accept", "prepare", "ready", "assign", "start", "collect", "pin", "complete");
    expect(isLegal(delivered, "cancel")).toBe(false);
    expect(play(delivered, "cancel").status).toBe("DELIVERED");
  });

  it("turns received money into a refund due on cancellation", () => {
    const order = play(createOrder("online"), "accept", "pay", "cancel");
    expect(order.status).toBe("CANCELLED");
    expect(order.refundDue).toBe(true);
    expect(paymentLabel(order)).toBe("Refund due");
  });

  it("appends every attempt to the timeline, refused or not", () => {
    const order = play(createOrder("online"), "pay", "accept", "prepare");
    expect(order.events.map((event) => event.ok)).toEqual([false, true, false]);
    expect(order.events.map((event) => event.id)).toEqual([1, 2, 3]);
  });
});

describe("stage machine", () => {
  it("has thirteen stages and six checkpoints", () => {
    expect(STAGES).toHaveLength(13);
    expect(STAGES.filter((stage) => stage.checkpoint)).toHaveLength(6);
  });

  it("stops at the first checkpoint and will not pass it unapproved", () => {
    const first = run(createRun());
    expect(STAGES[cursor(first)].id).toBe("panels");
    expect(first.statuses[cursor(first)]).toBe("awaiting-approval");
    expect(run(first)).toEqual(first);
  });

  it("finishes after every checkpoint is approved", () => {
    let state = createRun();
    for (let guard = 0; guard < 40 && !isComplete(state); guard++) {
      state = run(state);
      const at = cursor(state);
      if (at >= 0) state = approve(state, at);
    }
    expect(isComplete(state)).toBe(true);
    expect(state.runs.every((count) => count === 1)).toBe(true);
  });

  it("resets everything downstream when an artifact is edited", () => {
    let state = createRun();
    for (let guard = 0; guard < 40 && !isComplete(state); guard++) {
      state = run(state);
      const at = cursor(state);
      if (at >= 0) state = approve(state, at);
    }
    const edited = editArtifact(state, 2);
    expect(edited.statuses.slice(0, 2)).toEqual(["done", "done"]);
    expect(edited.statuses[2]).toBe("awaiting-approval");
    expect(edited.statuses.slice(3).every((status) => status === "pending")).toBe(true);
  });
});

describe("contact validation", () => {
  const good = {
    name: "Ada Example",
    email: "ada@example.com",
    company: "",
    type: PROJECT_TYPES[0],
    message: "We need an ordering system for three branches.",
  };

  it("accepts a complete message", () => {
    expect(hasErrors(validate(normalise(good)))).toBe(false);
  });

  it("rejects a missing name, a bad address, an unknown type and a short message", () => {
    const errors = validate(normalise({ name: " ", email: "ada@", type: "Something else", message: "Hi" }));
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name", "type"]);
  });

  it("ignores non-string input instead of throwing", () => {
    expect(normalise({ name: 42, email: null, message: ["x"] })).toEqual({ name: "", email: "", company: "", type: "", message: "" });
  });

  it("builds an email a person can read", () => {
    const input = normalise({ ...good, company: "Example Ltd" });
    expect(emailSubject(input)).toBe("Product build — Ada Example, Example Ltd");
    expect(emailBody(input)).toContain("ada@example.com");
  });
});

describe("content integrity", () => {
  it("has unique project slugs", () => {
    expect(new Set(projects.map((project) => project.slug)).size).toBe(projects.length);
  });

  it("only links services and skills to projects that exist", () => {
    const referenced = [...services.flatMap((service) => service.evidence), ...capabilityLayers.flatMap((layer) => layer.evidence)];
    for (const slug of referenced) expect(getProject(slug), slug).toBeDefined();
  });

  it("gives every project a status note, a role note and at least one limitation", () => {
    for (const project of builtInProjects) {
      expect(project.status.note.length, project.slug).toBeGreaterThan(20);
      expect(project.role.note.length, project.slug).toBeGreaterThan(20);
      expect(project.limitations.length, project.slug).toBeGreaterThan(0);
    }
  });

  it("gives every published number a source", () => {
    for (const outcome of builtInProjects.flatMap((project) => project.outcomes)) {
      expect(outcome.source.length, outcome.label).toBeGreaterThan(10);
    }
  });

  it("uses https for every external project link", () => {
    for (const link of projects.flatMap((project) => project.links)) expect(link.href).toMatch(/^https:\/\//);
  });

  it("wraps previous and next around the list", () => {
    expect(adjacentProjects(projects[0].slug).previous.slug).toBe(projects.at(-1)?.slug);
    expect(adjacentProjects(projects.at(-1)!.slug).next.slug).toBe(projects[0].slug);
  });
});

describe("content store", () => {
  it("returns safe defaults for an empty or broken file", () => {
    const store = sanitizeStore(null);
    expect(store.hero.wordOne).toBe("Nexora");
    expect(store.motion).toMatchObject({ reveal: "rise", imageMask: "varied", hero: "full", speed: "normal" });
    expect(store.projects).toEqual([]);
  });

  it("rejects unknown motion values instead of passing them to the site", () => {
    const store = sanitizeStore({ motion: { reveal: "explode", speed: "ludicrous", imageMask: "star", hero: 7 } });
    expect(store.motion).toMatchObject({ reveal: "rise", speed: "normal", imageMask: "varied", hero: "full" });
  });

  it("keeps a valid project and builds its slug from the title", () => {
    const store = sanitizeStore({ projects: [{ title: "My New App!", summary: "A thing.", stack: ["React", 5, ""], surface: "ink" }] });
    expect(store.projects).toHaveLength(1);
    expect(store.projects[0]).toMatchObject({ slug: "my-new-app", stack: ["React"], surface: "ink", statusKind: "development" });
    expect(slugify("  Héllo — World  ")).toBe("hello-world");
  });

  it("drops projects without a title, with a slug that collides, or with an unsafe link or image", () => {
    const store = sanitizeStore(
      {
        projects: [
          { title: "" },
          { title: "Food For Less" },
          { title: "Fine", linkHref: "javascript:alert(1)", image: { src: "https://evil.example/x.png", width: 10, height: 10 } },
          { title: "Fine" },
        ],
      },
      ["food-for-less"],
    );
    expect(store.projects.map((project) => project.slug)).toEqual(["fine"]);
    expect(store.projects[0].links).toEqual([]);
    expect(store.projects[0].images).toEqual([]);
  });

  it("moves an older single link and image into the lists", () => {
    const image = { src: "/shots/app-1.png", width: 1200, height: 800, alt: "A", caption: "B" };
    const [project] = sanitizeStore({ projects: [{ title: "Old", linkLabel: "Site", linkHref: "https://old.example", image }] }).projects;
    expect(project.links).toEqual([{ label: "Site", href: "https://old.example" }]);
    expect(project.images).toEqual([image]);
  });

  it("caps links at four and photos at three, and drops unsafe links", () => {
    const image = (n: number) => ({ src: `/shots/p-${n}.png`, width: 10, height: 10 });
    const [project] = sanitizeStore({
      projects: [
        {
          title: "Many",
          links: [
            { label: "Bad", href: "javascript:alert(1)" },
            ...[1, 2, 3, 4, 5].map((n) => ({ label: `L${n}`, href: `https://${n}.example` })),
          ],
          images: [1, 2, 3, 4].map(image),
        },
      ],
    }).projects;
    expect(project.links.map((link) => link.label)).toEqual(["L1", "L2", "L3", "L4"]);
    expect(project.images.map((item) => item.src)).toEqual(["/shots/p-1.png", "/shots/p-2.png", "/shots/p-3.png"]);
  });

  it("keeps only video addresses the site can play", () => {
    const video = (src: string) => sanitizeStore({ projects: [{ title: "V", video: { src, caption: "Demo" } }] }).projects[0].video;
    expect(video("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({ src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", caption: "Demo" });
    expect(video("/videos/demo-abc.mp4")?.src).toBe("/videos/demo-abc.mp4");
    expect(video("http://example.com/a.mp4")).toBeNull();
    expect(video("/videos/../secret.mp4")).toBeNull();
    expect(video("https://example.com/page")).toBeNull();
  });

  it("keeps social links only when they are https addresses", () => {
    const store = sanitizeStore({ social: { linkedin: " https://www.linkedin.com/in/someone ", github: "javascript:alert(1)", myspace: "https://x" } });
    expect(store.social.linkedin).toBe("https://www.linkedin.com/in/someone");
    expect(store.social.github).toBe("");
    expect(Object.keys(store.social)).not.toContain("myspace");
  });

  it("only hides projects that exist", () => {
    expect(sanitizeStore({ hidden: ["pg-india", "nope"] }, ["pg-india", "food-for-less"]).hidden).toEqual(["pg-india"]);
  });
});

describe("video addresses", () => {
  it("turns share links into embeds", () => {
    expect(videoEmbed("https://youtu.be/dQw4w9WgXcQ")).toEqual({ kind: "iframe", src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" });
    expect(videoEmbed("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toEqual({ kind: "iframe", src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" });
    expect(videoEmbed("https://vimeo.com/76979871")).toEqual({ kind: "iframe", src: "https://player.vimeo.com/video/76979871" });
    expect(videoEmbed("https://www.loom.com/share/0123456789abcdef")).toEqual({ kind: "iframe", src: "https://www.loom.com/embed/0123456789abcdef" });
    expect(videoEmbed("https://cdn.example.com/clip.webm")).toEqual({ kind: "file", src: "https://cdn.example.com/clip.webm" });
  });
});

describe("edits to built-in projects", () => {
  it("keeps an edit only for a project that exists, under that project's own slug", () => {
    const store = sanitizeStore(
      { overrides: { "pg-india": { slug: "something-else", title: "PG Hub", summary: "New summary.", surface: "ink" }, ghost: { title: "Ghost" } } },
      ["pg-india", "food-for-less"],
    );
    expect(Object.keys(store.overrides)).toEqual(["pg-india"]);
    expect(store.overrides["pg-india"]).toMatchObject({ slug: "pg-india", title: "PG Hub", surface: "ink", images: [], video: null });
  });

  it("drops an edit that has no title", () => {
    expect(sanitizeStore({ overrides: { "pg-india": { title: "  " } } }, ["pg-india"]).overrides).toEqual({});
  });

  it("accepts the marketing group", () => {
    expect(sanitizeStore({ projects: [{ title: "SEO", summary: "x", group: "marketing" }] }).projects[0].group).toBe("marketing");
  });
});
