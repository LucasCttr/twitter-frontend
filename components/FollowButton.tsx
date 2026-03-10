"use client";
import React, { useState } from "react";

export default function FollowButton({ user, onChange }: { user: any; onChange?: (next: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(false);

  const isSelf = user?.followStatus === "self";
  if (isSelf) return null;

  const isFollowing = !!user?.isFollowing;
  const followStatus = user?.followStatus ?? "none";

  // status shown by default
  const statusLabel = isFollowing
    ? "Following"
    : followStatus === "requested"
    ? "Requested"
    : followStatus === "follow_back"
    ? "Follow back"
    : "Follow";
  // label shown when hovering (action)
  const actionLabel = isFollowing ? "Unfollow" : followStatus === "requested" ? "Cancel" : "Follow";

  async function toggle(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const id = user.id ?? user._id ?? user.userId ?? user.handle ?? "";
      const endpoint = `/api/proxy/users/${encodeURIComponent(id)}/follow`;

      // determine method: if currently following -> DELETE; if requested -> DELETE (cancel request); else -> POST
      const method = isFollowing ? "DELETE" : (followStatus === "requested" ? "DELETE" : "POST");

      // optimistic update: flip isFollowing for instant feedback or clear request
      const optimistic = { ...user, isFollowing: method === "POST", followStatus: method === "POST" ? "none" : "none" };
      onChange?.(optimistic);

      const res = await fetch(endpoint, { method, credentials: "include" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Status ${res.status}`);
      }
      const json = await res.json().catch(() => null);
      const next = json ?? optimistic;
      onChange?.(next);
    } catch (e) {
      console.error("Follow toggle failed", e);
      // revert optimistic update on error
      try {
        onChange?.(user);
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  const display = loading ? "..." : (hover ? actionLabel : statusLabel);

  const baseClass = isFollowing ? "bg-transparent border border-zinc-600 text-zinc-200" : "bg-blue-600 text-white";
  const hoverClass = isFollowing && hover ? "bg-red-600 text-white border-transparent" : "";

  return (
    <button
      onClick={(e) => toggle(e)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={loading}
      className={`px-3 py-1 rounded text-sm font-medium transition ${baseClass} ${hoverClass} hover:opacity-90`}>
      {display}
    </button>
  );
}
