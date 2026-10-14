import type { StatusKind } from "@/content/projects";
import { cn } from "@/lib/cn";

/** Project status. The mark's shape changes with the kind, so it never relies on colour alone. */
export function Status({ kind, label, className }: { kind: StatusKind; label: string; className?: string }) {
  return (
    <span className={cn("t-data inline-flex items-center gap-2.5", className)}>
      <span className="status-mark" data-kind={kind} aria-hidden="true" />
      {label}
    </span>
  );
}
