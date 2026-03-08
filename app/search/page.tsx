import React from "react";
import SearchResults from "@/components/SearchResults";

export default function SearchPage({ searchParams }: { searchParams?: Record<string, any> }) {
  const q = (searchParams?.q as string) ?? "";
  const tab = (searchParams?.tab as string) ?? "relevance";
  return (
    <main>
      <SearchResults q={q} initialTab={tab} />
    </main>
  );
}
