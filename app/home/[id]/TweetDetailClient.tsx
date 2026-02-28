"use client";

import TweetCard from "@/components/TweetCard";
import type { Tweet } from "@/types/tweet";

export default function TweetDetailClient({ tweet }: { tweet: Tweet }) {
  return (
    <main className="max-w-2xl mx-auto p-4">
      <TweetCard tweet={tweet} />
      <section className="mt-6">
        <h2 className="mb-2 text-lg font-bold">Comentarios</h2>
        {tweet.replies?.length ? (
          tweet.replies.map((reply: Tweet) => (
            <TweetCard key={reply.id} tweet={reply} depth={1} />
          ))
        ) : (
          <div className="p-4 text-center text-sm text-zinc-500">No hay comentarios</div>
        )}
      </section>
    </main>
  );
}