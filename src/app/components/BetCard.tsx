import { EyeOff, Check } from 'lucide-react';

export interface Bet {
  id: string;
  type: string;
  selection: string;
  sportsbook: string;
  odds: number;
  fairOdds: number;
  ev: number;
  recommendedBet: number;
}

interface BetCardProps {
  bet: Bet;
  darkMode: boolean;
  onHide: (betId: string) => void;
  onPlace: (betId: string) => void;
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
    'DraftKings': 'bg-green-600 text-white',
    'FanDuel': 'bg-blue-600 text-white',
    'BetMGM': 'bg-yellow-500 text-gray-900',
    'Caesars': 'bg-purple-700 text-white',
    'PointsBet': 'bg-red-600 text-white',
    'BetRivers': 'bg-cyan-600 text-white',
  };
  return colors[sportsbook] || 'bg-gray-600 text-white';
}

export function BetCard({ bet, darkMode, onHide, onPlace }: BetCardProps) {
  const impliedProb = oddsToImpliedProb(bet.odds);
  const fairProb = oddsToImpliedProb(bet.fairOdds);

  return (
    <div className={`border rounded-md p-3 hover:border-blue-300 transition-colors ${
      darkMode
        ? 'bg-gray-750 border-gray-600 hover:border-blue-500'
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className={`text-sm mb-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <span className="font-medium">{bet.type}:</span> {bet.selection}
              </div>
              <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getSportsbookColor(bet.sportsbook)}`}>
                {bet.sportsbook}
              </div>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              bet.ev >= 5 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
              bet.ev >= 3 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
            }`}>
              +{bet.ev.toFixed(1)}% EV
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 text-xs">
            <div>
              <div className={`mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Odds</div>
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatOdds(bet.odds)}
              </div>
              <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {(impliedProb * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className={`mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fair Odds</div>
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatOdds(bet.fairOdds)}
              </div>
              <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {(fairProb * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className={`mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bet Amount</div>
              <div className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                ${bet.recommendedBet.toFixed(2)}
              </div>
            </div>
            <div>
              <div className={`mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Exp. Profit</div>
              <div className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                ${((bet.recommendedBet * bet.ev) / 100).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onHide(bet.id)}
            className={`p-1.5 rounded transition-colors ${
              darkMode
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
            }`}
            title="Hide bet"
          >
            <EyeOff className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPlace(bet.id)}
            className={`p-1.5 text-white rounded transition-colors ${
              darkMode
                ? 'bg-green-700 hover:bg-green-600'
                : 'bg-green-600 hover:bg-green-700'
            }`}
            title="Place bet"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}