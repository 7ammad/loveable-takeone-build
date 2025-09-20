/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
}

export function Avatar({ name, src, className, ...props }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("h-10 w-10 rounded-full object-cover", className)}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand)] text-sm font-semibold uppercase text-white",
        className,
      )}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
}
