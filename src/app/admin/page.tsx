import type { Metadata } from "next";
import Link from "next/link";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Site panel",
  robots: { index: false, follow: false },
};

/**
 * The place to add and remove projects, edit the hero and about text, and choose the motion.
 * It works on your own machine only: a deployed site shows the notice below instead.
 */
export default function AdminPage() {
  if (process.env.NODE_ENV === "development") return <AdminPanel />;

  return (
    <div className="shell flex min-h-[80svh] flex-col justify-center py-[calc(var(--spacing-header)+3rem)]">
      <h1 className="t-display max-w-[18ch]">The site panel runs on your own machine</h1>
      <p className="t-lead mt-6 max-w-[52ch] text-fg-2">
        Start the site locally with <code className="font-mono text-[0.9em]">npm run dev</code> and open{" "}
        <code className="font-mono text-[0.9em]">localhost:3000/admin</code>. Changes are saved to a file in the
        project, so they go live when you commit and deploy.
      </p>
      <div className="mt-8">
        <Link href="/" className="btn btn-primary">
          Back to the site
        </Link>
      </div>
    </div>
  );
}
