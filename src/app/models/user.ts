export type SubscriptionTier =
  | "free"
  | "starter"
  | "pro"
  | "premium"
  | "enterprise";

export type SubscriptionStatus =
  | "inactive"
  | "trialing"
  | "active"
  | "canceled";

export interface UserFilters {
  selectedSportsbooks: string[];
  selectedLeagues: string[];
  oddsRange: [number, number];
  minEV: number;
  dateRange: [string, string];
  bankroll: number;
  pinnyMode: boolean;
  darkMode: boolean;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  customerId?: string;
  subscriptionId?: string;
  priceId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  updatedAt: string;
}

export interface PlacedBet {
  id: string;
  eventId: string;
  marketType: string;
  selection: string;
  sportsbook: string;
  odds: number;
  fairOdds: number;
  evAtPlacement: number;
  stake: number;
  potentialPayout: number;
  status: "open" | "won" | "lost" | "void" | "cashout";
  placedAt: string;
  settledAt?: string;
  notes?: string;
}

export interface UserModel {
  id: string;
  phoneNumber: string;
  username: string;
  firstName: string;
  lastName: string;
  savedFilters: UserFilters;
  subscription: UserSubscription;
  placedBets: PlacedBet[];
}

export function createDefaultUserFilters(): UserFilters {
  return {
    selectedSportsbooks: [
      "DraftKings",
      "FanDuel",
      "BetMGM",
      "Caesars",
      "PointsBet",
      "BetRivers",
    ],
    selectedLeagues: ["NFL", "NBA", "MLB", "NHL", "NCAAF", "NCAAB"],
    oddsRange: [-500, 500],
    minEV: 3,
    dateRange: ["2026-02-16", "2026-02-28"],
    bankroll: 1000,
    pinnyMode: false,
  };
}

export function createDefaultSubscription(): UserSubscription {
  return {
    tier: "free",
    status: "inactive",
    updatedAt: new Date().toISOString(),
  };
}

export function createDefaultPlacedBets(): PlacedBet[] {
  return [];
}
