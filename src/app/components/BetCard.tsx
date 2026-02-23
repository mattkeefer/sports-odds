import { EyeOff } from "lucide-react";

export interface BookListing {
  id: string;
  sportsbook: string;
  odds: number;
  fairOdds: number;
  ev: number;
  recommendedBet: number;
}

export interface Bet {
  id: string;
  type: string;
  selection: string;
  listings: BookListing[];
}

interface BetCardProps {
  bet: Bet;
  darkMode: boolean;
  onHide: (betId: string) => void;
  onPlace: (listingId: string, sportsbook: string, amount: number) => void;
}

function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

function oddsToImpliedProb(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100);
  } else {
    return Math.abs(odds) / (Math.abs(odds) + 100);
  }
}

// Sportsbook brand colors
function getSportsbookColor(sportsbook: string): string {
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

export function BetCard({ bet, darkMode, onHide, onPlace }: BetCardProps) {
  // Sort listings by EV descending
  const sortedListings = [...bet.listings].sort((a, b) => b.ev - a.ev);

  return (
    <div
      className={`border rounded-md p-3 transition-colors ${
        darkMode ? "bg-gray-750 border-gray-600" : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div
            className={`text-sm font-medium mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            {bet.type}: {bet.selection}
          </div>
        </div>
        <button
          onClick={() => onHide(bet.id)}
          className={`p-1.5 rounded transition-colors ${
            darkMode
              ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
          }`}
          title="Hide bet"
        >
          <EyeOff className="w-4 h-4" />
        </button>
      </div>

      {/* Sportsbook Listings */}
      <div className="space-y-2">
        {sortedListings.map((listing) => {
          const impliedProb = oddsToImpliedProb(listing.odds);
          const fairProb = oddsToImpliedProb(listing.fairOdds);

          return (
            <div
              key={listing.id}
              className={`border rounded p-2.5 transition-colors ${
                darkMode
                  ? "border-gray-600 hover:border-blue-500 bg-gray-800/50"
                  : "border-gray-300 hover:border-blue-400 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getSportsbookColor(listing.sportsbook)}`}
                >
                  {listing.sportsbook}
                </div>
                <div
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    listing.ev >= 5
                      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                      : listing.ev >= 3
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                  }`}
                >
                  +{listing.ev.toFixed(1)}% EV
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-xs mb-2">
                <div>
                  <div
                    className={`mb-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Odds
                  </div>
                  <div
                    className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {formatOdds(listing.odds)}
                  </div>
                  <div className={darkMode ? "text-gray-400" : "text-gray-500"}>
                    {(impliedProb * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div
                    className={`mb-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Fair Odds
                  </div>
                  <div
                    className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {formatOdds(listing.fairOdds)}
                  </div>
                  <div className={darkMode ? "text-gray-400" : "text-gray-500"}>
                    {(fairProb * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div
                    className={`mb-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Bet Amount
                  </div>
                  <div
                    className={`font-medium ${darkMode ? "text-green-400" : "text-green-700"}`}
                  >
                    ${listing.recommendedBet.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div
                    className={`mb-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Exp. Profit
                  </div>
                  <div
                    className={`font-medium ${darkMode ? "text-green-400" : "text-green-700"}`}
                  >
                    ${((listing.recommendedBet * listing.ev) / 100).toFixed(2)}
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  onPlace(
                    listing.id,
                    listing.sportsbook,
                    listing.recommendedBet,
                  )
                }
                className={`w-full py-1 text-xs font-medium text-white rounded transition-colors ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Place Bet
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
