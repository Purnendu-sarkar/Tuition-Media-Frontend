import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-border bg-surface-strong p-6 shadow-[0_22px_50px_-40px_rgba(15,23,42,0.4)]",
        className,
      )}
      {...props}
    />
  );
}
