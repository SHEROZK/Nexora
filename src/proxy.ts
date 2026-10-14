import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { projects } from "@/content/projects";

/**
 * Gives unknown case-study addresses a real 404.
 *
 * With Cache Components, a dynamic route sends its static shell before the page can
 * discover that a slug does not exist, so `notFound()` alone leaves the status at 200
 * (a "soft 404"). Checking the slug here, before rendering starts, lets the response
 * carry the right status. The slug list comes from the same content file as the pages,
 * so there is nothing to keep in sync.
 */
const known = new Set(projects.map((project) => project.slug));

export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (slug && !known.has(slug)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  // One segment below /work only: the case-study page itself, not its social image.
  matcher: "/work/:slug",
};
