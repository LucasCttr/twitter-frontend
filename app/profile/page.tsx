// Removed server-side redirect logic to avoid multiple default exports.
// If you want to redirect unauthenticated users, handle it in the main component below using useEffect or middleware.

"use client";
import { useSession } from "next-auth/react";

type SessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  accessToken?: string;
};

type SessionType = {
  user?: SessionUser;
  accessToken?: string;
};
import { useEffect, useState } from "react";
import ProfileCard from "../../components/ProfileCard";
import TweetCard from "../../components/TweetCard";
import { useInfiniteProfileTweets } from "@/lib/tweets";

export default function ProfilePage() {
  const sessionHook = useSession();
  const session = (sessionHook?.data ?? null) as SessionType | null;
  const status = (sessionHook?.status ?? "unauthenticated") as string;
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tweetsLocal, setTweetsLocal] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [retweets, setRetweets] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("tweets");
  const [loading, setLoading] = useState(false);

  const authorId = (session as SessionType)?.user?.id ?? "";
  const { tweets, loading: tweetsLoading, hasMore, loadMoreRef, initialized: tweetsInitialized } = useInfiniteProfileTweets({ authorId, type: selectedTab });
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [likesLoaded, setLikesLoaded] = useState(false);
  const [retweetsLoaded, setRetweetsLoaded] = useState(false);

  useEffect(() => {
    // Redirect to /profile/:id for the current user
    const redirectToSelf = async () => {
      const user = (session as SessionType)?.user;
      if (user?.id) {
        // client-side navigation to the canonical profile URL
        window.location.href = `/profile/${user.id}`;
      }
    };
    redirectToSelf();
  }, [session]);

  useEffect(() => {
    // Limpiar el estado antes de cargar nuevos datos
    setTweetsLocal([]);
    setReplies([]);
    setLikes([]);
    setRetweets([]);
    const fetchTweetsByType = async (type: 'tweet' | 'reply' | 'like' | 'retweet') => {
      const accessToken = (session as SessionType)?.accessToken || (session as SessionType)?.user?.accessToken;
      if (!accessToken) return;
      try {
        const user = (session as SessionType)?.user;
        if (!user?.id) return;
        setLoading(true);
        const params = new URLSearchParams({ authorId: user.id, type });
        const res = await fetch(`/api/proxy/profile/tweets?${params.toString()}`, { credentials: 'include' });
        if (!res.ok) throw new Error("Failed to fetch tweets");
        const data = await res.json();
        if (type === 'tweet') setTweetsLocal(data.data ?? []);
        else if (type === 'reply') setReplies(data.data ?? []);
        else if (type === 'like') setLikes(data.data ?? []);
        else if (type === 'retweet') setRetweets(data.data ?? []);
      } catch (err) {
        /* Opcional: setError("Failed to fetch tweets"); */
      } finally {
        if (type === 'reply') setRepliesLoaded(true);
        if (type === 'like') setLikesLoaded(true);
        if (type === 'retweet') setRetweetsLoaded(true);
        setLoading(false);
      }
    };
    if (selectedTab === 'tweets') {
      // tweets are handled by the infinite hook, nothing to do here
    } else if (selectedTab === 'replies') fetchTweetsByType('reply');
    else if (selectedTab === 'likes') fetchTweetsByType('like');
    else if (selectedTab === 'retweets') fetchTweetsByType('retweet');
  }, [session, selectedTab]);

  if (status === "loading") return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!profile) return null;
  return (
    <>
      <div className="w-full mt-4" style={{ backgroundColor: '#18181b' }}>
        <div className="w-full p-4" style={{ backgroundColor: 'transparent', border: 'none', borderRadius: 0 }}>
          <ProfileCard profile={profile} />
        </div>
        <div className="flex justify-center mb-4 gap-2 mt-4">
          <button
            className={`px-4 py-2 rounded-t font-semibold transition border-b-2 ${selectedTab === "tweets" ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-400"}`}
            onClick={() => setSelectedTab("tweets")}
          >Tweets</button>
          <button
            className={`px-4 py-2 rounded-t font-semibold transition border-b-2 ${selectedTab === "replies" ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-400"}`}
            onClick={() => setSelectedTab("replies")}
          >Replies</button>
          <button
            className={`px-4 py-2 rounded-t font-semibold transition border-b-2 ${selectedTab === "likes" ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-400"}`}
            onClick={() => setSelectedTab("likes")}
          >Likes</button>
          <button
            className={`px-4 py-2 rounded-t font-semibold transition border-b-2 ${selectedTab === "retweets" ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-400"}`}
            onClick={() => setSelectedTab("retweets")}
          >Retweets</button>
        </div>
        <div className="w-full">
          {selectedTab === 'tweets' && (
            tweetsInitialized ? (
              tweets.length === 0 ? (
                <div className="text-center text-zinc-500">No tweets yet</div>
              ) : (
                <div className="w-full">
                  {tweets.map((tweet) => (
                    <TweetCard key={tweet.id} tweet={tweet} />
                  ))}
                  <div ref={loadMoreRef} />
                  {tweetsLoading && <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>}
                  {!hasMore && tweets.length > 0 && <div className="p-4 text-center text-xs text-zinc-400">No more tweets</div>}
                </div>
              )
            ) : (
              <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>
            )
          )}
          {selectedTab === 'replies' && (
            repliesLoaded ? (
              replies.length === 0 ? (
                <div className="text-center text-zinc-500">No replies yet</div>
              ) : (
                <div className="w-full">
                  {replies.map((reply) => (
                    <TweetCard key={reply.id} tweet={reply} />
                  ))}
                </div>
              )
            ) : (
              <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>
            )
          )}
          {selectedTab === 'likes' && (
            likesLoaded ? (
              likes.length === 0 ? (
                <div className="text-center text-zinc-500">No likes yet</div>
              ) : (
                <div className="w-full">
                  {likes.map((like) => (
                    <TweetCard key={like.id} tweet={like} />
                  ))}
                </div>
              )
            ) : (
              <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>
            )
          )}
          {selectedTab === 'retweets' && (
            retweetsLoaded ? (
              retweets.length === 0 ? (
                <div className="text-center text-zinc-500">No retweets yet</div>
              ) : (
                <div className="w-full">
                  {retweets.map((retweet) => (
                    <TweetCard key={retweet.id} tweet={retweet} />
                  ))}
                </div>
              )
            ) : (
              <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>
            )
          )}
        </div>
        </div>
    </>
  );
}
