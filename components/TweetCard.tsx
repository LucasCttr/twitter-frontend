"use client";
import React from "react";

type Tweet = {
  id: string;
  text: string;
  author?: { id?: string; name?: string; username?: string };
  createdAt?: string;
};

export default function TweetCard({ tweet }: { tweet: Tweet }) {
  return (
    <article className="border-b py-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-200" />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-zinc-700">
            <strong>{tweet.author?.name ?? "Unknown"}</strong>
            <span className="text-xs text-zinc-500">@{tweet.author?.username ?? tweet.author?.id ?? "anon"}</span>
            <span className="text-xs text-zinc-400">• {tweet.createdAt ?? "now"}</span>
          </div>
          <p className="mt-2 text-base text-zinc-900">{tweet.text}</p>
        </div>
      </div>
    </article>
  );
}
