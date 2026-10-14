import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Password protection for the site panel. Server-side only.
 *
 * The password lives in ADMIN_PASSWORD (.env.local). Signing in sets an HttpOnly cookie
 * holding an expiry time and an HMAC of it, keyed from the password, so there is no
 * session store and changing the password signs everyone out. The panel still only
 * runs in development: the password is there because `next dev` is reachable from
 * other devices on the same network.
 */

export const SESSION_COOKIE = "panel_session";
const SESSION_HOURS = 12;

export function adminPassword() {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value && value.length >= 8 ? value : null;
}

const key = (password: string) => createHash("sha256").update(`portfolio-panel:${password}`).digest();
const sign = (payload: string, password: string) => createHmac("sha256", key(password)).update(payload).digest("hex");

/** Compares in constant time. Both sides are hashed first so their lengths never leak. */
export function passwordMatches(attempt: string, password: string) {
  const a = createHash("sha256").update(attempt).digest();
  const b = createHash("sha256").update(password).digest();
  return timingSafeEqual(a, b);
}

export function createSession(password: string) {
  const expires = String(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  return { value: `${expires}.${sign(expires, password)}`, maxAge: SESSION_HOURS * 60 * 60 };
}

export function sessionIsValid(cookie: string | undefined, password: string) {
  if (!cookie) return false;
  const [expires, signature] = cookie.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
  const expected = Buffer.from(sign(expires, password), "hex");
  const given = Buffer.from(signature, "hex");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

function readCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return undefined;
}

export type Refusal = { status: number; code: "not_local" | "not_panel" | "no_password" | "signed_out"; message: string };

/** The checks every panel request passes, in order. Returns null when the request may proceed. */
export function refuse(request: Request, options: { needsSession: boolean } = { needsSession: true }): Refusal | null {
  if (process.env.NODE_ENV !== "development") {
    return { status: 403, code: "not_local", message: "The panel only works while the site runs locally with npm run dev." };
  }
  // A custom header cannot be sent cross-site without a preflight this server never approves.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (request.headers.get("x-site-panel") !== "1" || (origin && host && new URL(origin).host !== host)) {
    return { status: 403, code: "not_panel", message: "This request did not come from the panel." };
  }
  const password = adminPassword();
  if (!password) {
    return { status: 503, code: "no_password", message: "Set ADMIN_PASSWORD (at least 8 characters) in .env.local to use the panel." };
  }
  if (options.needsSession && !sessionIsValid(readCookie(request, SESSION_COOKIE), password)) {
    return { status: 401, code: "signed_out", message: "Sign in to use the panel." };
  }
  return null;
}
