"use client";

import React, { useEffect, useState } from "react";
import type { Tweet } from "@/types/tweet";

export default function TweetCard({ tweet, depth = 0 }: { tweet: Tweet; depth?: number }) {
  const [resolved, setResolved] = useState<Tweet | null | undefined>(
    tweet.retweetOf ?? undefined
  );

  useEffect(() => {
    let mounted = true;
    async function resolveRetweet() {
      if (tweet.retweetOf) {
        if (mounted) setResolved(tweet.retweetOf);
        return;
      }
      if (!tweet.retweetOfId) {
        if (mounted) setResolved(null);
        return;
      }
      try {
        const res = await fetch(`/api/proxy/tweets/${encodeURIComponent(tweet.retweetOfId)}`, {
          credentials: "same-origin",
        });
        if (!mounted) return;
        if (!res.ok) {
          setResolved(null);
          return;
        }
        const json = await res.json();
        setResolved(json ?? null);
      } catch (e) {
        if (!mounted) return;
        setResolved(null);
      }
    }
    resolveRetweet();
    return () => {
      mounted = false;
    };
  }, [tweet.retweetOf, tweet.retweetOfId]);

  const isNested = (depth ?? 0) > 0;
  const currentRetweet = resolved ?? null;

  return (
    <article className={`${isNested ? "p-3" : "border-b p-4"}`}>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex-1">

          <div className="mt-0.5 mb-1 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300" style={{marginTop: '-1px'}}>
            <strong>{tweet.author?.name ?? "Unknown"}</strong>
            {(() => {
              const email = (tweet as any).author?.email;
              const name = (tweet as any).author?.name;
              const id = (tweet as any).author?.id;
              const handle = email
                ? String(email).split("@")[0]
                : name
                ? String(name).replace(/\s+/g, "").toLowerCase()
                : id
                ? String(id).slice(0, 8)
                : "anon";
              return <span className="text-xs text-zinc-500 dark:text-zinc-400">@{handle}</span>;
            })()}
          </div>
          {currentRetweet && !isNested && (
            <div className="mb-2 text-[13px] text-blue-500 dark:text-blue-400 flex items-center gap-2">
              <span>🔁</span>
              <span>{tweet.author?.name ?? "Someone"} retweeted</span>
            </div>
          )}
          {!currentRetweet && tweet.parentId && !isNested && (
            <div className="mb-2 text-[13px] text-blue-500 dark:text-blue-400 flex items-center gap-2">
              <span>💬</span>
              <span>{tweet.author?.name ?? "Someone"} replied</span>
            </div>
          )}

          {(() => {
            const retweeterText = tweet.content ?? tweet.text;
            if (currentRetweet) {
              return (
                <>
                  {retweeterText && (
                    <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">{retweeterText}</p>
                  )}
                  <div className="mt-3 rounded-md border bg-zinc-50 dark:bg-zinc-800 p-3">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>{currentRetweet.author?.name ?? "Unknown"}</strong>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">@{(currentRetweet.author?.email ?? currentRetweet.author?.name ?? "").toString().split("@") [0]}</span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">{currentRetweet.content ?? currentRetweet.text ?? ""}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                          <div className="flex items-center gap-3">
                            <span>❤️ {currentRetweet.likesCount ?? 0}</span>
                            <span>🔁 {currentRetweet.retweetsCount ?? 0}</span>
                            <span>💬 {currentRetweet.repliesCount ?? 0}</span>
                          </div>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">{currentRetweet.createdAt ?? "now"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            }
            // Fallback: show retweeter content (if any)
            return <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-100">{tweet.content ?? tweet.text ?? ""}</p>;
          })()}

          <div className="mt-3 flex items-center justify-between text-sm text-zinc-500">
            <div className="flex items-center gap-4">
              <span>❤️ {tweet.likesCount ?? 0}</span>
              <span>🔁 {tweet.retweetsCount ?? 0}</span>
              <span>💬 {tweet.repliesCount ?? 0}</span>
            </div>
            <div className="text-xs text-zinc-400 dark:text-zinc-500">{tweet.createdAt ?? "now"}</div>
          </div>
        </div>
      </div>
    </article>
  );
}
