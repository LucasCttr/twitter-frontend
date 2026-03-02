"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname() || "/home";

  return (
    <header className="sticky top-0 z-50 border-b bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <div className="mx-auto grid max-w-6xl grid-cols-3 items-center gap-8 p-2">
        <div className="flex items-center justify-start">
          <Link href="/home" className="text-xl font-bold">
            MiniTwitter
          </Link>
        </div>

        <nav className="flex items-center justify-center gap-6">
          <Link
            href="/home"
            className={`px-4 py-2 rounded-t font-semibold transition border-b-2 ${pathname.startsWith("/home") || pathname === "/" ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-400"}`}
          >
            Feed
          </Link>
          <Link
            href="/trending"
            className={`px-4 py-2 rounded-t font-semibold transition border-b-2 ${pathname.startsWith("/trending") ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-400"}`}
          >
            Trending
          </Link>
          <Link
            href="/profile"
            className={`px-4 py-2 rounded-t font-semibold transition border-b-2 ${pathname.startsWith("/profile") ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-400"}`}
          >
            Profile
          </Link>
        </nav>

        <nav className="flex items-center justify-end gap-6">
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
