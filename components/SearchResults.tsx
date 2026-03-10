"use client";
import React, { useEffect, useState } from "react";
import TweetCard from "./TweetCard";
import FollowButton from "./FollowButton";

export default function SearchResults({ q, initialTab }: { q: string; initialTab: string }) {
  const [tab, setTab] = useState<string>(initialTab || "relevance");
  const [currentQ, setCurrentQ] = useState<string>(q || "");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("SearchResults effect", { q: currentQ, tab });
    if (!currentQ) {
      setResults([]);
      return;
    }

    let cancelled = false;
    async function doFetch() {
      setLoading(true);
      setError(null);
      try {
        if (tab === "people") {
          const url = `/api/proxy/users?q=${encodeURIComponent(currentQ)}`;
          console.log("fetching users ->", url);
          const res = await fetch(url, { credentials: "include" });
          if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
          const raw = await res.json().catch(() => null);
          const items = raw?.items ?? raw?.data ?? raw ?? [];
          if (!cancelled) setResults(items || []);
        } else {
          const sort = tab === "recent" ? "recent" : "relevant";
          const url = `/api/proxy/tweets?q=${encodeURIComponent(currentQ)}&sort=${encodeURIComponent(sort)}`;
          console.log("fetching tweets ->", url);
          const res = await fetch(url, { credentials: "include" });
          if (!res.ok) throw new Error(`Failed to fetch tweets: ${res.status}`);
          const raw = await res.json().catch(() => null);
          const items = raw?.items ?? raw?.data ?? raw?.tweets ?? [];
          if (!cancelled) setResults(items || []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to fetch");
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    doFetch();
    return () => {
      cancelled = true;
    };
  }, [currentQ, tab]);

  useEffect(() => {
    function onAppSearch(e: any) {
      const detail = e?.detail ?? {};
      if (detail.q) setCurrentQ(detail.q);
      if (detail.tab) setTab(detail.tab);
    }
    window.addEventListener('app:search', onAppSearch as EventListener);
    return () => window.removeEventListener('app:search', onAppSearch as EventListener);
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const uq = params.get('q') ?? q ?? '';
      const ut = params.get('tab');
      if (uq && uq !== currentQ) setCurrentQ(uq);
      if (ut) setTab(ut);
    } catch (err) {}
  }, []);

  useEffect(() => {
    if (typeof q === 'string' && q !== currentQ) setCurrentQ(q);
  }, [q]);

  function changeTab(next: string) {
    setTab(next);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", next);
    if (currentQ) params.set('q', currentQ);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)]">
      <main className="w-full">
        <div className="w-full inner-bg pt-5">
          <div className="max-w-3xl mx-auto">
            <div className="border-b border-zinc-800 dark:border-zinc-700 py-0 text-center">
              <h1 className="text-lg font-semibold mt-0 mb-1 text-white mx-auto">Search: "{currentQ}"</h1>
              <div className="flex gap-6 justify-center pt-5">
                <button className={`pb-2 ${tab === "relevance" ? "border-b-4 border-blue-500 text-blue-600" : "text-zinc-500"}`} onClick={() => changeTab("relevance")}>Relevant</button>
                <button className={`pb-2 ${tab === "recent" ? "border-b-4 border-blue-500 text-blue-600" : "text-zinc-500"}`} onClick={() => changeTab("recent")}>Recent</button>
                <button className={`pb-2 ${tab === "people" ? "border-b-4 border-blue-500 text-blue-600" : "text-zinc-500"}`} onClick={() => changeTab("people")}>People</button>
              </div>
            </div>

            <div>
              {loading ? (
                <div className="px-4 pt-0 pb-4">Loading…</div>
              ) : error ? (
                <div className="px-4 pt-0 pb-4 text-red-600">{error}</div>
              ) : results.length === 0 ? (
                <div className="px-4 pt-0 pb-4 text-zinc-500">No results</div>
              ) : (
                <div>
                  {tab === "people" ? (
                    <div className="divide-y divide-zinc-800 dark:divide-zinc-700">
                      {results.map((r: any, idx: number) => (
                        <div
                          key={r.id ?? r._id ?? JSON.stringify(r)}
                          onClick={() => {
                            const username = r.handle ?? r.username;
                            const id = r.id ?? r._id;
                            const target = username ? `/profile/${encodeURIComponent(username)}` : id ? `/profile/${encodeURIComponent(id)}` : undefined;
                            if (target) window.location.href = target;
                          }}
                          className="p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 last:border-b last:border-zinc-800 last:dark:border-zinc-700"
                        >
                          <div className="w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-800 dark:text-zinc-100">{((r.name || r.fullName || r.email || r.username || '?') + '').charAt(0).toString().toUpperCase()}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-zinc-100">{r.name ?? r.fullName ?? r.email ?? r.username}</div>
                            <div className="text-sm text-zinc-500">@{(r.handle ?? r.username ?? (r.email || "").split("@")[0])}</div>
                          </div>
                          <div className="ml-4" onClick={(e) => e.stopPropagation()}>
                            {!r.followStatus || r.followStatus === 'self' ? null : (
                              <FollowButton user={r} onChange={(next: any) => {
                                const getId = (u: any) => u?.id ?? u?._id ?? u?.userId ?? u?.handle;
                                const targetId = getId(r);
                                setResults(prev => prev.map(it => (getId(it) === targetId ? { ...it, ...next } : it)));
                              }} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      {results.map((r: any, idx: number) => (
                        <TweetCard
                          key={r.id ?? r._id ?? JSON.stringify(r)}
                          tweet={r}
                          noBorderTop={idx === 0}
                          isLast={idx === results.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
