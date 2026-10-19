import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Site panel",
  robots: { index: false, follow: false },
};

/**
 * The place to add and remove projects, edit the hero and about text, and choose the motion.
 * Password protected; saves go to Supabase and rebuild the live site (see app/api/admin).
 */
export default function AdminPage() {
  return <AdminPanel />;
}
