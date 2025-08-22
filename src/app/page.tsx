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
  });

  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [pendingQuiz, setPendingQuiz] = useState<PendingQuiz | null>(null);
  const [pendingSpellQuiz, setPendingSpellQuiz] =
    useState<PendingSpellQuiz | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isGameFullyLoaded, setIsGameFullyLoaded] = useState<boolean>(false);
  const [isStarfieldFadingOut, setIsStarfieldFadingOut] = useState<boolean>(false);

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

  const handleGameReady = useCallback(() => {
    console.log("🎮 Game fully loaded!");
    setIsStarfieldFadingOut(true);
    setTimeout(() => {
      setIsGameFullyLoaded(true);
    }, 800); 
  }, []);

  // const restartGame = useCallback(() => {
  //   setTimeout(() => {
  //     setIsGameFullyLoaded(false);
  //   }, 800);
  //   setIsStarfieldFadingOut(false);
  //   window.location.reload(); // Simple restart
  // }, []);

  if (showTutorial) {
    return (
      <div className="min-h-screen starfield-background flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl nes-container is-rounded is-dark">
          <CardHeader className="text-center text-white">
            <CardTitle className="text-4xl font-bold pt-4 pb-4 mb-2 game-title">
              🎮 Welcome to EduBattle! ⚔️
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600">
                  🎯 How to Play
                </h3>
                <ul className="space-y-4 text-sm">
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
                <h3 className="text-lg font-semibold text-purple-600">
                  🎲 Game Rules
                </h3>
                <ul className="space-y-4 text-sm">
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

            <div className="mt-8 mb-8 text-center">
              <Button
                onClick={startGame}
                size="lg"
                className=" is-primary text-sm px-24 py-8 cursor-pointer mb-8 game-button nes-btn"
              >
                Start Battle!
              </Button>
              
            </div>
            <p className="text-sm text-gray-500 mt-8 text-center">
                Get ready for educational warfare! 🎓⚔️
              </p>
          </CardContent>
        </Card>
      </div>
    );
  }

    return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Unified Loading Screen With Fade-out Animation */}
      {!isGameFullyLoaded && (
        <div className={`absolute inset-0 starfield-background flex items-center justify-center z-50 ${
          isStarfieldFadingOut ? 'fade-out' : ''
        }`}>
                      <div className={`text-white text-lg game-ui-text transition-opacity duration-500 ${
            isStarfieldFadingOut ? 'opacity-0' : 'opacity-100'
          }`}>
            Loading Battle Arena...
          </div>
        </div>
      )}

      {/* Battle Arena - Full Screen */}
      <div className="absolute inset-0">
        <BattleArena
          ref={battleArenaRef}
          gameState={gameState}
          onGameStateUpdate={handleGameStateUpdate}
          onRequestQuiz={handleRequestQuiz}
          onGameReady={handleGameReady}
          onRequestSpellQuiz={handleRequestSpellQuiz}
        />
      </div>

      {/* Game HUD - shows when game is loaded */}
      {isGameFullyLoaded && (
        <GameHUD
          gameState={gameState}
          onSpellClick={handleSpellClick}
        />
      )}

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        unitType={pendingQuiz?.unitType || ""}
        spellId={pendingSpellQuiz?.spellId || ""}
        onAnswer={handleQuizAnswer}
        onClose={handleQuizClose}
      />

      {/* Game Over Actions */}
      {/* {gameState.isGameOver && isGameFullyLoaded && (
        <div className="absolute top-4 right-4">
          <Button onClick={restartGame} size="lg" variant="outline" className="game-button">
            🔄 Play Again
          </Button>
        </div>
      )} */}

      {/* Instructions (Mobile) */}
      {/* {isGameFullyLoaded && (
        <div className="lg:hidden absolute top-4 left-4 right-4">
          <Card className="bg-black/50 text-white text-center">
            <CardContent className="p-2">
              <p className="text-xs">
                Deploy units by answering quizzes! Correct = stronger units! 🧠⚔️
              </p>
            </CardContent>
          </Card>
        </div>
      )} */}
    </div>
  );
}
