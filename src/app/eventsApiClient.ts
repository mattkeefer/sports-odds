import { Event } from "./components/EventCard";
import { PlacedBet } from "./models/bet";
import { Bet } from "./models/models";
import { UserModel } from "./models/user";

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
  links?: { bookmakers?: Record<string, string> };
  odds?: Record<
    string,
    {
      oddID?: string;
      opposingOddID?: string;
      marketName?: string;
      betTypeID?: string;
      sideID?: string;
      fairOdds?: string;
      fairSpread?: number;
      fairOverUnder?: number;
      byBookmaker?: Record<
        string,
        {
          odds?: string;
          available?: boolean;
          spread?: number;
          overUnder?: number;
        }
      >;
    }
  >;
};

type ApiEventsResponse = {
  success: boolean;
  data: ApiEvent[];
  nextCursor?: string;
  notice?: string;
};

type RegisterUserRequest = {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  username: string;
  state: string;
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
  kalshi: "Kalshi",
};

interface RawBet {
  id: string;
  marketName: string;
  type: string;
  selection: string;
  sportsbook: string;
  odds: number;
  fairOdds: number;
  fairLine: number | null;
  ev: number;
  recommendedBet: number;
}

function groupBetsBySelection(rawBets: RawBet[]): Bet[] {
  const grouped = new Map<string, Bet>();

  rawBets.forEach((rawBet) => {
    if (!grouped.has(rawBet.id)) {
      grouped.set(rawBet.id, {
        id: rawBet.id,
        marketName: rawBet.marketName,
        type: rawBet.type,
        selection: rawBet.selection,
        listings: [],
      });
    }

    const bet = grouped.get(rawBet.id)!;
    bet.listings.push({
      id: rawBet.id,
      sportsbook: rawBet.sportsbook,
      odds: rawBet.odds,
      fairOdds: rawBet.fairOdds,
      fairLine: rawBet.fairLine,
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
): [number, number | null] | null {
  const oddID = odd.oddID;
  const opposingOddID = odd.opposingOddID;
  if (
    !oddID ||
    !opposingOddID ||
    !odd.byBookmaker?.pinnacle?.available ||
    !oddsById[opposingOddID]?.byBookmaker?.pinnacle?.available
  )
    return null;

  var line = null;
  switch (odd.betTypeID) {
    case "ou":
      // Ensure Over/Under bets use the same line
      const thisLine = odd.byBookmaker?.pinnacle?.overUnder;
      const opposingLine =
        oddsById[opposingOddID].byBookmaker?.pinnacle?.overUnder;
      if (
        thisLine !== opposingLine ||
        thisLine === undefined ||
        opposingLine === undefined
      )
        return null;
      line = thisLine;
      break;
    case "sp":
      // Ensure Spread bets use the same line
      const thisSpread = odd.byBookmaker?.pinnacle?.spread;
      const opposingSpread =
        oddsById[opposingOddID].byBookmaker?.pinnacle?.spread;
      if (
        thisSpread === undefined ||
        opposingSpread === undefined ||
        Math.abs(thisSpread) !== Math.abs(opposingSpread)
      )
        return null;
      line = thisSpread;
      break;
    case "ml":
    case "eo":
    case "yn":
    case "ml3way":
    case "prop":
      // Handle normal bets
      break;
    default:
      return null;
  }

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
  const convertedOdds = probabilityToAmericanOdds(devigProbability);
  if (convertedOdds === null) return null;
  return [convertedOdds, line];
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
    const pinnyResponse = getPinnacleDevigFairOdds(odd, oddsById);
    if (pinnyMode && pinnyResponse === null) continue;
    const [pinnyFairOdds, pinnyLine] = pinnyResponse! || [null, null];
    const fairOdds = pinnyMode ? pinnyFairOdds : defaultFairOdds;
    if (fairOdds === null) continue;

    const byBookmaker = odd.byBookmaker ?? {};
    for (const [bookmakerID, line] of Object.entries(byBookmaker)) {
      const sportsbook = SPORTSBOOK_LABELS[bookmakerID.toLowerCase()];
      if (!sportsbook || !line.available) continue;

      var fairLine = null;
      if (pinnyMode) {
        if (odd.betTypeID === "ou") {
          if (line.overUnder !== pinnyLine || line.overUnder === undefined)
            continue;
          fairLine = line.overUnder;
        } else if (odd.betTypeID === "sp") {
          if (line.spread !== pinnyLine || line.spread === undefined) continue;
          fairLine = line.spread;
        }
      } else {
        if (odd.betTypeID === "ou") {
          if (
            line.overUnder !== odd.fairOverUnder ||
            line.overUnder === undefined ||
            odd.fairOverUnder === undefined
          )
            continue;
          fairLine = line.overUnder;
        } else if (odd.betTypeID === "sp") {
          if (
            line.spread !== odd.fairSpread ||
            line.spread === undefined ||
            odd.fairSpread === undefined
          )
            continue;
          fairLine = line.spread;
        }
      }

      const bookOdds = parseAmericanOdds(line.odds);
      if (bookOdds === null) continue;

      const ev = calculateEVPercent(bookOdds, fairOdds);
      rawBets.push({
        id: `${apiEvent.eventID}:${odd.oddID}`,
        marketName: odd.marketName ?? "UNKNOWN",
        type: odd.betTypeID ?? "UNKNOWN",
        selection: odd.sideID ?? "UNKNOWN",
        sportsbook,
        odds: bookOdds,
        fairOdds,
        fairLine: pinnyMode ? pinnyLine : fairLine,
        ev,
        recommendedBet: 0,
      });
    }
  }

  const bets = groupBetsBySelection(rawBets);

  return {
    id: apiEvent.eventID,
    name: `${awayTeam} @ ${homeTeam}`,
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

export async function fetchBets(
  startsAfter?: string,
  startsBefore?: string,
): Promise<PlacedBet[]> {
  const params = new URLSearchParams();
  if (startsAfter) {
    params.set("startsAfter", startsAfter);
  }
  if (startsBefore) {
    params.set("startsBefore", startsBefore);
  }
  const response = await fetch(`${API_BASE_URL}/api/bets?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch bets (status ${response.status}).`);
  }
  const json = await response.json();
  if (!json.success || !Array.isArray(json.data)) {
    throw new Error("Unexpected response shape when fetching bets.");
  }
  return json.data as PlacedBet[];
}

export async function fetchUserBets(
  userId: string,
  startsAfter?: string,
  startsBefore?: string,
): Promise<PlacedBet[]> {
  const params = new URLSearchParams();
  if (startsAfter) {
    params.set("startsAfter", startsAfter);
  }
  if (startsBefore) {
    params.set("startsBefore", startsBefore);
  }
  const response = await fetch(
    `${API_BASE_URL}/api/users/${encodeURIComponent(userId)}/bets?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch user bets (status ${response.status}).`);
  }
  const json = await response.json();
  if (!json.success || !Array.isArray(json.data)) {
    throw new Error("Unexpected response shape when fetching user bets.");
  }
  return json.data as PlacedBet[];
}

export async function saveBet(
  userId: string,
  bet: PlacedBet,
): Promise<UserModel> {
  const response = await fetch(
    `${API_BASE_URL}/api/users/${encodeURIComponent(userId)}/bets`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bet),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to save bet (status ${response.status}).`);
  }

  const json = await response.json();
  if (!json.success || !json.user) {
    throw new Error("Unexpected response shape when saving bet.");
  }
  return json.user as UserModel;
}

export async function registerUser(
  user: RegisterUserRequest,
): Promise<UserModel> {
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const json = await response.json().catch(() => null);
    throw new Error(
      json?.error ?? `Failed to register (status ${response.status}).`,
    );
  }

  const json = await response.json();
  if (!json.success || !json.user) {
    throw new Error("Unexpected response shape when registering.");
  }
  return json.user as UserModel;
}

export async function loginUser(identifier: string): Promise<UserModel> {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier }),
  });

  if (!response.ok) {
    const json = await response.json().catch(() => null);
    throw new Error(
      json?.error ?? `Failed to log in (status ${response.status}).`,
    );
  }

  const json = await response.json();
  if (!json.success || !json.user) {
    throw new Error("Unexpected response shape when logging in.");
  }
  return json.user as UserModel;
}

export async function updateBet(bet: PlacedBet): Promise<void> {
  return fetch(`${API_BASE_URL}/api/bets/${bet.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bet),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to update bet (status ${response.status}).`);
    }
  });
}
