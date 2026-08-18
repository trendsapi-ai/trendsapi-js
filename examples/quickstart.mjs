// Trends API JS client. Get a free key at https://trendsapi.ai/#get-key
import { TrendsAPI } from "trendsapi";

const client = new TrendsAPI({ apiKey: process.env.TRENDSAPI_KEY });
console.log(await client.getTopTrends({ type: "Google Trends", limit: 10 }));
