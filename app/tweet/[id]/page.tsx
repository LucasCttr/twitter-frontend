import type { Tweet } from "@/types/tweet";
import { cookies } from 'next/headers';
import TweetDetailClient from "./TweetDetailClient";
import { normalizeTweet } from "@/lib/normalizeTweet";

async function fetchTweet(id: string): Promise<Tweet> {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!apiUrl) throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
  let headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  } catch (e) {}
  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/tweets/${id}`, { headers });
  if (!res.ok) throw new Error("Tweet not found");
  const raw = await res.json().catch(() => null);
  return normalizeTweet(raw);
}

export default async function TweetDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const tweet = await fetchTweet(id);
  return (
    <div className="w-full min-h-[calc(100vh-4rem)]" style={{ backgroundColor: '#0b0b0b' }}>
      <TweetDetailClient tweet={tweet} />
    </div>
  );
}
