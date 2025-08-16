"use client";
import clsx from "clsx";
export function Badge({ variant="default", className, ...props }) {
  const variants = {
    default: "bg-accent/10 text-foreground border border-border",
    success: "bg-green-500/20 text-green-700 dark:text-green-300 border border-green-600/40",
    destructive: "bg-destructive text-destructive-foreground border border-destructive",
    outline: "border border-border"
  };
  return <span className={clsx("inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium", variants[variant], className)} {...props} />;
}
