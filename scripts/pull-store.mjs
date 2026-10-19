/**
 * Runs before every build (npm "prebuild"). Copies the content saved in the admin panel
 * from Supabase into src/content/store.json, which the site imports.
 *
 * If Supabase is not configured, has nothing saved yet, or cannot be reached, the
 * committed store.json is used as it is, so a build never fails because of this step.
 */

import { writeFile } from "node:fs/promises";

const FILE = new URL("../src/content/store.json", import.meta.url);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

async function main() {
  if (!url || !key) {
    console.log("pull-store: Supabase is not configured; building with the committed store.json.");
    return;
  }
  const response = await fetch(`${url}/rest/v1/site_store?id=eq.1&select=data`, {
    // A legacy service_role key is a JWT and goes in Authorization too; a newer sb_secret_ key does not.
    headers: { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}) },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Supabase answered ${response.status}: ${await response.text()}`);
  const [row] = await response.json();
  if (!row?.data) {
    console.log("pull-store: nothing saved in the panel yet; building with the committed store.json.");
    return;
  }
  await writeFile(FILE, `${JSON.stringify(row.data, null, 2)}\n`, "utf8");
  console.log("pull-store: using the content saved in the admin panel.");
}

main().catch((error) => {
  console.warn(`pull-store: could not load the saved content (${error.message}); building with the committed store.json.`);
});
