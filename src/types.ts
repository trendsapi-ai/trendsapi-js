/** Keyword trend sources supported by the Trends API. */
export type TrendsSource =
  | "google search"
  | "google images"
  | "google news"
  | "google shopping"
  | "youtube"
  | "tiktok"
  | "reddit"
  | "amazon"
  | "wikipedia"
  | "news volume"
  | "news sentiment"
  | "app downloads"
  | "app rankings"
  | "npm"
  | "steam"
  | (string & {});

export type GrowthPreset =
  | "7D"
  | "14D"
  | "30D"
  | "1M"
  | "2M"
  | "3M"
  | "6M"
  | "9M"
  | "12M"
  | "1Y"
  | "18M"
  | "24M"
  | "2Y"
  | "36M"
  | "3Y"
  | "48M"
  | "60M"
  | "5Y"
  | "MTD"
  | "QTD"
  | "YTD"
  | (string & {});

export type CustomGrowthPeriod = {
  recent: string;
  baseline: string;
  name?: string;
};

export type TrendsDataPoint = {
  date: string;
  value: number;
  keyword: string;
  volume?: number | null;
  source?: string;
  datatype?: string;
  volume_cumulative?: number | null;
};

export type GrowthResult = {
  period: string;
  growth?: number | null;
  direction?: string | null;
  recent_date?: string;
  baseline_date?: string;
  recent_value?: number | null;
  baseline_value?: number | null;
  volume_available?: boolean;
  recent_volume?: number | null;
  baseline_volume?: number | null;
  volume_growth?: number | null;
  status?: string;
  error?: string;
  message?: string;
  data_start?: string;
  data_end?: string;
  calculation_method?: string;
  growth_unit?: string;
  [key: string]: unknown;
};

export type GrowthMetadata = {
  total_data_points: number;
  calculations_completed: number;
  all_successful: boolean;
};

export type GetGrowthResponse = {
  search_term: string;
  data_source: string;
  results: GrowthResult[];
  metadata: GrowthMetadata;
};

export type TopTrendsFeed =
  | "Google Trends"
  | "Google News Top News"
  | "TikTok Trending Hashtags"
  | "TikTok Trending Searches"
  | "TikTok Shop Hot Products"
  | "YouTube Trending"
  | "X (Twitter) Trending"
  | "Reddit Hot Posts"
  | "Reddit World News"
  | "Wikipedia Trending"
  | "Amazon Best Sellers Top Rated"
  | "Amazon Best Sellers by Category"
  | "App Store Top Free"
  | "App Store Top Paid"
  | "Google Play"
  | "Top Websites"
  | "Spotify Top Podcasts"
  | "Steam Most Played"
  | "GitHub Trending Repos"
  | "IMDb MOVIEmeter"
  | "Open Library Trending Books"
  | (string & {});

export type GetTopTrendsResponse = {
  type: string;
  count: number;
  data: Array<[number, string] | unknown[]>;
  limit?: number;
  offset?: number;
  as_of_ts?: string;
};

export type TrendsAPIOptions = {
  /** API key. Defaults to `process.env.TRENDSAPI_KEY`. */
  apiKey?: string;
  /** Override API base URL (default production endpoint). */
  baseUrl?: string;
  /** Request timeout in milliseconds (default 30000). */
  timeoutMs?: number;
  /** Retries for 429 / 5xx (default 3). */
  maxRetries?: number;
};

export type GetTimeSeriesParams = {
  source: TrendsSource;
  keyword: string;
  data_mode?: "daily" | string;
};

export type GetGrowthParams = {
  source: TrendsSource;
  keyword: string;
  percent_growth?: Array<GrowthPreset | CustomGrowthPeriod>;
  data_mode?: "daily" | string;
};

export type GetTopTrendsParams = {
  type?: TopTrendsFeed;
  category?: string;
  limit?: number;
  offset?: number;
};
