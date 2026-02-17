export type EventsQuery = {
  oddsAvailable?: boolean;
  leagueID?: string;
  oddID?: string;
  includeAltLines?: boolean;
  cursor?: string;
  limit?: number;
};

export type SportsGameOddsResponse<T> = {
  data: T;
  nextCursor?: string;
};

export type EventStatus = {
  startsAt?: string;
  started?: boolean;
  ended?: boolean;
  finalized?: boolean;
};

export type EventTeam = {
  teamID?: string;
  [key: string]: unknown;
};

export type EventOddsBookmakerLine = {
  odds?: string;
  available?: boolean;
  spread?: string;
  overUnder?: string;
  deeplink?: string;
  altLines?: Array<{
    odds?: string;
    available?: boolean;
    spread?: string;
    overUnder?: string;
    lastUpdatedAt?: string;
  }>;
  [key: string]: unknown;
};

export type EventOddsEntry = {
  byBookmaker?: Record<string, EventOddsBookmakerLine>;
  [key: string]: unknown;
};

export type SportsEvent = {
  eventID: string;
  sportID?: string;
  leagueID?: string;
  teams?: {
    home?: EventTeam;
    away?: EventTeam;
    [key: string]: unknown;
  };
  status?: EventStatus;
  odds?: Record<string, EventOddsEntry>;
  [key: string]: unknown;
};
