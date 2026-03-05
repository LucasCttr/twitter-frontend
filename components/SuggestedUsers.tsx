"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email?: string;
  image?: string;
  followersCount?: number;
}

export default function SuggestedUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await fetch(`/api/proxy/users?sort=followers`, { credentials: "include" });
        if (!res.ok) throw new Error("Error fetching users");
        const data = await res.json();
        setUsers(data?.users || []);
      } catch (e) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <aside className="hidden xl:block w-[320px] p-4 pt-6 sticky top-0 h-screen overflow-y-auto">
      <div className="bg-zinc-900 rounded-lg shadow p-4">
        <h2 className="text-lg font-bold mb-4 text-zinc-100">Suggested users</h2>
        {loading ? (
          <div className="text-zinc-400">Loading…</div>
        ) : users.length === 0 ? (
          <div className="text-zinc-400">No suggestions</div>
        ) : (
          <ul className="space-y-3">
            {users.slice(0, 6).map((user) => (
              <li key={user.id} className="flex items-center gap-3">
                <Link href={`/profile/${user.id}`} className="flex items-center gap-3 hover:underline">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-9 h-9 rounded-full object-cover bg-zinc-700" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-100">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-zinc-100 leading-tight">{user.name}</div>
                    <div className="text-xs text-zinc-400">@{user.email ? user.email.split("@")[0] : user.id}</div>
                  </div>
                </Link>
                <span className="ml-auto text-xs text-zinc-400">{user.followersCount ?? 0} followers</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
