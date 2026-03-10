"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProfileCard from "../../../components/ProfileCard";
import TweetCard from "../../../components/TweetCard";
import FollowButton from "../../../components/FollowButton";
import { useInfiniteProfileTweets } from "@/lib/useInfiniteProfileTweets";

export default function ProfileByIdPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("tweets");

  const [followers, setFollowers] = useState<any[]>([]);
  const [followersNextCursor, setFollowersNextCursor] = useState<string | undefined>(undefined);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followersHasMore, setFollowersHasMore] = useState(true);

  const [following, setFollowing] = useState<any[]>([]);
  const [followingNextCursor, setFollowingNextCursor] = useState<string | undefined>(undefined);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followingHasMore, setFollowingHasMore] = useState(true);

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

  async function fetchFollowers(cursor?: string) {
    if (!id) return;
    setFollowersLoading(true);
    try {
      const url = `/api/proxy/users/${encodeURIComponent(id)}/followers?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch followers');
      const data = await res.json().catch(() => ({}));
      const items = data.data ?? data.items ?? [];
      setFollowers((prev) => [...prev, ...items]);
      setFollowersNextCursor(data.nextCursor ?? data.cursor ?? null);
      setFollowersHasMore(Boolean(data.nextCursor ?? data.cursor));
    } catch (e) {
      /* ignore for now */
    } finally {
      setFollowersLoading(false);
    }
  }

  async function fetchFollowing(cursor?: string) {
    if (!id) return;
    setFollowingLoading(true);
    try {
      const url = `/api/proxy/users/${encodeURIComponent(id)}/following?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch following');
      const data = await res.json().catch(() => ({}));
      const items = data.data ?? data.items ?? [];
      setFollowing((prev) => [...prev, ...items]);
      setFollowingNextCursor(data.nextCursor ?? data.cursor ?? null);
      setFollowingHasMore(Boolean(data.nextCursor ?? data.cursor));
    } catch (e) {
      /* ignore for now */
    } finally {
      setFollowingLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    if (selectedTab === 'followers' && followers.length === 0) fetchFollowers();
    if (selectedTab === 'following' && following.length === 0) fetchFollowing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, id]);

  if (!id) return <div className="p-6 text-center">No user id</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!profile) return <div className="p-6 text-center">Loading...</div>;

  return (
    <>
      <div className="w-full min-h-[calc(100vh-4rem)]">
        <div className="w-full" style={{ backgroundColor: '#0b0b0b' }}>
          <div className="w-full">
            <div className="p-4">
              <ProfileCard profile={profile} onChange={(next: any) => {
                  setProfile((prev: any) => ({ ...(prev ?? {}), ...(next ?? {}) }));
                }} onSelectTab={(t) => setSelectedTab(t)} />
            </div>

            <div className="border-t border-zinc-800 dark:border-zinc-700 bg-transparent">
              <div className="flex justify-center gap-2 py-2 border-b border-zinc-800 dark:border-zinc-700">
                <button
                  className={`px-3 py-1 font-semibold transition text-sm ${selectedTab === "tweets" ? "border-b-2 border-blue-600 text-blue-600" : "text-zinc-400"}`}
                  onClick={() => setSelectedTab("tweets")}
                >Tweets</button>
                <button
                  className={`px-3 py-1 font-semibold transition text-sm ${selectedTab === "replies" ? "border-b-2 border-blue-600 text-blue-600" : "text-zinc-400"}`}
                  onClick={() => setSelectedTab("replies")}
                >Replies</button>
                <button
                  className={`px-3 py-1 font-semibold transition text-sm ${selectedTab === "likes" ? "border-b-2 border-blue-600 text-blue-600" : "text-zinc-400"}`}
                  onClick={() => setSelectedTab("likes")}
                >Likes</button>
                <button
                  className={`px-3 py-1 font-semibold transition text-sm ${selectedTab === "retweets" ? "border-b-2 border-blue-600 text-blue-600" : "text-zinc-400"}`}
                  onClick={() => setSelectedTab("retweets")}
                >Retweets</button>
              </div>

              <div className="py-0">
                {selectedTab === 'followers' && (
                  <div className="max-w-3xl mx-auto p-1">
                    {followers.length === 0 && !followersLoading && <div className="text-zinc-500 text-center">No followers</div>}
                    <div className="divide-y divide-zinc-800 dark:divide-zinc-700">
                      {followers.map((u) => (
                        <div key={u.id} className="py-3 px-4 flex items-center gap-3 last:border-b last:border-zinc-800 last:dark:border-zinc-700">
                          <div className="w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-800 dark:text-zinc-100">{((u.name || u.email || u.username || u.id) + '').charAt(0).toUpperCase()}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-zinc-100">{u.name ?? u.fullName ?? u.email ?? u.username}</div>
                            <div className="text-sm text-zinc-500">@{(u.handle ?? u.username ?? (u.email || "").split("@")[0])}</div>
                          </div>
                          <div className="ml-4" onClick={(e) => e.stopPropagation()}>
                            {!u.followStatus || u.followStatus === 'self' ? null : (
                              <FollowButton user={u} onChange={(next: any) => {
                                const getId = (x: any) => x?.id ?? x?._id ?? x?.userId ?? x?.handle;
                                const targetId = getId(u);
                                setFollowers(prev => prev.map(it => (getId(it) === targetId ? { ...it, ...next } : it)));
                                setFollowing(prev => prev.map(it => (getId(it) === targetId ? { ...it, ...next } : it)));
                              }} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {followersHasMore && !followersLoading && followers.length > 0 && (
                      <div className="text-center mt-3">
                        <button onClick={() => fetchFollowers(followersNextCursor)} className="px-4 py-2 bg-blue-600 text-white rounded">Cargar más</button>
                      </div>
                    )}
                    {followersLoading && <div className="mt-4 text-zinc-500 text-center">Cargando…</div>}
                  </div>
                )}

                {selectedTab === 'following' && (
                  <div className="max-w-3xl mx-auto p-0">
                    {following.length === 0 && !followingLoading && <div className="text-zinc-500 text-center">No following</div>}
                    <div className="divide-y divide-zinc-800 dark:divide-zinc-700">
                      {following.map((u) => (
                        <div key={u.id} className="py-3 px-4 flex items-center gap-3 last:border-b last:border-zinc-800 last:dark:border-zinc-700">
                          <div className="w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-800 dark:text-zinc-100">{((u.name || u.email || u.username || u.id) + '').charAt(0).toUpperCase()}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-zinc-100">{u.name ?? u.fullName ?? u.email ?? u.username}</div>
                            <div className="text-sm text-zinc-500">@{(u.handle ?? u.username ?? (u.email || "").split("@")[0])}</div>
                          </div>
                          <div className="ml-4" onClick={(e) => e.stopPropagation()}>
                            {!u.followStatus || u.followStatus === 'self' ? null : (
                              <FollowButton user={u} onChange={(next: any) => {
                                const getId = (x: any) => x?.id ?? x?._id ?? x?.userId ?? x?.handle;
                                const targetId = getId(u);
                                setFollowing(prev => prev.map(it => (getId(it) === targetId ? { ...it, ...next } : it)));
                                setFollowers(prev => prev.map(it => (getId(it) === targetId ? { ...it, ...next } : it)));
                              }} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {followingHasMore && !followingLoading && following.length > 0 && (
                      <div className="text-center mt-3">
                        <button onClick={() => fetchFollowing(followingNextCursor)} className="px-4 py-2 bg-blue-600 text-white rounded">Cargar más</button>
                      </div>
                    )}
                    {followingLoading && <div className="mt-4 text-zinc-500 text-center">Cargando…</div>}
                  </div>
                )}
                {selectedTab === 'tweets' && (
                  tweetsHook.initialized ? (
                    tweetsHook.tweets.length === 0 ? (
                      <div className="text-center text-zinc-500">No tweets yet</div>
                    ) : (
                      <div className="divide-y divide-zinc-800 dark:divide-zinc-700">
                        {tweetsHook.tweets.map((tweet) => (
                          <TweetCard key={tweet.id} tweet={tweet} noBorderTop />
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
                          <TweetCard key={reply.id} tweet={reply} noBorderTop />
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
                          <TweetCard key={like.id} tweet={like} noBorderTop />
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
                          <TweetCard key={retweet.id} tweet={retweet} noBorderTop />
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
    </>
  );
}
