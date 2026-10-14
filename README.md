# Nexora — website

Next.js 16 (App Router, Cache Components), React 19, TypeScript (strict), Tailwind CSS 4, GSAP + ScrollTrigger, Lenis.

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm test           # vitest: order rules, stage machine, contact validation, content integrity, the content store
npm run build && npm start
```

## The design system in one page

**Direction:** editorial. Five flat, muted colours used as whole surfaces, condensed display type at a
restrained scale, and real screenshots mounted in hard frames.

**Colour.** `paper #ece7dd`, `charcoal #1c1b22`, `navy #2c3b63`, `clay #9f4a34`, `sand #d6c48d`.
(In the code the last three keep their original token names: `--cobalt`, `--red`, `--yellow`.)
Components never name a colour. They use roles (`bg-surface`, `text-fg`, `text-fg-2`, `border-line`, `text-accent`…),
and the nearest `data-surface="paper|ink|cobalt|yellow|red"` ancestor decides what those mean. To recolour a
section, change its `data-surface`. All of this lives at the top of `src/app/globals.css`.

**Type.** Bricolage Grotesque (display, with its width axis: `t-giant`, `t-display`, `t-title`), Instrument Sans
(reading), JetBrains Mono (annotations only: `t-data`).

**Motion.** One owner per concern:

| What | Where |
| --- | --- |
| Smooth scroll, scroll reveals, progress line | `components/motion/MotionProvider.tsx` |
| Hero: words pull apart, screens level out, pointer depth | `components/hero/HeroMotion.tsx` |
| Mask reveals (up, left, circle, diagonal) | `components/motion/RevealMedia.tsx` |
| Numerals and strips that move against the scroll | `components/motion/Drift.tsx` |
| The scroll-driven line of type | `components/motion/Marquee.tsx` |
| Generative canvas in the lab | `components/interactive/FlowField.tsx` |

Everything is skipped under `prefers-reduced-motion`, and no content depends on JavaScript to be visible.

## The site panel

Run `npm run dev` and open **http://localhost:3000/admin**.

**Password.** The panel asks for the password in `ADMIN_PASSWORD`, which lives in `.env.local` (never committed).
Change it there to anything of 8 characters or more; signing in lasts 12 hours, and changing the password signs
everyone out. Without that variable the panel refuses to open and tells you what to add. The password matters
because `npm run dev` is reachable from other devices on your network, not only from this machine.

Three tabs:

- **Projects.** The list on the left shows every project. Choose one and the right side shows a preview of how it
  looks (its colour block and its row in the work list), with buttons to edit it, remove it, or open its page.
  - The original case studies can be edited too: name, summary, status, role, year, group, stack, description,
    bullet points, link, colour and whether they are featured. Their long written sections stay as they are, and
    "Reset to original" undoes your edits.
  - "Add a project" opens the same form with a live preview underneath that updates as you type, so you can see
    the result before adding it. A project you add gets its own `/work/<name>` page, appears in the work list, and
    (if featured) gets a full-width spread on the home page. One screenshot can be uploaded per added project.
- **Hero and about.** The two big words, the headline and caption of the first screen, the availability label, and
  the opening and background paragraphs of the About page.
- **Motion.** How text appears on scroll, how project images open, what the hero screenshots do, animation speed,
  and switches for smooth scrolling, parallax drift, the generative canvas and magnetic buttons.

Nothing changes until you press **Save changes**. Saving writes `src/content/store.json` (and any uploaded image
into `public/shots/`). The dev server reloads the page when that file changes; the panel remembers which tab and
project you were on, and any half-filled form. **To publish, commit those files and deploy.**

The panel only works on your own machine. On a deployed site `/admin` shows a notice and every panel route refuses,
because a deployed site cannot write files. Editing the live site directly would need a database or storage service.

## Where to edit things

| What | File |
| --- | --- |
| Hero text, about text, availability, motion choices, added projects | the site panel (or `src/content/store.json`) |
| Name, email, GitHub / LinkedIn / résumé links | `src/config/site.ts` |
| Navigation | `src/config/navigation.ts` |
| Projects and case studies (one entry = one `/work/<slug>` page) | `src/content/projects.ts` |
| Each featured project's home-page spread | `src/components/projects/Spreads.tsx` |
| Services, skills, experiments | `src/content/services.ts`, `capabilities.ts`, `experiments.ts` |

A `null` link in `site.ts` hides that link everywhere. LinkedIn and résumé are `null` until you add them.

### Adding a screenshot

Put a `.webp` in `public/shots/` and add it to the project's `images` array with its real pixel size, alt text
and a caption that says what it is and when it was taken. It appears in the case-study gallery automatically.
Do not put images under `public/work/`: that path belongs to the case-study routes and the proxy will 404 them.

## Routes

`/`, `/work`, `/work/[slug]` (the case studies), `/services`, `/about`, `/experiments`, `/contact`, `/admin`,
`/api/contact`, `/api/admin/*` (local only, password-protected), `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, generated icons and Open Graph images.
`src/proxy.ts` returns a real 404 for unknown `/work/<slug>` addresses.

## Environment variables

See `.env.example`. None are required to run.

- `NEXT_PUBLIC_SITE_URL`: set it at deploy time. Until it is set, the site is marked `noindex` and robots.txt disallows everything.
- `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`: optional. The ownership token from Google Search Console
  or Bing Webmaster Tools, so you can submit the sitemap there.
- `ADMIN_PASSWORD`: the site panel password, in `.env.local`. Local development only.
- `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`: optional. With all three, the contact form sends
  server-side. Without them it composes the message in the visitor's email app and says so on the page.

## Logo

The Nexora logo lives in `src/config/brand.ts` as vectors: the mark is rebuilt from the rectangles measured off
`Nexora logo.png` (two stems and three steps in the site's cobalt, clay and sand), the wordmark is traced from it.
`src/components/brand/Logo.tsx` draws it in two tones: colour on paper, one-colour on dark or coloured surfaces
(the menu and footer), where the cobalt step would vanish. The header and menu show the mark and name; the footer
adds the tagline. The favicon (`src/app/icon.svg`), the home-screen icon (`src/app/apple-icon.png`) and the app
icons in `public/icons/` are the colour mark on paper. To change the logo, replace the vectors and regenerate them.

## Search engines and link previews

All of it lives in `src/lib/seo.ts` and is switched on by `NEXT_PUBLIC_SITE_URL`.

- **Each page has its own title, description, canonical address and link preview.** A new page should export
  `metadata = pageMetadata({ title, description, path })`. Setting only a `title` would make the page inherit the
  home page's preview and shared-link address.
- **Structured data** (schema.org, as JSON-LD) describes you and the site on every page, plus the page itself:
  the profile on `/about`, the list of projects on `/work`, the services on `/services`, and each case study with
  its breadcrumb trail. It is generated from `projects.ts` and `services.ts`, so there is nothing to keep in sync.
- **`/sitemap.xml`** lists every page and case study, with the real screenshots attached for image search.
- **After deploying**: add the site in Google Search Console, put its token in `GOOGLE_SITE_VERIFICATION`,
  redeploy, then submit `/sitemap.xml` there. Check a page in Google's Rich Results Test if you change the schema.

## Screen sizes

Layouts change at 768px (`md`, tablets upright) and 1024px (`lg`, tablets sideways and laptops). Anything that
needs more than about 250px per column stays stacked until `lg`. Two extra switches exist in `globals.css`:
`short:` for a phone held sideways (under 520px tall) and `pointer-coarse:` for touch screens, where text links
keep their size but respond to a finger-sized area.

## Deploying (Vercel)

Import the repository, add `NEXT_PUBLIC_SITE_URL` (and the optional mail variables), deploy. The contact-form
mode is decided at build time, so redeploy after changing the mail variables.

## What is real and what is drawn

Screenshots in `public/shots/` are real: the live Food For Less storefront and the VentureWorld password gate
(captured 13 October 2026), a PG India development build with seeded test data, and a review sheet and source
page from Video Director's first complete run. Everything else on the project pages is a diagram, and is
captioned as one. Vega Ventures and Vega Trade have no screenshots because their sites blocked automated capture.

## Design history

`design/directions/` holds the three hero prototypes that were compared before this direction was chosen
(open the `.html` files directly). They are reference only and are not part of the build.
