"use client";
import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 p-4">
        <Link href="/home" className="text-xl font-bold">
          MiniTwitter
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/home" className="text-sm font-medium hover:underline">
            Feed
          </Link>
          <Link href="/trending" className="text-sm font-medium hover:underline">
            Trending
          </Link>
          <Link href="/profile" className="text-sm font-medium hover:underline">
            Profile
          </Link>

        </nav>

        <nav className="flex items-center gap-3">
          <ThemeToggle />

          {status === "loading" ? (
            <div>Loading…</div>
          ) : session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm">{(session.user as any).name ?? (session.user as any).email}</span>
              <Button onClick={() => signOut({ callbackUrl: "/" })} className="bg-red-600 hover:bg-red-700">
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button className="bg-blue-600 hover:bg-blue-700">Sign in</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
