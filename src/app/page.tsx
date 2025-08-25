"use client";

import EmailLoginForm from "@/components/ui/EmailLoginForm";
import LeaderboardView from "@/components/ui/LeaderboardView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, type User } from "@/lib/auth";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
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
    isSuddenDeath: false,
  });

  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [pendingQuiz, setPendingQuiz] = useState<PendingQuiz | null>(null);
  const [pendingSpellQuiz, setPendingSpellQuiz] =
    useState<PendingSpellQuiz | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isGameFullyLoaded, setIsGameFullyLoaded] = useState<boolean>(false);
  const [isStarfieldFadingOut, setIsStarfieldFadingOut] =
    useState<boolean>(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showGameResult, setShowGameResult] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<{
    won: boolean;
    message: string;
  } | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");

  const [spellCooldowns, setSpellCooldowns] = useState<Record<string, number>>(
    {}
  );

  // Spell disable state for game start
  const [areSpellsDisabled, setAreSpellsDisabled] = useState<boolean>(false);
  const [spellDisableTimeRemaining, setSpellDisableTimeRemaining] =
    useState<number>(0);

  const battleArenaRef = useRef<BattleArenaRef>(null);

  // Check auth status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (auth.isAuthenticated()) {
        setCurrentUser(auth.getCurrentUser());
      } else {
        // Try to restore session for email users
        const result = await auth.restoreSession();
        if (result.success && result.user) {
          setCurrentUser(result.user);
        }
      }
    };
    checkAuth();
  }, []);

  // Handle spell disable countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (areSpellsDisabled && spellDisableTimeRemaining > 0) {
      interval = setInterval(() => {
        setSpellDisableTimeRemaining((prev) => {
          if (prev <= 1) {
            setAreSpellsDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [areSpellsDisabled, spellDisableTimeRemaining]);

  const isSpellOnCooldown = useCallback(
    (spellId: string): boolean => {
      const currentTime = Date.now();
      const cooldownEndTime = spellCooldowns[spellId] || 0;
      return currentTime < cooldownEndTime;
    },
    [spellCooldowns]
  );

  const getSpellCooldownRemaining = useCallback(
    (spellId: string): number => {
      const currentTime = Date.now();
      const cooldownEndTime = spellCooldowns[spellId] || 0;
      return Math.max(0, Math.ceil((cooldownEndTime - currentTime) / 1000));
    },
    [spellCooldowns]
  );

  const handleGameStateUpdate = useCallback(
    (state: GameState) => {
      setGameState(state);

      // Check if game is over and record win/loss
      if (state.isGameOver && currentUser) {
        // Check actual game result
        let playerWon = false;
        let playerLost = false;

        // Now that we fixed the HP update in sudden death mode, we can use simple HP checks
        playerWon = state.enemyBaseHp <= 0;
        playerLost = state.playerBaseHp <= 0;

        if (state.isSuddenDeath) {
          console.log(
            "🎯 Sudden Death Mode - Base HP should now be 0 for loser"
          );
        }

        // Log the actual game state for debugging
        console.log("🎮 Game State Details:", {
          playerBaseHp: state.playerBaseHp,
          enemyBaseHp: state.enemyBaseHp,
          isGameOver: state.isGameOver,
          isSuddenDeath: state.isSuddenDeath,
          playerWon,
          playerLost,
        });

        // If neither condition is met, something is wrong with the game logic
        if (!playerWon && !playerLost) {
          console.warn("⚠️ Game ended but no clear winner/loser:", {
            playerBaseHp: state.playerBaseHp,
            enemyBaseHp: state.enemyBaseHp,
            isGameOver: state.isGameOver,
            isSuddenDeath: state.isSuddenDeath,
          });
        }

        console.log("🎮 Game Over! Recording result:", {
          userId: currentUser.id,
          username: currentUser.username,
          won: playerWon,
          playerBaseHp: state.playerBaseHp,
          enemyBaseHp: state.enemyBaseHp,
          isGameOver: state.isGameOver,
        });

        // Record game result via API
        fetch("/api/game/record", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUser.id,
            won: playerWon,
            score: playerWon ? 100 : 0,
            gameData: {
              playerBaseHp: state.playerBaseHp,
              enemyBaseHp: state.enemyBaseHp,
              matchTimeLeft: state.matchTimeLeft,
            },
          }),
        })
          .then((response) => response.json())
          .then((result) => {
            if (result.success) {
              console.log("✅ Game result recorded successfully!");
            } else {
              console.error("❌ Failed to record game:", result.error);
            }
          })
          .catch((error) => {
            console.error("❌ Failed to record game result:", error);
          });

        if (playerWon) {
          setGameResult({
            won: true,
            message: "🎉 Victory! You destroyed the enemy base!",
          });
        } else {
          setGameResult({
            won: false,
            message: "💀 Defeat! Your base was destroyed!",
          });
        }
        setShowGameResult(true);
      }
    },
    [currentUser]
  );

  useEffect(() => {
    if (!gameStarted || gameState.isGameOver) return;

    const interval = setInterval(() => {
      const currentTime = Date.now();
      const hasActiveCooldowns = Object.values(spellCooldowns).some(
        (endTime) => currentTime < endTime
      );

      if (hasActiveCooldowns) {
        setSpellCooldowns((prev) => ({ ...prev }));
      }
    }, 1000);

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
      if (pendingSpellQuiz) {
        pendingSpellQuiz.callback(correct);
        setPendingSpellQuiz(null);
        setIsQuizOpen(false);
        return;
      } else if (pendingQuiz) {
        pendingQuiz.callback(correct);
        setPendingQuiz(null);
        setIsQuizOpen(false);
      }

      if (battleArenaRef.current) {
        battleArenaRef.current.resetQuizState();
      }

      setTimeout(() => {
        setPendingQuiz(null);
        setPendingSpellQuiz(null);
      }, 100);
    },
    [pendingQuiz, pendingSpellQuiz]
  );

  const handleQuizClose = useCallback(() => {
    if (pendingSpellQuiz) {
      pendingSpellQuiz.callback(false);
      setPendingSpellQuiz(null);
    } else if (pendingQuiz) {
      pendingQuiz.callback(false);
      setPendingQuiz(null);
    }
    setIsQuizOpen(false);

    if (battleArenaRef.current) {
      battleArenaRef.current.resetQuizState();
    }

    setTimeout(() => {
      setPendingQuiz(null);
      setPendingSpellQuiz(null);
    }, 100);
  }, [pendingQuiz, pendingSpellQuiz]);

  const handleUnitClick = useCallback((unitType: string) => {
    return;
  }, []);

  const handleSpellClick = useCallback(
    (spellId: string) => {
      if (!gameStarted || gameState.isGameOver) return;

      // Check if spells are disabled at game start
      if (areSpellsDisabled) return;

      const spellConfig = GAME_CONFIG.spells.find((s) => s.id === spellId);
      if (!spellConfig) return;

      const currentTime = Date.now();
      const cooldownEndTime = spellCooldowns[spellId] || 0;

      if (currentTime < cooldownEndTime) {
        return;
      }

      if (battleArenaRef.current) {
        battleArenaRef.current.castSpell(spellId);

        const cooldownDuration = spellConfig.cooldownSeconds * 1000;
        setSpellCooldowns((prev) => ({
          ...prev,
          [spellId]: currentTime + cooldownDuration,
        }));
      }
    },
    [gameStarted, gameState.isGameOver, spellCooldowns, areSpellsDisabled]
  );

  const startGame = useCallback(() => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setShowTutorial(false);
    setGameStarted(true);

    // Disable spells for 10 seconds at game start
    setAreSpellsDisabled(true);
    setSpellDisableTimeRemaining(25);
  }, [currentUser]);

  // Handle game completion and record win
  const handleGameComplete = useCallback(
    (playerWon: boolean) => {
      // Game completion is now handled in handleGameStateUpdate
    },
    [currentUser]
  );

  // Auth handlers
  const handleLoginWithWallet = async () => {
    setAuthLoading(true);
    setAuthError("");

    try {
      console.log("🔐 Frontend: Starting wallet login...");
      const result = await auth.loginWithWallet();

      console.log("📊 Frontend: Wallet login result:", result);

      if (result.success && result.user) {
        console.log(
          "✅ Frontend: Wallet login successful, setting user:",
          result.user
        );
        setCurrentUser(result.user);
        setShowLoginModal(false);
        // ✅ Show welcome page instead of immediately starting game
        setShowTutorial(true);
        setGameStarted(false);
      } else {
        console.error("❌ Frontend: Wallet login failed:", result.error);
        setAuthError(result.error || "Wallet login failed");
      }
    } catch (error) {
      console.error("❌ Frontend: Wallet login error:", error);
      setAuthError("Wallet authentication error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLoginWithEmail = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError("");

    try {
      const result = await auth.loginWithEmail({ email, password });
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setShowLoginModal(false);
        // ✅ Show welcome page instead of immediately starting game
        setShowTutorial(true);
        setGameStarted(false);
      } else {
        setAuthError(result.error || "Email login failed");
      }
    } catch (error) {
      setAuthError("Email authentication error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterWithEmail = async (
    email: string,
    password: string,
    username: string
  ) => {
    setAuthLoading(true);
    setAuthError("");

    try {
      const result = await auth.registerWithEmail({
        email,
        password,
        username,
      });
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setShowLoginModal(false);
        // ✅ Show welcome page instead of immediately starting game
        setShowTutorial(true);
        setGameStarted(false);
      } else {
        setAuthError(result.error || "Registration failed");
      }
    } catch (error) {
      setAuthError("Registration error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
    setGameStarted(false);
    setShowTutorial(true);
    // Reset spell disable state on logout
    setAreSpellsDisabled(false);
    setSpellDisableTimeRemaining(0);
  };

  const handleGameReady = useCallback(() => {
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
      setShowGameResult(false);
      setGameResult(null);

      setSpellCooldowns({});
    }
  }, []);

  if (showTutorial) {
    return (
      <div className="min-h-screen starfield-background flex items-center flex-col justify-center p-2 sm:p-4">
        {/* Top Right Buttons */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
          {currentUser && (
            <div className="flex items-center gap-3">
              <span className="text-white text-sm">
                Welcome, {currentUser.username}!
              </span>

              <button
                onClick={() => {
                  const dialog = document.getElementById(
                    "logout-dialog"
                  ) as HTMLDialogElement;
                  if (dialog) dialog.showModal();
                }}
                type="button"
                className="nes-btn text-xs sm:text-sm md:text-base px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 lg:py-5 game-button nes-btn cursor-pointer"
              >
                Logout
              </button>

              {/* NES.css Logout Confirmation Dialog */}
              <dialog className="nes-dialog" id="logout-dialog">
                <form method="dialog">
                  <p className="title">⚠️ Confirm Logout ⚠️</p>
                  <p>Are you sure you want to exit EduBattle?</p>
                  <p>Your progress will be saved!</p>
                  <menu className="dialog-menu">
                    <button className="nes-btn">Continue Playing</button>
                    <button
                      className="nes-btn is-error"
                      onClick={(e) => {
                        e.preventDefault();
                        const dialog = document.getElementById(
                          "logout-dialog"
                        ) as HTMLDialogElement;
                        if (dialog) dialog.close();
                        handleLogout();
                      }}
                    >
                      Exit Game
                    </button>
                  </menu>
                </form>
              </dialog>
            </div>
          )}
        </div>

        <div className="w-full max-w-sm sm:max-w-md md:max-w-3xl lg:max-w-4xl nes-container is-rounded is-dark mx-2">
          <div className="text-center text-white p-3 sm:p-2 md:p-6">
            <div className="text-xl sm:text-lg md:text-3xl lg:text-4xl font-bold pt-2 sm:pt-4 pb-2 sm:pb-4 mb-1 sm:mb-2 game-title">
              🎮 Welcome to EduBattle! ⚔️
            </div>

            {/* Username display and edit for logged-in users */}
            {currentUser && (
              <div className="mb-4">
                <div className="text-lg text-blue-400 mb-2">
                  Playing as:{" "}
                  <span className="text-yellow-400">
                    {currentUser.username}
                  </span>
                </div>
                {currentUser.authMethod === "wallet" && (
                  <div className="text-sm text-gray-400 mb-2">
                    Wallet: {currentUser.address?.slice(0, 8)}...
                    {currentUser.address?.slice(-6)}
                  </div>
                )}
                {/* 🆕 DEBUG INFO: Show current user state */}
                <div className="text-xs text-gray-500 mb-2">
                  Debug: ID={currentUser.id}, Auth={currentUser.authMethod},
                  Username="{currentUser.username}", Address=
                  {currentUser.address?.slice(0, 10)}...
                </div>
              </div>
            )}
          </div>

          <div className="p-2 sm:p-1 md:p-2 lg:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-1 md:gap-8">
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-blue-600 game-ui-text">
                  🎯 How to Play
                </h3>
                <ul className="space-y-2 sm:space-y-3 md:space-y-4">
                  <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base game-ui-text">
                    <span className="text-green-500 text-sm sm:text-base">
                      🧠
                    </span>
                    Answer quiz questions while having fun!
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base game-ui-text">
                    <span className="text-green-500 text-sm sm:text-base">
                      🔮
                    </span>
                    Answer spell quiz questions to cast spells
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base game-ui-text">
                    <span className="text-yellow-500 text-sm sm:text-base">
                      💪
                    </span>
                    Correct answers = stronger units!
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base game-ui-text">
                    <span className="text-red-500 text-sm sm:text-base">
                      ⚡
                    </span>
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
                    <span className="text-blue-500 text-sm sm:text-base">
                      ⏰
                    </span>
                    Quizzes appear every 10 seconds - make your choice!
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base game-ui-text">
                    <span className="text-red-500 text-sm sm:text-base">
                      🧑‍🤝‍🧑
                    </span>
                    Wrong answers deploy weaker units
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base game-ui-text">
                    <span className="text-red-500 text-sm sm:text-base">
                      🔥
                    </span>
                    Canceling spells will backfire
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base game-ui-text">
                    <span className="text-red-500 text-sm sm:text-base">
                      💥
                    </span>
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
                {currentUser ? "Start Battle!" : "Login to Play!"}
              </Button>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-4 sm:mt-6 md:mt-8 text-center game-ui-text">
              Get ready for educational warfare! 🎓⚔️
            </p>
          </div>
        </div>

        {currentUser && (
          <button
            onClick={() => setShowLeaderboard(true)}
            type="button"
            className="nes-btn absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 text-xs sm:text-sm md:text-base px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 lg:py-5 game-button nes-btn cursor-pointer"
          >
            🏆 Leaderboard
          </button>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 login-modal">
            <Card className="w-full max-w-md nes-container is-rounded is-dark">
              <CardHeader className="text-center text-white">
                <CardTitle className="text-xl">Login to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {authError && (
                  <div className="text-red-400 text-sm text-center">
                    {authError}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleLoginWithWallet}
                    disabled={authLoading}
                    type="button"
                    className="w-full nes-btn text-xs sm:text-sm md:text-base px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 lg:py-5 game-button nes-btn cursor-pointer"
                  >
                    {authLoading ? "Connecting..." : "🔗 Connect Wallet"}
                  </button>

                  <div className="text-center text-white text-sm">or</div>

                  <EmailLoginForm
                    onLogin={handleLoginWithEmail}
                    onRegister={handleRegisterWithEmail}
                    loading={authLoading}
                  />
                </div>

                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setAuthError("");
                  }}
                  type="button"
                  className="w-full nes-btn text-xs sm:text-sm md:text-base px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 lg:py-5 game-button nes-btn cursor-pointer"
                >
                  Cancel
                </button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 leaderboard-modal">
            <Card className="w-full max-w-2xl nes-container is-rounded is-dark">
              <CardHeader className="text-center text-white">
                <CardTitle className="text-xl">🏆 Leaderboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <LeaderboardView />
                <button
                  onClick={() => setShowLeaderboard(false)}
                  type="button"
                  className="w-full nes-btn text-xs sm:text-sm md:text-base px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 lg:py-5 game-button nes-btn cursor-pointer"
                >
                  Close
                </button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Result Modal */}
        {showGameResult && gameResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md nes-container is-rounded is-dark">
              <CardHeader className="text-center text-white">
                <CardTitle
                  className={`text-xl ${
                    gameResult.won ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {gameResult.won ? "🎉 Victory!" : "💀 Defeat!"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-white">{gameResult.message}</p>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowGameResult(false);
                      setShowLeaderboard(true);
                    }}
                    className="flex-1 is-primary"
                  >
                    🏆 View Leaderboard
                  </Button>
                  <Button
                    onClick={() => {
                      setShowGameResult(false);
                      restartGame();
                    }}
                    variant="outline"
                    className="flex-1 text-white border-white hover:bg-white hover:text-black"
                  >
                    🔄 Play Again
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    setShowGameResult(false);
                    setShowTutorial(true);
                  }}
                  variant="outline"
                  className="w-full text-white border-white hover:bg-white hover:text-black"
                >
                  🏠 Back to Menu
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {!isGameFullyLoaded && (
        <div
          className={`absolute inset-0 starfield-background flex items-center justify-center z-50 ${
            isStarfieldFadingOut ? "fade-out" : ""
          }`}
        >
          <div
            className={`text-white text-lg game-ui-text transition-opacity duration-500 ${
              isStarfieldFadingOut ? "opacity-0" : "opacity-100"
            }`}
          >
            Loading Battle Arena...
          </div>
        </div>
      )}

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

      {isGameFullyLoaded && (
        <GameHUD
          gameState={gameState}
          onSpellClick={handleSpellClick}
          isSpellOnCooldown={isSpellOnCooldown}
          getSpellCooldownRemaining={getSpellCooldownRemaining}
          areSpellsDisabled={areSpellsDisabled}
          spellDisableTimeRemaining={spellDisableTimeRemaining}
        />
      )}

      <QuizModal
        isOpen={isQuizOpen}
        unitType={pendingQuiz?.unitType || ""}
        spellId={pendingSpellQuiz?.spellId || ""}
        onAnswer={handleQuizAnswer}
        onClose={handleQuizClose}
      />
    </div>
  );
}
