"use client";
import React, { useEffect, useState } from "react";
import TweetCard from "./TweetCard";
import FollowButton from "./FollowButton";

export default function SearchResults({ q, initialTab }: { q: string; initialTab: string }) {
  const [tab, setTab] = useState<string>(initialTab || "relevance");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("SearchResults effect", { q, tab });
    if (!q) {
      setResults([]);
      return;
    }

    let cancelled = false;
    async function doFetch() {
      setLoading(true);
      setError(null);
      try {
        if (tab === "people") {
          const url = `/api/proxy/users?q=${encodeURIComponent(q)}`;
          console.log("fetching users ->", url);
          const res = await fetch(url, { credentials: "include" });
          if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
          const raw = await res.json().catch(() => null);
          const items = raw?.items ?? raw?.data ?? raw ?? [];
          if (!cancelled) setResults(items || []);
        } else {
          // relevance | recent
          const sort = tab === "recent" ? "recent" : "relevant";
          const url = `/api/proxy/tweets?q=${encodeURIComponent(q)}&sort=${encodeURIComponent(sort)}`;
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
  }, [q, tab]);

  function changeTab(next: string) {
    setTab(next);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", next);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-3xl min-h-[calc(100vh-4rem)] px-4">
      <main className="max-w-2xl mx-auto p-4">
        <section className="rounded-md overflow-hidden border border-zinc-800 dark:border-zinc-700 inner-bg">
          <div className="p-4 border-b border-zinc-800 dark:border-zinc-700">
            <h1 className="text-lg font-semibold mb-2">Search: "{q}"</h1>
            <div className="flex gap-6">
              <button className={`pb-2 ${tab === "relevance" ? "border-b-4 border-blue-500 text-blue-600" : "text-zinc-500"}`} onClick={() => changeTab("relevance")}>Destacado</button>
              <button className={`pb-2 ${tab === "recent" ? "border-b-4 border-blue-500 text-blue-600" : "text-zinc-500"}`} onClick={() => changeTab("recent")}>Más reciente</button>
              <button className={`pb-2 ${tab === "people" ? "border-b-4 border-blue-500 text-blue-600" : "text-zinc-500"}`} onClick={() => changeTab("people")}>Personas</button>
            </div>
          </div>

          <div>
            {loading ? (
              <div className="p-6">Loading…</div>
            ) : error ? (
              <div className="p-6 text-red-600">{error}</div>
            ) : results.length === 0 ? (
              <div className="p-6 text-zinc-500">No results</div>
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
                        className="p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      >
                        <div className="w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-800 dark:text-zinc-100">{((r.name || r.fullName || r.email || r.username || '?') + '').charAt(0).toString().toUpperCase()}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-zinc-100">{r.name ?? r.fullName ?? r.email ?? r.username}</div>
                          <div className="text-sm text-zinc-500">@{(r.handle ?? r.username ?? (r.email || "").split("@")[0])}</div>
                        </div>
                        <div className="ml-4" onClick={(e) => e.stopPropagation()}>
                          {!r.followStatus || r.followStatus === 'self' ? null : (
                            <FollowButton user={r} onChange={(next: any) => {
                              // update local state for this user (match by id or _id)
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
                      <TweetCard key={r.id ?? r._id ?? JSON.stringify(r)} tweet={r} noBorderTop={idx === 0} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
