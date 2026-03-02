import { Event } from "./components/EventCard";
import { Bet } from "./models/models";

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
      opposingOddID?: string;
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

export const SPORTSBOOK_LABELS: Record<string, string> = {
  draftkings: "DraftKings",
  fanduel: "FanDuel",
  betmgm: "BetMGM",
  caesars: "Caesars",
  fanatics: "Fanatics",
  espnbet: "ESPN Bet",
  thescorebet: "theScore Bet",
  fliff: "Fliff",
  pinnacle: "Pinnacle",
};

interface RawBet {
  id: string;
  type: string;
  selection: string;
  sportsbook: string;
  odds: number;
  fairOdds: number;
  ev: number;
  recommendedBet: number;
}

function groupBetsBySelection(rawBets: RawBet[]): Bet[] {
  const grouped = new Map<string, Bet>();

  rawBets.forEach((rawBet) => {
    const key = `${rawBet.type}|${rawBet.selection}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        id: key,
        type: rawBet.type,
        selection: rawBet.selection,
        listings: [],
      });
    }

    const bet = grouped.get(key)!;
    bet.listings.push({
      id: rawBet.id,
      sportsbook: rawBet.sportsbook,
      odds: rawBet.odds,
      fairOdds: rawBet.fairOdds,
      ev: rawBet.ev,
      recommendedBet: rawBet.recommendedBet,
    });
  });

  return Array.from(grouped.values());
}

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

function probabilityToAmericanOdds(probability: number): number | null {
  if (probability <= 0 || probability >= 1) return null;
  if (probability >= 0.5) {
    return Math.round((-100 * probability) / (1 - probability));
  }
  return Math.round((100 * (1 - probability)) / probability);
}

export function calculateEVPercent(bookOdds: number, fairOdds: number): number {
  const fairProbability = americanToImpliedProbability(fairOdds);
  const bookDecimal = americanToDecimalOdds(bookOdds);
  return (fairProbability * bookDecimal - 1) * 100;
}

export function formatDate(iso?: string): { date: string; time: string } {
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

function getPinnacleDevigFairOdds(
  odd: NonNullable<ApiEvent["odds"]>[string],
  oddsById: Record<string, NonNullable<ApiEvent["odds"]>[string]>,
): number | null {
  const oddID = odd.oddID;
  const opposingOddID = odd.opposingOddID;
  if (!oddID || !opposingOddID) return null;

  const thisPinnacleOdds = parseAmericanOdds(odd.byBookmaker?.pinnacle?.odds);
  if (thisPinnacleOdds === null) return null;

  const opposingOdd = oddsById[opposingOddID];
  if (!opposingOdd) return null;
  const opposingPinnacleOdds = parseAmericanOdds(
    opposingOdd.byBookmaker?.pinnacle?.odds,
  );
  if (opposingPinnacleOdds === null) return null;

  const thisImplied = americanToImpliedProbability(thisPinnacleOdds);
  const opposingImplied = americanToImpliedProbability(opposingPinnacleOdds);
  const total = thisImplied + opposingImplied;
  if (total <= 0) return null;

  const devigProbability = thisImplied / total;
  return probabilityToAmericanOdds(devigProbability);
}

function mapApiEventToUIEvent(apiEvent: ApiEvent, pinnyMode: boolean): Event {
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

  const rawBets: RawBet[] = [];
  const oddsById = apiEvent.odds ?? {};
  const oddsEntries = Object.values(oddsById);

  for (const odd of oddsEntries) {
    const defaultFairOdds = parseAmericanOdds(odd.fairOdds);
    const pinnyFairOdds = pinnyMode
      ? getPinnacleDevigFairOdds(odd, oddsById)
      : null;
    const fairOdds = pinnyFairOdds ?? defaultFairOdds;
    if (fairOdds === null) continue;

    const byBookmaker = odd.byBookmaker ?? {};
    for (const [bookmakerID, line] of Object.entries(byBookmaker)) {
      const sportsbook = SPORTSBOOK_LABELS[bookmakerID.toLowerCase()];
      if (!sportsbook) continue;

      const bookOdds = parseAmericanOdds(line.odds);
      if (bookOdds === null) continue;

      const ev = calculateEVPercent(bookOdds, fairOdds);
      rawBets.push({
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

  const bets = groupBetsBySelection(rawBets);

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
  sportsbooks: string[],
  leagues: string[],
  pinnyMode: boolean,
  signal?: AbortSignal,
): Promise<Event[]> {
  const nowIso = new Date().toISOString();
  const params = new URLSearchParams();
  params.set("oddsAvailable", "true");
  params.set("finalized", "false");
  params.set("live", "false");
  params.set("startsAfter", nowIso);
  params.set("limit", "1");
  if (leagues.length > 0) {
    params.set("leagueID", leagues.join(","));
  }
  const requestSportsbooks = [...sportsbooks];
  if (pinnyMode && !requestSportsbooks.includes("Pinnacle")) {
    requestSportsbooks.push("Pinnacle");
  }
  if (requestSportsbooks.length > 0) {
    params.set(
      "bookmakerID",
      requestSportsbooks
        .map(
          (s) =>
            Object.entries(SPORTSBOOK_LABELS)
              .find(([_key, val]) => val === s)?.[0]
              ?.toLowerCase() ?? s.toLowerCase(),
        )
        .join(","),
    );
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
  return (json.data ?? [])
    .filter((event) => {
      const startsAt = event.status?.startsAt;
      return startsAt ? new Date(startsAt).getTime() > Date.now() : true;
    })
    .map((event) => mapApiEventToUIEvent(event, pinnyMode));
}
