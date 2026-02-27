"use client";
import { useInfiniteFeed } from "@/lib/useInfiniteFeed";
import TweetCard from "@/components/TweetCard";
import NewTweetComposer from "@/components/NewTweetComposer";
import type { Tweet } from "@/types/tweet";

export default function FeedClient({ initialTweets, initialCursor }: { initialTweets: Tweet[]; initialCursor?: string | null }) {
  const { tweets, loading, hasMore, loadMoreRef } = useInfiniteFeed(initialTweets, initialCursor);

  return (
    <main className="max-w-2xl mx-auto p-4">
      <section className="divide-y rounded-md overflow-hidden border">
        <NewTweetComposer />
        {tweets.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-500">No tweets yet</div>
        ) : (
          tweets.map((t) => (
            <TweetCard key={t.id} tweet={t} />
          ))
        )}
        <div ref={loadMoreRef} />
        {loading && <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>}
        {!hasMore && tweets.length > 0 && <div className="p-4 text-center text-xs text-zinc-400">No more tweets</div>}
      </section>
    </main>
  );
}
