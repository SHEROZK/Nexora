import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { builtInProjects, toStored } from "@/content/projects";
import { sanitizeStore } from "@/content/store";
import { refuse } from "@/lib/adminAuth";
import { publish, supabaseAdmin } from "@/lib/supabase";

/**
 * Reads and writes the panel's content, kept in Supabase (public.site_store, one row).
 *
 * Every request must come from the panel with a valid signed-in session (see lib/adminAuth).
 * A save on the live site triggers a Vercel rebuild, and every build first copies the saved
 * row into src/content/store.json, so the change is live a minute or two later. During local
 * development the file is also written straight away, so the dev server shows it at once.
 */

const FILE = path.join(process.cwd(), "src", "content", "store.json");
const builtInSlugs = builtInProjects.map((project) => project.slug);

const denied = (request: Request) => {
  const refused = refuse(request);
  return refused ? NextResponse.json({ ok: false, code: refused.code, message: refused.message }, { status: refused.status }) : null;
};

const notConfigured = () =>
  NextResponse.json(
    { ok: false, message: "Supabase is not set up. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the environment." },
    { status: 503 },
  );

export async function GET(request: Request) {
  const refused = denied(request);
  if (refused) return refused;
  const supabase = supabaseAdmin();
  if (!supabase) return notConfigured();

  const { data, error } = await supabase.from("site_store").select("data").eq("id", 1).maybeSingle();
  if (error) {
    console.error("admin: could not read the content store", error);
    return NextResponse.json({ ok: false, message: "The saved content could not be loaded from Supabase." }, { status: 502 });
  }
  // Before the first save there is no row yet: start from what the site was built with.
  let saved: unknown = data?.data;
  if (!saved) saved = JSON.parse(await fs.readFile(FILE, "utf8").catch(() => "null"));

  return NextResponse.json({
    ok: true,
    store: sanitizeStore(saved, builtInSlugs),
    // The original case studies as written, in the flat shape the panel edits.
    builtIn: builtInProjects.map(toStored),
    // Their first written screenshot, for the panel's preview. Not editable there.
    covers: Object.fromEntries(builtInProjects.map((project) => [project.slug, project.images[0] ?? null])),
  });
}

export async function PUT(request: Request) {
  const refused = denied(request);
  if (refused) return refused;
  const supabase = supabaseAdmin();
  if (!supabase) return notConfigured();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "The request was not valid JSON." }, { status: 400 });
  }

  // Whatever arrives is rebuilt into a valid store, so a bad save cannot break the site.
  const store = sanitizeStore(body, builtInSlugs);
  const { error } = await supabase.from("site_store").upsert({ id: 1, data: store, updated_at: new Date().toISOString() });
  if (error) {
    console.error("admin: could not save the content store", error);
    return NextResponse.json({ ok: false, message: "The changes could not be saved to Supabase." }, { status: 502 });
  }

  if (process.env.NODE_ENV === "development") {
    await fs.writeFile(FILE, `${JSON.stringify(store, null, 2)}\n`, "utf8").catch((problem) => console.error("admin: could not mirror the store locally", problem));
  }

  let published = false;
  try {
    published = await publish();
  } catch (problem) {
    console.error("admin: the deploy hook failed", problem);
    return NextResponse.json({ ok: true, store, published: false, message: "Saved, but the site could not be rebuilt. Save again, or redeploy from Vercel." });
  }
  return NextResponse.json({ ok: true, store, published });
}
