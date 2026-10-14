import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { builtInProjects, toStored } from "@/content/projects";
import { sanitizeStore } from "@/content/store";
import { refuse } from "@/lib/adminAuth";

/**
 * Reads and writes src/content/store.json for the admin panel.
 *
 * Every request must come from the panel, on a local development server, with a valid
 * signed-in session (see lib/adminAuth). A deployed site has a read-only file system,
 * so there the panel is switched off: you edit locally, then commit and deploy the file.
 */

const FILE = path.join(process.cwd(), "src", "content", "store.json");
const builtInSlugs = builtInProjects.map((project) => project.slug);

const denied = (request: Request) => {
  const refused = refuse(request);
  return refused ? NextResponse.json({ ok: false, code: refused.code, message: refused.message }, { status: refused.status }) : null;
};

async function readStore() {
  try {
    return sanitizeStore(JSON.parse(await fs.readFile(FILE, "utf8")), builtInSlugs);
  } catch {
    return sanitizeStore(null, builtInSlugs);
  }
}

export async function GET(request: Request) {
  const refused = denied(request);
  if (refused) return refused;
  return NextResponse.json({
    ok: true,
    store: await readStore(),
    // The original case studies as written, in the flat shape the panel edits.
    builtIn: builtInProjects.map(toStored),
  });
}

export async function PUT(request: Request) {
  const refused = denied(request);
  if (refused) return refused;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "The request was not valid JSON." }, { status: 400 });
  }

  // Whatever arrives is rebuilt into a valid store, so a bad save cannot break the site.
  const store = sanitizeStore(body, builtInSlugs);
  try {
    await fs.writeFile(FILE, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  } catch (error) {
    console.error("admin: could not write the content store", error);
    return NextResponse.json({ ok: false, message: "The file could not be written. Check that src/content/store.json is not read-only." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, store });
}
