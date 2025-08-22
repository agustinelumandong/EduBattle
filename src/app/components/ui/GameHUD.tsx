"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import {
  GAME_CONFIG
} from "../../data/game-config";
import type { GameState } from "../battle/BattleScene";

interface GameHUDProps {
  gameState: GameState;
  onUnitClick: (unitType: string) => void;
  onSpellClick: (spellId: string) => void;
}

const GameHUD: React.FC<GameHUDProps> = ({
  gameState,
  onUnitClick,
  onSpellClick,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 to-transparent">
      {/* Top HUD - Gold */}
      <div className="flex justify-between items-center mb-4">
        <Card className=" bg-yellow-600 text-white">
          <CardContent className="p-2 game-stats">
            <div className="text-center">
              <div className="text-2xl font-bold game-stats">
                💰 {gameState.playerGold}
              </div>
              <div className="text-xs game-ui-text">
                Gold (+{GAME_CONFIG.economy.goldPerSecond}/s)
              </div>
            </div>
          </CardContent>
        </Card>
 
      </div>

      {/* Spell Buttons */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          {GAME_CONFIG.spells.map((spell) => {
            const affordable = gameState.playerGold >= spell.cost;

            return (
              <Button
                key={spell.id}
                onClick={() => onSpellClick(spell.id)}
                disabled={!affordable || gameState.isGameOver}
                variant={affordable ? "default" : "outline"}
                size="sm"
                className={`h-20 w-24 flex flex-col items-center justify-center text-white font-bold border-2 transition-all hover:scale-105 hover:shadow-lg game-button`}
                style={{
                  background:
                    spell.name.toLowerCase() === "freeze lane"
                      ? "#164e63" // cyan-900
                      : spell.name.toLowerCase() === "meteor strike"
                      ? "#7f1d1d" // red-900
                      : spell.name.toLowerCase() === "double gold"
                      ? "#854d0e" // yellow-900
                      : "#4b006e", // purple-900
                  borderColor: "#fff",
                }}
              >
                {spell.name.toLowerCase() === "freeze lane" ? (
                  <span className="text-cyan-200 text-2xl mr-1">❄️</span>
                ) : spell.name.toLowerCase() === "meteor strike" ? (
                  <span className="text-red-500 text-2xl mr-1">🔥</span>
                ) : spell.name.toLowerCase() === "double gold" ? (
                  <span className="text-yellow-400 text-2xl mr-1">2x💰</span>
                ) : (
                  <span className="text-purple-300 text-2xl mr-1">✨</span>
                )}
               <span className="text-white game-ui-text" style={{fontSize: '8px'}}>{spell.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Mobile-specific instructions */}
      <div className="lg:hidden mt-2 text-center">
        <p className="text-xs text-gray-400">
          Answer quizzes correctly for stronger units! Use gold for spells! ✨
        </p>
      </div>
    </div>
  );
};

export default GameHUD;
