"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
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
    isSuddenDeath: false, // Add sudden death state
  });

  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [pendingQuiz, setPendingQuiz] = useState<PendingQuiz | null>(null);
  const [pendingSpellQuiz, setPendingSpellQuiz] =
    useState<PendingSpellQuiz | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isGameFullyLoaded, setIsGameFullyLoaded] = useState<boolean>(false);
  const [isStarfieldFadingOut, setIsStarfieldFadingOut] = useState<boolean>(false);
  
  // ⏰ Spell Cooldown System
  const [spellCooldowns, setSpellCooldowns] = useState<Record<string, number>>({});

  const battleArenaRef = useRef<BattleArenaRef>(null);

  // ⏰ Helper function to check if spell is on cooldown
  const isSpellOnCooldown = useCallback((spellId: string): boolean => {
    const currentTime = Date.now();
    const cooldownEndTime = spellCooldowns[spellId] || 0;
    return currentTime < cooldownEndTime;
  }, [spellCooldowns]);

  // ⏰ Helper function to get remaining cooldown time in seconds
  const getSpellCooldownRemaining = useCallback((spellId: string): number => {
    const currentTime = Date.now();
    const cooldownEndTime = spellCooldowns[spellId] || 0;
    return Math.max(0, Math.ceil((cooldownEndTime - currentTime) / 1000));
  }, [spellCooldowns]);

  const handleGameStateUpdate = useCallback((state: GameState) => {
    setGameState(state);
  }, []);

  // ⏰ Update cooldown timers every second for smooth UI updates
  useEffect(() => {
    if (!gameStarted || gameState.isGameOver) return;

    const interval = setInterval(() => {
      const currentTime = Date.now();
      const hasActiveCooldowns = Object.values(spellCooldowns).some(endTime => currentTime < endTime);
      
      if (hasActiveCooldowns) {
        // Force re-render by updating the state
        setSpellCooldowns(prev => ({ ...prev }));
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [gameStarted, gameState.isGameOver, spellCooldowns]);

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

      // ⏰ Check if spell is on cooldown
      const currentTime = Date.now();
      const cooldownEndTime = spellCooldowns[spellId] || 0;
      
      if (currentTime < cooldownEndTime) {
        console.log(`🔥 Spell ${spellConfig.name} is on cooldown for ${Math.ceil((cooldownEndTime - currentTime) / 1000)} more seconds`);
        return; // Spell is still on cooldown
      }

      // Cast spell through BattleArena component
      if (battleArenaRef.current) {
        battleArenaRef.current.castSpell(spellId);
        
        // Start cooldown timer
        const cooldownDuration = spellConfig.cooldownSeconds * 1000; // Convert to milliseconds
        setSpellCooldowns(prev => ({
          ...prev,
          [spellId]: currentTime + cooldownDuration
        }));
      }
    },
    [gameStarted, gameState.isGameOver, spellCooldowns]
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

  const restartGame = useCallback(() => {
    if (battleArenaRef.current) {
      battleArenaRef.current.resetGameState();
      setGameStarted(true);
      setShowTutorial(false);
      
      // ⏰ Reset spell cooldowns
      setSpellCooldowns({});
    }
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
      <div className="min-h-screen starfield-background flex items-center justify-center p-2 sm:p-4">
        <Card className="w-full max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl nes-container is-rounded is-dark mx-2">
          <CardHeader className="text-center text-white p-3 sm:p-4 md:p-6">
            <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold pt-2 sm:pt-4 pb-2 sm:pb-4 mb-1 sm:mb-2 game-title">
              🎮 Welcome to EduBattle! ⚔️
            </CardTitle>
          </CardHeader>

          <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-blue-600 game-ui-text">
                  🎯 How to Play
                </h3>
                <ul className="space-y-2 sm:space-y-3 md:space-y-4"> 
                  <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base game-ui-text">
                    <span className="text-green-500 text-sm sm:text-base">🧠</span>
                    Answer quiz questions while having fun!
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base game-ui-text">
                    <span className="text-green-500 text-sm sm:text-base">🔮</span>
                    Answer spell quiz questions to cast spells
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base game-ui-text">
                    <span className="text-yellow-500 text-sm sm:text-base">💪</span>
                    Correct answers = stronger units!
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base game-ui-text">
                    <span className="text-red-500 text-sm sm:text-base">⚡</span>
                    Destroy the enemy base to win!
                  </li>
                </ul>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-purple-600 game-ui-text">
                  🎲 Game Rules
                </h3>
                <ul className="space-y-2 sm:space-y-3 md:space-y-4">
                  <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base game-ui-text">
                    <span className="text-blue-500 text-sm sm:text-base">⏰</span>
                    Quizzes appear every 10 seconds - make your choice!
                  </li> 
                  <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base game-ui-text">
                    <span className="text-red-500 text-sm sm:text-base">🧑‍🤝‍🧑</span>
                    Wrong answers deploy weaker units
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base game-ui-text">
                    <span className="text-red-500 text-sm sm:text-base">🔥</span>
                    Canceling spells will backfire
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base game-ui-text">
                    <span className="text-red-500 text-sm sm:text-base">💥</span>
                    Sudden death mode will end the game immediately
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 md:mt-8 mb-4 sm:mb-6 md:mb-8 text-center">
              <Button
                onClick={startGame}
                size="lg"
                className="is-primary text-xs sm:text-sm md:text-base px-6 sm:px-12 md:px-16 lg:px-24 py-3 sm:py-4 md:py-6 lg:py-8 cursor-pointer mb-4 sm:mb-6 md:mb-8 game-button nes-btn"
              >
                Start Battle!
              </Button>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-4 sm:mt-6 md:mt-8 text-center game-ui-text">
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
          isSpellOnCooldown={isSpellOnCooldown}
          getSpellCooldownRemaining={getSpellCooldownRemaining}
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
