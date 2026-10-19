import type { StoredVideo } from "@/content/store";
import { videoEmbed } from "@/lib/video";

/** A project video: an embedded YouTube, Vimeo or Loom player, or a plain file with controls. */
export function VideoPlayer({ video, title }: { video: StoredVideo; title: string }) {
  const embed = videoEmbed(video.src);
  if (!embed) return null;
  return (
    <div className="aspect-video overflow-hidden border-2 border-ink bg-ink">
      {embed.kind === "iframe" ? (
        <iframe
          src={embed.src}
          title={`Video: ${title}`}
          loading="lazy"
          allow="fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          className="size-full"
        />
      ) : (
        <video src={embed.src} controls preload="metadata" playsInline className="size-full object-contain">
          <a href={embed.src}>Download the video</a>
        </video>
      )}
    </div>
  );
}
