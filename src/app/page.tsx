'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCallback, useRef, useState, type ReactElement } from 'react';
import BattleArena from './components/battle/BattleArena';
import type { GameState } from './components/battle/BattleScene';
import QuizModal from './components/quiz/QuizModal';
import GameHUD from './components/ui/GameHUD';
import { GAME_CONFIG } from './data/game-config';

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
  
  const battleArenaRef = useRef<any>(null);

  const handleGameStateUpdate = useCallback((state: GameState) => {
    setGameState(state);
  }, []);

  const handleRequestQuiz = useCallback((unitType: string, callback: (correct: boolean) => void) => {
    setPendingQuiz({ unitType, callback });
    setIsQuizOpen(true);
  }, []);

  const handleQuizAnswer = useCallback((correct: boolean) => {
    if (pendingQuiz) {
      pendingQuiz.callback(correct);
      setPendingQuiz(null);
    }
    setIsQuizOpen(false);
  }, [pendingQuiz]);

  const handleQuizClose = useCallback(() => {
    if (pendingQuiz) {
      pendingQuiz.callback(false); // Default to incorrect if closed
      setPendingQuiz(null);
    }
    setIsQuizOpen(false);
  }, [pendingQuiz]);

  const handleUnitClick = useCallback((unitType: string) => {
    if (!gameStarted || gameState.isGameOver) return;
    
    // Check if player has enough gold
    const unitConfig = GAME_CONFIG.units.find(u => u.id === unitType);
    if (!unitConfig || gameState.playerGold < unitConfig.cost) return;
    
    // Trigger quiz modal
    handleRequestQuiz(unitType, (correct: boolean) => {
      if (battleArenaRef.current) {
        battleArenaRef.current.deployUnit(unitType, correct);
      }
    });
  }, [gameStarted, gameState.isGameOver, gameState.playerGold, handleRequestQuiz]);

  const handleSpellClick = useCallback((spellId: string) => {
    if (!gameStarted || gameState.isGameOver) return;
    
    const spellConfig = GAME_CONFIG.spells.find(s => s.id === spellId);
    if (!spellConfig || gameState.playerGold < spellConfig.cost) return;
    
    // TODO: Implement spell effects
    console.log(`Cast spell: ${spellId}`);
  }, [gameStarted, gameState.isGameOver, gameState.playerGold]);

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
            <CardTitle className="text-4xl font-bold mb-2">
              🎮 Welcome to EduBattle! ⚔️
            </CardTitle>
            <p className="text-xl">Educational Lane Battle Game</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-blue-600">🎯 How to Play</h3>
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
                <h3 className="text-2xl font-semibold text-purple-600">🎲 Game Rules</h3>
                <ul className="space-y-2 text-lg">
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-500">💰</span>
                    Start with 300 gold, earn 5 gold/second
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">⏰</span>
                    4-minute battles with sudden death
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
                <p className="text-sm">Strong melee warrior<br />💰200 gold</p>
              </div>
              <div className="p-4 bg-green-100 rounded-lg">
                <div className="text-3xl mb-2">🧪</div>
                <h4 className="font-semibold text-green-600">Science Mage</h4>
                <p className="text-sm">Ranged spell caster<br />💰220 gold</p>
              </div>
              <div className="p-4 bg-amber-100 rounded-lg">
                <div className="text-3xl mb-2">📜</div>
                <h4 className="font-semibold text-amber-600">History Archer</h4>
                <p className="text-sm">Long-range archer<br />💰180 gold</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 relative overflow-hidden">
      {/* Battle Arena */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <BattleArena
            ref={battleArenaRef}
            gameState={gameState}
            onGameStateUpdate={handleGameStateUpdate}
            onRequestQuiz={handleRequestQuiz}
          />
        </div>
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
        unitType={pendingQuiz?.unitType || ''}
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
        <Card className="bg-black bg-opacity-50 text-white text-center">
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