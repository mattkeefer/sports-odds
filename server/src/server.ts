import { createServer } from "node:http";
import { URL } from "node:url";
import { getEvents } from "./sportsGameOddsClient.js";
import { EventsQuery } from "./types.js";

const PORT = Number(process.env.PORT ?? 4000);

function json(res: import("node:http").ServerResponse, statusCode: number, payload: unknown): void {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function parseNumber(value: string | null): number | undefined {
  if (value === null) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function toEventsQuery(searchParams: URLSearchParams): EventsQuery {
  return {
    oddsAvailable: parseBoolean(searchParams.get("oddsAvailable")),
    leagueID: searchParams.get("leagueID") ?? undefined,
    oddID: searchParams.get("oddID") ?? undefined,
    includeAltLines: parseBoolean(searchParams.get("includeAltLines")),
    cursor: searchParams.get("cursor") ?? undefined,
    limit: parseNumber(searchParams.get("limit")),
  };
}

const server = createServer(async (req, res) => {
  if (!req.url || !req.method) {
    json(res, 400, { error: "Invalid request" });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "GET" && url.pathname === "/health") {
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/events") {
    try {
      const query = toEventsQuery(url.searchParams);
      const result = await getEvents(query);
      json(res, 200, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown backend error";
      json(res, 502, { error: message });
    }
    return;
  }

  json(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
