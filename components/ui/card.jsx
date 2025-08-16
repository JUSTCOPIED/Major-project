"use client";
import clsx from "clsx";
export function Card({ className, ...props }) {
  return <div className={clsx("rounded-sm border border-border bg-card text-card-foreground shadow-sm", className)} {...props} />;
}
export function CardHeader({ className, ...props }) {
  return <div className={clsx("p-4 border-b border-border flex flex-col gap-1", className)} {...props} />;
}
export function CardTitle({ className, ...props }) {
  return <h3 className={clsx("text-base font-semibold leading-none tracking-tight", className)} {...props} />;
}
export function CardDescription({ className, ...props }) {
  return <p className={clsx("text-xs opacity-70", className)} {...props} />;
}
export function CardContent({ className, ...props }) {
  return <div className={clsx("p-4", className)} {...props} />;
}
export function CardFooter({ className, ...props }) {
  return <div className={clsx("p-4 pt-0 flex items-center gap-2", className)} {...props} />;
}
