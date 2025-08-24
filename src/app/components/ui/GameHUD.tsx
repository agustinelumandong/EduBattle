"use client";

import React from "react";
import { GAME_CONFIG } from "../../data/game-config";
import type { GameState } from "../battle/BattleScene";

interface GameHUDProps {
  gameState: GameState;
  onSpellClick: (spellId: string) => void;
  isSpellOnCooldown: (spellId: string) => boolean;
  getSpellCooldownRemaining: (spellId: string) => number;
}

const GameHUD: React.FC<GameHUDProps> = ({
  gameState,
  onSpellClick,
  isSpellOnCooldown,
  getSpellCooldownRemaining,
}) => {
  return (
    <>
      {/* Sudden Death Banner - Full Screen */}
      {gameState.isSuddenDeath && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 sm:py-3 md:py-4 animate-pulse">
          <div className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold game-title px-2">
            🔥 SUDDEN DEATH MODE! 🔥
          </div>
          <div className="text-xs sm:text-sm md:text-base lg:text-lg game-ui-text px-2 mt-1">
            First base to take damage loses! Fight to the death!
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 to-transparent">
        {/* Spell Buttons */}
        <div className="flex justify-center">
          <div className="flex gap-2">
            {GAME_CONFIG.spells.map((spell) => {
              // ⏰ Check if spell is on cooldown
              const isOnCooldown = isSpellOnCooldown(spell.id);
              const cooldownRemaining = getSpellCooldownRemaining(spell.id);
              const isDisabled = gameState.isGameOver || isOnCooldown;

              return (
                <button
                  key={spell.id}
                  onClick={() => onSpellClick(spell.id)}
                  disabled={isDisabled}
                  className={`nes-btn ${
                    isDisabled ? "is-disabled" : "is-primary"
                  }`}
                  style={{
                    height: "80px",
                    width: "96px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "8px",
                    // ⏰ Gray out during cooldown, normal colors otherwise
                    background: isOnCooldown
                      ? "#4b5563" // gray-600 for cooldown
                      : spell.name.toLowerCase() === "freeze lane"
                      ? "#164e63" // cyan-900
                      : spell.name.toLowerCase() === "meteor strike"
                      ? "#7f1d1d" // red-900
                      : "#854d0e", // yellow-900
                    opacity: isOnCooldown ? 0.6 : 1,
                    cursor: isOnCooldown ? "not-allowed" : "pointer",
                  }}
                >
                  {/* ⏰ Show cooldown timer or normal icon */}
                  {isOnCooldown ? (
                    <div className="text-center">
                      <span className="text-gray-300 text-xl">⏰</span>
                      <div className="text-red-400 text-xs font-bold mt-1">
                        {cooldownRemaining}s
                      </div>
                    </div>
                  ) : (
                    <>
                      {spell.name.toLowerCase() === "freeze lane" ? (
                        <span className="text-cyan-200 text-2xl mr-1">❄️</span>
                      ) : spell.name.toLowerCase() === "meteor strike" ? (
                        <span className="text-red-500 text-2xl mr-1">🔥</span>
                      ) : (
                        <span className="text-purple-300 text-2xl mr-1">
                          ✨
                        </span>
                      )}
                      <span
                        className="text-white"
                        style={{
                          fontSize: "10px",
                          fontFamily: "'Press Start 2P', cursive",
                        }}
                      >
                        {spell.name}
                      </span>
                    </>
                  )}
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
    </>
  );
};

export default GameHUD;
