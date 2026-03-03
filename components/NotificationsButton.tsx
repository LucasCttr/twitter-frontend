"use client";
import React, { useEffect, useRef, useState } from "react";
// Socket.IO client
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

// NotificationsButton: shows unread count and connects to backend via WebSocket.
// Behavior:
// - On mount fetches `/api/notifications/unread` (credentials included) to get initial count.
// - Opens a WebSocket to `NEXT_PUBLIC_BACKEND_WS` or to `window.location` derived path `/ws/notifications`.
// - On incoming messages updates the counter (expects JSON with { type: 'notification', unreadCount?: number, delta?: number }).
// - On click it calls `/api/notifications/mark-read` (credentials included) and sets count to 0.

export default function NotificationsButton() {
  const [count, setCount] = useState<number>(0);
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const knownIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    async function fetchInitial() {
      try {
        const res = await fetch('/api/notifications/unread', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        if (typeof data.unread === 'number') setCount(data.unread);
      } catch (e) {
        // ignore
      }
    }

    fetchInitial();

    // Build backend URL (prefer NEXT_PUBLIC_BACKEND_URL)
    function backendUrl() {
      const env = (process as any)?.env;
      const publicBackend = env?.NEXT_PUBLIC_BACKEND_URL;
      if (publicBackend) return (publicBackend as string).replace(/\/$/, '');
      if (typeof window === 'undefined') return null;
      // fallback: assume same origin but backend on port 3000
      try {
        const loc = window.location;
        const host = loc.hostname;
        const protocol = loc.protocol;
        const port = process.env.NEXT_PUBLIC_BACKEND_PORT ?? (protocol === 'https:' ? '443' : '3000');
        return `${protocol}//${host}:${port}`;
      } catch (e) {
        return null;
      }
    }

    function connectSocket() {
      const base = backendUrl();
      if (!base) return;
      try {
        console.log('[NotificationsButton] attempting socket.io connect to', base, 'namespace /notifications');

        const makeSocket = (path: string) => io(base + path, {
          withCredentials: true,
          // start with polling so cookies are sent during the HTTP handshake,
          // then upgrade to websocket if available
          transports: ['polling', 'websocket'],
          reconnectionAttempts: 5,
        });

        // Try namespace first, then fallback to base namespace if that never connects.
        let triedFallback = false;
        let connectedOnce = false;
        const tryNamespace = () => {
          const socket = makeSocket('/notifications');
          socketRef.current = socket;

          socket.on('connect', () => {
            connectedOnce = true;
            console.log('[NotificationsButton] socket connected (namespace)', socket.id);
          });

          socket.on('connect_error', (err: any) => {
            console.error('[NotificationsButton] socket connect_error (namespace)', err);
          });

          socket.onAny((event, ...args) => {
            try {
              console.log('[NotificationsButton] socket event (namespace)', event, args);
              let handled = false;
              if (typeof event === 'string' && event.toLowerCase().includes('notification')) {
                handled = Boolean(handleNotifications(args[0]));
              }
              if (!handled) fetchUnread();
            } catch (e) {
              // ignore
            }
          });

          socket.on('notifications', (payload: any) => handleNotifications(payload));
          socket.on('notification', (payload: any) => handleNotifications(payload));

          socket.on('disconnect', (reason: any) => {
            console.log('[NotificationsButton] socket disconnected (namespace)', reason);
          });

          // Decide fallback based on explicit connect_error or a longer timeout.
          // Clear fallback timer if connect or connect_error fires (wehandle connect_error below).
          const fallbackTimer = setTimeout(() => {
            // Only fallback if the namespace has never successfully connected.
            if (!connectedOnce && !triedFallback) {
              triedFallback = true;
              console.info('[NotificationsButton] namespace did not connect within timeout, trying base socket');
              try { tryBase(); } catch (e) { /* ignore */ }
            }
          }, 10000);

          // If we get an explicit connect_error on namespace, fall back immediately.
          const onNamespaceConnectError = (err: any) => {
            if (triedFallback) return;
            triedFallback = true;
            clearTimeout(fallbackTimer);
            try { socket.disconnect(); } catch (e) {}
            console.info('[NotificationsButton] namespace connect_error, falling back to base socket', err);
            tryBase();
          };

          socket.once('connect', () => { connectedOnce = true; clearTimeout(fallbackTimer); });
          socket.once('connect_error', onNamespaceConnectError);
        };

        const tryBase = () => {
          const socket = makeSocket('');
          socketRef.current = socket;

          socket.on('connect', () => {
            console.log('[NotificationsButton] socket connected (base)', socket.id);
          });

          socket.on('connect_error', (err: any) => {
            console.error('[NotificationsButton] socket connect_error (base)', err);
          });

          socket.onAny((event, ...args) => {
            try {
              console.log('[NotificationsButton] socket event (base)', event, args);
              let handled = false;
              if (typeof event === 'string' && event.toLowerCase().includes('notification')) {
                handled = Boolean(handleNotifications(args[0]));
              }
              if (!handled) fetchUnread();
            } catch (e) {
              // ignore
            }
          });

          socket.on('notifications', (payload: any) => handleNotifications(payload));
          socket.on('notification', (payload: any) => handleNotifications(payload));

          socket.on('disconnect', (reason: any) => {
            console.log('[NotificationsButton] socket disconnected (base)', reason);
          });
        };

        const handleNotifications = (payload: any) => {
          console.log('[NotificationsButton] notifications payload', payload);
          if (!payload) return false;

          // If server provides explicit unreadCount or delta, use them
          if (payload?.unreadCount != null) {
            setCount(Number(payload.unreadCount));
            return true;
          }
          if (payload?.delta != null) {
            setCount((c) => Math.max(0, c + Number(payload.delta)));
            return true;
          }

          // If payload is an array of notifications, compute unread
          if (Array.isArray(payload)) {
            const unread = payload.filter((p: any) => !p.read).length;
            if (typeof unread === 'number') { setCount(unread); return true; }
            return false;
          }

          // If payload looks like a single notification object, and it's unread, increment
          if (typeof payload === 'object' && payload.id) {
            const isRead = Boolean(payload.read);
            if (!isRead) setCount((c) => c + 1);
            // also optimistically prepend to items so UI shows content immediately
            setItems((prev) => {
              try {
                const next = [payload, ...prev.filter((p) => (String(p.id ?? p._id) !== String(payload.id ?? payload._id)))];
                return next.slice(0, 5);
              } catch (e) { return prev; }
            });
            return true;
          }
          return false;
        };

        tryNamespace();
      } catch (e) {
        console.error('[NotificationsButton] socket connection error', e);
      }
    }

    connectSocket();

    return () => {
      mounted = false;
      try { socketRef.current?.disconnect(); } catch (e) {}
    };
  }, []);

  async function markAllRead() {
    try {
      const res = await fetch('/api/notifications/mark-read', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        setItems((prev) => prev.map((it) => ({ ...it, read: true })));
        // Refresh unread count from server
        await fetchUnread();
      }
    } catch (e) {
      // ignore
    }
  }

  async function fetchItems() {
    setLoadingItems(true);
    try {
      const res = await fetch('/api/notifications?limit=5', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      const list = data.items ?? [];
      setItems(list);
      try {
        knownIdsRef.current = new Set(list.map((it: any) => String(it.id ?? it._id ?? '')));
      } catch (e) { knownIdsRef.current = new Set(); }
      // refresh unread count after loading items
      await fetchUnread();
    } catch (e) {
      // ignore
    } finally {
      setLoadingItems(false);
    }
  }

  async function markReadAndNavigate(id: string, url?: string) {
    try {
      await fetch('/api/notifications/mark-read', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [id] }) });
      setCount((c) => Math.max(0, c - 1));
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, read: true } : it)));
    } catch (e) {
      // ignore
    }
    try { if (url) router.push(url); } catch (e) { /* ignore */ }
    // ensure badge reflects server state
    await fetchUnread();
  }

  async function fetchUnread() {
    try {
      const res = await fetch('/api/notifications/unread', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data.unread === 'number') setCount(data.unread);
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (!panelRef.current) return;
      if (!panelRef.current.contains(target)) setPanelOpen(false);
    }
    if (panelOpen) document.addEventListener('mousedown', onDocClick);
    return () => { document.removeEventListener('mousedown', onDocClick); };
  }, [panelOpen]);

  // When `items` changes, increment badge for any new unseen IDs (dedupe)
  useEffect(() => {
    try {
      const prev = knownIdsRef.current || new Set<string>();
      const current = new Set<string>();
      let newUnread = 0;
      for (const it of items) {
        const id = String(it.id ?? it._id ?? '');
        current.add(id);
        if (!prev.has(id)) {
          if (!it.read) newUnread += 1;
        }
      }
      if (newUnread > 0 && !panelOpen) setCount((c) => c + newUnread);
      knownIdsRef.current = current;
    } catch (e) {
      // ignore
    }
  }, [items, panelOpen]);

  return (
    <div className="relative inline-block" ref={panelRef}>
      <button
        onClick={(e) => { e.stopPropagation(); const open = !panelOpen; setPanelOpen(open); if (!open) return; fetchItems(); }}
        title="Notifications"
        className="relative inline-flex items-center gap-2 px-3 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700 dark:text-zinc-200">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 01-3.46 0"></path>
        </svg>
        {count > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white bg-red-600 rounded-full">{count}</span>
        )}
      </button>

      {panelOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white dark:bg-zinc-900 border rounded-md shadow-lg z-50">
          <div className="p-2 border-b flex items-center justify-between">
            <strong>Notifications</strong>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); markAllRead(); }} className="text-xs text-zinc-500 hover:underline">Mark all read</button>
              <a href="/notifications" onClick={(e) => { e.stopPropagation(); setPanelOpen(false); }} className="text-xs text-blue-600 hover:underline">View all</a>
            </div>
          </div>
          <div className="max-h-72 overflow-auto">
            {loadingItems ? (
              <div className="p-4 text-sm text-zinc-500">Loading…</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-sm text-zinc-500">No notifications</div>
            ) : (
              items.map((it) => (
                <div key={it.id} className={`p-3 border-b hover:bg-zinc-50 dark:hover:bg-zinc-800 ${it.read ? 'opacity-60' : ''}`} onClick={(e) => { e.stopPropagation(); markReadAndNavigate(it.id, it.url ?? (it.targetType === 'TWEET' && it.targetId ? `/tweet/${it.targetId}` : undefined)); setPanelOpen(false); }}>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                    <div className="flex-1">
                      <div className="text-sm text-zinc-800 dark:text-zinc-100"><strong>{it.actor?.username ?? it.actor?.email}</strong> <span className="text-xs text-zinc-500">{it.action}</span></div>
                      {it.textPreview && <div className="text-xs text-zinc-500 mt-1">{it.textPreview}</div>}
                      <div className="text-xs text-zinc-400 mt-1">{new Date(it.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
