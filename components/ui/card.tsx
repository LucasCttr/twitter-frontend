"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-md border border-zinc-200 bg-white p-4 shadow-sm",
        "dark:border-zinc-700 dark:bg-zinc-800",
        className || ""
      )}
    >
      {children}
    </div>
  );
}

export default Card;
