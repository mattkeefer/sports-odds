import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { FilterPanel } from "../components/FilterPanel";
import { EventCard, Event } from "../components/EventCard";
import { BookListing } from "../components/BetCard";
import {
  TrendingUp,
  Moon,
  Sun,
  RefreshCw,
  AlertTriangle,
  Crown,
} from "lucide-react";
import { fetchEvents } from "../eventsApiClient";
import { useDarkMode } from "../Root";

function calculateRecommendedBet(
  listing: BookListing,
  bankroll: number,
): BookListing {
  const kellyFraction = 0.25;
  const recommendedBet = (listing.ev / 100) * bankroll * kellyFraction;
  return { ...listing, recommendedBet: Math.max(0, recommendedBet) };
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useDarkMode();
  const [pinnyMode, setPinnyMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bankroll, setBankroll] = useState(1000);
  const [selectedSportsbooks, setSelectedSportsbooks] = useState<string[]>([
    "DraftKings",
    "FanDuel",
    "BetMGM",
    "Caesars",
    "Fanatics",
    "theScore Bet",
    "ESPN Bet",
    "Fliff",
    "Pinnacle",
  ]);
  const [oddsRange, setOddsRange] = useState<[number, number]>([-500, 500]);
  const [minEV, setMinEV] = useState(3.0);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([
    "NFL",
    "NBA",
    "MLB",
    "NHL",
    "NCAAF",
    "NCAAB",
  ]);
  const [dateRange, setDateRange] = useState<[string, string]>([
    "2026-02-16",
    "2026-02-28",
  ]);
  const [hiddenBets, setHiddenBets] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const mapped = await fetchEvents(
          selectedSportsbooks,
          selectedLeagues,
          pinnyMode,
          controller.signal,
        );
        setEvents(mapped);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Failed to load events.";
        setLoadError(message);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    }

    void loadEvents();

    return () => controller.abort();
  }, [refreshKey, selectedLeagues, pinnyMode]);

  const filteredEvents = useMemo(() => {
    return events
      .map((event) => {
        const filteredBets = event.bets
          .filter((bet) => !hiddenBets.has(bet.id))
          .map((bet) => {
            if (!bet.listings) return { ...bet, listings: [] };
            const filteredListings = bet.listings
              .filter((bet) => selectedSportsbooks.includes(bet.sportsbook))
              .filter(
                (bet) => bet.odds >= oddsRange[0] && bet.odds <= oddsRange[1],
              )
              .filter((bet) => bet.ev >= minEV)
              .map((bet) => calculateRecommendedBet(bet, bankroll));

            return { ...bet, listings: filteredListings };
          })
          .filter((bet) => bet.listings.length > 0);

        return { ...event, bets: filteredBets };
      })
      .filter((event) => selectedLeagues.includes(event.league))
      .filter((event) => {
        const eventDate = new Date(event.date);
        const startDate = new Date(dateRange[0]);
        const endDate = new Date(dateRange[1]);
        return eventDate >= startDate && eventDate <= endDate;
      })
      .filter((event) => event.bets.length > 0);
  }, [
    events,
    hiddenBets,
    selectedSportsbooks,
    oddsRange,
    minEV,
    bankroll,
    selectedLeagues,
    dateRange,
  ]);

  const handleHideBet = (betId: string) => {
    setHiddenBets((prev) => new Set(prev).add(betId));
  };

  const handlePlaceBet = (
    betId: string,
    sportsbook: string,
    amount: number,
  ) => {
    alert(`Bet ${betId} placed successfully at ${sportsbook} for $${amount}!`);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    setHiddenBets(new Set());
  };

  const totalBets = filteredEvents.reduce(
    (sum, event) => sum + event.bets.length,
    0,
  );
  const totalListings = filteredEvents.reduce(
    (sum, event) =>
      sum + event.bets.reduce((betSum, bet) => betSum + bet.listings.length, 0),
    0,
  );
  const totalEV = filteredEvents.reduce(
    (sum, event) =>
      sum +
      event.bets.reduce(
        (betSum, bet) =>
          betSum +
          bet.listings.reduce(
            (listingSum, listing) => listingSum + listing.ev,
            0,
          ),
        0,
      ),
    0,
  );
  const avgEV = totalListings > 0 ? totalEV / totalListings : 0;

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center justify-center gap-3 mb-3">
              <TrendingUp
                className={`w-12 h-12 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
              />
              <h1
                className={`text-4xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Summit Sports
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPinnyMode(!pinnyMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  pinnyMode
                    ? "bg-orange-500 border-orange-600 text-white shadow-lg"
                    : darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                      : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                <AlertTriangle
                  className={`w-4 h-4 ${pinnyMode ? "animate-pulse" : ""}`}
                />
                <span className="text-sm font-medium">
                  {pinnyMode ? "Pinny Mode ON" : "Pinny Mode"}
                </span>
              </button>

              <button
                onClick={handleRefresh}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate("/subscription")}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                    : "bg-white text-yellow-600 hover:bg-gray-100 border border-gray-300"
                }`}
                title="Manage subscription"
              >
                <Crown className="w-5 h-5" />
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
                title={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {pinnyMode && (
            <div className="mb-3 p-3 bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500 rounded">
              <p className="text-sm text-orange-800 dark:text-orange-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <strong>Pinny Mode Active:</strong> Using Pinnacle de-vigged
                lines as fair odds.
              </p>
            </div>
          )}

          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            Showing {totalBets} profitable bets across {filteredEvents.length}{" "}
            events - Avg EV: +{avgEV.toFixed(1)}%
          </p>
          {loadError && (
            <p className="text-sm text-red-500 mt-1">{loadError}</p>
          )}
        </div>

        <FilterPanel
          darkMode={darkMode}
          bankroll={bankroll}
          setBankroll={setBankroll}
          selectedSportsbooks={selectedSportsbooks}
          setSelectedSportsbooks={setSelectedSportsbooks}
          oddsRange={oddsRange}
          setOddsRange={setOddsRange}
          minEV={minEV}
          setMinEV={setMinEV}
          selectedLeagues={selectedLeagues}
          setSelectedLeagues={setSelectedLeagues}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        <div className="space-y-4">
          {isLoading ? (
            <div
              className={`border rounded-lg p-12 text-center ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                Loading events...
              </p>
            </div>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                darkMode={darkMode}
                onHideBet={handleHideBet}
                onPlaceBet={handlePlaceBet}
              />
            ))
          ) : (
            <div
              className={`border rounded-lg p-12 text-center ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                No bets match your current filters. Try adjusting your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
