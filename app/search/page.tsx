import SearchResults from "@/components/SearchResults";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; tab?: string }> | { q?: string; tab?: string } }) {
  const params = await searchParams;
  const q = params?.q ?? "";
  const tab = params?.tab ?? "relevance";
  return (
    <main>
      <SearchResults q={q} initialTab={tab} />
    </main>
  );
}
