"use client";

// Removed unused Button, Card, and CardContent imports for NES.css implementation
import React from "react";
import {
  GAME_CONFIG
} from "../../data/game-config";
import type { GameState } from "../battle/BattleScene";

interface GameHUDProps {
  gameState: GameState;
  onSpellClick: (spellId: string) => void;
}

const GameHUD: React.FC<GameHUDProps> = ({
  gameState,
  onSpellClick,
}) => {
  // Removed unused onUnitClick and formatTime for cleaner code

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 to-transparent"> 
      

      {/* Spell Buttons */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          {GAME_CONFIG.spells.map((spell) => { 

            return (
              <button
                key={spell.id}
                onClick={() => onSpellClick(spell.id)}
                disabled={gameState.isGameOver}
                className={`nes-btn ${gameState.isGameOver ? 'is-disabled' : 'is-primary'}`}
                style={{
                  height: "80px",
                  width: "96px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "8px",
                  background:
                    spell.name.toLowerCase() === "freeze lane"
                      ? "#164e63" // cyan-900
                      : spell.name.toLowerCase() === "meteor strike"
                      ? "#7f1d1d" // red-900
                      : "#854d0e" // yellow-900
                }}
              >
                {spell.name.toLowerCase() === "freeze lane" ? (
                  <span className="text-cyan-200 text-2xl mr-1">❄️</span>
                ) : spell.name.toLowerCase() === "meteor strike" ? (
                  <span className="text-red-500 text-2xl mr-1">🔥</span>) 
                  : (
                  <span className="text-purple-300 text-2xl mr-1">✨</span>
                )}
               <span className="text-white" style={{fontSize: '10px', fontFamily: "'Press Start 2P', cursive"}}>{spell.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile-specific instructions */}
      <div className="lg:hidden mt-2 text-center">
        <p className="text-xs text-gray-400">
          Answer quizzes correctly for stronger units! Use spells wisely! ✨
        </p>
      </div>
    </div>
  );
};

export default GameHUD;
