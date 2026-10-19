"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpRight, Check, Eye, EyeOff, LoaderCircle, LogOut, Pencil, Plus, RotateCcw, Trash2, Upload } from "lucide-react";
import {
  HERO_MODES,
  MASKS,
  MAX_IMAGES,
  MAX_LINKS,
  MEDIA_URL,
  MOTION_HELP,
  REVEALS,
  SOCIALS,
  SPEEDS,
  slugify,
  type MotionSettings,
  type Store,
  type StoredImage,
  type StoredLink,
  type StoredProject,
} from "@/content/store";
import { cn } from "@/lib/cn";
import { videoEmbed } from "@/lib/video";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { ProjectPreview } from "./ProjectPreview";

type Tab = "projects" | "text" | "social" | "motion";
type Gate = "loading" | "signed-out" | "no-password" | "error" | "ready";
type Notice = { kind: "idle" } | { kind: "saving" } | { kind: "saved"; message: string } | { kind: "error"; message: string };
/** What the form is editing: a new project, one you added, or one of the originals. */
type Draft = { mode: "new" | "custom" | "builtIn"; slug: string | null; project: StoredProject };

const HEADERS = { "x-site-panel": "1" };
const isUploadedVideo = (src: string | undefined) => Boolean(src && (src.startsWith("/videos/") || src.startsWith(`${MEDIA_URL}/videos/`)));

/**
 * Saving rewrites the content file, and the dev server reloads the page when that file
 * changes. So the panel keeps its place (tab, chosen project, any open form) in
 * sessionStorage and picks it up again after the reload.
 */
const UI_KEY = "site-panel-ui";
type PanelUi = { tab: Tab; selected: string | null; draft: Draft | null };

function readUi(): PanelUi {
  const fallback: PanelUi = { tab: "projects", selected: null, draft: null };
  if (typeof window === "undefined") return fallback;
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(UI_KEY) ?? "null") as Partial<PanelUi> | null;
    if (!saved) return fallback;
    return {
      tab: saved.tab === "text" || saved.tab === "social" || saved.tab === "motion" ? saved.tab : "projects",
      selected: typeof saved.selected === "string" ? saved.selected : null,
      // A form remembered from before photos and links became lists is dropped rather than half-restored.
      draft: saved.draft && typeof saved.draft === "object" && Array.isArray(saved.draft.project?.links) && Array.isArray(saved.draft.project?.images) ? saved.draft : null,
    };
  } catch {
    return fallback;
  }
}

const blank: StoredProject = {
  slug: "",
  title: "",
  category: "",
  summary: "",
  group: "product",
  featured: false,
  year: String(new Date().getFullYear()),
  statusKind: "development",
  statusLabel: "",
  statusNote: "",
  roleTitle: "",
  roleNote: "",
  stack: [],
  surface: "paper",
  links: [],
  overview: [],
  points: [],
  images: [],
  video: null,
};

const SURFACES: { id: StoredProject["surface"]; label: string }[] = [
  { id: "paper", label: "Paper" },
  { id: "ink", label: "Charcoal" },
  { id: "cobalt", label: "Navy" },
  { id: "yellow", label: "Sand" },
  { id: "red", label: "Clay" },
];

const field = "mt-2 w-full border-2 border-fg bg-transparent px-3.5 text-[1rem] outline-none focus:border-accent";
const rowButton = "flex min-h-11 items-center gap-2 border-2 border-fg px-4 text-[0.9375rem] font-semibold transition-colors hover:bg-fg hover:text-surface";

function Field({ label, hint, children }: { label: string; hint?: string; children: (id: string) => React.ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-[0.9375rem] font-semibold">
        {label}
      </label>
      {children(id)}
      {hint ? <p className="mt-2 text-[0.8125rem] leading-relaxed text-fg-3">{hint}</p> : null}
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (value: boolean) => void; label: string; hint?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3.5 border-b border-line py-5">
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 size-5 shrink-0 accent-[var(--accent)]" />
      <label htmlFor={id}>
        <span className="block font-semibold">{label}</span>
        {hint ? <span className="mt-1 block text-[0.875rem] leading-relaxed text-fg-2">{hint}</span> : null}
      </label>
    </div>
  );
}

/** The sign-in screen. The password is ADMIN_PASSWORD from .env.local. */
function SignIn({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { ...HEADERS, "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const body = await response.json();
      if (response.ok && body.ok) onDone();
      else setError(body.message ?? "Sign-in failed.");
    } catch {
      setError("The server did not answer. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shell flex min-h-[80svh] flex-col justify-center py-[calc(var(--spacing-header)+3rem)]">
      <form onSubmit={submit} className="w-full max-w-md">
        <h1 className="t-display">Site panel</h1>
        <p className="mt-4 leading-relaxed text-fg-2">Enter the panel password to manage projects, text and motion.</p>
        <div className="mt-8">
          <Field label="Password">
            {(id) => (
              <input id={id} type="password" autoComplete="current-password" autoFocus required value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={Boolean(error)} className={cn(field, "h-12")} />
            )}
          </Field>
        </div>
        <p role="alert" className="mt-3 min-h-6 font-semibold text-refuse">
          {error}
        </p>
        <button type="submit" disabled={busy || !password} className="btn btn-primary mt-3">
          {busy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
          Sign in
        </button>
      </form>
    </div>
  );
}

/** The project form, used for a new project, one you added, and edits to the originals. */
function ProjectForm({ draft, taken, onChange, onCommit, onCancel, onReset }: {
  draft: Draft;
  taken: (slug: string) => boolean;
  onChange: (project: StoredProject) => void;
  onCommit: (project: StoredProject) => void;
  onCancel: () => void;
  onReset?: () => void;
}) {
  const p = draft.project;
  const set = (patch: Partial<StoredProject>) => onChange({ ...p, ...patch });
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);
  const address = draft.slug ?? slugify(p.title);

  const commit = () => {
    const title = p.title.trim();
    if (!title) return setError("Give the project a name.");
    if (!address) return setError("The name needs at least one letter or number.");
    if (draft.mode === "new" && taken(address)) return setError(`A project with the address /work/${address} already exists. Use a different name.`);
    if (!p.summary.trim()) return setError("Add a one-sentence summary. It is shown on the home page and in the work list.");
    const links = p.links.map((link) => ({ label: link.label.trim(), href: link.href.trim() })).filter((link) => link.label || link.href);
    if (links.some((link) => !/^https:\/\/\S+$/.test(link.href))) return setError("Every live link needs an address that starts with https://");
    if (p.video && !videoEmbed(p.video.src)) return setError("The video has to be a YouTube, Vimeo or Loom link, an https link to an MP4 or WebM file, or an uploaded file.");
    onCommit({
      ...p,
      title,
      slug: address,
      stack: p.stack.map((item) => item.trim()).filter(Boolean),
      overview: p.overview.map((item) => item.trim()).filter(Boolean),
      points: p.points.map((item) => item.trim()).filter(Boolean),
      links,
      video: p.video ? { src: p.video.src.trim(), caption: p.video.caption.trim() } : null,
    });
  };

  // Ask the server for an upload address, send the file straight to Supabase, then have the server check it.
  const send = async (file: File, kind: "image" | "video") => {
    const json = { ...HEADERS, "Content-Type": "application/json" };
    const ask = await fetch("/api/admin/upload", {
      method: "POST",
      headers: json,
      body: JSON.stringify({ kind, name: p.title || "project", type: file.type, size: file.size }),
    });
    const slot = await ask.json();
    if (!ask.ok || !slot.ok) throw new Error(slot.message ?? `The ${kind} could not be uploaded.`);

    const sent = await fetch(slot.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type, "cache-control": "max-age=31536000", apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "" },
      body: file,
    });
    if (!sent.ok) throw new Error(`The ${kind} could not be sent to storage. Try again.`);

    const check = await fetch("/api/admin/upload", { method: "PUT", headers: json, body: JSON.stringify({ path: slot.path }) });
    const body = await check.json();
    if (!check.ok || !body.ok) throw new Error(body.message ?? `The ${kind} could not be uploaded.`);
    return body.src as string;
  };

  const uploadImage = async (file: File) => {
    setUploading("image");
    setError(null);
    try {
      const bitmap = await createImageBitmap(file).catch(() => {
        throw new Error("That file could not be read as an image. Use a PNG, JPG or WebP.");
      });
      const { width, height } = bitmap;
      bitmap.close();
      const src = await send(file, "image");
      set({ images: [...p.images, { src, width, height, alt: "", caption: "" }].slice(0, MAX_IMAGES) });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The image could not be uploaded.");
    } finally {
      setUploading(null);
    }
  };

  const uploadVideo = async (file: File) => {
    setUploading("video");
    setError(null);
    try {
      const src = await send(file, "video");
      set({ video: { src, caption: p.video?.caption ?? "" } });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The video could not be uploaded.");
    } finally {
      setUploading(null);
    }
  };

  const setImage = (index: number, patch: Partial<StoredImage>) => set({ images: p.images.map((image, i) => (i === index ? { ...image, ...patch } : image)) });
  const moveImage = (index: number, by: -1 | 1) => {
    const images = [...p.images];
    [images[index], images[index + by]] = [images[index + by], images[index]];
    set({ images });
  };
  const setLink = (index: number, patch: Partial<StoredLink>) => set({ links: p.links.map((link, i) => (i === index ? { ...link, ...patch } : link)) });

  return (
    <section aria-labelledby="form-heading">
      <h2 id="form-heading" className="t-title">
        {draft.mode === "new" ? "New project" : `Edit ${p.title || "project"}`}
      </h2>
      {draft.mode === "builtIn" ? (
        <p className="mt-3 leading-relaxed text-fg-2">
          This is one of the original case studies. What you change here replaces its name, summary, status and the other
          details below. Its long written sections stay as they are.
        </p>
      ) : null}

      <div className="mt-7 grid gap-x-6 gap-y-7 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Name" hint={address ? `Address: /work/${address}` : undefined}>
            {(id) => <input id={id} value={p.title} maxLength={60} onChange={(e) => set({ title: e.target.value })} className={cn(field, "h-12")} />}
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="What kind of thing it is" hint="For example: Booking system for a dental clinic">
            {(id) => <input id={id} value={p.category} maxLength={90} onChange={(e) => set({ category: e.target.value })} className={cn(field, "h-12")} />}
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="One-sentence summary">
            {(id) => <textarea id={id} rows={3} value={p.summary} maxLength={260} onChange={(e) => set({ summary: e.target.value })} className={cn(field, "py-3 leading-relaxed")} />}
          </Field>
        </div>
        <Field label="Status">
          {(id) => (
            <select id={id} value={p.statusKind} onChange={(e) => set({ statusKind: e.target.value as StoredProject["statusKind"], statusLabel: "" })} className={cn(field, "h-12 bg-surface")}>
              <option value="live">Live</option>
              <option value="development">In development</option>
              <option value="experiment">Experiment</option>
            </select>
          )}
        </Field>
        <Field label="Status wording (optional)" hint="Replaces the default, for example: Live, access-gated">
          {(id) => <input id={id} value={p.statusLabel} maxLength={40} onChange={(e) => set({ statusLabel: e.target.value })} className={cn(field, "h-12")} />}
        </Field>
        <Field label="Your role" hint="For example: Sole developer">
          {(id) => <input id={id} value={p.roleTitle} maxLength={60} onChange={(e) => set({ roleTitle: e.target.value })} className={cn(field, "h-12")} />}
        </Field>
        <Field label="Year">
          {(id) => <input id={id} value={p.year} maxLength={20} onChange={(e) => set({ year: e.target.value })} className={cn(field, "h-12")} />}
        </Field>
        <div className="sm:col-span-2">
          <Field label="Group in the work list">
            {(id) => (
              <select id={id} value={p.group} onChange={(e) => set({ group: e.target.value as StoredProject["group"] })} className={cn(field, "h-12 bg-surface")}>
                <option value="product">Products</option>
                <option value="ai">AI and generative</option>
                <option value="website">Client websites</option>
                <option value="marketing">Marketing and content</option>
              </select>
            )}
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Built with" hint="Separate with commas: React, Node.js, PostgreSQL">
            {(id) => <input id={id} value={p.stack.join(", ")} onChange={(e) => set({ stack: e.target.value.split(",").map((item) => item.trimStart()) })} className={cn(field, "h-12")} />}
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="What it is" hint="A blank line starts a new paragraph. Say only what is true of it today.">
            {(id) => <textarea id={id} rows={6} value={p.overview.join("\n\n")} onChange={(e) => set({ overview: e.target.value.split(/\n\s*\n/) })} className={cn(field, "py-3 leading-relaxed")} />}
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="What you did" hint="One line each.">
            {(id) => <textarea id={id} rows={5} value={p.points.join("\n")} onChange={(e) => set({ points: e.target.value.split("\n") })} className={cn(field, "py-3 leading-relaxed")} />}
          </Field>
        </div>
        <fieldset className="sm:col-span-2">
          <legend className="text-[0.9375rem] font-semibold">Live links (optional)</legend>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-fg-3">
            Up to {MAX_LINKS}: the live site, an app store page, a demo. Each must start with https://. Leave the label empty to show the
            site&rsquo;s address.
          </p>
          <ul className="mt-3 space-y-3">
            {p.links.map((link, i) => (
              <li key={i} className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_auto] sm:items-end">
                <Field label={`Label ${i + 1}`}>
                  {(id) => <input id={id} value={link.label} maxLength={60} placeholder="Live site" onChange={(e) => setLink(i, { label: e.target.value })} className={cn(field, "h-12")} />}
                </Field>
                <Field label={`Address ${i + 1}`}>
                  {(id) => <input id={id} type="url" value={link.href} maxLength={300} placeholder="https://" onChange={(e) => setLink(i, { href: e.target.value })} className={cn(field, "h-12")} />}
                </Field>
                <button type="button" onClick={() => set({ links: p.links.filter((_, j) => j !== i) })} className={cn(rowButton, "h-12 justify-center")} aria-label={`Remove link ${i + 1}`}>
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          {p.links.length < MAX_LINKS ? (
            <button type="button" onClick={() => set({ links: [...p.links, { label: "", href: "" }] })} className={cn(rowButton, "mt-3")}>
              <Plus className="size-4" aria-hidden="true" />
              Add a link
            </button>
          ) : null}
        </fieldset>

        <fieldset className="sm:col-span-2">
          <legend className="text-[0.9375rem] font-semibold">Colour of its page</legend>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {SURFACES.map((surface) => (
              <label key={surface.id} data-surface={surface.id} className={cn("flex min-h-11 cursor-pointer items-center border-2 px-4 font-semibold", p.surface === surface.id ? "border-ink outline outline-2 outline-offset-2 outline-ink" : "border-ink/40")}>
                <input type="radio" name="surface" value={surface.id} checked={p.surface === surface.id} onChange={() => set({ surface: surface.id })} className="sr-only" />
                {surface.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="sm:col-span-2">
          <legend className="text-[0.9375rem] font-semibold">Photos (optional)</legend>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-fg-3">
            Up to {MAX_IMAGES}. PNG, JPG or WebP, up to 6 MB each.{" "}
            {draft.mode === "builtIn"
              ? "They are shown after the screenshots already written into this case study."
              : "Without any, the project gets a title plate."}
          </p>
          <ol className="mt-3 space-y-5">
            {p.images.map((image, i) => (
              <li key={image.src} className="grid gap-4 border-2 border-fg p-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- a panel preview of a local file */}
                <img src={image.src} alt="" className="aspect-[4/3] w-full border border-line bg-paper object-cover object-top" />
                <div className="grid gap-4">
                  <Field label={`Describe photo ${i + 1}`} hint="Read aloud by screen readers.">
                    {(id) => <input id={id} value={image.alt} maxLength={200} onChange={(e) => setImage(i, { alt: e.target.value })} className={cn(field, "h-12")} />}
                  </Field>
                  <Field label="Caption" hint="What it shows and when it was taken.">
                    {(id) => <input id={id} value={image.caption} maxLength={240} onChange={(e) => setImage(i, { caption: e.target.value })} className={cn(field, "h-12")} />}
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    {i > 0 ? (
                      <button type="button" onClick={() => moveImage(i, -1)} className={rowButton} aria-label={`Move photo ${i + 1} up`}>
                        <ArrowUp className="size-4" aria-hidden="true" />
                        Earlier
                      </button>
                    ) : null}
                    {i < p.images.length - 1 ? (
                      <button type="button" onClick={() => moveImage(i, 1)} className={rowButton} aria-label={`Move photo ${i + 1} down`}>
                        <ArrowDown className="size-4" aria-hidden="true" />
                        Later
                      </button>
                    ) : null}
                    <button type="button" onClick={() => set({ images: p.images.filter((_, j) => j !== i) })} className={cn(rowButton, "text-refuse")}>
                      <Trash2 className="size-4" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          {p.images.length < MAX_IMAGES ? (
            <label className={cn("btn btn-ghost mt-4 cursor-pointer", uploading && "pointer-events-none opacity-60")}>
              {uploading === "image" ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
              Add a photo ({p.images.length} of {MAX_IMAGES})
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) uploadImage(file);
                }}
              />
            </label>
          ) : null}
        </fieldset>

        <fieldset className="sm:col-span-2">
          <legend className="text-[0.9375rem] font-semibold">Video (optional)</legend>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-fg-3">
            One video. Paste a YouTube, Vimeo or Loom link, or upload an MP4 or WebM up to 50 MB. A link keeps the site light; an upload is
            stored with the site.
          </p>
          <div className="mt-3 grid gap-4">
            <Field label="Video link or uploaded file">
              {(id) => (
                <input
                  id={id}
                  value={p.video?.src ?? ""}
                  maxLength={300}
                  placeholder="https://www.youtube.com/watch?v=…"
                  onChange={(e) => set({ video: e.target.value ? { src: e.target.value, caption: p.video?.caption ?? "" } : null })}
                  aria-invalid={Boolean(p.video?.src && !videoEmbed(p.video.src))}
                  className={cn(field, "h-12")}
                />
              )}
            </Field>
            {p.video?.src && !videoEmbed(p.video.src) ? (
              <p className="text-[0.8125rem] font-semibold text-refuse">Not a link the site can play yet. Use a YouTube, Vimeo or Loom link, or an https link ending in .mp4 or .webm.</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-4">
              <label className={cn("btn btn-ghost cursor-pointer", uploading && "pointer-events-none opacity-60")}>
                {uploading === "video" ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
                {isUploadedVideo(p.video?.src) ? "Replace the uploaded video" : "Upload a video file"}
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) uploadVideo(file);
                  }}
                />
              </label>
              {p.video ? (
                <button type="button" onClick={() => set({ video: null })} className="link text-[0.9375rem]">
                  Remove video
                </button>
              ) : null}
            </div>
            {p.video ? (
              <Field label="Video caption" hint="What it shows, for example: A two-minute walkthrough of the owner dashboard.">
                {(id) => <input id={id} value={p.video?.caption ?? ""} maxLength={240} onChange={(e) => p.video && set({ video: { ...p.video, caption: e.target.value } })} className={cn(field, "h-12")} />}
              </Field>
            ) : null}
          </div>
        </fieldset>

        <div className="sm:col-span-2">
          <Toggle checked={p.featured} onChange={(value) => set({ featured: value })} label="Feature on the home page" hint="Gives it a full-width spread on the home page. Otherwise it appears in the work list only." />
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-[0.9375rem] font-semibold">Preview</h3>
        <p className="mt-1 text-[0.875rem] text-fg-2">This updates as you type. Nothing is on the site until you add it and save.</p>
        <div className="mt-4">
          <ProjectPreview project={p} />
        </div>
      </div>

      <p role="alert" className="mt-6 min-h-6 font-semibold text-refuse">
        {error}
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        <button type="button" onClick={commit} className="btn btn-primary">
          <Check aria-hidden="true" />
          {draft.mode === "new" ? "Add to the list" : "Apply changes"}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancel
        </button>
        {onReset ? (
          <button type="button" onClick={onReset} className="btn btn-ghost">
            <RotateCcw aria-hidden="true" />
            Reset to original
          </button>
        ) : null}
      </div>
    </section>
  );
}

/**
 * The site panel. Loads the content store, lets you change it, and saves it to Supabase
 * through /api/admin, which rebuilds the live site. Nothing is saved until "Save changes".
 */
export function AdminPanel() {
  const [gate, setGate] = useState<Gate>("loading");
  const [gateMessage, setGateMessage] = useState("");
  const [store, setStore] = useState<Store | null>(null);
  const [builtIn, setBuiltIn] = useState<StoredProject[]>([]);
  const [covers, setCovers] = useState<Record<string, StoredImage | null>>({});
  const [remembered] = useState(readUi);
  const [tab, setTab] = useState<Tab>(remembered.tab);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState<Notice>({ kind: "idle" });
  const [selected, setSelected] = useState<string | null>(remembered.selected);
  const [draft, setDraft] = useState<Draft | null>(remembered.draft);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(UI_KEY, JSON.stringify({ tab, selected, draft }));
    } catch {
      // Private windows can refuse storage. The panel still works; it just forgets its place on reload.
    }
  }, [tab, selected, draft]);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin", { headers: HEADERS });
      const body = await response.json();
      if (response.ok && body.ok) {
        setStore(body.store);
        setBuiltIn(body.builtIn);
        setCovers(body.covers ?? {});
        setGate("ready");
      } else if (body.code === "signed_out") setGate("signed-out");
      else if (body.code === "no_password") setGate("no-password");
      else {
        setGateMessage(body.message ?? "The panel could not load the saved content.");
        setGate("error");
      }
    } catch {
      setGateMessage("The panel could not reach the server. Check your connection and reload.");
      setGate("error");
    }
  }, []);

  useEffect(() => {
    // The first load: nothing is set synchronously, state only changes when the request answers.
    const first = window.setTimeout(load, 0);
    return () => window.clearTimeout(first);
  }, [load]);

  // Warn before leaving with unsaved work.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (gate === "loading") {
    return (
      <div className="shell flex items-center gap-3 py-[calc(var(--spacing-header)+5rem)] text-fg-2">
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        Loading the panel
      </div>
    );
  }
  if (gate === "signed-out") return <SignIn onDone={load} />;
  if (gate === "no-password") {
    return (
      <div className="shell py-[calc(var(--spacing-header)+5rem)]">
        <h1 className="t-display max-w-[18ch]">Set a panel password first</h1>
        <p className="t-lead mt-6 max-w-[56ch] text-fg-2">
          Add a line like <code className="font-mono text-[0.9em]">ADMIN_PASSWORD=your-password</code> (at least 8 characters) to the file{" "}
          <code className="font-mono text-[0.9em]">.env.local</code> in the project folder, then reload this page. On the live site, add it
          under Environment Variables in the Vercel project settings and redeploy.
        </p>
      </div>
    );
  }
  if (gate === "error" || !store) {
    return (
      <div className="shell py-[calc(var(--spacing-header)+5rem)]">
        <h1 className="t-display">The panel could not start</h1>
        <p className="t-lead mt-6 max-w-[52ch] text-refuse">{gateMessage}</p>
      </div>
    );
  }

  const change = (next: Store) => {
    setStore(next);
    setDirty(true);
    setNotice({ kind: "idle" });
  };
  const setMotion = <K extends keyof MotionSettings>(key: K, value: MotionSettings[K]) => change({ ...store, motion: { ...store.motion, [key]: value } });

  const save = async () => {
    setNotice({ kind: "saving" });
    try {
      const response = await fetch("/api/admin", { method: "PUT", headers: { ...HEADERS, "Content-Type": "application/json" }, body: JSON.stringify(store) });
      const body = await response.json();
      if (response.status === 401) return setGate("signed-out");
      if (!response.ok || !body.ok) return setNotice({ kind: "error", message: body.message ?? "The changes could not be saved." });
      setStore(body.store);
      setDirty(false);
      setNotice({
        kind: "saved",
        message: body.message ?? (body.published ? "Saved. The live site is rebuilding and will show the changes in a minute or two." : "Saved."),
      });
    } catch {
      setNotice({ kind: "error", message: "The server did not answer. Your changes are still here; try saving again." });
    }
  };

  const signOut = async () => {
    await fetch("/api/admin/session", { method: "DELETE", headers: HEADERS }).catch(() => undefined);
    setGate("signed-out");
  };

  // Every project the panel knows about, with the edits made so far applied.
  const rows = [
    ...builtIn.map((original) => ({
      kind: "builtIn" as const,
      slug: original.slug,
      project: store.overrides[original.slug] ?? original,
      hidden: store.hidden.includes(original.slug),
      edited: Boolean(store.overrides[original.slug]),
    })),
    ...store.projects.map((project) => ({ kind: "custom" as const, slug: project.slug, project, hidden: false, edited: false })),
  ];
  const current = rows.find((row) => row.slug === selected) ?? rows[0];
  const taken = (slug: string) => rows.some((row) => row.slug === slug);

  const commit = (project: StoredProject) => {
    if (!draft) return;
    if (draft.mode === "new") change({ ...store, projects: [...store.projects, project] });
    else if (draft.mode === "custom") change({ ...store, projects: store.projects.map((p) => (p.slug === draft.slug ? project : p)) });
    else change({ ...store, overrides: { ...store.overrides, [project.slug]: project } });
    setSelected(project.slug);
    setDraft(null);
  };
  const resetOverride = (slug: string) => {
    const overrides = { ...store.overrides };
    delete overrides[slug];
    change({ ...store, overrides });
    setDraft(null);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "projects", label: "Projects" },
    { id: "text", label: "Hero and about" },
    { id: "social", label: "Social links" },
    { id: "motion", label: "Motion" },
  ];
  const socialProfiles = SOCIALS.filter(({ id }) => /^https:\/\/\S+$/.test(store.social[id])).map(({ id, label }) => ({ id, label, href: store.social[id] }));

  return (
    <div className="pb-36 pt-[var(--spacing-header)]">
      <div className="shell border-b-2 border-fg pb-10 pt-12">
        <h1 className="t-display">Site panel</h1>
        <p className="mt-4 max-w-[64ch] leading-relaxed text-fg-2">
          Changes are saved to the site&apos;s database when you press Save, and the live site rebuilds itself with them,
          which takes a minute or two.
        </p>
        <div role="tablist" aria-label="Panel sections" className="mt-9 flex flex-wrap gap-2.5">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`panel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={cn("min-h-11 border-2 border-fg px-5 font-semibold transition-colors", tab === item.id ? "bg-fg text-surface" : "hover:bg-fg hover:text-surface")}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------------- projects */}
      {tab === "projects" ? (
        <div role="tabpanel" id="panel-projects" aria-labelledby="tab-projects" className="shell grid gap-x-14 gap-y-14 pt-12 lg:grid-cols-12">
          <section className="lg:col-span-5" aria-labelledby="list-heading">
            <h2 id="list-heading" className="t-title">
              On the site
            </h2>
            <p className="mt-3 leading-relaxed text-fg-2">Choose a project to see how it looks, edit it or take it off the site.</p>
            <ul className="mt-6 border-t-2 border-fg">
              {rows.map((row) => {
                const active = !draft && row.slug === current?.slug;
                return (
                  <li key={row.slug} className="border-b border-line">
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setSelected(row.slug);
                        setDraft(null);
                      }}
                      className={cn("grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 text-left transition-colors", active ? "bg-fg text-surface" : "hover:bg-surface-2", row.hidden && !active && "opacity-50")}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{row.project.title}</span>
                        <span className="t-data mt-1 block truncate opacity-75">
                          {row.hidden ? "Removed" : row.project.statusLabel || row.project.statusKind}
                          {row.project.featured && !row.hidden ? " · home page" : ""}
                          {row.kind === "custom" ? " · added here" : row.edited ? " · edited" : ""}
                        </span>
                      </span>
                      <span data-surface={row.project.surface} className="size-5 shrink-0 border-2 border-current" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <button type="button" onClick={() => setDraft({ mode: "new", slug: null, project: blank })} className="btn btn-primary mt-7">
              <Plus aria-hidden="true" />
              Add a project
            </button>
          </section>

          <div className="lg:col-span-7">
            {draft ? (
              <ProjectForm
                key={`${draft.mode}-${draft.slug ?? "new"}`}
                draft={draft}
                taken={taken}
                onChange={(project) => setDraft({ ...draft, project })}
                onCommit={commit}
                onCancel={() => setDraft(null)}
                onReset={draft.mode === "builtIn" && draft.slug && store.overrides[draft.slug] ? () => resetOverride(draft.slug as string) : undefined}
              />
            ) : current ? (
              <section aria-labelledby="preview-heading" className="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)]">
                <h2 id="preview-heading" className="t-title">
                  {current.project.title}
                </h2>
                <p className="mt-3 leading-relaxed text-fg-2">
                  {current.hidden
                    ? "This project is removed from the site. Put it back to show it again."
                    : current.kind === "custom"
                      ? "A project you added here."
                      : current.edited
                        ? "One of the original case studies, with your edits."
                        : "One of the original case studies."}
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <button type="button" aria-label={`Edit ${current.project.title}`} onClick={() => setDraft({ mode: current.kind, slug: current.slug, project: current.project })} className={rowButton}>
                    <Pencil className="size-4" aria-hidden="true" />
                    Edit
                  </button>
                  {current.kind === "builtIn" ? (
                    <button
                      type="button"
                      aria-label={`${current.hidden ? "Put back" : "Remove"} ${current.project.title}`}
                      onClick={() => change({ ...store, hidden: current.hidden ? store.hidden.filter((slug) => slug !== current.slug) : [...store.hidden, current.slug] })}
                      className={rowButton}
                    >
                      {current.hidden ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
                      {current.hidden ? "Put back" : "Remove"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Delete ${current.project.title}`}
                      onClick={() => {
                        change({ ...store, projects: store.projects.filter((p) => p.slug !== current.slug) });
                        setSelected(null);
                      }}
                      className={cn(rowButton, "text-refuse")}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Delete
                    </button>
                  )}
                  {current.kind === "builtIn" && current.edited ? (
                    <button type="button" aria-label={`Reset ${current.project.title} to original`} onClick={() => resetOverride(current.slug)} className={rowButton}>
                      <RotateCcw className="size-4" aria-hidden="true" />
                      Reset to original
                    </button>
                  ) : null}
                  {!current.hidden ? (
                    <a href={`/work/${current.slug}`} target="_blank" rel="noopener noreferrer" className={rowButton}>
                      Open page
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
                <div className="mt-8">
                  <ProjectPreview project={current.project} dimmed={current.hidden} cover={current.kind === "builtIn" ? covers[current.slug] : undefined} />
                </div>
              </section>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* -------------------------------------------------------------------- text */}
      {tab === "text" ? (
        <div role="tabpanel" id="panel-text" aria-labelledby="tab-text" className="shell grid gap-x-14 gap-y-14 pt-12 lg:grid-cols-12">
          <section className="space-y-7 lg:col-span-6" aria-labelledby="hero-heading">
            <h2 id="hero-heading" className="t-title">
              Hero
            </h2>
            <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
              <Field label="First big word">
                {(id) => <input id={id} value={store.hero.wordOne} maxLength={14} onChange={(e) => change({ ...store, hero: { ...store.hero, wordOne: e.target.value } })} className={cn(field, "h-12")} />}
              </Field>
              <Field label="Second big word" hint="Leave empty for one word.">
                {(id) => <input id={id} value={store.hero.wordTwo} maxLength={14} onChange={(e) => change({ ...store, hero: { ...store.hero, wordTwo: e.target.value } })} className={cn(field, "h-12")} />}
              </Field>
            </div>
            <Field label="Headline" hint="One sentence under the big words.">
              {(id) => <input id={id} value={store.hero.heading} maxLength={120} onChange={(e) => change({ ...store, hero: { ...store.hero, heading: e.target.value } })} className={cn(field, "h-12")} />}
            </Field>
            <Field label="Caption">
              {(id) => <textarea id={id} rows={5} value={store.hero.caption} maxLength={400} onChange={(e) => change({ ...store, hero: { ...store.hero, caption: e.target.value } })} className={cn(field, "py-3 leading-relaxed")} />}
            </Field>
            <Toggle checked={store.availability.open} onChange={(value) => change({ ...store, availability: { ...store.availability, open: value } })} label="Open to new work" hint="Shown in the hero, the menu and the contact section." />
            <Field label="Availability label">
              {(id) => <input id={id} value={store.availability.label} maxLength={60} onChange={(e) => change({ ...store, availability: { ...store.availability, label: e.target.value } })} className={cn(field, "h-12")} />}
            </Field>
          </section>
          <section className="space-y-7 lg:col-span-6" aria-labelledby="about-heading">
            <h2 id="about-heading" className="t-title">
              About page
            </h2>
            <Field label="Opening paragraph">
              {(id) => <textarea id={id} rows={7} value={store.about.intro} maxLength={900} onChange={(e) => change({ ...store, about: { ...store.about, intro: e.target.value } })} className={cn(field, "py-3 leading-relaxed")} />}
            </Field>
            <Field label="Background paragraph" hint="Leave empty to hide it.">
              {(id) => <textarea id={id} rows={7} value={store.about.background} maxLength={900} onChange={(e) => change({ ...store, about: { ...store.about, background: e.target.value } })} className={cn(field, "py-3 leading-relaxed")} />}
            </Field>
          </section>
        </div>
      ) : null}

      {/* ------------------------------------------------------------------ social */}
      {tab === "social" ? (
        <div role="tabpanel" id="panel-social" aria-labelledby="tab-social" className="shell grid gap-x-14 gap-y-14 pt-12 lg:grid-cols-12">
          <section className="space-y-7 lg:col-span-6" aria-labelledby="social-heading">
            <h2 id="social-heading" className="t-title">
              Social links
            </h2>
            <p className="leading-relaxed text-fg-2">
              Paste the full address of each profile. An icon appears in the footer, on the contact page and on the e-invoicing page
              as soon as its link is saved. Leave a box empty to hide that icon.
            </p>
            {SOCIALS.map(({ id, label }) => {
              const value = store.social[id];
              const invalid = Boolean(value) && !/^https:\/\/\S+$/.test(value.trim());
              return (
                <Field key={id} label={label} hint={invalid ? undefined : "Must start with https://"}>
                  {(fieldId) => (
                    <>
                      <input
                        id={fieldId}
                        type="url"
                        value={value}
                        maxLength={300}
                        placeholder="https://"
                        aria-invalid={invalid}
                        onChange={(e) => change({ ...store, social: { ...store.social, [id]: e.target.value } })}
                        className={cn(field, "h-12")}
                      />
                      {invalid ? <p className="mt-2 text-[0.8125rem] font-semibold text-refuse">This needs to start with https:// or it will not be saved.</p> : null}
                    </>
                  )}
                </Field>
              );
            })}
          </section>
          <section className="lg:col-span-6" aria-labelledby="social-preview-heading">
            <div className="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)]">
              <h2 id="social-preview-heading" className="t-title">
                Preview
              </h2>
              <div data-surface="ink" className="mt-5 border-2 border-ink p-6">
                <p className="t-data text-fg-3">Footer</p>
                {socialProfiles.length > 0 ? (
                  <SocialLinks profiles={socialProfiles} className="mt-4" />
                ) : (
                  <p className="mt-4 text-fg-2">No icons yet. Add a link to show one.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {/* ------------------------------------------------------------------ motion */}
      {tab === "motion" ? (
        <div role="tabpanel" id="panel-motion" aria-labelledby="tab-motion" className="shell grid gap-x-14 gap-y-14 pt-12 lg:grid-cols-12">
          <section className="space-y-7 lg:col-span-6" aria-labelledby="style-heading">
            <h2 id="style-heading" className="t-title">
              Style
            </h2>
            {(
              [
                ["reveal", REVEALS],
                ["imageMask", MASKS],
                ["hero", HERO_MODES],
                ["speed", SPEEDS],
              ] as const
            ).map(([key, values]) => (
              <Field key={key} label={MOTION_HELP[key].label}>
                {(id) => (
                  <select id={id} value={store.motion[key]} onChange={(e) => setMotion(key, e.target.value as never)} className={cn(field, "h-12 bg-surface")}>
                    {values.map((value) => (
                      <option key={value} value={value}>
                        {(MOTION_HELP[key].options as Record<string, string>)[value]}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            ))}
          </section>
          <section className="lg:col-span-6" aria-labelledby="switch-heading">
            <h2 id="switch-heading" className="t-title">
              Switches
            </h2>
            <div className="mt-5 border-t-2 border-fg">
              {(["smoothScroll", "drift", "flowField", "magnetic"] as const).map((key) => (
                <Toggle key={key} checked={store.motion[key]} onChange={(value) => setMotion(key, value)} label={MOTION_HELP[key].label} hint={MOTION_HELP[key].hint} />
              ))}
            </div>
            <p className="mt-5 text-[0.875rem] leading-relaxed text-fg-2">
              Visitors who ask their device for reduced motion always get a still site, whatever is chosen here.
            </p>
          </section>
        </div>
      ) : null}

      {/* ---------------------------------------------------------------- save bar */}
      <div data-surface="ink" className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-paper">
        <div className="shell flex min-h-[4.5rem] flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3.5">
          <p role="status" aria-live="polite" className="text-[0.9375rem]">
            {notice.kind === "saving" ? "Saving" : null}
            {notice.kind === "saved" ? notice.message : null}
            {notice.kind === "error" ? <span className="text-refuse">{notice.message}</span> : null}
            {notice.kind === "idle" ? (dirty ? "You have unsaved changes." : "Everything is saved.") : null}
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={signOut} className="btn btn-ghost min-h-11">
              <LogOut aria-hidden="true" />
              Sign out
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-11" data-arrow="up-right">
              View the site
              <ArrowUpRight aria-hidden="true" />
            </a>
            <button type="button" onClick={save} disabled={!dirty || notice.kind === "saving"} className="btn btn-primary min-h-11">
              {notice.kind === "saving" ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />}
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
