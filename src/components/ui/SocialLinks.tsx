"use client";

import { FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6";
import type { IconType } from "react-icons";
import type { SocialId } from "@/content/store";
import { cn } from "@/lib/cn";

const ICONS: Record<SocialId, IconType> = {
  linkedin: FaLinkedin,
  github: FaGithub,
  x: FaXTwitter,
  instagram: FaInstagram,
  facebook: FaFacebook,
  youtube: FaYoutube,
  tiktok: FaTiktok,
};

export type SocialProfile = { id: SocialId; label: string; href: string };

/**
 * A row of square icon links. Only profiles with an address are passed in, so an icon
 * appears as soon as its link is added in the panel. A client component because the icon
 * library reads React context.
 */
export function SocialLinks({ profiles, className }: { profiles: SocialProfile[]; className?: string }) {
  if (profiles.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {profiles.map(({ id, label, href }) => {
        const Icon = ICONS[id];
        return (
          <li key={id}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              className="inline-flex size-11 items-center justify-center border-2 border-current transition-colors duration-150 hover:bg-fg hover:text-surface"
            >
              <Icon className="size-[1.125rem]" aria-hidden="true" />
              <span className="sr-only">{label} (opens in a new tab)</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
