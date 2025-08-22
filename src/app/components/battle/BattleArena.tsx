"use client";

import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import React, { useCallback, useState } from "react";
import RetroHealthBar from "../ui/RetroHealthBar";
import type { GameState } from "./BattleScene";
import type { PhaserGameRef } from "./PhaserGameComponent";

const PhaserGameComponent = dynamic(() => import("./PhaserGameComponent"), {
  ssr: false,
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
  onGameReady?: () => void;
  onRequestSpellQuiz: (
    spellId: string,
    callback: (correct: boolean) => void
  ) => void;
}


const BattleArena = React.forwardRef<BattleArenaRef, BattleArenaProps>(
  ({ gameState, onGameStateUpdate, onRequestQuiz, onGameReady, onRequestSpellQuiz }, ref) => {
    const [isClient, setIsClient] = useState<boolean>(false);
    const gameRef = React.useRef<PhaserGameRef>(null);
    const [gameRestarted, setGameRestarted] = useState<boolean>(false);
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

    const handleGameReady = useCallback(() => {
      if (onGameReady) {
        onGameReady();
      }
    }, [onGameReady]);

    const restartGame = useCallback(() => {
      setGameRestarted(true);
      window.location.reload(); // Simple restart
    }, []);

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
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className="text-white text-lg">Initializing Battle Arena...</div>
        </div>
      );
    }
  

    return (
      <div className="relative w-full h-full">
        <PhaserGameComponent
          ref={gameRef}
          onGameStateUpdate={handleGameStateUpdate}
          onRequestQuiz={handleRequestQuiz}
          onGameReady={handleGameReady}
          onRequestSpellQuiz={onRequestSpellQuiz}
        />

        {/* Retro Health Bars Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          {/* Player Health Bar */}
          <div className="flex flex-col items-start">
            <RetroHealthBar
              currentHealth={gameState.playerBaseHp}
              maxHealth={100}
              label="PLAYER BASE"
              color="primary"
              size="large"
            />
          </div>

          {/* Timer Display */}
          <div className="nes-container is-rounded is-dark" style={{ padding: "1rem", background: "rgba(0,0,0,0.8)" }}>
            <div className="nes-text is-white" style={{ 
              fontSize: "16px", 
              fontFamily: "'Press Start 2P', cursive",
              textAlign: "center",
              marginBottom: "0.5rem"
            }}>
              ⏰{Math.floor(gameState.matchTimeLeft / 60)}:
              {String(gameState.matchTimeLeft % 60).padStart(2, "0")}
            </div>
            <div className="nes-text is-white text-center" style={{ 
              fontSize: "8px", 
              fontFamily: "'Press Start 2P', cursive",
              textAlign: "center",
              opacity: 0.8
            }}>
              TIME REMAINING
            </div>
          </div>

          {/* Enemy Health Bar */}
          <div className="flex flex-col items-end">
            <RetroHealthBar
              currentHealth={gameState.enemyBaseHp}
              maxHealth={100}
              label="ENEMY BASE"
              color="error"
              size="large"
            />
          </div>
        </div>

        {/* Camera controls hint */}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded-lg text-xs pointer-events-none game-ui-text z-50">
          🎮 Drag to pan • A/D keys to move • SPACE to center
        </div>

        {/* Game over overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold mb-4 game-title">
                {gameState.winner === "player" ? "🎉 Victory!" : "💥 Defeat!"}
              </h2>
              <p className="text-lg mb-4">
                {gameState.winner === "player"
                  ? "Congratulations! You destroyed the enemy base!"
                  : "Better luck next time!"}
              </p>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3].map((star) => (
                  <span
                    key={star}
                    className={`text-6xl ${
                      star <= (gameState.winner === "player" ? 3 : 1)
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <Button onClick={restartGame} size="lg" variant="outline" className="game-button nes-btn is-primary">
               Play Again
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

BattleArena.displayName = "BattleArena";

export default BattleArena;
