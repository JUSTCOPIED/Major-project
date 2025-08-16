"use client";
import clsx from "clsx";
export function Input({ className, ...props }){
  return <input className={clsx("w-full h-9 rounded-sm border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring", className)} {...props}/>;
}
