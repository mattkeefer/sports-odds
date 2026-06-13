import { Check, EyeOff, Table2 } from "lucide-react";
import {
  Bet,
  calculatePotentialWin,
  formatOdds,
  getSportsbookColor,
  oddsToImpliedProb,
} from "../models/models";
import { PlacedBet } from "../models/bet";
import { Event } from "./EventCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface BetCardProps {
  bet: Bet;
  event: Event;
  darkMode: boolean;
  onHide: (betId: string) => void;
  onPlace: (bet: PlacedBet) => void;
}

export function BetCard({
  bet,
  event,
  darkMode,
  onHide,
  onPlace,
}: BetCardProps) {
  // Sort listings by EV descending
  const sortedListings = [...bet.listings].sort((a, b) => b.ev - a.ev);
  const comparisonListings = [
    ...(bet.comparisonListings ?? bet.listings),
  ].sort((a, b) => b.odds - a.odds);
  const displayedSportsbooks = new Set(
    bet.listings.map((listing) => listing.sportsbook),
  );

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
            {bet.marketName}:&ensp;
            <span className="font-semibold">
              {bet.selection.charAt(0).toUpperCase() + bet.selection.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Dialog>
            <DialogTrigger asChild>
              <button
                className={`p-1.5 rounded transition-colors ${
                  darkMode
                    ? "text-blue-300 hover:text-blue-200 hover:bg-gray-700"
                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                }`}
                title="Compare sportsbook odds"
              >
                <Table2 className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent
              className={`sm:max-w-3xl ${
                darkMode
                  ? "bg-gray-900 border-gray-700 text-white"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              <DialogHeader>
                <DialogTitle>Sportsbook Odds</DialogTitle>
                <DialogDescription
                  className={darkMode ? "text-gray-400" : "text-gray-600"}
                >
                  {event.name} - {bet.marketName}:{" "}
                  {bet.selection.charAt(0).toUpperCase() +
                    bet.selection.slice(1)}
                </DialogDescription>
              </DialogHeader>

              <Table>
                <TableHeader>
                  <TableRow className={darkMode ? "border-gray-700" : ""}>
                    <TableHead
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      Sportsbook
                    </TableHead>
                    <TableHead
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      Odds
                    </TableHead>
                    <TableHead
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      Line
                    </TableHead>
                    <TableHead
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      Fair Odds
                    </TableHead>
                    <TableHead
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      Implied
                    </TableHead>
                    <TableHead
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      EV
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonListings.map((listing) => (
                    <TableRow
                      key={`${listing.sportsbook}-${listing.odds}-${listing.fairLine ?? "line"}`}
                      className={darkMode ? "border-gray-800" : ""}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getSportsbookColor(listing.sportsbook)}`}
                          >
                            {listing.sportsbook}
                          </span>
                          {displayedSportsbooks.has(listing.sportsbook) && (
                            <span
                              className={`text-[11px] ${
                                darkMode ? "text-green-300" : "text-green-700"
                              }`}
                            >
                              shown
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatOdds(listing.odds)}
                      </TableCell>
                      <TableCell>
                        {listing.fairLine === null
                          ? "-"
                          : bet.type === "sp" && listing.fairLine > 0
                            ? `+${listing.fairLine}`
                            : listing.fairLine}
                      </TableCell>
                      <TableCell>{formatOdds(listing.fairOdds)}</TableCell>
                      <TableCell>
                        {(oddsToImpliedProb(listing.odds) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell
                        className={
                          listing.ev >= 0
                            ? darkMode
                              ? "text-green-300"
                              : "text-green-700"
                            : darkMode
                              ? "text-red-300"
                              : "text-red-600"
                        }
                      >
                        {listing.ev >= 0 ? "+" : ""}
                        {listing.ev.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DialogContent>
          </Dialog>
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
      </div>

      {/* Sportsbook Listings */}
      <div className="space-y-2">
        {sortedListings.map((listing, index) => {
          return (
            <div
              key={listing.id + index}
              className={`border rounded p-2.5 transition-colors ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 flex-1">
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
                <button
                  onClick={() => {
                    onPlace({
                      id: bet.id,
                      user: "",
                      eventId: event.id,
                      eventName: event.name,
                      league: event.league,
                      marketName: bet.marketName,
                      betType: bet.type,
                      selection: bet.selection,
                      sportsbook: listing.sportsbook,
                      odds: listing.odds,
                      amount: listing.recommendedBet,
                      potentialWin: calculatePotentialWin(
                        listing.odds,
                        listing.recommendedBet,
                      ),
                      placedAt: new Date(),
                      eventDate: new Date(`${event.date} ${event.time}`),
                      placedEV: listing.ev,
                      status: "pending",
                    });
                  }}
                  className="p-1.5 rounded transition-colors bg-green-600 hover:bg-green-700 text-white"
                  title="Place bet"
                >
                  <Check className="w-4 h-4" />
                </button>
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
                  {listing.fairLine !== null && (
                    <div
                      className={darkMode ? "text-gray-400" : "text-gray-500"}
                    >
                      {bet.type === "sp" && listing.fairLine > 0
                        ? `+${listing.fairLine}`
                        : listing.fairLine}
                    </div>
                  )}
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
                  {listing.fairLine !== null && (
                    <div
                      className={darkMode ? "text-gray-400" : "text-gray-500"}
                    >
                      {bet.type === "sp" && listing.fairLine > 0
                        ? `+${listing.fairLine}`
                        : listing.fairLine}
                    </div>
                  )}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
