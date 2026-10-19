/**
 * Turns a video address from the admin panel into something a page can play: an embed
 * for YouTube, Vimeo and Loom, or a plain file for an uploaded or directly linked
 * MP4/WebM. Anything else returns null and is refused when the store is saved.
 */

export type VideoEmbed = { kind: "iframe"; src: string } | { kind: "file"; src: string };

const ID = /^[A-Za-z0-9_-]{6,64}$/;

export function videoEmbed(address: string): VideoEmbed | null {
  const value = address.trim();
  // Files uploaded through the panel.
  if (/^\/videos\/[a-z0-9-]+\.(mp4|webm)$/.test(value)) return { kind: "file", src: value };

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^(www|m)\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const id = url.searchParams.get("v") ?? (["shorts", "embed", "live"].includes(parts[0]) ? parts[1] : undefined);
    return id && ID.test(id) ? { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
  }
  if (host === "youtu.be") {
    return parts[0] && ID.test(parts[0]) ? { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${parts[0]}` } : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = parts.find((part) => /^\d{5,}$/.test(part));
    return id ? { kind: "iframe", src: `https://player.vimeo.com/video/${id}` } : null;
  }
  if (host === "loom.com") {
    const id = parts[0] === "share" || parts[0] === "embed" ? parts[1] : undefined;
    return id && ID.test(id) ? { kind: "iframe", src: `https://www.loom.com/embed/${id}` } : null;
  }
  if (/\.(mp4|webm)$/i.test(url.pathname)) return { kind: "file", src: url.toString() };
  return null;
}
