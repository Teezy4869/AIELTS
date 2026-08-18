import type { LabelHTMLAttributes } from "react";

import { classNames } from "@/lib/class-names";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={classNames("block text-xs font-black uppercase tracking-[0.08em]", className)} {...props} />;
}
