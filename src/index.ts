/**
 * trendsapi — Official JavaScript / TypeScript client for the Trends API.
 *
 * Normalized 0-100 trend scores across Google, TikTok, Amazon, Reddit, YouTube,
 * Steam, npm and 30+ sources. Zero runtime dependencies. Native fetch. Edge-ready.
 *
 * Get a free API key: https://trendsapi.ai/#get-key
 */

export { TrendsAPI, KEYWORD_SOURCES, LIVE_FEEDS } from "./client.js";
export { TrendsAPIError } from "./errors.js";
export type {
  TrendsSource,
  GrowthPreset,
  CustomGrowthPeriod,
  TrendsDataPoint,
  GrowthResult,
  GrowthMetadata,
  GetGrowthResponse,
  TopTrendsFeed,
  GetTopTrendsResponse,
  TrendsAPIOptions,
  GetTimeSeriesParams,
  GetGrowthParams,
  GetTopTrendsParams,
} from "./types.js";

export { TrendsAPI as default } from "./client.js";
