import { TweetItem } from "./tweet";


export interface FeedResponse {
  hasMore?: boolean;
  nextCursor?: string | null;
  items: TweetItem[];
}


