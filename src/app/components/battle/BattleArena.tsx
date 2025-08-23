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
  resetGameState: () => void; // Add reset game state method
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
        resetGameState: () => {
          if (gameRef.current) {
            gameRef.current.resetGameState();
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

        {/* Responsive Retro Health Bars & Timer Overlay */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 pointer-events-none">
          
          {/* Mobile Layout: Stacked Design */}
          <div className="block sm:hidden">
            {/* Mobile Timer - Top Center */}
            <div className="flex justify-center ">
              <div 
                className="nes-container is-rounded is-dark mobile-timer"
                style={{ 
                  padding: "0.5rem", 
                  background: "rgba(0,0,0,0.9)",
                  minWidth: "120px"
                }}
              >
                <div 
                  className="nes-text is-white text-center"
                  style={{ 
                    fontSize: "10px", 
                    fontFamily: "'Press Start 2P', cursive",
                    lineHeight: "1.2"
                  }}
                >
                  ⏰{Math.floor(gameState.matchTimeLeft / 60)}:
                  {String(gameState.matchTimeLeft % 60).padStart(2, "0")}
                </div>
              </div>
            </div>
            
            {/* Mobile Health Bars - Side by Side */}
            <div className="flex justify-between items-center gap-2">
              <div className="flex-1">
                <RetroHealthBar
                  currentHealth={gameState.playerBaseHp}
                  maxHealth={100}
                  label="PLAYER"
                  color="primary"
                  size="small"
                  className="mobile-healthbar responsive-healthbar"
                />
              </div>
              <div className="flex-1">
                <RetroHealthBar
                  currentHealth={gameState.enemyBaseHp}
                  maxHealth={100}
                  label="ENEMY"
                  color="error"
                  size="small"
                  className="mobile-healthbar responsive-healthbar"
                />
              </div>
            </div>
          </div>

          {/* Tablet Layout: Balanced Design */}
          <div className="hidden sm:block lg:hidden">
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-start">
                <RetroHealthBar
                  currentHealth={gameState.playerBaseHp}
                  maxHealth={100}
                  label="PLAYER BASE"
                  color="primary"
                  size="medium"
                  className="tablet-healthbar responsive-healthbar"
                />
              </div>

              <div 
                className="nes-container is-rounded is-dark tablet-timer"
                style={{ 
                  padding: "0.75rem", 
                  background: "rgba(0,0,0,0.8)" 
                }}
              >
                <div 
                  className="nes-text is-white text-center"
                  style={{ 
                    fontSize: "14px", 
                    fontFamily: "'Press Start 2P', cursive",
                    marginBottom: "0.25rem"
                  }}
                >
                  ⏰{Math.floor(gameState.matchTimeLeft / 60)}:
                  {String(gameState.matchTimeLeft % 60).padStart(2, "0")}
                </div>
                <div 
                  className="nes-text is-white text-center"
                  style={{ 
                    fontSize: "7px", 
                    fontFamily: "'Press Start 2P', cursive",
                    opacity: 0.8
                  }}
                >
                  TIME REMAINING
                </div>
              </div>

              <div className="flex flex-col items-end">
                <RetroHealthBar
                  currentHealth={gameState.enemyBaseHp}
                  maxHealth={100}
                  label="ENEMY BASE"
                  color="error"
                  size="medium"
                  className="tablet-healthbar responsive-healthbar"
                />
              </div>
            </div>
          </div>

          {/* Desktop Layout: Full Design */}
          <div className="hidden lg:flex justify-between items-start">
            <div className="flex flex-col items-start">
              <RetroHealthBar
                currentHealth={gameState.playerBaseHp}
                maxHealth={100}
                label="PLAYER BASE"
                color="primary"
                size="large"
                className="desktop-healthbar responsive-healthbar"
              />
          </div>

            <div 
              className="nes-container is-rounded is-dark desktop-timer"
              style={{ 
                padding: "1rem", 
                background: "rgba(0,0,0,0.8)" 
              }}
            >
              <div 
                className="nes-text is-white text-center"
                style={{ 
                  fontSize: "16px", 
                  fontFamily: "'Press Start 2P', cursive",
                  marginBottom: "0.5rem"
                }}
              >
          ⏰{Math.floor(gameState.matchTimeLeft / 60)}:
            {String(gameState.matchTimeLeft % 60).padStart(2, "0")}
              </div>
              <div 
                className="nes-text is-white text-center"
                style={{ 
                  fontSize: "8px", 
                  fontFamily: "'Press Start 2P', cursive",
                  opacity: 0.8
                }}
              >
                TIME REMAINING
              </div>
            </div>

            <div className="flex flex-col items-end">
              <RetroHealthBar
                currentHealth={gameState.enemyBaseHp}
                maxHealth={100}
                label="ENEMY BASE"
                color="error"
                size="large"
                className="desktop-healthbar responsive-healthbar"
              />
          </div>
          </div>
        </div>

        {/* Camera controls hint */}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded-lg text-xs pointer-events-none game-ui-text z-50">
          🎮 Drag to pan • A/D keys to move • SPACE to center
        </div>

        {/* Game over overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 text-center max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl w-full mx-2">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 game-title">
                {gameState.winner === "player" ?  "Victory!" : "Defeat!"}
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg mb-3 sm:mb-4 game-ui-text px-2">
                {gameState.winner === "player"
                  ? "Congratulations! You destroyed the enemy base!"
                  : "Better luck next time!"}
              </p>
              <div className="flex justify-center space-x-1 sm:space-x-2 mb-4 sm:mb-6">
                {[1, 2, 3].map((star) => (
                  <span
                    key={star}
                    className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl ${
                      star <= (gameState.winner === "player" ? 3 : 1)
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <Button 
                onClick={restartGame} 
                size="lg" 
                variant="outline" 
                className="mt-4 sm:mt-6 md:mt-8 game-button nes-btn is-primary text-xs sm:text-sm md:text-base px-4 sm:px-6 py-2 sm:py-3"
              >
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
