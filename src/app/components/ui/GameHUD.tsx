'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GAME_CONFIG, SUBJECT_COLORS, SUBJECT_ICONS } from '../../data/game-config';
import type { GameState } from '../battle/BattleScene';

interface GameHUDProps {
  gameState: GameState;
  onUnitClick: (unitType: string) => void;
  onSpellClick: (spellId: string) => void;
}

const GameHUD: React.FC<GameHUDProps> = ({
  gameState,
  onUnitClick,
  onSpellClick
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canAffordUnit = (unitCost: number): boolean => {
    return gameState.playerGold >= unitCost;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 to-transparent">
      {/* Top HUD - Gold, Timer, Health */}
      <div className="flex justify-between items-center mb-4">
        <Card className="bg-yellow-600 text-white">
          <CardContent className="p-2">
            <div className="text-center">
              <div className="text-2xl font-bold">💰 {gameState.playerGold}</div>
              <div className="text-xs">Gold (+{GAME_CONFIG.economy.goldPerSecond}/s)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 text-white">
          <CardContent className="p-2">
            <div className="text-center">
              <div className="text-2xl font-bold">⏰ {formatTime(gameState.matchTimeLeft)}</div>
              <div className="text-xs">Time Remaining</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cyan-600 text-white">
          <CardContent className="p-2">
            <div className="text-center">
              <div className="text-2xl font-bold">💙 {gameState.playerBaseHp}</div>
              <div className="text-xs">Base Health</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unit Deployment Buttons */}
      <div className="flex justify-center mb-4">
        <div className="grid grid-cols-3 gap-4">
          {GAME_CONFIG.units.map((unit) => {
            const affordable = canAffordUnit(unit.cost);
            const subjectColor = SUBJECT_COLORS[unit.subject];
            const subjectIcon = SUBJECT_ICONS[unit.subject];
            
            return (
              <Button
                key={unit.id}
                onClick={() => onUnitClick(unit.id)}
                disabled={!affordable || gameState.isGameOver}
                className={`h-20 w-24 flex flex-col items-center justify-center text-white font-bold border-2 transition-all ${
                  affordable 
                    ? 'hover:scale-105 hover:shadow-lg' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: affordable ? subjectColor : '#666',
                  borderColor: affordable ? '#fff' : '#999'
                }}
              >
                <div className="text-2xl mb-1">{subjectIcon}</div>
                <div className="text-xs text-center leading-tight">
                  {unit.name.split(' ')[0]}<br />
                  💰{unit.cost}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Spell Buttons */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          {GAME_CONFIG.spells.map((spell) => {
            const affordable = canAffordUnit(spell.cost);
            
            return (
              <Button
                key={spell.id}
                onClick={() => onSpellClick(spell.id)}
                disabled={!affordable || gameState.isGameOver}
                variant={affordable ? "default" : "outline"}
                size="sm"
                className={`${affordable ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
              >
                ✨ {spell.name} (💰{spell.cost})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Mobile-specific instructions */}
      <div className="lg:hidden mt-2 text-center">
        <p className="text-xs text-gray-400">
          Tap unit buttons to deploy! Answer quizzes correctly for stronger units! 💪
        </p>
      </div>
    </div>
  );
};

export default GameHUD;