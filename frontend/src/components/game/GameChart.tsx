import React, { useEffect, useRef, useState } from 'react';
import { GameStatus, GameRound } from '../../../../shared/types/game';
import { useLanguage } from '../../contexts/LanguageContext';

interface GameChartProps {
  multiplier: string;
  status: GameStatus;
  timeUntilNextRound?: number;
  roundHistory: GameRound[];
}

export const GameChart: React.FC<GameChartProps> = ({ 
  multiplier, 
  status, 
  timeUntilNextRound,
  roundHistory 
}) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rocketPosition, setRocketPosition] = useState({ x: 20, y: 70 });
  const [crashed, setCrashed] = useState(false);
  const [, setRocketRotation] = useState(0);

  // Animation for rocket movement - stays in center with small oscillations
  useEffect(() => {
    if (status === 'flying') {
      const mult = parseFloat(multiplier);
      
      // Rocket stays in center with small movements
      const baseX = 50;
      const baseY = 75; // Moved down further to avoid overlapping with multiplier
      
      // Enhanced oscillations - rocket vibrates more like it's flying
      const oscillationX = Math.sin(mult * 3) * 3.5; // ±3.5% horizontal
      const oscillationY = Math.cos(mult * 2.5) * 3; // ±3% vertical
      
      setRocketPosition({ 
        x: baseX + oscillationX, 
        y: baseY + oscillationY 
      });
      setRocketRotation(0); // Always pointing up
      setCrashed(false);
    } else if (status === 'crashed') {
      setCrashed(true);
    } else if (status === 'betting') {
      // Reset position for next round
      setRocketPosition({ x: 50, y: 75 });
      setRocketRotation(0);
      setCrashed(false);
    }
  }, [multiplier, status]);

  // Clear canvas - no effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Just clear canvas - no air flows or fire
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [multiplier, status, crashed]);

  const getMultiplierColor = (crashPoint: string): string => {
    const point = parseFloat(crashPoint);
    if (point < 1.5) return 'bg-red-500 text-white';
    if (point < 2.0) return 'bg-orange-500 text-white';
    if (point < 5.0) return 'bg-emerald-500 text-white';
    return 'bg-blue-500 text-white';
  };

  return (
    <div className={`relative w-full card overflow-hidden ${
      status === 'betting' ? 'h-48' : 'h-80'
    }`}>
      {/* Game History - Top Bar */}
      <div className="absolute top-4 left-2 right-2 z-10">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {roundHistory.slice(-8).reverse().map((round, index) => {
            const isLatest = index === 0; // First element after reverse is the latest
            return (
              <div
                key={round.id}
                className={`px-3 py-1.5 rounded-lg font-semibold text-sm whitespace-nowrap ${
                  getMultiplierColor(round.crashPoint)
                } ${isLatest ? 'scale-105 shadow-xl' : 'shadow-md'}`}
              >
                {parseFloat(round.crashPoint).toFixed(2)}x
              </div>
            );
          })}
        </div>
      </div>

      {/* Background canvas for trail */}
      <canvas
        ref={canvasRef}
        width={400}
        height={320}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Betting phase - compact timer only */}
      {status === 'betting' && timeUntilNextRound ? (
            <div className="absolute top-16 left-0 right-0 bottom-0 flex items-center justify-center px-2">
              <div className="text-center">
                <div className="text-base font-semibold text-telegram-hint mb-1">
                  {t('pages.crash.nextRoundIn')}
                </div>
                <div className="text-3xl font-bold text-telegram-text animate-pulse">
                  {Math.ceil(timeUntilNextRound)}
                </div>
              </div>
            </div>
      ) : (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30">
          <div className={`text-5xl font-bold transition-all duration-300 ${
            status === 'crashed' 
              ? 'text-red-500 animate-pulse' 
              : 'text-emerald-400 animate-multiplier-pulse'
          }`}>
            {multiplier}x
          </div>
        </div>
      )}

      {/* Rocket - centered, flying up */}
      {(status === 'flying' || status === 'crashed') && (
        <div
          className="absolute z-20 transition-all duration-300"
          style={{
            left: `${rocketPosition.x}%`,
            top: `${rocketPosition.y}%`,
            transform: `translate(-50%, -50%)`
          }}
        >
          {crashed ? (
            // Simple explosion effect - just slight scale up
            <div className="relative">
              <div className="text-8xl animate-pulse">💥</div>
            </div>
          ) : (
            // Flying rocket - larger, straight up
            <div className="relative flex flex-col items-center">
              {/* Rocket body - white, large */}
              <div className="text-7xl animate-rocket-fly">
                🚀
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid background */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }} />
      </div>
    </div>
  );
};
