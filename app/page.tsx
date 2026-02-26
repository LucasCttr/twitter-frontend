"use client";
import React, { useEffect, useState } from "react";
import TweetCard from "@/components/TweetCard";
import { fetchTweetsClient } from "@/lib/api";

export default function Home() {
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchTweetsClient()
      .then((data) => {
        if (!mounted) return;
        setTweets(Array.isArray(data) ? data : data?.items ?? []);
      })
      .catch((err) => setError(String(err)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8">
      <main className="mx-auto w-full max-w-2xl p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Timeline</h1>
          </div>

          {loading && <div>Loading…</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !tweets.length && <div>No tweets yet.</div>}

          <div className="space-y-2">
            {tweets.map((t) => (
              <TweetCard key={t.id} tweet={t} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
