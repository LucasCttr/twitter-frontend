"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "./button";

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = theme === "system" ? systemTheme : theme;

  if (!mounted) return <Button aria-hidden className="opacity-0 pointer-events-none">...</Button>;

  return (
    <Button onClick={() => setTheme(current === "dark" ? "light" : "dark") } aria-label="Toggle theme">
      {current === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}

export default ThemeToggle;
