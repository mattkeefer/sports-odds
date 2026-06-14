import { Filter, DollarSign } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { SPORTSBOOK_LABELS } from "../eventsApiClient";

interface FilterPanelProps {
  darkMode: boolean;
  bankroll: number;
  setBankroll: Dispatch<SetStateAction<number>>;
  selectedSportsbooks: string[];
  setSelectedSportsbooks: Dispatch<SetStateAction<string[]>>;
  oddsRange: [number, number];
  setOddsRange: Dispatch<SetStateAction<[number, number]>>;
  minEV: number;
  setMinEV: Dispatch<SetStateAction<number>>;
  selectedLeagues: string[];
  setSelectedLeagues: Dispatch<SetStateAction<string[]>>;
  dateRange: [string, string];
  setDateRange: Dispatch<SetStateAction<[string, string]>>;
  isExpanded: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
}

const LEAGUES = [
  "NFL",
  "NBA",
  "MLB",
  "NHL",
  "NCAAF",
  "NCAAB",
  "INTERNATIONAL_SOCCER",
];

export function FilterPanel({
  darkMode,
  bankroll,
  setBankroll,
  selectedSportsbooks,
  setSelectedSportsbooks,
  oddsRange,
  setOddsRange,
  minEV,
  setMinEV,
  selectedLeagues,
  setSelectedLeagues,
  dateRange,
  setDateRange,
  isExpanded,
  setIsExpanded,
}: FilterPanelProps) {
  const toggleSportsbook = (sportsbook: string) => {
    if (selectedSportsbooks.includes(sportsbook)) {
      setSelectedSportsbooks(
        selectedSportsbooks.filter((s) => s !== sportsbook),
      );
    } else {
      setSelectedSportsbooks([...selectedSportsbooks, sportsbook]);
    }
  };

  const toggleLeague = (league: string) => {
    if (selectedLeagues.includes(league)) {
      setSelectedLeagues(selectedLeagues.filter((l) => l !== league));
    } else {
      setSelectedLeagues([...selectedLeagues, league]);
    }
  };

  return (
    <div
      className={`border rounded-lg shadow-sm mb-6 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Filter
            className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
          />
          <h2
            className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Filters & Configuration
          </h2>
        </div>
        <button
          className={
            darkMode
              ? "text-gray-400 hover:text-gray-300"
              : "text-gray-500 hover:text-gray-700"
          }
        >
          {isExpanded ? "−" : "+"}
        </button>
      </div>

      {isExpanded && (
        <div
          className={`p-4 pt-0 space-y-4 border-t ${darkMode ? "border-gray-700" : "border-gray-100"}`}
        >
          {/* Bankroll */}
          <div className="pt-2">
            <label
              className={`flex items-center gap-2 text-sm mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              <DollarSign className="w-4 h-4" />
              Bankroll
            </label>
            <input
              type="number"
              value={bankroll}
              onChange={(e) => setBankroll(Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              min="0"
              step="100"
            />
          </div>

          {/* Sportsbooks */}
          <div>
            <label
              className={`text-sm mb-2 block ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Sportsbooks
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(SPORTSBOOK_LABELS).map((sportsbook) => (
                <button
                  key={sportsbook}
                  onClick={() => toggleSportsbook(sportsbook)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    selectedSportsbooks.includes(sportsbook)
                      ? "bg-blue-500 text-white border-blue-500"
                      : darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600 hover:border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                  }`}
                >
                  {sportsbook}
                </button>
              ))}
            </div>
          </div>

          {/* Leagues */}
          <div>
            <label
              className={`text-sm mb-2 block ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Leagues
            </label>
            <div className="flex flex-wrap gap-2">
              {LEAGUES.map((league) => (
                <button
                  key={league}
                  onClick={() => toggleLeague(league)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    selectedLeagues.includes(league)
                      ? "bg-green-500 text-white border-green-500"
                      : darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600 hover:border-green-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
                  }`}
                >
                  {league}
                </button>
              ))}
            </div>
          </div>

          {/* Odds Range & Min EV */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                className={`text-sm mb-2 block ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Min Odds
              </label>
              <input
                type="number"
                value={oddsRange[0]}
                onChange={(e) =>
                  setOddsRange([Number(e.target.value), oddsRange[1]])
                }
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                min="-500"
                step="10"
              />
            </div>
            <div>
              <label
                className={`text-sm mb-2 block ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Max Odds
              </label>
              <input
                type="number"
                value={oddsRange[1]}
                onChange={(e) =>
                  setOddsRange([oddsRange[0], Number(e.target.value)])
                }
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                min="-500"
                step="10"
              />
            </div>
            <div>
              <label
                className={`text-sm mb-2 block ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Min EV %
              </label>
              <input
                type="number"
                value={minEV}
                onChange={(e) => setMinEV(Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                min="0"
                step="0.5"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`text-sm mb-2 block ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                From Date
              </label>
              <input
                type="date"
                value={dateRange[0]}
                onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
            <div>
              <label
                className={`text-sm mb-2 block ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                To Date
              </label>
              <input
                type="date"
                value={dateRange[1]}
                onChange={(e) => setDateRange([dateRange[0], e.target.value])}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
