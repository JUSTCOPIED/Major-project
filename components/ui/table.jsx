"use client";
import clsx from "clsx";
export function Table({ className, ...props }) { return <table className={clsx("w-full text-sm border-collapse", className)} {...props} />; }
export function THead({ className, ...props }) { return <thead className={clsx("bg-muted/30", className)} {...props} />; }
export function TBody({ className, ...props }) { return <tbody className={clsx("divide-y divide-border", className)} {...props} />; }
export function TR({ className, ...props }) { return <tr className={clsx("hover:bg-accent/5", className)} {...props} />; }
export function TH({ className, ...props }) { return <th className={clsx("text-left font-medium py-2 px-3 align-middle border-b border-border text-xs uppercase tracking-wide", className)} {...props} />; }
export function TD({ className, ...props }) { return <td className={clsx("py-2 px-3 align-middle", className)} {...props} />; }
