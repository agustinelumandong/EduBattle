"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCallback, useRef, useState, type ReactElement } from "react";
import BattleArena from "./components/battle/BattleArena";
import type { BattleArenaRef } from "./components/battle/BattleArena";
import type { GameState } from "./components/battle/BattleScene";
import QuizModal from "./components/quiz/QuizModal";
import GameHUD from "./components/ui/GameHUD";
import { GAME_CONFIG } from "./data/game-config";

interface PendingQuiz {
  unitType: string;
  callback: (correct: boolean) => void;
}

interface PendingSpellQuiz {
  spellId: string;
  callback: (correct: boolean) => void;
}

export default function EduBattle(): ReactElement {
  const [gameState, setGameState] = useState<GameState>({
    playerBaseHp: GAME_CONFIG.battle.baseMaxHealth,
    enemyBaseHp: GAME_CONFIG.battle.baseMaxHealth,
    matchTimeLeft: GAME_CONFIG.battle.matchDurationMinutes * 60,
    isGameOver: false,
    isSuddenDeath: false, // Add sudden death state
  });

  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [pendingQuiz, setPendingQuiz] = useState<PendingQuiz | null>(null);
  const [pendingSpellQuiz, setPendingSpellQuiz] =
    useState<PendingSpellQuiz | null>(null);
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

  const handleRequestSpellQuiz = useCallback(
    (spellId: string, callback: (correct: boolean) => void) => {
      setPendingSpellQuiz({ spellId, callback });
      setIsQuizOpen(true);
    },
    []
  );

  const handleQuizAnswer = useCallback(
    (correct: boolean) => {
      console.log("📝 Quiz answered:", correct);
      console.log("🔍 pendingQuiz:", pendingQuiz);
      console.log("🔍 pendingSpellQuiz:", pendingSpellQuiz);

      if (pendingSpellQuiz) {
        console.log("🧙‍♂️ Processing SPELL quiz callback");
        console.log("🧙‍♂️ About to call spell callback with:", correct);
        pendingSpellQuiz.callback(correct);
        console.log("🧙‍♂️ Spell callback completed, clearing state");
        setPendingSpellQuiz(null);
        setIsQuizOpen(false);
        console.log("🧙‍♂️ Spell quiz state cleared, returning early");
        // Clear spell quiz immediately to prevent double execution
        return; // Exit early to prevent further processing
      } else if (pendingQuiz) {
        console.log("⚔️ Processing UNIT quiz callback");
        pendingQuiz.callback(correct);
        setPendingQuiz(null);
        setIsQuizOpen(false);
      }

      // Reset quiz state in battle scene to allow new quizzes
      if (battleArenaRef.current) {
        battleArenaRef.current.resetQuizState();
      }

      // Add a small delay before allowing new quizzes
      setTimeout(() => {
        setPendingQuiz(null);
        setPendingSpellQuiz(null);
      }, 100);
    },
    [pendingQuiz, pendingSpellQuiz]
  );

  const handleQuizClose = useCallback(() => {
    console.log("❌ Quiz closed/skipped");
    console.log("🔍 pendingQuiz:", pendingQuiz);
    console.log("🔍 pendingSpellQuiz:", pendingSpellQuiz);

    if (pendingSpellQuiz) {
      console.log("🧙‍♂️ Processing SPELL quiz close (default to incorrect)");
      console.log("🧙‍♂️ WARNING: Spell quiz should have been cleared already!");
      pendingSpellQuiz.callback(false); // Default to incorrect if closed
      setPendingSpellQuiz(null);
    } else if (pendingQuiz) {
      console.log("⚔️ Processing UNIT quiz close (default to incorrect)");
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
      setPendingSpellQuiz(null);
    }, 100);
  }, [pendingQuiz, pendingSpellQuiz]);

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
      if (!spellConfig) return;

      // Cast spell through BattleArena component
      if (battleArenaRef.current) {
        battleArenaRef.current.castSpell(spellId);
      }
    },
    [gameStarted, gameState.isGameOver]
  );

  const startGame = useCallback(() => {
    setShowTutorial(false);
    setGameStarted(true);
  }, []);

  const restartGame = useCallback(() => {
    if (battleArenaRef.current) {
      battleArenaRef.current.resetGameState();
      setGameStarted(true);
      setShowTutorial(false);
    }
  }, []);

  if (showTutorial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-4xl font-bold mb-2">
              🎮 Welcome to EduBattle! ⚔️
            </CardTitle>
            <p className="text-xl">Educational Lane Battle Game</p>
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
                    <span className="text-blue-500">⏰</span>
                    Quizzes appear every 30 seconds - make your choice!
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">🔢</span>
                    Math Knights, Science Mages, History Archers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">💥</span>
                    Wrong answers deploy weaker units
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-100 rounded-lg">
                <div className="text-3xl mb-2">🔢</div>
                <h4 className="font-semibold text-blue-600">Math Knight</h4>
                <p className="text-sm">
                  Strong melee warrior
                  <br />
                </p>
              </div>
              <div className="p-4 bg-green-100 rounded-lg">
                <div className="text-3xl mb-2">🧪</div>
                <h4 className="font-semibold text-green-600">Science Mage</h4>
                <p className="text-sm">
                  Ranged spell caster
                  <br />
                </p>
              </div>
              <div className="p-4 bg-amber-100 rounded-lg">
                <div className="text-3xl mb-2">📜</div>
                <h4 className="font-semibold text-amber-600">History Archer</h4>
                <p className="text-sm">
                  Long-range archer
                  <br />
                </p>
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
          onRequestSpellQuiz={handleRequestSpellQuiz}
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
        spellId={pendingSpellQuiz?.spellId || ""}
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
