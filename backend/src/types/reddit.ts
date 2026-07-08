export type RedditComment = {
  commenterId: string;
  commentText: string;
  commenterName: string;
  urlToComment: string;
  children: RedditComment[];
};

export type RedditPost = {
  subreddit: string;
  title: string;
  post: string;
  postId: string;
  posterId: string;
  urlToPost: string;
  comments: RedditComment[];
};

export type RedditFetchTarget =
  | { type: "SUBREDDIT"; subreddit: string }
  | { type: "CUSTOM_FEED"; owner: string; name: string };
