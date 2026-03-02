import { PlacedBet } from "./bet";
import { getListOfLeagues, getListOfSportsbooks } from "./models";

export type SubscriptionTier = "free" | "pro" | "elite";

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
    selectedSportsbooks: getListOfSportsbooks(),
    selectedLeagues: getListOfLeagues(),
    oddsRange: [-200, 200],
    minEV: 2,
    dateRange: ["2026-02-16", "2026-02-28"],
    bankroll: 1000,
    pinnyMode: false,
    darkMode: false,
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
