import { useEffect, useRef, useState, useCallback } from "react";
import type { Tweet } from "@/types/tweet";
import { fetchTweets } from "@/lib/tweets";

export function useInfiniteProfileTweets({ authorId, type, limit = 20 }: { authorId: string; type: string; limit?: number }) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [cursor, setCursor] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const typeMap: Record<string, string> = {
        tweets: "tweet",
        replies: "reply",
        likes: "like",
        retweets: "retweet",
      };
      const backendType = typeMap[type] ?? type;
      const data = await fetchTweets({ authorId, type: backendType, cursor: cursor ?? undefined, limit });
      setTweets((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newItems = (data.items || []).filter((t) => !existingIds.has(t.id));
        return [...prev, ...newItems];
      });
      setCursor(data.nextCursor ?? null);
      setHasMore(!!data.nextCursor && (data.items?.length ?? 0) > 0);
    } catch (e) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [authorId, type, cursor, loading, hasMore, limit]);

  // reset when authorId or type changes
  useEffect(() => {
    setTweets([]);
    setCursor(undefined);
    setHasMore(true);
    // load first page automatically if authorId present
    if (authorId) {
      // small timeout to allow caller effects settle
      (async () => {
        try {
          await fetchMore();
        } catch (e) {
          /* ignore */
        }
      })();
    }
  }, [authorId, type]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchMore();
      }
    });
    observer.current.observe(loadMoreRef.current);
    return () => observer.current?.disconnect();
  }, [fetchMore, hasMore, loading]);

  return { tweets, loading, hasMore, loadMoreRef, setTweets };
}
