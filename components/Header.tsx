"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NotificationsButton from "./NotificationsButton";

type UserInfo = { id?: string; name?: string | null; email?: string | null };

export default function Header() {
  const pathname = usePathname() || "/home";
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) return mounted && setUser(null);
        const data = await res.json();
        if (mounted) setUser(data);
      } catch (e) {
        if (mounted) setUser(null);
      } finally { if (mounted) setLoading(false); }
    }

    loadUser();

    const onAuthChanged = () => {
      // re-fetch user when auth changes elsewhere in the app
      setLoading(true);
      loadUser();
    };
    window.addEventListener('auth:changed', onAuthChanged);

    return () => { mounted = false; window.removeEventListener('auth:changed', onAuthChanged); };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
        <div className="mx-auto max-w-6xl p-2 grid grid-cols-[1fr_minmax(0,640px)_1fr] items-center gap-x-32">
            <div className="flex items-center justify-self-start px-6">
            <Link href="/home" className="text-xl font-bold">
              MiniTwitter
            </Link>
          </div>

          <nav className="flex items-center justify-center gap-8 justify-self-center z-10 w-full max-w-[640px]">
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
              href={user?.id ? `/profile/${user.id}` : '/auth/login'}
              className={`px-4 py-2 rounded-t font-semibold transition border-b-2 ${pathname.startsWith("/profile") ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-400"}`}
            >
              Profile
            </Link>
          </nav>

          <div className="flex items-center justify-end gap-8 z-20 justify-self-end px-6">
            <ThemeToggle />

            {loading ? (
              <div>Loading…</div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:block w-36">
                  <Input placeholder="Buscar" aria-label="Buscar" />
                </div>
                <NotificationsButton />
                <span className="text-sm">{user.name ?? user.email}</span>
                <Button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                    try { window.dispatchEvent(new Event('auth:changed')); } catch (e) {}
                    window.location.href = '/';
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
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
          </div>
      </div>
    </header>
  );
}
