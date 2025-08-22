"use client";
import * as Phaser from "phaser";
import React, { useEffect, useRef, useState } from "react";
import type { GameState } from "./BattleScene";
import BattleScene from "./BattleScene";
import gameConfig from "./gameConfig";

let game: Phaser.Game | null = null;
let battleScene: BattleScene | null = null;

export interface PhaserGameRef {
  deployUnit: (unitType: string, isCorrect: boolean) => void;
  castSpell: (spellId: string) => boolean;
  getGameState: () => GameState | null;
  resetQuizState: () => void;
}

interface PhaserGameComponentProps {
  onGameStateUpdate: (state: GameState) => void;
  onRequestQuiz: (
    unitType: string,
    callback: (correct: boolean) => void
  ) => void;
  onGameReady?: () => void;
}

const PhaserGameComponent = React.forwardRef<
  PhaserGameRef,
  PhaserGameComponentProps
>(({ onGameStateUpdate, onRequestQuiz, onGameReady }, ref) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isSceneReady, setIsSceneReady] = useState(false);

  useEffect(() => {
    if (!game && typeof window !== "undefined" && gameContainerRef.current) {
      console.log("🎮 Creating Phaser game...", gameContainerRef.current);
      
      // Create battle scene instance
      battleScene = new BattleScene();
      battleScene.onGameStateUpdate = onGameStateUpdate;
      battleScene.onRequestQuiz = onRequestQuiz;
      
      // Set up scene ready callback
      battleScene.onSceneReady = () => {
        console.log("🎯 Scene ready callback fired!");
        setTimeout(() => {
          setIsSceneReady(true);
          if (onGameReady) {
            onGameReady();
          }
        }, 100);
      };

      // Clone config, set scene
      const config = {
        ...gameConfig,
        scene: battleScene,
        parent: gameContainerRef.current,
      };
      game = new Phaser.Game(config);
      console.log("✅ Phaser game created:", game);
    }

    return () => {
      if (game) {
        game.destroy(true);
        game = null;
        battleScene = null;
      }
      setIsSceneReady(false);
    };
  }, [onGameStateUpdate, onRequestQuiz, onGameReady]);

  // Expose methods to parent component
  React.useImperativeHandle(
    ref,
    () => ({
      deployUnit: (unitType: string, isCorrect: boolean) => {
        if (battleScene) {
          battleScene.deployUnit(unitType, isCorrect);
        }
      },
      castSpell: (spellId: string) => {
        if (battleScene) {
          return battleScene.castSpell(spellId);
        }
        return false;
      },
      getGameState: () => {
        return battleScene ? battleScene.getGameState() : null;
      },
      resetQuizState: () => {
        if (battleScene) {
          battleScene.resetQuizState();
        }
      },
    }),
    []
  );

  return (
    <div className="relative w-full h-full">
      {/* Loading overlay that hides until scene is ready */}
      {!isSceneReady && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10">
          <div className="text-white text-lg">Loading Battle Arena...</div>
        </div>
      )}
      
      {/* Phaser game container */}
      <div 
        ref={gameContainerRef}
        className={`w-full h-full transition-opacity duration-300 ${
          isSceneReady ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
});

PhaserGameComponent.displayName = "PhaserGameComponent";

export default PhaserGameComponent;
