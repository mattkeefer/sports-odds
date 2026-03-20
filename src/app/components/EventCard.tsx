import { Calendar, Trophy, ArrowUpDown } from "lucide-react";
import { BetCard } from "./BetCard";
import { useState } from "react";
import { PlacedBet } from "../models/bet";
import { BookListing, Bet } from "../models/models";

export interface Event {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  bets: Bet[];
}

interface EventCardProps {
  event: Event;
  darkMode: boolean;
  onHideBet: (betId: string) => void;
  onPlaceBet: (bet: PlacedBet) => void;
}

type SortOption = "ev-desc" | "ev-asc" | "odds-asc" | "odds-desc";

export function EventCard({
  event,
  darkMode,
  onHideBet,
  onPlaceBet,
}: EventCardProps) {
  const [sortBy, setSortBy] = useState<SortOption>("ev-desc");

  const sortedBets = [...event.bets].sort((a, b) => {
    // Get the best listing for comparison
    const getBestEV = (bet: Bet) =>
      Math.max(...bet.listings.map((l: BookListing) => l.ev));
    const getBestOdds = (bet: Bet) =>
      Math.max(...bet.listings.map((l: BookListing) => l.odds));

    switch (sortBy) {
      case "ev-desc":
        return getBestEV(b) - getBestEV(a);
      case "ev-asc":
        return getBestEV(a) - getBestEV(b);
      case "odds-asc":
        return getBestOdds(a) - getBestOdds(b);
      case "odds-desc":
        return getBestOdds(b) - getBestOdds(a);
      default:
        return 0;
    }
  });

  return (
    <div
      className={`border rounded-lg shadow-sm overflow-hidden ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div
        className={`p-4 border-b ${
          darkMode
            ? "bg-gradient-to-r from-gray-800 to-gray-750 border-gray-700"
            : "bg-gradient-to-r from-gray-50 to-white border-gray-200"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Trophy
                className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              />
              <span
                className={`text-xs font-medium uppercase tracking-wide ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {event.league}
              </span>
            </div>
            <div
              className={`text-base mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              <span className="font-medium">{event.awayTeam}</span> @{" "}
              <span className="font-medium">{event.homeTeam}</span>
            </div>
            <div
              className={`flex items-center gap-1.5 text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {event.date} at {event.time}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                darkMode
                  ? "bg-blue-900/50 text-blue-300"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {event.bets.length} {event.bets.length === 1 ? "bet" : "bets"}
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 mt-3">
          <ArrowUpDown
            className={`w-3.5 h-3.5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          />
          <span
            className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Sort:
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setSortBy("ev-desc")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                sortBy === "ev-desc"
                  ? darkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              EV ↓
            </button>
            <button
              onClick={() => setSortBy("ev-asc")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                sortBy === "ev-asc"
                  ? darkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              EV ↑
            </button>
            <button
              onClick={() => setSortBy("odds-asc")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                sortBy === "odds-asc"
                  ? darkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Odds ↑
            </button>
            <button
              onClick={() => setSortBy("odds-desc")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                sortBy === "odds-desc"
                  ? darkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Odds ↓
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        {sortedBets.map((bet) => (
          <BetCard
            key={bet.id}
            bet={bet}
            event={event}
            darkMode={darkMode}
            onHide={onHideBet}
            onPlace={onPlaceBet}
          />
        ))}
      </div>
    </div>
  );
}
