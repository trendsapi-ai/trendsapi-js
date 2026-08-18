import { parseError, TrendsAPIError } from "./errors.js";
import type {
  GetGrowthParams,
  GetGrowthResponse,
  GetTimeSeriesParams,
  GetTopTrendsParams,
  GetTopTrendsResponse,
  TrendsAPIOptions,
  TrendsDataPoint,
} from "./types.js";

const BASE_URL = "https://api.trendsapi.ai/api";
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

export const KEYWORD_SOURCES = Object.freeze([
  "google search",
  "google images",
  "google news",
  "google shopping",
  "youtube",
  "tiktok",
  "reddit",
  "amazon",
  "wikipedia",
  "news volume",
  "news sentiment",
  "app downloads",
  "app rankings",
  "npm",
  "steam",
] as const);

export const LIVE_FEEDS = Object.freeze([
  "Google Trends",
  "Google News Top News",
  "TikTok Trending Hashtags",
  "TikTok Trending Searches",
  "TikTok Shop Hot Products",
  "YouTube Trending",
  "X (Twitter) Trending",
  "Reddit Hot Posts",
  "Reddit World News",
  "Wikipedia Trending",
  "Amazon Best Sellers Top Rated",
  "Amazon Best Sellers by Category",
  "App Store Top Free",
  "App Store Top Paid",
  "Google Play",
  "Top Websites",
  "Spotify Top Podcasts",
  "Steam Most Played",
  "GitHub Trending Repos",
  "IMDb MOVIEmeter",
  "Open Library Trending Books",
] as const);

function resolveApiKey(apiKey?: string): string {
  const envKey =
    typeof process !== "undefined" && process.env
      ? process.env.TRENDSAPI_KEY
      : undefined;
  const key = (apiKey || envKey || "").trim();
  if (!key) {
    throw new Error(
      "apiKey is required. Pass new TrendsAPI({ apiKey }) or set TRENDSAPI_KEY. Get a free key at https://trendsapi.ai/#get-key",
    );
  }
  return key;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function unwrap(raw: unknown, status: number): unknown {
  if (
    raw &&
    typeof raw === "object" &&
    typeof (raw as { statusCode?: unknown }).statusCode === "number" &&
    typeof (raw as { body?: unknown }).body === "string"
  ) {
    const envelope = raw as { statusCode: number; body: string };
    const parsed = JSON.parse(envelope.body);
    if (envelope.statusCode >= 400) throw parseError(envelope.statusCode, parsed);
    return parsed;
  }
  if (status >= 400) throw parseError(status, raw);
  return raw;
}

/**
 * Official Trends API client.
 *
 * Managed JSON trend data across Google, TikTok, Amazon, Reddit, YouTube,
 * Steam, npm and 30+ sources. Native `fetch`, zero runtime dependencies.
 *
 * @example
 * ```ts
 * import { TrendsAPI } from "trendsapi";
 * const client = new TrendsAPI(); // or { apiKey: "..." } / TRENDSAPI_KEY
 * const g = await client.getGrowth({
 *   source: "tiktok",
 *   keyword: "creatine gummies",
 *   percent_growth: ["12M"],
 * });
 * ```
 */
export class TrendsAPI {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(opts: TrendsAPIOptions = {}) {
    this.apiKey = resolveApiKey(opts.apiKey);
    this.baseUrl = (opts.baseUrl || BASE_URL).replace(/\/$/, "");
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = opts.maxRetries ?? MAX_RETRIES;
  }

  private async post(body: Record<string, unknown>): Promise<unknown> {
    let lastErr: TrendsAPIError | undefined;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
      try {
        const res = await fetch(this.baseUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "User-Agent": "trendsapi-js/1.0.0",
          },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
        const text = await res.text();
        let raw: unknown = text;
        if (text) {
          try {
            raw = JSON.parse(text);
          } catch {
            throw new TrendsAPIError(
              res.status || 502,
              "invalid_response",
              `Expected JSON from Trends API, got non-JSON body (${text.slice(0, 80).replace(/\s+/g, " ")})`,
            );
          }
        } else {
          raw = {};
        }
        if (
          res.status >= 400 &&
          (res.status === 429 || res.status >= 500) &&
          attempt < this.maxRetries
        ) {
          lastErr = parseError(res.status, raw);
          await sleep(Math.min(2 ** attempt * 1000, 8000));
          continue;
        }
        return unwrap(raw, res.status);
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastErr ?? new TrendsAPIError(500, "retry_exhausted", "Request failed after retries");
  }

  /** ~5 years of weekly history for one source + keyword (or recent daily with `data_mode: "daily"`). */
  getTimeSeries(params: GetTimeSeriesParams): Promise<TrendsDataPoint[]> {
    const body: Record<string, unknown> = {
      mode: "get_time_series",
      source: params.source,
      keyword: params.keyword,
    };
    if (params.data_mode) body.data_mode = params.data_mode;
    return this.post(body) as Promise<TrendsDataPoint[]>;
  }

  /** Alias for {@link TrendsAPI.getTimeSeries}. */
  getTrends(params: GetTimeSeriesParams): Promise<TrendsDataPoint[]> {
    return this.getTimeSeries(params);
  }

  /** Period-over-period growth. Omit `percent_growth` to let the API default to `["12M"]`. */
  getGrowth(params: GetGrowthParams): Promise<GetGrowthResponse> {
    const body: Record<string, unknown> = {
      mode: "get_growth",
      source: params.source,
      keyword: params.keyword,
    };
    if (params.percent_growth) body.percent_growth = params.percent_growth;
    if (params.data_mode) body.data_mode = params.data_mode;
    return this.post(body) as Promise<GetGrowthResponse>;
  }

  /** Live trending feeds. Omit `type` on REST to receive all feeds. */
  getTopTrends(params: GetTopTrendsParams = {}): Promise<GetTopTrendsResponse> {
    const body: Record<string, unknown> = { mode: "get_top_trends" };
    if (params.type) body.type = params.type;
    if (params.category) body.category = params.category;
    if (params.limit != null) body.limit = params.limit;
    if (params.offset != null) body.offset = params.offset;
    return this.post(body) as Promise<GetTopTrendsResponse>;
  }
}
