import { EventsQuery, SportsEvent, SportsGameOddsResponse } from "./types.js";

const BASE_URL =
  process.env.SPORTSGAMEODDS_BASE_URL ?? "https://api.sportsgameodds.com/v2";

function getApiKey(): string {
  const apiKey = process.env.SPORTSGAMEODDS_API_KEY;
  if (!apiKey) {
    throw new Error("Missing SPORTSGAMEODDS_API_KEY environment variable.");
  }
  return apiKey;
}

function addQueryParam(
  params: URLSearchParams,
  key: string,
  value: unknown,
): void {
  if (value === undefined || value === null || value === "") return;
  params.set(key, String(value));
}

export async function getEvents(
  query: EventsQuery = {},
): Promise<SportsGameOddsResponse<SportsEvent[]>> {
  const params = new URLSearchParams();
  addQueryParam(params, "oddsAvailable", query.oddsAvailable);
  addQueryParam(params, "finalized", query.finalized);
  addQueryParam(params, "live", query.live);
  addQueryParam(params, "leagueID", query.leagueID);
  addQueryParam(params, "oddID", query.oddID);
  addQueryParam(params, "bookmakerID", query.bookmakerID);
  addQueryParam(params, "startsAfter", query.startsAfter);
  addQueryParam(params, "includeAltLines", query.includeAltLines);
  addQueryParam(params, "cursor", query.cursor);
  addQueryParam(params, "limit", query.limit);

  const url = `${BASE_URL}/events?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      "x-api-key": getApiKey(),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `SportsGameOdds request failed (${response.status}): ${body}`,
    );
  }

  const json = (await response.json()) as SportsGameOddsResponse<SportsEvent[]>;
  if (!json || !Array.isArray(json.data)) {
    throw new Error("Unexpected response shape from SportsGameOdds API.");
  }

  return json;
}
