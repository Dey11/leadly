export type redditScrapeInput = {
  subreddit: string;
  postsCount: number;
};

export type redditComment = {
  commenterId: string;
  commentText: string;
  commenterName: string;
  urlToComment: string;
  children: redditComment[];
};

export type redditPost = {
  post: string;
  postId: string;
  posterId: string;
  urlToPost: string;
  comments: redditComment[];
};

export type redditScrapeOutput = {
  posts: redditPost[];
};
