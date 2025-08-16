"use client";
import clsx from "clsx";

export function Button({ as:Comp="button", className, variant="default", size="md", ...props }){
  const base = "inline-flex items-center justify-center font-medium rounded-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:pointer-events-none transition";
  const variants = {
    default: "bg-primary text-primary-foreground shadow hover:opacity-90",
    outline: "border border-border hover:bg-accent/10",
    ghost: "hover:bg-accent/10",
    destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
  };
  const sizes = { sm:"h-8 px-3 text-xs", md:"h-9 px-4 text-sm", lg:"h-10 px-6 text-sm" };
  return <Comp className={clsx(base, variants[variant], sizes[size], className)} {...props}/>;
}
