import { format } from "date-fns";
import { CheckCircle, Clock, Edit2, XCircle } from "lucide-react";
import { PlacedBet } from "../models/bet";
import { getSportsbookColor } from "../models/models";

interface PlacedBetCardProps {
  bet: PlacedBet;
  darkMode: boolean;
  onEdit: (bet: PlacedBet) => void;
  onMarkWon: (bet: PlacedBet) => void;
  onMarkLost: (bet: PlacedBet) => void;
}

export function PlacedBetCard({
  bet,
  darkMode,
  onEdit,
  onMarkWon,
  onMarkLost,
}: PlacedBetCardProps) {
  const formatCurrency = (value: number) =>
    `${value < 0 ? "-$" : "$"}${Math.abs(value).toFixed(2)}`;

  const formatSignedPercent = (value: number) =>
    `${value > 0 ? "+" : "-"}${value.toFixed(1)}%`;

  return (
    <div
      className={`p-5 rounded-xl border transition-all ${
        darkMode
          ? "bg-gray-800 border-gray-700 hover:border-gray-600"
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                darkMode
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {bet.league}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold text-white ${getSportsbookColor(
                bet.sportsbook,
              )}`}
            >
              {bet.sportsbook}
            </span>
            {bet.status === "pending" && (
              <span
                className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                  darkMode
                    ? "bg-blue-900 text-blue-300"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                <Clock className="w-3 h-3" />
                Pending
              </span>
            )}
            {bet.status === "won" && (
              <span className="px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3" />
                Won
              </span>
            )}
            {bet.status === "lost" && (
              <span className="px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 bg-red-100 text-red-700">
                <XCircle className="w-3 h-3" />
                Lost
              </span>
            )}
          </div>

          <h3
            className={`font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            {bet.eventName}
          </h3>
          <p
            className={`text-sm mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {bet.betType}: {bet.selection}
          </p>
          <p
            className={`text-xs mb-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}
          >
            Placed {format(bet.placedAt, "MMM dd, yyyy @ h:mm a")}
          </p>
          <p
            className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}
          >
            Event {format(bet.eventDate, "MMM dd, yyyy @ h:mm a")}
          </p>
        </div>

        <div className="flex items-start gap-6">
          <div className="text-center">
            <div
              className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Odds
            </div>
            <div
              className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {bet.odds > 0 ? "+" : ""}
              {bet.odds}
            </div>
          </div>

          <div className="text-center">
            <div
              className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Amount
            </div>
            <div
              className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              ${bet.amount.toFixed(2)}
            </div>
          </div>

          <div className="text-center">
            <div
              className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              EV
            </div>
            <div
              className={`px-2 py-0.5 rounded font-bold ${
                bet.placedEV >= 5
                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                  : bet.placedEV >= 3
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
              }`}
            >
              {formatSignedPercent(bet.placedEV)}
            </div>
          </div>

          <div className="text-center">
            <div
              className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              {bet.status === "pending" ? "To Win" : "Return"}
            </div>
            <div
              className={`font-bold ${
                bet.status === "won"
                  ? "text-green-500"
                  : bet.status === "lost"
                    ? "text-red-500"
                    : darkMode
                      ? "text-white"
                      : "text-gray-900"
              }`}
            >
              {bet.status === "pending"
                ? formatCurrency(bet.potentialWin)
                : formatCurrency(bet.profit || 0)}
            </div>
          </div>

          {bet.status === "pending" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onMarkWon(bet)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "text-green-400 hover:text-green-300 hover:bg-gray-700"
                    : "text-green-600 hover:text-green-700 hover:bg-gray-100"
                }`}
                title="Mark as won"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => onMarkLost(bet)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "text-red-400 hover:text-red-300 hover:bg-gray-700"
                    : "text-red-600 hover:text-red-700 hover:bg-gray-100"
                }`}
                title="Mark as lost"
              >
                <XCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(bet)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "text-gray-400 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                title="Edit bet"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
