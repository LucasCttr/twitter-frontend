"use client";
import React from "react";
import FollowButton from "./FollowButton";

interface Profile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  followStatus: string;
}
export default function ProfileCard({ profile, onChange }: { profile: Profile; onChange?: (next: any) => void }) {
  const isSelf = profile.followStatus === "self";
  return (
    <div className="w-full text-center">
      <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
      <div className="text-sm text-zinc-500 mb-2">{profile.email}</div>
      <div className="text-xs text-zinc-400 mb-4">Joined: {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "Fecha desconocida"}</div>
      <div className="flex gap-6 mb-4 justify-center">
        <div>
          <span className="font-bold">{profile.followersCount}</span> Followers
        </div>
        <div>
          <span className="font-bold">{profile.followingCount}</span> Following
        </div>
      </div>
      {!isSelf && (
        <div>
          <FollowButton user={profile} onChange={(next) => {
            // propagate change to parent page
            onChange?.(next);
          }} />
        </div>
      )}
    </div>
  );
}
