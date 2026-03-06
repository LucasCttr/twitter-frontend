"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import SuggestedUsers from "./SuggestedUsers";
import TrendingTopics from "./TrendingTopics";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  // For auth routes we want a minimal page showing only the auth children
  if (pathname.startsWith("/auth")) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#18181b' }}>
        <div className="w-full max-w-md mx-4">{children}</div>
      </div>
    );
  }

  // Default app shell with header and sidebars
  return (
    <div className="relative z-20 min-h-screen w-full flex flex-col" style={{ backgroundColor: '#18181c' }}>
      <Header />
      <div className="w-full flex justify-center items-start">
        <div className="w-full max-w-[1620px] mx-auto xl:grid xl:grid-cols-[430px_minmax(0,45rem)_430px] xl:gap-0">
          <aside className="hidden xl:block w-[430px] p-4 pt-6 sticky top-0 border-r border-white/30" style={{ backgroundColor: '#18181b', borderLeft: '1px solid rgba(255, 255, 255, 0.28)' }}>
            <TrendingTopics />
          </aside>

          <section className="w-full min-w-0" style={{ backgroundColor: '#18181b' }}>
            <main className="w-full z-10 min-h-screen bg-black px-0" style={{ backgroundColor: '#18181b' }}>{children}</main>
          </section>

          <aside className="hidden xl:block w-[430px] p-4 pt-6 sticky top-0 border-l border-white/30" style={{ backgroundColor: '#18181b', borderRight: '1px solid rgba(255, 255, 255, 0.28)' }}>
            <SuggestedUsers />
          </aside>
        </div>
      </div>
    </div>
  );
}
