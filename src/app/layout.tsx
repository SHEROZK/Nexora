import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { motion, motionSpeed, site, siteUrl } from "@/config/site";
import { services } from "@/content/services";
import { cn } from "@/lib/cn";
import { siteSchema, siteTitle } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Display: a grotesque with ink traps and a width axis, set condensed and heavy for the poster type.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

// Annotations only, so it is not worth a preload.
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.links.github }],
  creator: site.name,
  publisher: site.name,
  category: "technology",
  // The home page's own address and preview. Every other page sets these through pageMetadata().
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: siteTitle,
    description: site.description,
    url: "/",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: siteTitle, description: site.description },
  // Until a production domain is configured, ask crawlers not to index the preview.
  // Once it is, results may show full-size image previews and snippets of any length.
  robots: site.url
    ? {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
      }
    : { index: false, follow: false },
  // Ownership tokens from Google Search Console and Bing Webmaster Tools, when provided.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ece7dd",
  colorScheme: "light",
};

/**
 * Runs before first paint. Marks the document as scripted so the scroll-reveal
 * starting states apply, and removes them again if the motion system has not
 * started a few seconds later, so content can never stay hidden.
 */
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(!d.classList.contains('motion-ready'))d.classList.add('reveal-all')},3500)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(bricolage.variable, instrumentSans.variable, jetbrains.variable)}
      data-reveal-style={motion.reveal}
      style={{ "--speed": motionSpeed } as React.CSSProperties}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body data-surface="paper" className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="btn btn-primary fixed left-4 top-4 z-[80] -translate-y-24 transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <MotionProvider>
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
        </MotionProvider>
        <CommandPalette />
        <JsonLd data={siteSchema(services)} />
        <Analytics />
      </body>
    </html>
  );
}
