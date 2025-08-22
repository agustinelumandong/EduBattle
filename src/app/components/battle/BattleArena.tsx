"use client";

import React, { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import type { GameState } from "./BattleScene";
import type { PhaserGameRef } from "./PhaserGameComponent";

// Dynamically import PhaserGameComponent only on client
const PhaserGameComponent = dynamic(() => import("./PhaserGameComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-white text-lg">Loading Battle Arena...</div>
    </div>
  ),
});

export interface BattleArenaRef {
  deployUnit: (unitType: string, isCorrect: boolean) => void;
  castSpell: (spellId: string) => boolean;
  resetQuizState: () => void;
}

interface BattleArenaProps {
  gameState: GameState;
  onGameStateUpdate: (state: GameState) => void;
  onRequestQuiz: (
    unitType: string,
    callback: (correct: boolean) => void
  ) => void;
  onRequestSpellQuiz: (
    spellId: string,
    callback: (correct: boolean) => void
  ) => void;
}

const BattleArena = React.forwardRef<BattleArenaRef, BattleArenaProps>(
  (
    { gameState, onGameStateUpdate, onRequestQuiz, onRequestSpellQuiz },
    ref
  ) => {
    const [isClient, setIsClient] = useState<boolean>(false);
    const gameRef = React.useRef<PhaserGameRef>(null);

    React.useEffect(() => {
      setIsClient(true);
    }, []);

    const handleGameStateUpdate = useCallback(
      (state: GameState) => {
        onGameStateUpdate(state);
      },
      [onGameStateUpdate]
    );

    const handleRequestQuiz = useCallback(
      (unitType: string, callback: (correct: boolean) => void) => {
        onRequestQuiz(unitType, callback);
      },
      [onRequestQuiz]
    );

    // Expose methods to parent
    React.useImperativeHandle(
      ref,
      () => ({
        deployUnit: (unitType: string, isCorrect: boolean) => {
          if (gameRef.current) {
            gameRef.current.deployUnit(unitType, isCorrect);
          }
        },
        castSpell: (spellId: string) => {
          if (gameRef.current) {
            return gameRef.current.castSpell(spellId);
          }
          return false;
        },
        resetQuizState: () => {
          if (gameRef.current) {
            gameRef.current.resetQuizState();
          }
        },
      }),
      []
    );

    if (!isClient) {
      return (
        <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-white text-lg">Initializing Battle Arena...</div>
        </div>
      );
    }

    return (
      <div className="relative w-full">
        <PhaserGameComponent
          ref={gameRef}
          onGameStateUpdate={handleGameStateUpdate}
          onRequestQuiz={handleRequestQuiz}
          onRequestSpellQuiz={onRequestSpellQuiz}
        />

        {/* Battle status overlay */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center pointer-events-none">
          <div className="bg-cyan-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
            Player Base: {gameState.playerBaseHp}/{1000}
          </div>
          <div className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-bold">
            {Math.floor(gameState.matchTimeLeft / 60)}:
            {String(gameState.matchTimeLeft % 60).padStart(2, "0")}
          </div>
          <div className="bg-magenta-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
            Enemy Base: {gameState.enemyBaseHp}/{1000}
          </div>
        </div>

        {/* Camera controls hint */}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded-lg text-xs pointer-events-none">
          🎮 Drag to pan • A/D keys to move • SPACE to center
        </div>

        {/* Game over overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">
                {gameState.winner === "player" ? "🎉 Victory!" : "💥 Defeat!"}
              </h2>
              <p className="text-lg mb-4">
                {gameState.winner === "player"
                  ? "Congratulations! You destroyed the enemy base!"
                  : "The enemy destroyed your base. Better luck next time!"}
              </p>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3].map((star) => (
                  <span
                    key={star}
                    className={`text-2xl ${
                      star <= (gameState.winner === "player" ? 3 : 1)
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

BattleArena.displayName = "BattleArena";

export default BattleArena;
