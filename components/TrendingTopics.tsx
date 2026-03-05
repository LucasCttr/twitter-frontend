"use client";
import React, { useEffect, useState } from "react";

interface TrendingTopic {
  hashtag: string;
  count: number;
}

export default function TrendingTopics() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      setLoading(true);
      try {
        // Simulación: reemplaza por tu endpoint real si tienes uno
        // const res = await fetch("/api/proxy/trending", { credentials: "include" });
        // const data = await res.json();
        // setTopics(data.topics || []);
        setTimeout(() => {
          setTopics([
            { hashtag: "#react", count: 1200 },
            { hashtag: "#nextjs", count: 950 },
            { hashtag: "#javascript", count: 800 },
            { hashtag: "#frontend", count: 600 },
            { hashtag: "#opensource", count: 400 },
          ]);
          setLoading(false);
        }, 500);
      } catch (e) {
        setTopics([]);
        setLoading(false);
      }
    }
    fetchTrends();
  }, []);

  return (
    <div className="bg-zinc-900 rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-4 text-zinc-100">Trending topics</h2>
      {loading ? (
        <div className="text-zinc-400">Loading…</div>
      ) : topics.length === 0 ? (
        <div className="text-zinc-400">No trends</div>
      ) : (
        <ul className="space-y-2">
          {topics.map((topic) => (
            <li key={topic.hashtag} className="flex items-center justify-between">
              <span className="text-zinc-100 font-medium">{topic.hashtag}</span>
              <span className="text-xs text-zinc-400">{topic.count} posts</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
