import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { slugify } from "@/content/store";
import { refuse } from "@/lib/adminAuth";

/**
 * Saves a project image chosen in the admin panel into public/shots.
 * Signed-in panel requests only, like the rest of the panel. The file type is decided
 * from the bytes themselves, never from the name or the browser's claim.
 */

const MAX_BYTES = 6 * 1024 * 1024;
const DIRECTORY = path.join(process.cwd(), "public", "shots");

function detect(bytes: Uint8Array): "png" | "jpg" | "webp" | null {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  const tag = (from: number) => String.fromCharCode(...bytes.slice(from, from + 4));
  if (tag(0) === "RIFF" && tag(8) === "WEBP") return "webp";
  return null;
}

export async function POST(request: Request) {
  const refused = refuse(request);
  if (refused) return NextResponse.json({ ok: false, code: refused.code, message: refused.message }, { status: refused.status });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, message: "No file was received." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "No file was received." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, message: "That image is over 6 MB. Export a smaller one and try again." }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const extension = detect(bytes);
  if (!extension) {
    return NextResponse.json({ ok: false, message: "Use a PNG, JPG or WebP image." }, { status: 415 });
  }

  const base = slugify(String(form.get("name") ?? "")) || "project";
  const name = `${base}-${Date.now().toString(36)}.${extension}`;
  try {
    await fs.mkdir(DIRECTORY, { recursive: true });
    await fs.writeFile(path.join(DIRECTORY, name), bytes);
  } catch (error) {
    console.error("admin: could not save the upload", error);
    return NextResponse.json({ ok: false, message: "The image could not be saved to public/shots." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, src: `/shots/${name}` });
}
