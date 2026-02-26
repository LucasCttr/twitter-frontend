"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const ThemeProviderAny = ThemeProvider as unknown as React.ComponentType<any>;
  return (
    <ThemeProviderAny attribute="class" defaultTheme="system">
      <SessionProvider>{children}</SessionProvider>
    </ThemeProviderAny>
  );
}

