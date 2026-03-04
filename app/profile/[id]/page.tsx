"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProfileCard from "../../../components/ProfileCard";
import TweetCard from "../../../components/TweetCard";
import { useInfiniteProfileTweets } from "@/lib/useInfiniteProfileTweets";

export default function ProfileByIdPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("tweets");

  const tweetsHook = useInfiniteProfileTweets({ authorId: id ?? "", type: 'tweets' });
  const repliesHook = useInfiniteProfileTweets({ authorId: id ?? "", type: 'replies' });
  const likesHook = useInfiniteProfileTweets({ authorId: id ?? "", type: 'likes' });
  const retweetsHook = useInfiniteProfileTweets({ authorId: id ?? "", type: 'retweets' });

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/proxy/users/${encodeURIComponent(id)}`, { credentials: 'include' });
        if (!res.ok) throw new Error("Failed to fetch profile");
        setProfile(await res.json());
      } catch (err) {
        setError("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, [id]);

  if (!id) return <div className="p-6 text-center">No user id</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!profile) return <div className="p-6 text-center">Loading...</div>;

  return (
    <>
      <div className="mx-auto max-w-3xl min-h-[calc(100vh-4rem)] px-4">
        <div className="max-w-2xl mx-auto p-4">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-lg overflow-hidden border border-zinc-800 dark:border-zinc-700 inner-bg">
              <div className="p-4">
                <ProfileCard profile={profile} onChange={(next: any) => {
                  setProfile((prev: any) => ({ ...(prev ?? {}), ...(next ?? {}) }));
                }} />
              </div>

              <div className="border-t border-zinc-800 dark:border-zinc-700 bg-transparent">
                <div className="flex justify-center gap-2 px-4 py-3">
                  <button
                    className={`px-4 py-2 font-semibold transition ${selectedTab === "tweets" ? "border-b-2 border-blue-600 text-blue-600" : "text-zinc-400"}`}
                    onClick={() => setSelectedTab("tweets")}
                  >Tweets</button>
                  <button
                    className={`px-4 py-2 font-semibold transition ${selectedTab === "replies" ? "border-b-2 border-blue-600 text-blue-600" : "text-zinc-400"}`}
                    onClick={() => setSelectedTab("replies")}
                  >Replies</button>
                  <button
                    className={`px-4 py-2 font-semibold transition ${selectedTab === "likes" ? "border-b-2 border-blue-600 text-blue-600" : "text-zinc-400"}`}
                    onClick={() => setSelectedTab("likes")}
                  >Likes</button>
                  <button
                    className={`px-4 py-2 font-semibold transition ${selectedTab === "retweets" ? "border-b-2 border-blue-600 text-blue-600" : "text-zinc-400"}`}
                    onClick={() => setSelectedTab("retweets")}
                  >Retweets</button>
                </div>

                <div className="p-4">
            {selectedTab === 'tweets' && (
              tweetsHook.initialized ? (
                tweetsHook.tweets.length === 0 ? (
                  <div className="text-center text-zinc-500">No tweets yet</div>
                  ) : (
                  <div className="divide-y divide-zinc-800 dark:divide-zinc-700">
                    {tweetsHook.tweets.map((tweet) => (
                      <TweetCard key={tweet.id} tweet={tweet} />
                    ))}
                    <div ref={tweetsHook.loadMoreRef} />
                    {tweetsHook.loading && <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>}
                    {!tweetsHook.hasMore && tweetsHook.tweets.length > 0 && <div className="p-4 text-center text-xs text-zinc-400">No more tweets</div>}
                  </div>
                )
              ) : (
                <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>
              )
            )}

            {selectedTab === 'replies' && (
              repliesHook.initialized ? (
                repliesHook.tweets.length === 0 ? (
                  <div className="text-center text-zinc-500">No replies yet</div>
                  ) : (
                  <div className="divide-y divide-zinc-800 dark:divide-zinc-700">
                    {repliesHook.tweets.map((reply) => (
                      <TweetCard key={reply.id} tweet={reply} />
                    ))}
                    <div ref={repliesHook.loadMoreRef} />
                    {repliesHook.loading && <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>}
                    {!repliesHook.hasMore && repliesHook.tweets.length > 0 && <div className="p-4 text-center text-xs text-zinc-400">No more replies</div>}
                  </div>
                )
              ) : (
                <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>
              )
            )}

            {selectedTab === 'likes' && (
              likesHook.initialized ? (
                likesHook.tweets.length === 0 ? (
                  <div className="text-center text-zinc-500">No likes yet</div>
                  ) : (
                  <div className="divide-y divide-zinc-800 dark:divide-zinc-700">
                    {likesHook.tweets.map((like) => (
                      <TweetCard key={like.id} tweet={like} />
                    ))}
                    <div ref={likesHook.loadMoreRef} />
                    {likesHook.loading && <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>}
                    {!likesHook.hasMore && likesHook.tweets.length > 0 && <div className="p-4 text-center text-xs text-zinc-400">No more likes</div>}
                  </div>
                )
              ) : (
                <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>
              )
            )}

            {selectedTab === 'retweets' && (
              retweetsHook.initialized ? (
                retweetsHook.tweets.length === 0 ? (
                  <div className="text-center text-zinc-500">No retweets yet</div>
                  ) : (
                  <div className="divide-y divide-zinc-800 dark:divide-zinc-700">
                    {retweetsHook.tweets.map((retweet) => (
                      <TweetCard key={retweet.id} tweet={retweet} />
                    ))}
                    <div ref={retweetsHook.loadMoreRef} />
                    {retweetsHook.loading && <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>}
                    {!retweetsHook.hasMore && retweetsHook.tweets.length > 0 && <div className="p-4 text-center text-xs text-zinc-400">No more retweets</div>}
                  </div>
                )
              ) : (
                <div className="p-4 text-center text-xs text-zinc-400">Loading...</div>
              )
            )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
