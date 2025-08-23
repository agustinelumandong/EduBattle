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
  resetGameState: () => void;
}

interface PhaserGameComponentProps {
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

const PhaserGameComponent = React.forwardRef<
  PhaserGameRef,
  PhaserGameComponentProps
>(
  (
    { onGameStateUpdate, onRequestQuiz, onGameReady, onRequestSpellQuiz },
    ref
  ) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const [isSceneReady, setIsSceneReady] = useState(false);

    useEffect(() => {
      if (!game && typeof window !== "undefined" && gameContainerRef.current) {
        battleScene = new BattleScene();
        battleScene.onGameStateUpdate = onGameStateUpdate;
        battleScene.onRequestQuiz = onRequestQuiz;
        battleScene.onRequestSpellQuiz = onRequestSpellQuiz;

        battleScene.onSceneReady = () => {
          setTimeout(() => {
            setIsSceneReady(true);
            if (onGameReady) {
              onGameReady();
            }
          }, 100);
        };

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
        setIsSceneReady(false);
      };
    }, [onGameStateUpdate, onRequestQuiz, onRequestSpellQuiz, onGameReady]);

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
      <div className="relative w-full h-full">
        {!isSceneReady && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10">
            <div className="text-white text-lg">Loading Battle Arena...</div>
          </div>
        )}

        <div
          ref={gameContainerRef}
          className={`w-full h-full transition-opacity duration-300 ${
            isSceneReady ? "opacity-100" : "opacity-0"
          }`}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  }
);

PhaserGameComponent.displayName = "PhaserGameComponent";

export default PhaserGameComponent;
