"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { ArrowUpRight, Check, Eye, EyeOff, LoaderCircle, LogOut, Pencil, Plus, RotateCcw, Trash2, Upload } from "lucide-react";
import {
  HERO_MODES,
  MASKS,
  MOTION_HELP,
  REVEALS,
  SPEEDS,
  slugify,
  type MotionSettings,
  type Store,
  type StoredProject,
} from "@/content/store";
import { cn } from "@/lib/cn";
import { ProjectPreview } from "./ProjectPreview";

type Tab = "projects" | "text" | "motion";
type Gate = "loading" | "signed-out" | "no-password" | "error" | "ready";
type Notice = { kind: "idle" } | { kind: "saving" } | { kind: "saved" } | { kind: "error"; message: string };
/** What the form is editing: a new project, one you added, or one of the originals. */
type Draft = { mode: "new" | "custom" | "builtIn"; slug: string | null; project: StoredProject };

const HEADERS = { "x-site-panel": "1" };

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
      tab: saved.tab === "text" || saved.tab === "motion" ? saved.tab : "projects",
      selected: typeof saved.selected === "string" ? saved.selected : null,
      draft: saved.draft && typeof saved.draft === "object" && saved.draft.project ? saved.draft : null,
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
  linkLabel: "",
  linkHref: "",
  overview: [],
  points: [],
  image: null,
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
      setError("The local server did not answer. Is npm run dev still running?");
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
  const [uploading, setUploading] = useState(false);
  const address = draft.slug ?? slugify(p.title);

  const commit = () => {
    const title = p.title.trim();
    if (!title) return setError("Give the project a name.");
    if (!address) return setError("The name needs at least one letter or number.");
    if (draft.mode === "new" && taken(address)) return setError(`A project with the address /work/${address} already exists. Use a different name.`);
    if (!p.summary.trim()) return setError("Add a one-sentence summary. It is shown on the home page and in the work list.");
    if (p.linkHref && !/^https:\/\//.test(p.linkHref.trim())) return setError("The link has to start with https://");
    onCommit({
      ...p,
      title,
      slug: address,
      stack: p.stack.map((item) => item.trim()).filter(Boolean),
      overview: p.overview.map((item) => item.trim()).filter(Boolean),
      points: p.points.map((item) => item.trim()).filter(Boolean),
    });
  };

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const bitmap = await createImageBitmap(file);
      const form = new FormData();
      form.set("file", file);
      form.set("name", p.title || "project");
      const response = await fetch("/api/admin/upload", { method: "POST", headers: HEADERS, body: form });
      const body = await response.json();
      if (!response.ok || !body.ok) setError(body.message ?? "The image could not be uploaded.");
      else set({ image: { src: body.src, width: bitmap.width, height: bitmap.height, alt: p.image?.alt ?? "", caption: p.image?.caption ?? "" } });
      bitmap.close();
    } catch {
      setError("That file could not be read as an image. Use a PNG, JPG or WebP.");
    } finally {
      setUploading(false);
    }
  };

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
        <div className="sm:col-span-2">
          <Field label="Link (optional)" hint="Must start with https://">
            {(id) => <input id={id} type="url" value={p.linkHref} maxLength={300} onChange={(e) => set({ linkHref: e.target.value })} className={cn(field, "h-12")} />}
          </Field>
        </div>

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

        {draft.mode !== "builtIn" ? (
          <div className="sm:col-span-2">
            <p className="text-[0.9375rem] font-semibold">Screenshot (optional)</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <label className={cn("btn btn-ghost cursor-pointer", uploading && "pointer-events-none opacity-60")}>
                {uploading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
                {p.image ? "Replace image" : "Choose image"}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
              </label>
              {p.image ? (
                <button type="button" onClick={() => set({ image: null })} className="link text-[0.9375rem]">
                  Remove image
                </button>
              ) : null}
            </div>
            {p.image ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <Field label="Describe the image" hint="Read aloud by screen readers.">
                  {(id) => <input id={id} value={p.image?.alt ?? ""} maxLength={200} onChange={(e) => p.image && set({ image: { ...p.image, alt: e.target.value } })} className={cn(field, "h-12")} />}
                </Field>
                <Field label="Caption" hint="What it shows and when it was taken.">
                  {(id) => <input id={id} value={p.image?.caption ?? ""} maxLength={240} onChange={(e) => p.image && set({ image: { ...p.image, caption: e.target.value } })} className={cn(field, "h-12")} />}
                </Field>
              </div>
            ) : (
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-fg-3">PNG, JPG or WebP, up to 6 MB. Without one the project gets a title plate.</p>
            )}
          </div>
        ) : null}

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
 * The site panel. Loads the content store, lets you change it, and saves it back to
 * src/content/store.json through /api/admin. Nothing is saved until "Save changes".
 */
export function AdminPanel() {
  const [gate, setGate] = useState<Gate>("loading");
  const [gateMessage, setGateMessage] = useState("");
  const [store, setStore] = useState<Store | null>(null);
  const [builtIn, setBuiltIn] = useState<StoredProject[]>([]);
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
        setGate("ready");
      } else if (body.code === "signed_out") setGate("signed-out");
      else if (body.code === "no_password") setGate("no-password");
      else {
        setGateMessage(body.message ?? "The panel could not load the content file.");
        setGate("error");
      }
    } catch {
      setGateMessage("The panel could not reach the local server. Is npm run dev still running?");
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
          <code className="font-mono text-[0.9em]">.env.local</code> in the project folder, then reload this page.
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
      setNotice({ kind: "saved" });
    } catch {
      setNotice({ kind: "error", message: "The local server did not answer. Your changes are still here; try saving again." });
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
      project: store.overrides[original.slug] ? { ...store.overrides[original.slug], image: original.image } : original,
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
    else change({ ...store, overrides: { ...store.overrides, [project.slug]: { ...project, image: null } } });
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
    { id: "motion", label: "Motion" },
  ];

  return (
    <div className="pb-36 pt-[var(--spacing-header)]">
      <div className="shell border-b-2 border-fg pb-10 pt-12">
        <h1 className="t-display">Site panel</h1>
        <p className="mt-4 max-w-[64ch] leading-relaxed text-fg-2">
          Changes are written to <code className="font-mono text-[0.9em]">src/content/store.json</code> when you save, and the
          site updates straight away. Commit that file and deploy to publish them.
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
                  <ProjectPreview project={current.project} dimmed={current.hidden} />
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
            {notice.kind === "saved" ? "Saved. The site has been updated." : null}
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
