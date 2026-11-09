import { ArrowDown } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { site, whatsapp } from "@/config/site";
import { projects } from "@/content/projects";
import { Shot } from "@/components/ui/Shot";
import { HeroMotion } from "./HeroMotion";

/**
 * First viewport: the name set large, one plain sentence saying who this is for, a caption,
 * and a stack of real product screens. The words and the caption come from the content
 * store, so they can be changed in the admin panel.
 *
 * Everything is server-rendered and enters with CSS, so it is complete without JavaScript.
 */
export function Hero() {
  const { hero } = site;
  // The first three real screenshots on the site, widest first, whatever projects they belong to.
  const shots = projects.flatMap((project) => project.images).filter((image) => image.width / image.height < 4);
  const wide = shots.filter((image) => image.width > image.height);
  const tall = shots.find((image) => image.height > image.width);
  const [front, back] = wide;
  // On phones the longest word sets the size, so a long word never runs off the screen.
  // The display face sets about 0.45em a letter in capitals; 0.48 keeps the word inside the margins.
  const longest = Math.max(...[hero.wordOne, hero.wordTwo].map((word) => word?.length ?? 0), 1);
  const fit = { "--hero-fit": `calc((100vw - 2 * var(--spacing-gutter)) / ${(longest * 0.48).toFixed(2)})` } as React.CSSProperties;
  const delay = (i: number) => ({ animationDelay: `${i * 110 + 150}ms` }) as React.CSSProperties;

  return (
    <HeroMotion className="relative overflow-hidden pt-[var(--spacing-header)]">
      <div className="shell grid gap-x-14 gap-y-14 pb-16 pt-[clamp(2.5rem,7svh,5rem)] md:min-h-[calc(100svh-var(--spacing-header))] md:grid-cols-12 md:items-center md:pb-16">
        <div className="md:col-span-7">
          <h1 className="t-giant text-[length:min(19vw,26svh,var(--hero-fit))] md:text-[min(19vw,26svh)]" style={fit}>
            <span data-word="1" className="block w-max">
              <span className="block animate-slide-right text-accent">{hero.wordOne}</span>
            </span>
            {/* The lines are blocks, so without this space copied or extracted text reads "YOUR IDEAWE BUILD". */}{" "}
            {hero.wordTwo ? (
              <span data-word="2" className="block w-max">
                <span className="block animate-slide-left">{hero.wordTwo}</span>
              </span>
            ) : null}
            {/* The poster shows the big words alone. Search engines and screen readers also get who and what. */}
            <span className="sr-only">
              : {site.name}, full-stack development and AI engineering in {site.location}
            </span>
          </h1>

          {hero.heading ? (
            <p className="enter t-title mt-10 max-w-[22ch]" style={{ "--i": 4 } as React.CSSProperties}>
              {hero.heading}
            </p>
          ) : null}
          {hero.caption ? (
            <p className="enter t-body-lg mt-6 max-w-[50ch] text-fg-2" style={{ "--i": 5 } as React.CSSProperties}>
              {hero.caption}
            </p>
          ) : null}

          <div className="enter mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap" style={{ "--i": 6 } as React.CSSProperties}>
            <a
              href={whatsapp("Hi, I found Nexora online and would like to talk about software for my business.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              data-icon="lead"
            >
              <FaWhatsapp aria-hidden="true" />
              Message on WhatsApp
            </a>
            <a href="#work" className="btn btn-ghost">
              See what is running
              <ArrowDown aria-hidden="true" />
            </a>
          </div>

          <p className="enter t-data mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-fg-2" style={{ "--i": 7 } as React.CSSProperties}>
            <span className="flex items-center gap-2.5 text-fg">
              <span className="status-mark" data-kind={site.availability.open ? "live" : "development"} aria-hidden="true" />
              {site.availability.open ? site.availability.label : site.availability.closedLabel}
            </span>
            <span>Web apps · Back offices · AI features</span>
            <span>{site.location}</span>
          </p>
        </div>

        {/* Real screens, stacked like prints on a desk. Hidden if no project has a screenshot. */}
        {front ? (
          <div className="md:col-span-5">
            <div className="relative mx-auto aspect-[10/9] w-full max-w-[34rem] md:max-w-none">
              {back ? (
                <div data-depth="-16" className="absolute right-0 top-0 w-[64%]">
                  <div data-square style={{ transform: "rotate(4deg)" }}>
                    <div className="animate-drop" style={delay(4)}>
                      <Shot image={back} sizes="(min-width: 768px) 26vw, 60vw" />
                    </div>
                  </div>
                </div>
              ) : null}

              <div data-depth="22" className="absolute left-0 top-[24%] w-[88%]">
                <div data-square style={{ transform: "rotate(-4deg)" }}>
                  <div className="animate-drop" style={delay(2)}>
                    {/* The coloured block is the print's card backing, offset behind it. */}
                    <div className="absolute inset-0 translate-x-[4%] translate-y-[7%] bg-red" aria-hidden="true" />
                    <Shot image={front} sizes="(min-width: 768px) 36vw, 84vw" className="relative" />
                  </div>
                </div>
              </div>

              {tall ? (
                <div data-depth="46" className="absolute bottom-0 right-[3%] w-[24%]">
                  <div data-square style={{ transform: "rotate(6deg)" }}>
                    <div className="animate-drop" style={delay(5)}>
                      <Shot image={tall} sizes="(min-width: 768px) 10vw, 22vw" />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <p className="t-data enter mt-6 text-fg-2" style={{ "--i": 9 } as React.CSSProperties}>
              Fig. 1: real screens from the projects below, not mock-ups
            </p>
          </div>
        ) : null}
      </div>
    </HeroMotion>
  );
}
