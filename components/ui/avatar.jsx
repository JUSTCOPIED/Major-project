"use client";

import { cn } from "../../lib/utils";

function Avatar({ className, ...props }) {
  return (
    <div
      className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  );
}

function AvatarImage({ className, src, alt, ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full text-xs font-medium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
