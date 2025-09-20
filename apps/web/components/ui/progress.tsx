"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

export function Progress({ value, className, ...props }: ProgressProps) {
  const bounded = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-[var(--color-brand)] transition-all duration-300"
        style={{ width: `${bounded}%` }}
      />
    </div>
  );
}
