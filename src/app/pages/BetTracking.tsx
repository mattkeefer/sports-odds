import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useDarkMode } from "../Root";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Minus,
  X,
} from "lucide-react";
import { format, isToday, startOfDay, endOfDay } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { calculatePotentialWin } from "../models/models";
import { PlacedBet } from "../models/bet";
import { PlacedBetCard } from "../components/PlacedBetCard";

// Mock data generator
function generateMockBets(): PlacedBet[] {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  return [
    {
      id: "placed-1",
      eventName: "Kansas City Chiefs vs Buffalo Bills",
      league: "NFL",
      betType: "Moneyline",
      selection: "Buffalo Bills",
      sportsbook: "DraftKings",
      odds: 185,
      amount: 58.0,
      potentialWin: 107.3,
      placedAt: new Date(today.setHours(10, 30, 0)),
      eventDate: new Date(today.setHours(20, 20, 0)),
      placedEV: 5.5,
      status: "pending",
    },
    {
      id: "placed-2",
      eventName: "Los Angeles Lakers vs Boston Celtics",
      league: "NBA",
      betType: "Player Prop",
      selection: "LeBron James Over 28.5 pts",
      sportsbook: "PointsBet",
      odds: 120,
      amount: 42.0,
      potentialWin: 50.4,
      placedAt: new Date(today.setHours(14, 15, 0)),
      eventDate: new Date(today.setHours(19, 0, 0)),
      placedEV: 4.2,
      status: "won",
      actualReturn: 50.4,
    },
    {
      id: "placed-3",
      eventName: "Toronto Maple Leafs vs Montreal Canadiens",
      league: "NHL",
      betType: "Total",
      selection: "Over 6.5",
      sportsbook: "DraftKings",
      odds: 110,
      amount: 48.0,
      potentialWin: 52.8,
      placedAt: new Date(today.setHours(16, 45, 0)),
      eventDate: new Date(today.setHours(22, 0, 0)),
      placedEV: 1.8,
      status: "lost",
      actualReturn: -48.0,
    },
    {
      id: "placed-4",
      eventName: "Golden State Warriors vs Phoenix Suns",
      league: "NBA",
      betType: "Spread",
      selection: "Suns +4.5",
      sportsbook: "BetMGM",
      odds: -108,
      amount: 31.0,
      potentialWin: 28.7,
      placedAt: new Date(yesterday.setHours(18, 20, 0)),
      eventDate: new Date(yesterday.setHours(23, 30, 0)),
      placedEV: 2.5,
      status: "won",
      settledAt: new Date(yesterday.setHours(23, 30, 0)),
      actualReturn: 28.7,
    },
    {
      id: "placed-5",
      eventName: "Duke Blue Devils vs North Carolina Tar Heels",
      league: "NCAA BB",
      betType: "Total",
      selection: "Under 155.5",
      sportsbook: "FanDuel",
      odds: 105,
      amount: 56.0,
      potentialWin: 58.8,
      placedAt: new Date(yesterday.setHours(12, 10, 0)),
      eventDate: new Date(yesterday.setHours(20, 0, 0)),
      placedEV: 3.0,
      status: "won",
      settledAt: new Date(yesterday.setHours(21, 45, 0)),
      actualReturn: 58.8,
    },
    {
      id: "placed-6",
      eventName: "Miami Heat vs Milwaukee Bucks",
      league: "NBA",
      betType: "Moneyline",
      selection: "Miami Heat",
      sportsbook: "Caesars",
      odds: 165,
      amount: 40.0,
      potentialWin: 66.0,
      placedAt: new Date(twoDaysAgo.setHours(15, 0, 0)),
      eventDate: new Date(twoDaysAgo.setHours(21, 0, 0)),
      placedEV: 2.8,
      status: "lost",
      settledAt: new Date(twoDaysAgo.setHours(22, 0, 0)),
      actualReturn: -40.0,
    },
    {
      id: "placed-7",
      eventName: "Dallas Cowboys vs Philadelphia Eagles",
      league: "NFL",
      betType: "Spread",
      selection: "Cowboys -3.5",
      sportsbook: "FanDuel",
      odds: -110,
      amount: 32.0,
      potentialWin: 29.1,
      placedAt: new Date(twoDaysAgo.setHours(11, 30, 0)),
      eventDate: new Date(twoDaysAgo.setHours(19, 15, 0)),
      placedEV: 1.5,
      status: "lost",
      settledAt: new Date(twoDaysAgo.setHours(19, 15, 0)),
      actualReturn: -32.0,
    },
  ];
}

export function BetTrackingPage() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const [allBets] = useState<PlacedBet[]>(generateMockBets());
  const [showAllBets, setShowAllBets] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingBet, setEditingBet] = useState<PlacedBet | null>(null);
  const [editForm, setEditForm] = useState({
    odds: 0,
    amount: 0,
  });

  const filteredBets = useMemo(() => {
    if (showAllBets) {
      return allBets;
    }

    if (selectedDate) {
      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);
      return allBets.filter(
        (bet) => bet.eventDate >= start && bet.eventDate <= end,
      );
    }

    return allBets.filter((bet) => isToday(bet.eventDate));
  }, [allBets, showAllBets, selectedDate]);

  // Calculate today's stats
  const todayStats = useMemo(() => {
    const todayBets = allBets.filter((bet) => isToday(bet.eventDate));
    const openBets = todayBets.filter((bet) => bet.status === "pending");
    const settledBets = todayBets.filter((bet) => bet.status !== "pending");

    const atRisk = openBets.reduce((sum, bet) => sum + bet.amount, 0);
    const profit = settledBets.reduce(
      (sum, bet) => sum + (bet.actualReturn || 0),
      0,
    );

    return {
      openBets: openBets.length,
      atRisk,
      profit,
    };
  }, [allBets]);

  const handleEditBet = (bet: PlacedBet) => {
    setEditingBet(bet);
    setEditForm({
      odds: bet.odds,
      amount: bet.amount,
    });
  };

  const handleSaveEdit = () => {
    if (editingBet) {
      editingBet.odds = editForm.odds;
      editingBet.amount = editForm.amount;
      editingBet.potentialWin = calculatePotentialWin(
        editForm.odds,
        editForm.amount,
      );
      setEditingBet(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingBet(null);
  };

  const handleMarkWon = (bet: PlacedBet) => {
    bet.status = "won";
    bet.settledAt = new Date();
    bet.actualReturn = bet.potentialWin;
  };

  const handleMarkLost = (bet: PlacedBet) => {
    bet.status = "lost";
    bet.settledAt = new Date();
    bet.actualReturn = -bet.amount;
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg transition-colors ${
              darkMode
                ? "text-gray-300 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Bet Tracking
              </h1>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                Monitor your placed bets and track performance
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Open Bets */}
          <div
            className={`p-6 rounded-xl border ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Open Bets Today
              </span>
              <Clock
                className={`w-5 h-5 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
              />
            </div>
            <div
              className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {todayStats.openBets}
            </div>
          </div>

          {/* At Risk */}
          <div
            className={`p-6 rounded-xl border ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                $ At Risk Today
              </span>
              <DollarSign
                className={`w-5 h-5 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}
              />
            </div>
            <div
              className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              ${todayStats.atRisk.toFixed(2)}
            </div>
          </div>

          {/* Current Profit */}
          <div
            className={`p-6 rounded-xl border ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Profit Today
              </span>
              {todayStats.profit >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div
              className={`text-3xl font-bold ${
                todayStats.profit >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {todayStats.profit >= 0 ? "+" : ""}${todayStats.profit.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div
          className={`p-4 rounded-xl border mb-6 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex flex-wrap items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowAllBets(false);
                  setSelectedDate(new Date());
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !showAllBets
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-600 text-white"
                    : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setShowAllBets(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showAllBets
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-600 text-white"
                    : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All Bets
              </button>
            </div>

            {/* Date Picker */}
            {!showAllBets && (
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  {selectedDate
                    ? format(selectedDate, "MMM dd, yyyy")
                    : "Select date"}
                </button>

                {showCalendar && (
                  <div
                    className={`absolute top-full mt-2 z-50 rounded-lg shadow-xl border ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setShowCalendar(false);
                      }}
                      className={darkMode ? "dark-calendar" : ""}
                    />
                  </div>
                )}
              </div>
            )}

            <div
              className={`ml-auto ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Showing {filteredBets.length} bet
              {filteredBets.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Bets List */}
        <div className="space-y-3">
          {filteredBets.length > 0 ? (
            filteredBets.map((bet) => (
              <PlacedBetCard
                key={bet.id}
                bet={bet}
                darkMode={darkMode}
                onEdit={handleEditBet}
                onMarkWon={handleMarkWon}
                onMarkLost={handleMarkLost}
              />
            ))
          ) : (
            <div
              className={`border rounded-xl p-12 text-center ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <Minus
                className={`w-12 h-12 mx-auto mb-4 ${
                  darkMode ? "text-gray-600" : "text-gray-400"
                }`}
              />
              <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                No bets placed {showAllBets ? "yet" : "on this date"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingBet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            className={`w-full max-w-md rounded-xl shadow-2xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div
              className={`p-6 border-b ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  Edit Bet
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className={`p-1 rounded-lg transition-colors ${
                    darkMode
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Odds
                </label>
                <input
                  type="number"
                  value={editForm.odds}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      odds: parseFloat(e.target.value),
                    })
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      amount: parseFloat(e.target.value),
                    })
                  }
                  step="0.01"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              <div
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div
                  className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Potential Win
                </div>
                <div
                  className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  $
                  {calculatePotentialWin(
                    editForm.odds,
                    editForm.amount,
                  ).toFixed(2)}
                </div>
              </div>
            </div>

            <div
              className={`p-6 border-t flex gap-3 ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={handleCancelEdit}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
