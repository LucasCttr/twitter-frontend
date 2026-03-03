"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useInfiniteNotifications } from "@/lib/useInfiniteNotifications";



export default function NotificationsPage() {
  const router = useRouter();
  const { items, loading, hasMore, loadMoreRef } = useInfiniteNotifications();

  function handleClickNotification(id: string, url?: string) {
    // Optionally mark as read here
    if (url) router.push(url);
  }
  
  // Card anidada para mostrar el tweet original del usuario logueado
  function ShowOwnTweetCard({ tweet }: { tweet: any }) {
    // Obtener usuario logueado desde window.__USER__ (debería setearse en _app o layout)
    const [user, setUser] = React.useState<{ id?: string; name?: string | null; email?: string | null; username?: string | null } | null>(null);
    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        if ((window as any).__USER__) {
          setUser((window as any).__USER__);
        } else {
          // Leer de cookies si no está window.__USER__
          const getCookie = (name: string) => {
            const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
            return v ? decodeURIComponent(v[2]) : undefined;
          };
          const id = getCookie('userId');
          const name = getCookie('userName');
          const email = getCookie('userEmail');
          if (id || name || email) {
            setUser({ id, name, email });
          }
        }
      }
    }, []);
    let name = user?.name;
    let handle = user?.username
      ?? (user?.email ? user.email.split("@")[0] : undefined)
      ?? (user?.id ? user.id.slice(0, 8) : undefined)
      ?? undefined;
    if (!user) {
      // fallback: mostrar id del tweet si no hay user
      name = '';
      handle = tweet.authorId ? tweet.authorId.slice(0, 8) : '';
    }
    return (
      <div className="mt-2 p-3 rounded border border-zinc-700 bg-zinc-900 w-full flex flex-col self-stretch" style={{width: '100vw', maxWidth: '100%', minWidth: 0, alignSelf: 'stretch'}}>
        <div className="flex items-center gap-2 mb-1">
          {name && <span className="font-semibold text-zinc-200">{user?.name}</span>}
          {handle && <span className="text-xs text-zinc-400">@{handle}</span>}
        </div>
        <div className="text-zinc-100 text-sm break-words whitespace-pre-line">{tweet.content}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl border-l border-r border-zinc-200 dark:border-zinc-100 min-h-[calc(100vh-4rem)]">
      <main className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        {items.length === 0 && !loading && <div className="text-zinc-500">No hay notificaciones.</div>}
        <div className="divide-y divide-zinc-800 dark:divide-zinc-700">
          {items.map((it) => {
            let url: string | undefined = it.url;
            try {
              if (typeof url === 'string' && url.includes('/user/')) {
                url = url.replace(/\/user\//, '/profile/');
              }
            } catch {}
            if (it.targetType === 'TWEET' && it.targetId) url = `/tweet/${it.targetId}`;
            else if (typeof it.action === 'string' && it.action.toLowerCase().includes('follow')) {
              const actorUsername = it.actor?.username ?? it.actor?.handle;
              const actorId = it.actor?.id;
              if (actorUsername) url = `/profile/${actorUsername}`;
              else if (actorId) url = `/profile/${actorId}`;
            }
            const actor = it.actor ?? ({} as any);
            const actorImage = (actor.image ?? actor.profileImage) as string | undefined;
            const actorName = actor.name ?? actor.username ?? actor.email ?? 'Unknown';
            const actorHandle =
              actor.username
              ?? actor.handle
              ?? (actor.email ? actor.email.split("@")[0] : undefined)
              ?? (actor.id ? actor.id.slice(0, 8) : undefined)
              ?? "anon";
            return (
              <div
                key={it.id}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-800 dark:border-zinc-700 ${it.read ? 'opacity-60' : ''}`}
                onClick={() => handleClickNotification(it.id, url)}
              >
                <div className="flex-shrink-0">
                  {actorImage ? (
                    <img
                      src={actorImage}
                      alt={actorName}
                      className="h-10 w-10 rounded-full object-cover bg-zinc-200 dark:bg-zinc-700"
                    />
                  ) : (
                    <img
                      src={(() => {
                        const seed = (actor.email ?? actor.id ?? actor.username ?? actor.name ?? 'anon').toString();
                        return `https://api.dicebear.com/6.x/identicon/svg?seed=${encodeURIComponent(seed)}`;
                      })()}
                      alt={actorName}
                      className="h-10 w-10 rounded-full object-cover bg-zinc-200 dark:bg-zinc-700"
                    />
                  )}
                </div>
                <div className="text-sm text-zinc-800 dark:text-zinc-100 truncate">
                  <strong>{actorName}</strong>{" "}
                  <span className="text-xs text-zinc-500">
                    @{actorHandle} · {it.action}
                  </span>
                  <div className="text-xs text-zinc-400">
                    {it.createdAt && (
                      <>{new Date(it.createdAt).toLocaleString()}</>
                    )}
                  </div>
                  {it.tweet && (
                    <ShowOwnTweetCard tweet={it.tweet} />
                  )}
                </div>
              </div>
            );
          })}
          <div ref={loadMoreRef} />
        </div>
        {loading && <div className="mt-4 text-zinc-500">Cargando…</div>}
      </main>
    </div>
  );
}
