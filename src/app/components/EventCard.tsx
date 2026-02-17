import { Calendar, Trophy } from 'lucide-react';
import { BetCard, Bet } from './BetCard';

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
  onPlaceBet: (betId: string) => void;
}

export function EventCard({ event, darkMode, onHideBet, onPlaceBet }: EventCardProps) {
  return (
    <div className={`border rounded-lg shadow-sm overflow-hidden ${
      darkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className={`p-4 border-b ${
        darkMode
          ? 'bg-gradient-to-r from-gray-800 to-gray-750 border-gray-700'
          : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`text-xs font-medium uppercase tracking-wide ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {event.league}
              </span>
            </div>
            <div className={`text-base mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <span className="font-medium">{event.awayTeam}</span> @ <span className="font-medium">{event.homeTeam}</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <Calendar className="w-3.5 h-3.5" />
              {event.date} at {event.time}
            </div>
          </div>
          <div className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            darkMode
              ? 'bg-blue-900/50 text-blue-300'
              : 'bg-blue-50 text-blue-700'
          }`}>
            {event.bets.length} {event.bets.length === 1 ? 'bet' : 'bets'}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        {event.bets.map(bet => (
          <BetCard
            key={bet.id}
            bet={bet}
            darkMode={darkMode}
            onHide={onHideBet}
            onPlace={onPlaceBet}
          />
        ))}
      </div>
    </div>
  );
}