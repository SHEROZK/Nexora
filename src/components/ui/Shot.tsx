import Image from "next/image";
import type { ProjectImage } from "@/content/projects";
import { cn } from "@/lib/cn";

interface Props {
  image: ProjectImage;
  /** Layout width hint for the browser, e.g. "(min-width: 768px) 60vw, 100vw". */
  sizes: string;
  className?: string;
  /** For the one image that is the largest thing on screen at load. */
  preload?: boolean;
}

/** A real screenshot, mounted with a hard frame like a print on card. Never used for mock-ups. */
export function Shot({ image, sizes, className, preload }: Props) {
  return (
    <div className={cn("mount", className)}>
      <Image src={image.src} width={image.width} height={image.height} alt={image.alt} sizes={sizes} preload={preload} />
    </div>
  );
}
