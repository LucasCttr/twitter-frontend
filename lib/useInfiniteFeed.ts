import { useEffect, useRef, useState, useCallback } from "react";
import type { Tweet } from "@/types/tweet";
import { fetchTweets } from "@/lib/tweetsClient";

export function useInfiniteFeed(initialTweets: Tweet[] = [], initialCursor?: string | null) {
  const [tweets, setTweets] = useState<Tweet[]>(initialTweets);
  const [cursor, setCursor] = useState<string | null | undefined>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await fetchTweets({ cursor: cursor ?? undefined, take: 20 });
      setTweets((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newItems = (data.items || []).filter((t) => !existingIds.has(t.id));
        return [...prev, ...newItems];
      });
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor && (data.items?.length ?? 0) > 0);
    } catch (e) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, hasMore]);

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
