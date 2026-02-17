import { Event } from "./components/EventCard";
import { Bet } from "./components/BetCard";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

type ApiEvent = {
  eventID: string;
  leagueID?: string;
  teams?: {
    home?: { names?: { long?: string; medium?: string; short?: string } };
    away?: { names?: { long?: string; medium?: string; short?: string } };
  };
  status?: { startsAt?: string };
  odds?: Record<
    string,
    {
      oddID?: string;
      marketName?: string;
      sideID?: string;
      fairOdds?: string;
      byBookmaker?: Record<string, { odds?: string; available?: boolean }>;
    }
  >;
};

type ApiEventsResponse = {
  success: boolean;
  data: ApiEvent[];
  nextCursor?: string;
  notice?: string;
};

const BOOKMAKER_LABELS: Record<string, string> = {
  draftkings: "DraftKings",
  fanduel: "FanDuel",
  betmgm: "BetMGM",
  caesars: "Caesars",
  pointsbet: "PointsBet",
  betrivers: "BetRivers",
};

function parseAmericanOdds(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function americanToImpliedProbability(odds: number): number {
  if (odds > 0) return 100 / (odds + 100);
  return Math.abs(odds) / (Math.abs(odds) + 100);
}

function americanToDecimalOdds(odds: number): number {
  if (odds > 0) return 1 + odds / 100;
  return 1 + 100 / Math.abs(odds);
}

function calculateEVPercent(bookOdds: number, fairOdds: number): number {
  const fairProbability = americanToImpliedProbability(fairOdds);
  const bookDecimal = americanToDecimalOdds(bookOdds);
  return (fairProbability * bookDecimal - 1) * 100;
}

function formatDate(iso?: string): { date: string; time: string } {
  if (!iso) return { date: "Unknown", time: "Unknown" };
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { date: "Unknown", time: "Unknown" };

  return {
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

function mapApiEventToUIEvent(apiEvent: ApiEvent): Event {
  const startsAt = apiEvent.status?.startsAt;
  const { date, time } = formatDate(startsAt);

  const homeTeam =
    apiEvent.teams?.home?.names?.medium ??
    apiEvent.teams?.home?.names?.long ??
    apiEvent.teams?.home?.names?.short ??
    "Home";
  const awayTeam =
    apiEvent.teams?.away?.names?.medium ??
    apiEvent.teams?.away?.names?.long ??
    apiEvent.teams?.away?.names?.short ??
    "Away";

  const bets: Bet[] = [];
  const oddsEntries = Object.values(apiEvent.odds ?? {});

  for (const odd of oddsEntries) {
    const fairOdds = parseAmericanOdds(odd.fairOdds);
    if (fairOdds === null) continue;

    const byBookmaker = odd.byBookmaker ?? {};
    for (const [bookmakerID, line] of Object.entries(byBookmaker)) {
      const sportsbook = BOOKMAKER_LABELS[bookmakerID.toLowerCase()];
      if (!sportsbook) continue;

      const bookOdds = parseAmericanOdds(line.odds);
      if (bookOdds === null) continue;

      const ev = calculateEVPercent(bookOdds, fairOdds);
      bets.push({
        id: `${apiEvent.eventID}:${odd.oddID ?? odd.sideID ?? "odd"}:${bookmakerID}`,
        type: odd.marketName ?? "Market",
        selection: odd.sideID ?? odd.oddID ?? "Selection",
        sportsbook,
        odds: bookOdds,
        fairOdds,
        ev,
        recommendedBet: 0,
      });
    }
  }

  return {
    id: apiEvent.eventID,
    league: apiEvent.leagueID ?? "UNKNOWN",
    homeTeam,
    awayTeam,
    date,
    time,
    bets,
  };
}

export async function fetchEvents(
  leagues: string[],
  signal?: AbortSignal,
): Promise<Event[]> {
  const params = new URLSearchParams();
  params.set("oddsAvailable", "true");
  params.set("includeAltLines", "false");
  params.set("limit", "1");
  if (leagues.length > 0) {
    params.set("leagueID", leagues.join(","));
  }

  const response = await fetch(
    `${API_BASE_URL}/api/events?${params.toString()}`,
    {
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(`Backend request failed (${response.status}).`);
  }

  const json = (await response.json()) as ApiEventsResponse;
  return (json.data ?? []).map(mapApiEventToUIEvent);
}
