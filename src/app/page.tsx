"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCallback, useRef, useState, type ReactElement } from "react";
import type { BattleArenaRef } from "./components/battle/BattleArena";
import BattleArena from "./components/battle/BattleArena";
import type { GameState } from "./components/battle/BattleScene";
import QuizModal from "./components/quiz/QuizModal";
import GameHUD from "./components/ui/GameHUD";
import { GAME_CONFIG } from "./data/game-config";

interface PendingQuiz {
  unitType: string;
  callback: (correct: boolean) => void;
}

export default function EduBattle(): ReactElement {
  const [gameState, setGameState] = useState<GameState>({
    playerGold: GAME_CONFIG.economy.startGold,
    playerBaseHp: GAME_CONFIG.battle.baseMaxHealth,
    enemyBaseHp: GAME_CONFIG.battle.baseMaxHealth,
    matchTimeLeft: GAME_CONFIG.battle.matchDurationMinutes * 60,
    isGameOver: false,
  });

  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [pendingQuiz, setPendingQuiz] = useState<PendingQuiz | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const battleArenaRef = useRef<BattleArenaRef>(null);

  const handleGameStateUpdate = useCallback((state: GameState) => {
    setGameState(state);
  }, []);

  const handleRequestQuiz = useCallback(
    (unitType: string, callback: (correct: boolean) => void) => {
      setPendingQuiz({ unitType, callback });
      setIsQuizOpen(true);
    },
    []
  );

  const handleQuizAnswer = useCallback(
    (correct: boolean) => {
      if (pendingQuiz) {
        pendingQuiz.callback(correct);
        setPendingQuiz(null);
      }
      setIsQuizOpen(false);

      // Reset quiz state in battle scene to allow new quizzes
      if (battleArenaRef.current) {
        battleArenaRef.current.resetQuizState();
      }

      // Add a small delay before allowing new quizzes
      setTimeout(() => {
        setPendingQuiz(null);
      }, 100);
    },
    [pendingQuiz]
  );

  const handleQuizClose = useCallback(() => {
    if (pendingQuiz) {
      pendingQuiz.callback(false); // Default to incorrect if closed
      setPendingQuiz(null);
    }
    setIsQuizOpen(false);

    // Reset quiz state in battle scene to allow new quizzes
    if (battleArenaRef.current) {
      battleArenaRef.current.resetQuizState();
    }

    // Add a small delay before allowing new quizzes
    setTimeout(() => {
      setPendingQuiz(null);
    }, 100);
  }, [pendingQuiz]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUnitClick = useCallback((unitType: string) => {
    // Since units are now only deployed through the quiz system,
    // We'll ignore direct unit clicks from the UI
    return;
  }, []);

  const handleSpellClick = useCallback(
    (spellId: string) => {
      if (!gameStarted || gameState.isGameOver) return;

      const spellConfig = GAME_CONFIG.spells.find((s) => s.id === spellId);
      if (!spellConfig || gameState.playerGold < spellConfig.cost) return;

      // Cast spell through BattleArena component
      if (battleArenaRef.current) {
        battleArenaRef.current.castSpell(spellId);
      }
    },
    [gameStarted, gameState.isGameOver, gameState.playerGold]
  );

  const startGame = useCallback(() => {
    setShowTutorial(false);
    setGameStarted(true);
  }, []);

  const restartGame = useCallback(() => {
    window.location.reload(); // Simple restart
  }, []);

  if (showTutorial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-4xl font-bold pt-4 pb-4 mb-2">
              🎮 Welcome to EduBattle! ⚔️
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-blue-600">
                  🎯 How to Play
                </h3>
                <ul className="space-y-2 text-lg">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Click unit buttons to deploy warriors
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">🧠</span>
                    Answer quiz questions to deploy units
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-500">💪</span>
                    Correct answers = stronger units!
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">⚡</span>
                    Destroy the enemy crystal to win!
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-purple-600">
                  🎲 Game Rules
                </h3>
                <ul className="space-y-2 text-lg">
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-500">💰</span>
                    Gold is only used for spells, units are free after quizzes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">⏰</span>
                    Quizzes appear every 10 seconds - make your choice!
                  </li> 
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">💥</span>
                    Wrong answers deploy weaker units
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button
                onClick={startGame}
                size="lg"
                className="text-xl px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                🚀 Start Battle!
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Get ready for educational warfare! 🎓⚔️
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Battle Arena - Full Screen */}
      <div className="absolute inset-0">
        <BattleArena
          ref={battleArenaRef}
          gameState={gameState}
          onGameStateUpdate={handleGameStateUpdate}
          onRequestQuiz={handleRequestQuiz}
        />
      </div>

      {/* Game HUD */}
      <GameHUD
        gameState={gameState}
        onUnitClick={handleUnitClick}
        onSpellClick={handleSpellClick}
      />

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        unitType={pendingQuiz?.unitType || ""}
        onAnswer={handleQuizAnswer}
        onClose={handleQuizClose}
      />

      {/* Game Over Actions */}
      {gameState.isGameOver && (
        <div className="absolute top-4 right-4">
          <Button onClick={restartGame} size="lg" variant="outline">
            🔄 Play Again
          </Button>
        </div>
      )}

      {/* Instructions (Mobile) */}
      <div className="lg:hidden absolute top-4 left-4 right-4">
        <Card className="bg-black/50 text-white text-center">
          <CardContent className="p-2">
            <p className="text-xs">
              Deploy units by answering quizzes! Correct = stronger units! 🧠⚔️
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
