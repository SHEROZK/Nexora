import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side access to Supabase for the site panel. Uses the service role key, which
 * bypasses row level security, so this module must never be imported by a client component.
 *
 * The panel's content lives in one row of public.site_store and its uploads in the public
 * "media" bucket (see supabase/migrations). Both are locked to the public API roles.
 */

export const MEDIA_BUCKET = "media";

let client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

/**
 * Starts a fresh production build on Vercel, which pulls the saved content before it builds
 * (scripts/pull-store.mjs). Returns false when no deploy hook is set, as in local development.
 */
export async function publish(): Promise<boolean> {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL?.trim();
  if (!hook) return false;
  const response = await fetch(hook, { method: "POST" });
  if (!response.ok) throw new Error(`The deploy hook answered ${response.status}.`);
  return true;
}
