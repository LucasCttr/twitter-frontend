"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
// using native input here to avoid nested borders
import NotificationsButton from "./NotificationsButton";
import router from "next/router";


type UserInfo = { id?: string; name?: string | null; email?: string | null };

export default function Header() {
  const pathname = usePathname() || "/home";
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // const router = useRouter();

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
    <header className="sticky top-0 z-50 border-b bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400">
      <div className="relative mx-auto max-w-6xl p-2 grid grid-cols-[auto_1fr_auto] items-center gap-x-34">
        {/* Left: App name */}
        <div className="flex items-center justify-self-start px-38 -ml-60">
          <LeftGroup />
        </div>

        {/* Center: Navigation tabs */}
        <div className="flex items-center justify-center">
          <CenterNav pathname={pathname} user={user} />
        </div>

        {/* Right: Theme, Search, Notifications, User */}
        <div className="flex items-center justify-end gap-8 z-20 justify-self-end pl-3 pr-4">
          <RightGroup user={user} loading={loading} setLoading={setLoading} pathname={pathname} />
        </div>
      </div>
    </header>
  );
}

function LeftGroup() {
  return (
    <Link href="/home" className="text-3xl font-bold text-white">
      MiniTwitter
    </Link>
  );
}

function CenterNav({ pathname, user }: { pathname: string; user: UserInfo | null }) {
  return (
    <nav className="flex items-center gap-8 z-10 mx-auto max-w-[640px]">
      <Link
        href="/home"
        className={`px-3 py-2 rounded-t font-semibold transition border-b-2 ${pathname.startsWith("/home") || pathname === "/" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-200"}`}
      >
        Feed
      </Link>
      <Link
        href="/trending"
        className={`px-3 py-2 rounded-t font-semibold transition border-b-2 ${pathname.startsWith("/trending") ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-200"}`}
      >
        Trending
      </Link>
      <Link
        href="/news"
        className={`px-3 py-2 rounded-t font-semibold transition border-b-2 ${pathname.startsWith("/news") ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-200"}`}
      >
        News
      </Link>
      <Link
        href={user?.id ? `/profile/${user.id}` : '/auth/login'}
        className={`px-3 py-2 rounded-t font-semibold transition border-b-2 ${pathname.startsWith("/profile") ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-200"}`}
      >
        Profile
      </Link>
    </nav>
  );
}

function RightGroup({ user, loading, setLoading, pathname }: { user: UserInfo | null; loading: boolean; setLoading: React.Dispatch<React.SetStateAction<boolean>>; pathname: string }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      {loading ? (
        <div>Loading…</div>
      ) : user ? (
        <div className="flex items-center gap-2 ml-9">
          <div className="hidden lg:flex items-center gap-2 w-74 rounded-full border border-zinc-300 dark:border-zinc-400 px-3 py-2 bg-transparent">
            <button
              type="button"
              className="p-0 m-0 flex items-center justify-center text-zinc-300"
              onClick={() => {
                const el = document.getElementById('header-search-input') as HTMLInputElement | null;
                if (el) el.focus();
              }}
              aria-label="Focus search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const q = searchQuery.trim();
                console.log('Header search submit', { q, pathname });
                if (!q) return;
                const url = `/search?q=${encodeURIComponent(q)}&tab=relevance`;
                if (pathname && pathname.startsWith('/search')) {
                  console.log('Header: on /search -> replaceState+dispatch', url);
                  try { window.history.replaceState({}, '', url); } catch (err) { console.warn(err); }
                  try { window.dispatchEvent(new CustomEvent('app:search', { detail: { q, tab: 'relevance' } })); } catch (err) { console.warn(err); }
                } else {
                  console.log('Header: navigating to /search via router.push', url);
                  try {
                    await router.push(url);
                    console.log('Header: router.push resolved');
                  } catch (err) {
                    console.warn('router.push failed, falling back to location.href', err);
                    window.location.href = url;
                    return;
                  }
                  try { window.dispatchEvent(new CustomEvent('app:search', { detail: { q, tab: 'relevance' } })); } catch (err) { console.warn(err); }
                }
              }}
              className="flex items-center w-full"
            >
              <input
                id="header-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                aria-label="Search"
                className="bg-transparent placeholder:text-zinc-300 focus:outline-none w-full text-sm py-0 text-zinc-200"
              />
            </form>
          </div>
          <NotificationsButton />

          {/* profile moved to left menu; header no longer shows avatar/menu */}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/auth/login">
            <Button className="bg-blue-600 hover:bg-blue-700">Sign in</Button>
          </Link>
        </div>
      )}
    </>
  );
}
