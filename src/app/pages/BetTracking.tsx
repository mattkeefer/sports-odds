import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDarkMode } from "../Root";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Hash,
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
import { fetchUserBets, updateBet } from "../eventsApiClient";

export function BetTrackingPage() {
  const navigate = useNavigate();
  const { darkMode, user } = useDarkMode();
  const userId = user?.id;
  const [refreshKey, setRefreshKey] = useState(0);
  const [allBets, setAllBets] = useState<PlacedBet[]>([]);
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
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function loadBets() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const mapped = await fetchUserBets(userId);
        mapped.sort(
          (a, b) =>
            new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
        );
        setAllBets(mapped);
      } catch (error) {
        setLoadError("Failed to load bets.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadBets();
  }, [refreshKey, userId]);

  const filteredBets = useMemo(() => {
    if (showAllBets) {
      return allBets;
    }

    if (selectedDate) {
      const start = startOfDay(selectedDate).getTime();
      const end = endOfDay(selectedDate).getTime();
      return allBets.filter(
        (bet) =>
          bet.eventDate &&
          new Date(bet.eventDate).getTime() >= start &&
          new Date(bet.eventDate).getTime() <= end,
      );
    }

    return allBets.filter((bet) => isToday(bet.eventDate));
  }, [allBets, showAllBets, selectedDate]);

  // Calculate stats for the day
  const stats = useMemo(() => {
    const numBets = filteredBets.length;
    const betAmount = filteredBets.reduce((sum, bet) => sum + bet.amount, 0);
    const profit = filteredBets.reduce(
      (sum, bet) => sum + (bet.profit || 0),
      0,
    );
    const profitPercent = betAmount > 0 ? (profit / betAmount) * 100 : 0;
    const expectedProfit = filteredBets.reduce((sum, bet) => {
      const expectedValue = (bet.placedEV / 100 || 0) * bet.amount;
      return sum + expectedValue;
    }, 0);
    const expectedProfitPercent =
      betAmount > 0 ? (expectedProfit / betAmount) * 100 : 0;

    return {
      numBets,
      betAmount,
      profit,
      profitPercent,
      expectedProfit,
      expectedProfitPercent,
    };
  }, [filteredBets]);

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
      updateBet(editingBet).then(() => setRefreshKey((prev) => prev + 1));
      setEditingBet(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingBet(null);
  };

  const handleMarkWon = (bet: PlacedBet) => {
    bet.status = "won";
    bet.settledAt = new Date();
    bet.profit = bet.potentialWin;
    updateBet(bet).then(() => setRefreshKey((prev) => prev + 1));
  };

  const handleMarkLost = (bet: PlacedBet) => {
    bet.status = "lost";
    bet.settledAt = new Date();
    bet.profit = -bet.amount;
    updateBet(bet).then(() => setRefreshKey((prev) => prev + 1));
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
              {loadError && (
                <p className="text-sm text-red-500 mt-1">{loadError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                Placed Bets
              </span>
              <Hash
                className={`w-5 h-5 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
              />
            </div>
            <div
              className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {stats.numBets}
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
                Amount Bet
              </span>
              <DollarSign
                className={`w-5 h-5 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}
              />
            </div>
            <div
              className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              ${stats.betAmount.toFixed(2)}
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
                Profit
              </span>
              {stats.profit >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div
              className={`text-3xl font-bold ${
                stats.profit >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {stats.profit >= 0 ? "+" : ""}${stats.profit.toFixed(2)}
            </div>
            <div
              className={`text-lg font-semibold ${
                stats.profitPercent >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {stats.profitPercent >= 0 ? "(+" : "("}
              {stats.profitPercent.toFixed(2)}%{")"}
            </div>
          </div>

          {/* Expected Value */}
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
                Expected Profit
              </span>
              {stats.expectedProfit >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div
              className={`text-3xl font-bold ${
                stats.expectedProfit >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {stats.expectedProfit >= 0 ? "+" : ""}$
              {stats.expectedProfit.toFixed(2)}
            </div>
            <div
              className={`text-lg font-semibold ${
                stats.expectedProfitPercent >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {stats.expectedProfitPercent >= 0 ? "(+" : "("}
              {stats.expectedProfitPercent.toFixed(2)}%{")"}
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
          ) : filteredBets.length > 0 ? (
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
