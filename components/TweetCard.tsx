"use client";
import React from "react";

type Tweet = {
  id: string;
  content?: string | null;
  text?: string | null;
  author?: { id?: string; name?: string; email?: string };
  likesCount?: number;
  retweetsCount?: number;
  repliesCount?: number;
  createdAt?: string;
};

export default function TweetCard({ tweet }: { tweet: Tweet }) {
  return (
    <article className="border-b p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <strong>{tweet.author?.name ?? "Unknown"}</strong>
            {(() => {
              const email = (tweet as any).author?.email;
              const name = (tweet as any).author?.name;
              const id = (tweet as any).author?.id;
              const handle =  (email ? String(email).split("@")[0] : name ? String(name).replace(/\s+/g, "").toLowerCase() : id ? String(id).slice(0, 8) : "anon");
              return <span className="text-xs text-zinc-500 dark:text-zinc-400">@{handle}</span>;
            })()}
            <span className="text-xs text-zinc-400 dark:text-zinc-500">• {tweet.createdAt ?? "now"}</span>
          </div>
          <p className="mt-2 text-base text-zinc-900 dark:text-zinc-100">{tweet.content ?? tweet.text ?? ""}</p>

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
