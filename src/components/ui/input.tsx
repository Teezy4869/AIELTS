import type { InputHTMLAttributes } from "react";

import { classNames } from "@/lib/class-names";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const isInvalid = props["aria-invalid"] === true;

  return (
    <input
      className={classNames(
        "h-11 w-full rounded-[var(--radius-control)] border-2 border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)]",
        isInvalid && "border-[var(--destructive)]",
        className,
      )}
      {...props}
    />
  );
}
