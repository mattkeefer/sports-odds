import { useState, useMemo } from "react";
import { FilterPanel } from "./components/FilterPanel";
import { EventCard, Event } from "./components/EventCard";
import { Bet } from "./components/BetCard";
import { TrendingUp, Moon, Sun, RefreshCw, AlertTriangle } from "lucide-react";

// Mock data generator
function generateMockData(pinnyMode: boolean): Event[] {
  // In Pinny mode, EVs are much lower (sharper lines)
  const evMultiplier = pinnyMode ? 0.3 : 1.0;

  return [
    {
      id: "evt-1",
      league: "NFL",
      homeTeam: "Kansas City Chiefs",
      awayTeam: "Buffalo Bills",
      date: "Feb 16, 2026",
      time: "1:00 PM",
      bets: [
        {
          id: "bet-1",
          type: "Moneyline",
          selection: "Buffalo Bills",
          sportsbook: "DraftKings",
          odds: 185,
          fairOdds: 160,
          ev: 5.8 * evMultiplier,
          recommendedBet: 58.0,
        },
        {
          id: "bet-2",
          type: "Spread",
          selection: "Chiefs -3.5",
          sportsbook: "FanDuel",
          odds: -110,
          fairOdds: -125,
          ev: 3.2 * evMultiplier,
          recommendedBet: 32.0,
        },
        {
          id: "bet-3",
          type: "Total",
          selection: "Over 48.5",
          sportsbook: "BetMGM",
          odds: 105,
          fairOdds: -105,
          ev: 4.5 * evMultiplier,
          recommendedBet: 45.0,
        },
      ],
    },
    {
      id: "evt-2",
      league: "NBA",
      homeTeam: "Los Angeles Lakers",
      awayTeam: "Boston Celtics",
      date: "Feb 16, 2026",
      time: "7:30 PM",
      bets: [
        {
          id: "bet-4",
          type: "Moneyline",
          selection: "Boston Celtics",
          sportsbook: "Caesars",
          odds: -145,
          fairOdds: -165,
          ev: 3.8 * evMultiplier,
          recommendedBet: 38.0,
        },
        {
          id: "bet-5",
          type: "Player Prop",
          selection: "LeBron James Over 28.5 pts",
          sportsbook: "PointsBet",
          odds: 120,
          fairOdds: 100,
          ev: 4.2 * evMultiplier,
          recommendedBet: 42.0,
        },
      ],
    },
    {
      id: "evt-3",
      league: "NHL",
      homeTeam: "Toronto Maple Leafs",
      awayTeam: "Montreal Canadiens",
      date: "Feb 17, 2026",
      time: "7:00 PM",
      bets: [
        {
          id: "bet-6",
          type: "Moneyline",
          selection: "Montreal Canadiens",
          sportsbook: "BetRivers",
          odds: 225,
          fairOdds: 195,
          ev: 6.2 * evMultiplier,
          recommendedBet: 62.0,
        },
        {
          id: "bet-7",
          type: "Total",
          selection: "Over 6.5",
          sportsbook: "DraftKings",
          odds: 110,
          fairOdds: -100,
          ev: 4.8 * evMultiplier,
          recommendedBet: 48.0,
        },
        {
          id: "bet-8",
          type: "Puck Line",
          selection: "Maple Leafs -1.5",
          sportsbook: "FanDuel",
          odds: 180,
          fairOdds: 155,
          ev: 5.5 * evMultiplier,
          recommendedBet: 55.0,
        },
      ],
    },
    {
      id: "evt-4",
      league: "NBA",
      homeTeam: "Golden State Warriors",
      awayTeam: "Phoenix Suns",
      date: "Feb 17, 2026",
      time: "10:00 PM",
      bets: [
        {
          id: "bet-9",
          type: "Spread",
          selection: "Suns +4.5",
          sportsbook: "BetMGM",
          odds: -108,
          fairOdds: -120,
          ev: 3.1 * evMultiplier,
          recommendedBet: 31.0,
        },
        {
          id: "bet-10",
          type: "Player Prop",
          selection: "Kevin Durant Over 26.5 pts",
          sportsbook: "Caesars",
          odds: 115,
          fairOdds: 100,
          ev: 3.5 * evMultiplier,
          recommendedBet: 35.0,
        },
      ],
    },
    {
      id: "evt-5",
      league: "NCAA BB",
      homeTeam: "Duke Blue Devils",
      awayTeam: "North Carolina Tar Heels",
      date: "Feb 18, 2026",
      time: "6:00 PM",
      bets: [
        {
          id: "bet-11",
          type: "Moneyline",
          selection: "North Carolina",
          sportsbook: "PointsBet",
          odds: 140,
          fairOdds: 120,
          ev: 4.1 * evMultiplier,
          recommendedBet: 41.0,
        },
        {
          id: "bet-12",
          type: "Total",
          selection: "Under 155.5",
          sportsbook: "BetRivers",
          odds: 102,
          fairOdds: -110,
          ev: 5.2 * evMultiplier,
          recommendedBet: 52.0,
        },
      ],
    },
  ];
}

function calculateRecommendedBet(bet: Bet, bankroll: number): Bet {
  // Kelly Criterion simplified: (EV% / 100) * bankroll
  const kellyFraction = 0.25; // Using quarter Kelly for safety
  const recommendedBet = (bet.ev / 100) * bankroll * kellyFraction;
  return { ...bet, recommendedBet };
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [pinnyMode, setPinnyMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bankroll, setBankroll] = useState(1000);
  const [selectedSportsbooks, setSelectedSportsbooks] = useState<string[]>([
    "DraftKings",
    "FanDuel",
    "BetMGM",
    "Caesars",
    "PointsBet",
    "BetRivers",
  ]);
  const [oddsRange, setOddsRange] = useState<[number, number]>([-500, 500]);
  const [minEV, setMinEV] = useState(3.0);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([
    "NFL",
    "NBA",
    "MLB",
    "NHL",
    "NCAA FB",
    "NCAA BB",
  ]);
  const [dateRange, setDateRange] = useState<[string, string]>([
    "2026-02-16",
    "2026-02-28",
  ]);
  const [hiddenBets, setHiddenBets] = useState<Set<string>>(new Set());

  const mockData = useMemo(
    () => generateMockData(pinnyMode),
    [pinnyMode, refreshKey],
  );

  const filteredEvents = useMemo(() => {
    return mockData
      .map((event) => {
        // Filter bets
        const filteredBets = event.bets
          .filter((bet) => !hiddenBets.has(bet.id))
          .filter((bet) => selectedSportsbooks.includes(bet.sportsbook))
          .filter((bet) => bet.odds >= oddsRange[0] && bet.odds <= oddsRange[1])
          .filter((bet) => bet.ev >= minEV)
          .map((bet) => calculateRecommendedBet(bet, bankroll));

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
    mockData,
    selectedSportsbooks,
    oddsRange,
    minEV,
    selectedLeagues,
    dateRange,
    hiddenBets,
    bankroll,
  ]);

  const handleHideBet = (betId: string) => {
    setHiddenBets((prev) => new Set(prev).add(betId));
  };

  const handlePlaceBet = (betId: string) => {
    // In a real app, this would place the bet
    alert(`Bet ${betId} placed successfully!`);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    setHiddenBets(new Set());
  };

  const totalBets = filteredEvents.reduce(
    (sum, event) => sum + event.bets.length,
    0,
  );
  const totalEV = filteredEvents.reduce(
    (sum, event) =>
      sum + event.bets.reduce((betSum, bet) => betSum + bet.ev, 0),
    0,
  );
  const avgEV = totalBets > 0 ? totalEV / totalBets : 0;

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <TrendingUp
                className={`w-8 h-8 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
              />
              <h1
                className={`text-3xl ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Summit - Sports Odds Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Pinny Mode Toggle */}
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

              {/* Refresh Button */}
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

              {/* Dark Mode Toggle */}
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
                <strong>Pinny Mode Active:</strong> Using Pinnacle as fair odds
                reference. EVs will be significantly lower due to sharp lines.
              </p>
            </div>
          )}

          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            Showing {totalBets} profitable bets across {filteredEvents.length}{" "}
            events • Avg EV: +{avgEV.toFixed(1)}%
          </p>
        </div>

        {/* Filters */}
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

        {/* Events */}
        <div className="space-y-4">
          {filteredEvents.length > 0 ? (
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
