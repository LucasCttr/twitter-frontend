export function normalizeTweet(raw: any) {
  if (!raw || typeof raw !== 'object') return raw;

  const bookmarksCount =
    raw?.bookmarksCount ?? raw?.bookmarks_count ?? raw?.bookmarks ?? raw?.bookmarksTotal ?? 0;

  const bookmarkedByCurrentUser =
    raw?.bookmarkedByCurrentUser ?? raw?.bookmarked ?? raw?.bookmarked_by_current_user ?? raw?.isBookmarked ?? raw?.bookmarked_by_me ?? false;

  return {
    ...raw,
    bookmarksCount: typeof bookmarksCount === 'string' ? Number(bookmarksCount) : bookmarksCount ?? 0,
    bookmarkedByCurrentUser: Boolean(bookmarkedByCurrentUser),
  };
}

export default normalizeTweet;
