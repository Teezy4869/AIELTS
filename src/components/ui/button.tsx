import type { ButtonHTMLAttributes } from "react";

import { classNames } from "@/lib/class-names";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary: "border-2 border-[var(--line)] bg-[var(--brand)] text-[var(--on-primary)] shadow-[3px_3px_0_var(--line)] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0_var(--line)]",
  secondary:
    "border-2 border-[var(--line)] bg-[var(--warm)] text-[var(--on-accent)] shadow-[3px_3px_0_var(--line)] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0_var(--line)]",
  ghost: "text-[var(--ink)] underline decoration-2 underline-offset-4 hover:bg-[var(--surface-muted)]",
};

export function Button({ className, type = "button", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={classNames(
        "inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 text-xs font-black uppercase tracking-[0.08em] transition-all disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
