import { NextResponse } from "next/server";
import { slugify } from "@/content/store";
import { refuse } from "@/lib/adminAuth";
import { MEDIA_BUCKET, supabaseAdmin } from "@/lib/supabase";

/**
 * Uploads from the admin panel go to Supabase Storage in two steps, because a Vercel function
 * cannot receive a body over 4.5 MB:
 *
 *   POST  asks for a signed upload address; the browser then sends the file straight to it.
 *   PUT   checks the uploaded file. Its type is decided from the bytes themselves, never from
 *         the name or the browser's claim, and a file that is not what it says is deleted.
 *
 * Photos go into media/shots, videos into media/videos. Signed-in panel requests only.
 */

const KINDS = {
  image: { maxBytes: 6 * 1024 * 1024, directory: "shots", tooBig: "That image is over 6 MB. Export a smaller one and try again.", wrongType: "Use a PNG, JPG or WebP image." },
  video: { maxBytes: 50 * 1024 * 1024, directory: "videos", tooBig: "That video is over 50 MB. Export a shorter or smaller one, or paste a YouTube, Vimeo or Loom link instead.", wrongType: "Use an MP4 or WebM video." },
} as const;

const EXTENSIONS: Record<string, { kind: keyof typeof KINDS; extension: string }> = {
  "image/png": { kind: "image", extension: "png" },
  "image/jpeg": { kind: "image", extension: "jpg" },
  "image/webp": { kind: "image", extension: "webp" },
  "video/mp4": { kind: "video", extension: "mp4" },
  "video/webm": { kind: "video", extension: "webm" },
};

const PATH = /^(shots|videos)\/[a-z0-9-]+\.(png|jpg|webp|mp4|webm)$/;

function detect(bytes: Uint8Array): { kind: keyof typeof KINDS; extension: string } | null {
  const tag = (from: number) => String.fromCharCode(...bytes.slice(from, from + 4));
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { kind: "image", extension: "png" };
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { kind: "image", extension: "jpg" };
  if (tag(0) === "RIFF" && tag(8) === "WEBP") return { kind: "image", extension: "webp" };
  if (tag(4) === "ftyp") return { kind: "video", extension: "mp4" };
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return { kind: "video", extension: "webm" };
  return null;
}

const fail = (message: string, status: number) => NextResponse.json({ ok: false, message }, { status });

async function readJson(request: Request) {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const refused = refuse(request);
  if (refused) return NextResponse.json({ ok: false, code: refused.code, message: refused.message }, { status: refused.status });
  const supabase = supabaseAdmin();
  if (!supabase) return fail("Supabase is not set up, so files cannot be uploaded.", 503);

  const body = await readJson(request);
  if (!body) return fail("No file was described.", 400);
  const wanted = body.kind === "video" ? KINDS.video : KINDS.image;
  const size = Number(body.size);
  if (!(size > 0)) return fail("That file is empty.", 400);
  if (size > wanted.maxBytes) return fail(wanted.tooBig, 413);
  const claimed = EXTENSIONS[String(body.type)];
  if (!claimed || KINDS[claimed.kind] !== wanted) return fail(wanted.wrongType, 415);

  const base = slugify(String(body.name ?? "")) || "project";
  const path = `${wanted.directory}/${base}-${Date.now().toString(36)}.${claimed.extension}`;
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    console.error("admin: could not create an upload address", error);
    return fail("Supabase did not accept the upload. Try again.", 502);
  }
  return NextResponse.json({ ok: true, path, uploadUrl: data.signedUrl });
}

export async function PUT(request: Request) {
  const refused = refuse(request);
  if (refused) return NextResponse.json({ ok: false, code: refused.code, message: refused.message }, { status: refused.status });
  const supabase = supabaseAdmin();
  if (!supabase) return fail("Supabase is not set up, so files cannot be uploaded.", 503);

  const body = await readJson(request);
  const path = String(body?.path ?? "");
  if (!PATH.test(path)) return fail("That upload could not be found.", 400);
  const wanted = path.startsWith("videos/") ? KINDS.video : KINDS.image;
  const bucket = supabase.storage.from(MEDIA_BUCKET);
  const src = bucket.getPublicUrl(path).data.publicUrl;

  let bytes = new Uint8Array();
  try {
    const response = await fetch(src, { headers: { Range: "bytes=0-15" }, cache: "no-store" });
    if (response.ok) bytes = new Uint8Array(await response.arrayBuffer()).slice(0, 16);
  } catch (error) {
    console.error("admin: could not read back the upload", error);
  }
  const found = detect(bytes);
  if (!found || KINDS[found.kind] !== wanted || !path.endsWith(`.${found.extension}`)) {
    await bucket.remove([path]);
    return fail(wanted.wrongType, 415);
  }
  return NextResponse.json({ ok: true, src });
}
