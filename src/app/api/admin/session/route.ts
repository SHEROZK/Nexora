import { NextResponse } from "next/server";
import { SESSION_COOKIE, adminPassword, createSession, passwordMatches, refuse } from "@/lib/adminAuth";

/** Sign in (POST) and sign out (DELETE) for the site panel. */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 6;
const attempts = new Map<string, number[]>();

function tooMany(key: string, now: number) {
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  attempts.set(key, recent);
  return recent.length >= MAX_ATTEMPTS;
}

export async function POST(request: Request) {
  const refused = refuse(request, { needsSession: false });
  if (refused) return NextResponse.json({ ok: false, code: refused.code, message: refused.message }, { status: refused.status });

  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  if (tooMany(address, now)) {
    return NextResponse.json({ ok: false, message: "Too many wrong passwords. Wait ten minutes and try again." }, { status: 429 });
  }

  let attempt = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    attempt = typeof body.password === "string" ? body.password : "";
  } catch {
    // Treated as a wrong password below.
  }

  const password = adminPassword() as string;
  if (!passwordMatches(attempt, password)) {
    attempts.set(address, [...(attempts.get(address) ?? []), now]);
    return NextResponse.json({ ok: false, message: "That password is not right." }, { status: 401 });
  }

  attempts.delete(address);
  const session = createSession(password);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, session.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: session.maxAge });
  return response;
}

export async function DELETE(request: Request) {
  const refused = refuse(request, { needsSession: false });
  if (refused) return NextResponse.json({ ok: false, message: refused.message }, { status: refused.status });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
