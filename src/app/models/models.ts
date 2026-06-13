import { SPORTSBOOK_LABELS } from "../eventsApiClient";

export interface BookListing {
  id: string;
  sportsbook: string;
  odds: number;
  fairOdds: number;
  fairLine: number | null;
  ev: number;
  recommendedBet: number;
}

export interface Bet {
  id: string;
  marketName: string;
  type: string;
  selection: string;
  listings: BookListing[];
  comparisonListings?: BookListing[];
}

export function getListOfSportsbooks(): string[] {
  return Object.values(SPORTSBOOK_LABELS);
}

export function getListOfLeagues(): string[] {
  return ["NFL", "NBA", "MLB", "NHL", "NCAAF", "NCAAB"];
}

export function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

export function oddsToImpliedProb(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100);
  } else {
    return Math.abs(odds) / (Math.abs(odds) + 100);
  }
}

export function calculatePotentialWin(odds: number, amount: number): number {
  if (odds > 0) {
    return (odds / 100) * amount;
  } else {
    return (100 / Math.abs(odds)) * amount;
  }
}

// Sportsbook brand colors
export function getSportsbookColor(sportsbook: string): string {
  const colors: { [key: string]: string } = {
    DraftKings: "bg-green-600 text-white",
    FanDuel: "bg-blue-600 text-white",
    BetMGM: "bg-yellow-500 text-gray-900",
    "theScore Bet": "bg-blue-800 text-white",
    "ESPN Bet": "bg-cyan-600 text-white",
    Fliff: "bg-purple-700 text-white",
    Fanatics: "bg-red-800 text-white",
    Caesars: "bg-green-800 text-white",
    Pinnacle: "bg-orange-500 text-gray-900",
  };
  return colors[sportsbook] || "bg-gray-600 text-white";
}
