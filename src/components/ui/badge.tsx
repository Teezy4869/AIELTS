import type { HTMLAttributes } from "react";

import { classNames } from "@/lib/class-names";

const statusPresentation = {
  active: { label: "Active", tone: "bg-[var(--accent)] text-[var(--on-accent)]" },
  "in-progress": { label: "In progress", tone: "bg-[var(--brand)] text-[var(--on-primary)]" },
  upcoming: { label: "Upcoming", tone: "bg-[var(--warm)] text-[var(--on-accent)]" },
  complete: { label: "Complete", tone: "bg-[var(--accent)] text-[var(--on-accent)]" },
  paused: { label: "Paused", tone: "bg-[var(--surface-muted)] text-[var(--ink)]" },
  late: { label: "Late", tone: "bg-[var(--warm)] text-[var(--on-accent)]" },
  missed: { label: "Missed", tone: "bg-[var(--destructive)] text-white" },
  failed: { label: "Failed", tone: "bg-[var(--destructive)] text-white" },
} as const;

export type Status = keyof typeof statusPresentation;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status: Status;
};

export function Badge({ className, status, ...props }: BadgeProps) {
  const presentation = statusPresentation[status];

  return (
    <span
      className={classNames("inline-flex items-center rounded-[var(--radius-sharp)] border-2 border-[var(--line)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em]", presentation.tone, className)}
      {...props}
    >
      {presentation.label}
    </span>
  );
}
