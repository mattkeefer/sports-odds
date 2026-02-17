export type EventsQuery = {
  eventID?: string;
  eventIDs?: string;
  sportID?: string;
  leagueID?: string;
  type?: string;
  oddsAvailable?: boolean;
  oddsPresent?: boolean;
  oddID?: string;
  includeOpposingOdds?: boolean;
  includeAltLines?: boolean;
  expandResults?: boolean;
  includeOpenCloseOdds?: boolean;
  bookmakerID?: string;
  teamID?: string;
  playerID?: string;
  finalized?: boolean;
  live?: boolean;
  started?: boolean;
  ended?: boolean;
  cancelled?: boolean;
  startsAfter?: string;
  startsBefore?: string;
  limit?: number;
  cursor?: string;
};

export type SportsGameOddsResponse<T> = {
  success: boolean;
  data: T;
  nextCursor?: string;
  notice?: string;
};

export type EventNameSet = {
  short?: string;
  medium?: string;
  long?: string;
};

export type EventColorSet = {
  primary?: string;
  secondary?: string;
  text?: string;
  primaryContrast?: string;
  secondaryContrast?: string;
  [key: string]: unknown;
};

export type EventTeam = {
  teamID?: string;
  statEntityID?: string;
  score?: number;
  names?: EventNameSet;
  logo?: string;
  colors?: EventColorSet;
  [key: string]: unknown;
};

export type EventPeriodsStatus = {
  started?: string[];
  ended?: string[];
};

export type EventStatus = {
  startsAt?: string;
  previousStartsAt?: string[];
  started?: boolean;
  completed?: boolean;
  cancelled?: boolean;
  ended?: boolean;
  live?: boolean;
  delayed?: boolean;
  inBreak?: boolean;
  hardStart?: boolean;
  finalized?: boolean;
  reGrade?: boolean;
  currentPeriodID?: string;
  previousPeriodID?: string;
  displayShort?: string;
  displayLong?: string;
  periods?: EventPeriodsStatus;
  oddsPresent?: boolean;
  oddsAvailable?: boolean;
  [key: string]: unknown;
};

export type EventBroadcast = {
  broadcasterID?: string;
  name?: string;
  type?: string;
};

export type EventInfo = {
  seasonWeek?: string;
  venue?: {
    name?: string;
    countryName?: string;
    countryCode?: string;
    regionName?: string;
    regionCode?: string;
    city?: string;
    address?: string;
    capacity?: number;
    [key: string]: unknown;
  };
  referee?: {
    name?: string;
    [key: string]: unknown;
  };
  broadcasts?: EventBroadcast[];
  [key: string]: unknown;
};

export type EventLinks = {
  bookmakers?: Record<string, string>;
  [key: string]: unknown;
};

export type EventPlayer = {
  playerID?: string;
  teamID?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  alias?: string;
  photo?: string;
  status?: string;
  statusDetails?: string;
  [key: string]: unknown;
};

export type EventResults = Record<string, Record<string, Record<string, number>>>;

export type EventOddsAltLine = {
  odds?: string;
  overUnder?: string;
  spread?: string;
  available?: boolean;
  isMainLine?: boolean;
  lastUpdatedAt?: string;
  [key: string]: unknown;
};

export type EventOddsBookmakerLine = {
  bookmakerID?: string;
  odds?: string;
  overUnder?: string;
  spread?: string;
  available?: boolean;
  isMainLine?: boolean;
  lastUpdatedAt?: string;
  openOdds?: string;
  closeOdds?: string;
  openSpread?: string;
  closeSpread?: string;
  openOverUnder?: string;
  closeOverUnder?: string;
  deeplink?: string;
  altLines?: EventOddsAltLine[];
  [key: string]: unknown;
};

export type EventOddsEntry = {
  oddID?: string;
  opposingOddID?: string;
  marketName?: string;
  statID?: string;
  statEntityID?: string;
  periodID?: string;
  betTypeID?: string;
  sideID?: string;
  playerID?: string;
  teamID?: string;
  started?: boolean;
  ended?: boolean;
  cancelled?: boolean;
  bookOddsAvailable?: boolean;
  fairOddsAvailable?: boolean;
  fairOdds?: string;
  bookOdds?: string;
  fairOverUnder?: string;
  bookOverUnder?: string;
  fairSpread?: string;
  bookSpread?: string;
  openFairOdds?: string;
  openBookOdds?: string;
  openFairOverUnder?: string;
  openBookOverUnder?: string;
  openFairSpread?: string;
  openBookSpread?: string;
  closeFairOdds?: string;
  closeBookOdds?: string;
  closeFairOverUnder?: string;
  closeBookOverUnder?: string;
  closeFairSpread?: string;
  closeBookSpread?: string;
  score?: number;
  scoringSupported?: boolean;
  byBookmaker?: Record<string, EventOddsBookmakerLine>;
  [key: string]: unknown;
};

export type SportsEvent = {
  eventID: string;
  sportID?: string;
  leagueID?: string;
  type?: string;
  manual?: boolean;
  activity?: {
    count?: number;
    score?: number;
    [key: string]: unknown;
  };
  teams?: {
    home?: EventTeam;
    away?: EventTeam;
    [key: string]: unknown;
  };
  status?: EventStatus;
  info?: EventInfo;
  links?: EventLinks;
  odds?: Record<string, EventOddsEntry>;
  results?: EventResults;
  players?: Record<string, EventPlayer>;
  [key: string]: unknown;
};
