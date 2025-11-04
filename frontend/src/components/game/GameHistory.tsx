import React from 'react';
import { GameRound } from '../../../../shared/types/game';

interface GameHistoryProps {
  rounds: GameRound[];
}

export const GameHistory: React.FC<GameHistoryProps> = ({ rounds }) => {
  if (rounds.length === 0) {
    return null;
  }

  const getMultiplierColor = (crashPoint: string): string => {
    const point = parseFloat(crashPoint);
    if (point < 1.5) return 'text-game-red';
    if (point < 2.0) return 'text-game-orange';
    if (point < 5.0) return 'text-game-green';
    return 'text-game-blue';
  };

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold text-telegram-text mb-3">
        История раундов
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {rounds.slice(-10).reverse().map((round) => (
          <div
            key={round.id}
            className={`px-3 py-2 rounded-lg bg-telegram-bg font-semibold ${
              getMultiplierColor(round.crashPoint)
            }`}
          >
            {parseFloat(round.crashPoint).toFixed(2)}x
          </div>
        ))}
      </div>
      
      {/* Statistics */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="text-telegram-hint">Средний</div>
          <div className="text-telegram-text font-semibold">
            {rounds.length > 0 
              ? (rounds.reduce((sum, r) => sum + parseFloat(r.crashPoint), 0) / rounds.length).toFixed(2)
              : '0.00'
            }x
          </div>
        </div>
        <div>
          <div className="text-telegram-hint">Максимум</div>
          <div className="text-telegram-text font-semibold">
            {rounds.length > 0 
              ? Math.max(...rounds.map(r => parseFloat(r.crashPoint))).toFixed(2)
              : '0.00'
            }x
          </div>
        </div>
        <div>
          <div className="text-telegram-hint">Раундов</div>
          <div className="text-telegram-text font-semibold">
            {rounds.length}
          </div>
        </div>
      </div>
    </div>
  );
};
