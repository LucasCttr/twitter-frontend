import TweetCard from "@/components/TweetCard";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function getFeed() {
  const backend = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";
  const url = `${backend.replace(/\/$/, "")}/feed`;
  try {
    console.log("Fetching feed from:", url);
    // Try to get server session to include access token if present
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    try {
      type SessionWithToken = { accessToken?: string } & Record<string, any>;
      const session = await getServerSession(authOptions as any) as SessionWithToken;
      if (session?.accessToken) {
        headers["Authorization"] = `Bearer ${session.accessToken}`;
      }
    } catch (e) {
      console.warn("getServerSession failed:", e);
    }

    const res = await fetch(url, { cache: 'no-store', headers });
    if (!res.ok) {
      let body = "";
      try { body = await res.text(); } catch (e) { body = String(e); }
      console.error(`Feed fetch failed: ${res.status} ${res.statusText}`, body);
      return [];
    }
    const json = await res.json();
    // Expecting { items: TweetResponseDto[] } or an array — normalize
    const items = Array.isArray(json) ? json : json.items ?? [];
    console.log(`Feed fetched: ${items.length} items`);
    return items;
  } catch (err) {
    console.error("Failed to fetch feed:", err);
    return [];
  }
}

export default async function HomeFeedPage() {
  const items = await getFeed();

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Feed</h1>
      <section className="divide-y rounded-md overflow-hidden border">
        {items.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-500">No tweets yet</div>
        ) : (
          items.map((t: any) => (
            <TweetCard
              key={t.id}
              tweet={{
                id: t.id,
                text: t.content ?? t.text ?? "",
                  author: { id: t.author?.id, name: t.author?.name, email: t.author?.email },
                  likesCount: t.likesCount ?? t._count?.likes,
                  retweetsCount: t.retweetsCount ?? t._count?.retweets,
                  repliesCount: t.repliesCount ?? t._count?.replies,
                createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString() : undefined,
              }}
            />
          ))
        )}
      </section>
    </main>
  );
}
