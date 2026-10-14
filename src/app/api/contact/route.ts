import { NextResponse } from "next/server";
import { MIN_FILL_MS, emailBody, emailSubject, formBackendConfigured, hasErrors, normalise, validate } from "@/lib/contact";

/**
 * Contact form endpoint. Active only when RESEND_API_KEY, CONTACT_TO_EMAIL and
 * CONTACT_FROM_EMAIL are set; otherwise it answers 503 and the form uses the
 * visitor's email app instead. Nothing is stored.
 *
 * Spam protection, in order: honeypot field, minimum fill time, per-address rate limit.
 * The rate limit is in-memory, so on serverless hosting it is per instance. It slows
 * a casual script; it is not a substitute for a real limiter under sustained abuse.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 4;
const hits = new Map<string, number[]>();

function limited(key: string, now: number) {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

export async function POST(request: Request) {
  if (!formBackendConfigured()) {
    return NextResponse.json(
      { ok: false, code: "not_configured", message: "Form delivery is not set up on this deployment. Please use email." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "The request was not valid JSON." }, { status: 400 });
  }

  // A filled honeypot or an impossibly fast submission gets a quiet success: no signal for a bot to learn from.
  const elapsed = typeof body.elapsed === "number" ? body.elapsed : 0;
  if ((typeof body.website === "string" && body.website.length > 0) || elapsed < MIN_FILL_MS) {
    return NextResponse.json({ ok: true });
  }

  const input = normalise(body);
  const errors = validate(input);
  if (hasErrors(errors)) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(address, Date.now())) {
    return NextResponse.json(
      { ok: false, message: "That is several messages in a few minutes. Please wait a little, or use email." },
      { status: 429 },
    );
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL,
        to: [process.env.CONTACT_TO_EMAIL],
        reply_to: input.email,
        subject: `Portfolio enquiry: ${emailSubject(input)}`,
        text: emailBody(input),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error("contact: mail provider answered", response.status);
      return NextResponse.json(
        { ok: false, message: "The mail service refused the message. Your text is still in the form; please try email." },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("contact: mail provider unreachable", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      { ok: false, message: "The mail service did not answer in time. Your text is still in the form; please try email." },
      { status: 504 },
    );
  }

  return NextResponse.json({ ok: true });
}
