import type { HTMLAttributes } from "react";

import { classNames } from "@/lib/class-names";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={classNames("rounded-[var(--radius-sharp)] border-[3px] border-[var(--line)] bg-[var(--surface)] shadow-[5px_5px_0_var(--line)]", className)}
      {...props}
    />
  );
}
