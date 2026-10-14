import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { navigation } from "@/config/navigation";
import { mailto, site } from "@/config/site";
import { featuredProjects } from "@/content/projects";
import { Logo } from "@/components/brand/Logo";
import { BackToTop } from "./BackToTop";

export function Footer() {
  const external = [
    { label: "GitHub", href: site.links.github as string | null },
    { label: "LinkedIn", href: site.links.linkedin },
    { label: "Résumé", href: site.links.resume },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  return (
    <footer data-surface="ink">
      <div className="shell grid gap-12 py-14 md:grid-cols-12 md:gap-6 md:py-20">
        <div className="md:col-span-5">
          <Logo variant="full" tone="mono" className="mb-10" />
          <p className="t-title max-w-[16ch]">
            {site.name}
            <span className="accent block">builds software that works.</span>
          </p>
          <a href={mailto()} className="link mt-8 inline-block break-all text-[1.0625rem]">
            {site.email}
          </a>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
          <div>
            <h2 className="t-data text-fg-3">Site</h2>
            <ul className="mt-4 space-y-2.5 pointer-coarse:mt-2 pointer-coarse:space-y-0">
              <li>
                <Link href="/" className="link-quiet pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center">
                  Home
                </Link>
              </li>
              {navigation.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="link-quiet pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="t-data text-fg-3">Case studies</h2>
            <ul className="mt-4 space-y-2.5 pointer-coarse:mt-2 pointer-coarse:space-y-0">
              {featuredProjects.map((project) => (
                <li key={project.slug}>
                  <Link href={`/work/${project.slug}`} className="link-quiet pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center">
                    {project.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/work" className="link-quiet pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center">
                  All projects
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="t-data text-fg-3">Elsewhere</h2>
            <ul className="mt-4 space-y-2.5 pointer-coarse:mt-2 pointer-coarse:space-y-0">
              {external.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="link-quiet inline-flex items-center gap-1.5 pointer-coarse:min-h-11">
                    {link.label}
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
              <li>
                <a href={mailto()} className="link-quiet pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center">
                  Email
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="shell flex flex-col gap-4 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="t-data text-fg-3">
          © {site.name} · {site.location} · Set in Bricolage Grotesque and Instrument Sans · Built with Next.js and GSAP
        </p>
        <BackToTop />
      </div>
    </footer>
  );
}
