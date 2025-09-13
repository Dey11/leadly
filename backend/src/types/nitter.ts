export type nitterTweet = {
  user: string;
  content: string;
  tweetLink: string;
};

export type nitterScrapeInput = {
  query: string;
  daysAgo: number;
};

export type nitterScrapeOutput = {
  tweets: nitterTweet[];
};
