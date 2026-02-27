import FeedClient from "./FeedClient";
import type { FeedResponse } from "@/types/feed";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Tweet } from "@/types/tweet";

async function getFeed(): Promise<{ items: Tweet[]; nextCursor?: string | null }> {
  const backend = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";
  const url = `${backend.replace(/\/$/, "")}/feed?take=20`;
  try {
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    try {
      type SessionWithToken = { accessToken?: string } & Record<string, any>;
      const session = await getServerSession(authOptions as any) as SessionWithToken;
      if (session?.accessToken) {
        headers["Authorization"] = `Bearer ${session.accessToken}`;
      }
    } catch (e) {}
    const res = await fetch(url, { cache: 'no-store', headers });
    if (!res.ok) return { items: [] };
    const json = await res.json();
    if (Array.isArray(json)) return { items: json };
    return { items: json.items ?? [], nextCursor: json.nextCursor };
  } catch {
    return { items: [] };
  }
}

export default async function HomeFeedPage() {
  const { items, nextCursor } = await getFeed();
  return <FeedClient initialTweets={items} initialCursor={nextCursor} />;
}
