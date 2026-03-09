"use client";
import React from "react";
import { useInfiniteBookmarks } from "@/lib/useInfiniteBookmarks";
import TweetCard from "@/components/TweetCard";
import type { Tweet } from "@/types/tweet";
import { useEffect } from "react";

export default function BookmarksClient({ initialItems, initialCursor }: { initialItems: Tweet[]; initialCursor?: string | null }) {
  const { items, loading, hasMore, loadMoreRef, setItems } = useInfiniteBookmarks(initialItems, initialCursor);

  useEffect(() => {
    function onTweetUpdated(e: any) {
      const updated: Tweet = e?.detail;
      if (!updated || !updated.id) return;
      setItems((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    }
    window.addEventListener("tweet:updated", onTweetUpdated as EventListener);
    return () => window.removeEventListener("tweet:updated", onTweetUpdated as EventListener);
  }, [setItems]);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)]">
      <header className="w-full border-b border-zinc-800 dark:border-zinc-700 p-4 flex justify-center">
        <h1 className="text-lg font-semibold text-white text-center">Bookmarks</h1>
      </header>
      <main className="w-full">
        <div className="w-full inner-bg">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">No bookmarks yet</div>
          ) : (
            items.map((t, i) => (
              <TweetCard key={t.id} tweet={t} onRetweet={() => {}} noBorderTop={i === 0} />
            ))
          )}
          <div ref={loadMoreRef} />
          {loading && <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>}
          {!hasMore && items.length > 0 && <div className="p-4 text-center text-xs text-zinc-400">No more bookmarks</div>}
        </div>
      </main>
    </div>
  );
}
