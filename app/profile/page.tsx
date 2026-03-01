
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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tweets, setTweets] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [retweets, setRetweets] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("tweets");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const accessToken = (session as SessionType)?.accessToken || (session as SessionType)?.user?.accessToken;
      if (!accessToken) return;
      try {
        const res = await fetch("/api/proxy/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        setProfile(await res.json());
      } catch (err) {
        setError("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, [session]);

  useEffect(() => {
    // Limpiar el estado antes de cargar nuevos datos
    setTweets([]);
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
        const res = await fetch(`/api/proxy/profile/tweets?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch tweets");
        const data = await res.json();
        if (type === 'tweet') setTweets(data.data ?? []);
        else if (type === 'reply') setReplies(data.data ?? []);
        else if (type === 'like') setLikes(data.data ?? []);
        else if (type === 'retweet') setRetweets(data.data ?? []);
      } catch (err) {
        /* Opcional: setError("Failed to fetch tweets"); */
      } finally {
        setLoading(false);
      }
    };
    if (selectedTab === 'tweets') fetchTweetsByType('tweet');
    else if (selectedTab === 'replies') fetchTweetsByType('reply');
    else if (selectedTab === 'likes') fetchTweetsByType('like');
    else if (selectedTab === 'retweets') fetchTweetsByType('retweet');
  }, [session, selectedTab]);

  if (status === "loading") return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!profile) return null;
  return (
    <>
      <ProfileCard profile={profile} />
      <div className="max-w-md mx-auto mt-6">
        <div className="flex justify-center mb-4 gap-2">
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
          <div>
          {selectedTab === 'tweets' && (
            tweets.length === 0 ? (
              <div className="text-center text-zinc-500">No tweets yet</div>
            ) : (
              <div className="rounded-md overflow-hidden border">
                {tweets.map((tweet) => (
                  <TweetCard key={tweet.id} tweet={tweet} />
                ))}
              </div>
            )
          )}
          {selectedTab === 'replies' && (
            replies.length === 0 ? (
              <div className="text-center text-zinc-500">No replies yet</div>
            ) : (
              <div className="rounded-md overflow-hidden border">
                {replies.map((reply) => (
                  <TweetCard key={reply.id} tweet={reply} />
                ))}
              </div>
            )
          )}
          {selectedTab === 'likes' && (
            likes.length === 0 ? (
              <div className="text-center text-zinc-500">No likes yet</div>
            ) : (
              <div className="rounded-md overflow-hidden border">
                {likes.map((like) => (
                  <TweetCard key={like.id} tweet={like} />
                ))}
              </div>
            )
          )}
          {selectedTab === 'retweets' && (
            retweets.length === 0 ? (
              <div className="text-center text-zinc-500">No retweets yet</div>
            ) : (
              <div className="rounded-md overflow-hidden border">
                {retweets.map((retweet) => (
                  <TweetCard key={retweet.id} tweet={retweet} />
                ))}
              </div>
            )
          )}
                </div>
              </div>
            </>
          );
        }
