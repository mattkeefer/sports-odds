export interface PlacedBet {
  id: string;
  user: string;
  eventId: string;
  eventName: string;
  league: string;
  marketName: string;
  betType: string;
  selection: string;
  sportsbook: string;
  odds: number;
  amount: number;
  potentialWin: number;
  placedAt: Date;
  eventDate: Date;
  placedEV: number;
  status: "pending" | "won" | "lost";
  settledAt?: Date;
  profit?: number;
}
