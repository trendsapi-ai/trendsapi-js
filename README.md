# trendsapi (JavaScript / TypeScript)

Official JS/TS client for [Trends API](https://trendsapi.ai). Node 18+, Deno, Bun, Workers. Zero runtime dependencies. Three methods. Decoded payloads. You never parse the HTTP `body` string.

HTTP contract and field tables: [trendsapi-ai/trendsapi](https://github.com/trendsapi-ai/trendsapi).

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![npm](https://img.shields.io/badge/npm-trendsapi-red.svg)](https://www.npmjs.com/package/trendsapi)
[![Runtime](https://img.shields.io/badge/runtime-fetch-lightgrey.svg)](https://trendsapi.ai)

## Authentication

```bash
npm install trendsapi
export TRENDSAPI_KEY=your_key
```

Key: [trendsapi.ai/#get-key](https://trendsapi.ai/#get-key) (100 calls/month on free).

```ts
import { TrendsAPI } from "trendsapi";

const client = new TrendsAPI({ apiKey: process.env.TRENDSAPI_KEY! });
```

## Methods

| Method | REST `mode` | Required | Returns |
|---|---|---|---|
| `getTimeSeries` | `get_time_series` | `source`, `keyword` | weekly points |
| `getGrowth` | `get_growth` | `source`, `keyword` | growth object |
| `getTopTrends` | `get_top_trends` | `type` | live feed |

```ts
const series = await client.getTimeSeries({ source: "youtube", keyword: "air fryer" });
const growth = await client.getGrowth({
  source: "google shopping",
  keyword: "air fryer",
  percentGrowth: ["3M", "12M"],
});
const chart = await client.getTopTrends({ type: "App Store Top Free", limit: 25 });
```

Typed `source` and `type` are separate unions. `source: "Google Trends"` is a type error (and a 400 on raw POST).

## getTimeSeries

```ts
const points = await client.getTimeSeries({ source: "google search", keyword: "bitcoin" });
```

| Field | Always | Meaning |
|---|---|---|
| `date` | yes | `YYYY-MM-DD` |
| `value` | yes | 0-100 index |
| `keyword` | yes | Echo |
| `volume` | no | Absolute volume when available |
| `source` or `datatype` | no | Pipeline label |

## getGrowth

```ts
const g = await client.getGrowth({
  source: "google search",
  keyword: "nike",
  percentGrowth: ["12M", "3M", "YTD"],
});
```

Default window: `["12M"]`. Presets: `7D` `14D` `30D` `1M` `2M` `3M` `6M` `9M` `12M`/`1Y` `18M` `24M`/`2Y` `36M`/`3Y` `48M` `60M`/`5Y` `MTD` `QTD` `YTD`. Custom: `{ name: "Launch", recent: "2024-06-01", baseline: "2024-01-01" }`.

| Field | Meaning |
|---|---|
| `search_term` | Keyword |
| `data_source` | Source |
| `results` | Per-window `growth`, `direction`, dates, values |
| `metadata` | Counts / success flag |

## getTopTrends

```ts
const hot = await client.getTopTrends({ type: "GitHub Trending Repos", limit: 5 });
```

| Field | Meaning |
|---|---|
| `as_of_ts` | Snapshot time |
| `type` | Feed name |
| `limit`, `offset`, `count` | Pagination |
| `data` | `[rank, label]` rows |

Optional `offset`, `category` (`Amazon Best Sellers by Category`, `Top Websites` only).

## Keyword sources

Pass as `source`. Details: [hub README](https://github.com/trendsapi-ai/trendsapi#keyword-sources).

| `source` | `keyword` |
|---|---|
| `google search`, `google images`, `google news`, `google shopping` | Any phrase |
| `youtube` | Any phrase |
| `tiktok` | Hashtag or topic |
| `reddit` | Subreddit, no `r/` |
| `amazon` | Product phrase |
| `wikipedia` | Article title |
| `news volume`, `news sentiment` | Any phrase |
| `app downloads`, `app rankings` | Android bundle ID (`com.openai.chatgpt`) |
| `npm` | Exact package name |
| `steam` | Game display name |

## Live feeds

Pass as `type`. Exact strings: `Google Trends`, `Google News Top News`, `TikTok Trending Hashtags`, `TikTok Trending Searches`, `TikTok Shop Hot Products`, `YouTube Trending`, `X (Twitter) Trending`, `Reddit Hot Posts`, `Reddit World News`, `Wikipedia Trending`, `Amazon Best Sellers Top Rated`, `Amazon Best Sellers by Category`, `App Store Top Free`, `App Store Top Paid`, `Google Play`, `Top Websites`, `Spotify Top Podcasts`, `Steam Most Played`, `GitHub Trending Repos`, `IMDb MOVIEmeter`, `Open Library Trending Books`.

## Next.js / Workers

Uses global `fetch`. Bind `TRENDSAPI_KEY` as a secret.

```ts
import { TrendsAPI } from "trendsapi";

export async function GET(req: Request) {
  const keyword = new URL(req.url).searchParams.get("q") ?? "air fryer";
  const client = new TrendsAPI({ apiKey: process.env.TRENDSAPI_KEY! });
  const [search, shopping, video] = await Promise.all([
    client.getGrowth({ source: "google search", keyword, percentGrowth: ["12M"] }),
    client.getGrowth({ source: "google shopping", keyword, percentGrowth: ["12M"] }),
    client.getGrowth({ source: "youtube", keyword, percentGrowth: ["12M"] }),
  ]);
  return Response.json({ keyword, search, shopping, video });
}
```

Three 200s, three quota units.

```ts
export default {
  async fetch(_req: Request, env: { TRENDSAPI_KEY: string }) {
    const client = new TrendsAPI({ apiKey: env.TRENDSAPI_KEY });
    return Response.json(await client.getTopTrends({ type: "GitHub Trending Repos", limit: 5 }));
  },
};
```

```ts
import type { TimeSeriesPoint, GrowthResponse, TopTrendsResponse } from "trendsapi";
```

## Errors

| Code | Client |
|---|---|
| 200 | Resolves parsed payload |
| 400 | Throws. Fix field names |
| 401 | Throws. Check `TRENDSAPI_KEY` |
| 404 | Throws. No series. Do not retry |
| 429 | Throws. Quota |
| 5xx | Retries, then throws |

Raw `fetch` (second parse required): [hub, Raw HTTP](https://github.com/trendsapi-ai/trendsapi#raw-http).

## License

MIT. See [LICENSE](LICENSE).
