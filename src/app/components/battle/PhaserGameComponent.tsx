"use client";
import React, { useEffect, useRef } from "react";
import gameConfig from "./gameConfig";
import BattleScene from "./BattleScene";
import * as Phaser from "phaser";
import type { GameState } from "./BattleScene";

let game: Phaser.Game | null = null;
let battleScene: BattleScene | null = null;

export interface PhaserGameRef {
  deployUnit: (unitType: string, isCorrect: boolean) => void;
  castSpell: (spellId: string) => boolean;
  getGameState: () => GameState | null;
  resetQuizState: () => void;
  resetGameState: () => void; // Add reset game state method
}

interface PhaserGameComponentProps {
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

const PhaserGameComponent = React.forwardRef<
  PhaserGameRef,
  PhaserGameComponentProps
>(({ onGameStateUpdate, onRequestQuiz, onRequestSpellQuiz }, ref) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!game && typeof window !== "undefined" && gameContainerRef.current) {
      // Create battle scene instance
      battleScene = new BattleScene();
      battleScene.onGameStateUpdate = onGameStateUpdate;
      battleScene.onRequestQuiz = onRequestQuiz;
      battleScene.onRequestSpellQuiz = onRequestSpellQuiz;

      // Clone config, set scene
      const config = {
        ...gameConfig,
        scene: battleScene,
        parent: gameContainerRef.current,
      };
      game = new Phaser.Game(config);
    }

    return () => {
      if (game) {
        game.destroy(true);
        game = null;
        battleScene = null;
      }
    };
  }, [onGameStateUpdate, onRequestQuiz, onRequestSpellQuiz]);

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
      resetGameState: () => {
        if (battleScene) {
          battleScene.resetGameState();
        }
      },
    }),
    []
  );

  return (
    <div
      ref={gameContainerRef}
      className="w-full h-full bg-gray-900"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
});

PhaserGameComponent.displayName = "PhaserGameComponent";

export default PhaserGameComponent;
