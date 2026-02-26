"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400",
          "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100",
          className || ""
        )}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
export default Input;
