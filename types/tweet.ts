export interface Author {
  id?: string;
  name?: string;
  email?: string;
}

export interface TweetItem {
  id: string;
  parentId?: string | null;
  retweetOfId?: string | null;
  retweetOf?: TweetItem | null;
  content?: string | null;
  text?: string | null;
  author?: Author;
  likesCount?: number;
  retweetsCount?: number;
  repliesCount?: number;
  createdAt?: string;
}

export type Tweet = TweetItem;