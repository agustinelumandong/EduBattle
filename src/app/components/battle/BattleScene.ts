import * as Phaser from "phaser";
import { GAME_CONFIG } from "../../data/game-config";
import { soundManager } from "./helpers/soundManager";
import { UnitHelpers, type BattleUnit } from "./helpers/unitHelpers";

export interface GameState {
  playerGold: number;
  playerBaseHp: number;
  enemyBaseHp: number;
  matchTimeLeft: number;
  isGameOver: boolean;
  winner?: "player" | "enemy";
}

export default class BattleScene extends Phaser.Scene {
  private units: BattleUnit[] = [];
  private gameState: GameState = {
    playerGold: GAME_CONFIG.economy.startGold,
    playerBaseHp: GAME_CONFIG.battle.baseMaxHealth,
    enemyBaseHp: GAME_CONFIG.battle.baseMaxHealth,
    matchTimeLeft: GAME_CONFIG.battle.matchDurationMinutes * 60,
    isGameOver: false,
  };

  private playerBase?: Phaser.GameObjects.Graphics;
  private enemyBase?: Phaser.GameObjects.Graphics;
  private goldTimer?: Phaser.Time.TimerEvent;
  private matchTimer?: Phaser.Time.TimerEvent;
  private quizTimer?: Phaser.Time.TimerEvent; // Timer for global quiz interval
  private lastTime: number = 0;

  // Callbacks for React components
  public onGameStateUpdate?: (state: GameState) => void;
  public onRequestQuiz?: (
    unitType: string,
    callback: (correct: boolean) => void
  ) => void;

  constructor() {
    super("BattleScene");
  }

  private setupCamera(): void {
    // Set camera bounds to cover the entire world (3200 x 400)
    this.cameras.main.setBounds(0, 0, 3200, 400);

    // Start camera centered on player base area
    this.cameras.main.setZoom(1);
    this.cameras.main.centerOn(400, 200); // Start view on left side near player base

    // Enable camera controls with mouse/touch
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        // Pan camera when dragging
        this.cameras.main.scrollX -=
          (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
        this.cameras.main.scrollY -=
          (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
      }
    });

    // Add keyboard controls for camera movement
    this.input.keyboard?.on("keydown-A", () => {
      this.cameras.main.scrollX -= 50;
    });

    this.input.keyboard?.on("keydown-D", () => {
      this.cameras.main.scrollX += 50;
    });

    this.input.keyboard?.on("keydown-SPACE", () => {
      // Center camera on action (middle of battlefield)
      this.cameras.main.centerOn(1600, 200);
    });
  }

  create() {
    // Initialize sound
    soundManager.init();

    // Set up camera for expanded world
    this.setupCamera();

    // Create battlefield background
    this.createBattlefield();

    // Create bases
    this.createBases();

    // Start gold income timer
    this.startGoldIncome();

    // Start match timer
    this.startMatchTimer();

    // Start global quiz timer
    this.startQuizTimer();

    // Add input handling
    this.setupInput();

    // Start game loop
    this.startGameLoop();
  }

  private createBattlefield(): void {
    // Space background - black with stars
    this.add.rectangle(1600, 200, 3200, 400, 0x000000);

    // Create random stars across the battlefield
    this.createStars();

    // Lane lines - make them more space-like (dim blue/cyan)
    this.add.line(1600, 150, 0, 0, 3200, 0, 0x1e40af, 1);
    this.add.line(1600, 250, 0, 0, 3200, 0, 0x1e40af, 1);

    // Center line - dim and space-like
    this.add.line(1600, 200, 0, 0, 0, 400, 0x374151, 1);
  }

  private createStars(): void {
    // Create random stars of varying sizes across the expanded battlefield
    const starCount = 300; // Number of stars to generate

    for (let i = 0; i < starCount; i++) {
      // Random position across the entire 3200x400 battlefield
      const x = Math.random() * 3200;
      const y = Math.random() * 400;

      // Random star size (1-4 pixels)
      const size = Math.random() * 3 + 1;

      // Random star brightness/opacity
      const brightness = Math.random() * 0.7 + 0.3; // 0.3 to 1.0

      // Create star as a small circle
      const star = this.add.circle(x, y, size, 0xffffff, brightness);

      // Add subtle twinkling animation to some stars
      if (Math.random() < 0.3) {
        // 30% of stars twinkle
        this.tweens.add({
          targets: star,
          alpha: 0.2,
          duration: Math.random() * 2000 + 1000, // 1-3 seconds
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    }
  }

  private createBases(): void {
    // Player base (left) - positioned at far left of expanded world
    this.playerBase = this.add.graphics();
    this.drawBase(this.playerBase, 100, 200, "player");

    // Enemy base (right) - positioned at far right of expanded world
    this.enemyBase = this.add.graphics();
    this.drawBase(this.enemyBase, 3100, 200, "enemy");
  }

  private drawBase(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    team: "player" | "enemy"
  ): void {
    graphics.setPosition(x, y);
    graphics.clear();

    const hpPercent =
      team === "player"
        ? this.gameState.playerBaseHp / GAME_CONFIG.battle.baseMaxHealth
        : this.gameState.enemyBaseHp / GAME_CONFIG.battle.baseMaxHealth;

    // Draw retro pixel-style planet
    this.drawRetroPlanet(graphics, hpPercent, team);

    // Add spinning animation
    this.tweens.add({
      targets: graphics,
      rotation: Math.PI * 2,
      duration: 8000, // 8 seconds for full rotation
      repeat: -1,
      ease: "Linear",
    });
  }

  private drawRetroPlanet(
    graphics: Phaser.GameObjects.Graphics,
    hpPercent: number,
    team: "player" | "enemy"
  ): void {
    const radius = 30;

    // Determine planet colors based on team and health
    let baseColor, continentColor, atmosphereColor;

    if (team === "player") {
      // Earth-like colors that get damaged
      baseColor =
        hpPercent > 0.5 ? 0x1e40af : hpPercent > 0.25 ? 0x1e3a8a : 0x7f1d1d;
      continentColor =
        hpPercent > 0.5 ? 0x16a34a : hpPercent > 0.25 ? 0x15803d : 0x991b1b;
      atmosphereColor =
        hpPercent > 0.5 ? 0x3b82f6 : hpPercent > 0.25 ? 0x2563eb : 0xdc2626;
    } else {
      // Mars-like enemy planet
      baseColor =
        hpPercent > 0.5 ? 0xdc2626 : hpPercent > 0.25 ? 0xb91c1c : 0x450a0a;
      continentColor =
        hpPercent > 0.5 ? 0x7f1d1d : hpPercent > 0.25 ? 0x6b1d1d : 0x3f0a0a;
      atmosphereColor =
        hpPercent > 0.5 ? 0xff6b6b : hpPercent > 0.25 ? 0xff5252 : 0xff1744;
    }

    // Draw outer atmosphere glow
    graphics.fillStyle(atmosphereColor, 0.2);
    graphics.fillCircle(0, 0, radius + 8);

    // Draw main planet body
    graphics.fillStyle(baseColor, 1);
    graphics.fillCircle(0, 0, radius);

    // Draw retro pixel-style continents/land masses
    this.drawRetroLandmasses(graphics, continentColor, radius);

    // Add some retro-style details
    this.drawRetroDetails(graphics, radius, hpPercent, team);

    // Planet outline
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokeCircle(0, 0, radius);
  }

  private drawRetroLandmasses(
    graphics: Phaser.GameObjects.Graphics,
    continentColor: number,
    radius: number
  ): void {
    graphics.fillStyle(continentColor, 0.9);

    // Draw chunky, pixel-art style landmasses
    // Continent 1 (top-left area)
    graphics.fillRect(-20, -15, 12, 8);
    graphics.fillRect(-15, -10, 8, 6);

    // Continent 2 (right side)
    graphics.fillRect(5, -8, 10, 12);
    graphics.fillRect(12, 0, 6, 8);

    // Continent 3 (bottom)
    graphics.fillRect(-8, 10, 14, 6);
    graphics.fillRect(-5, 16, 8, 4);

    // Small islands
    graphics.fillRect(-25, 5, 4, 3);
    graphics.fillRect(18, -20, 3, 4);
  }

  private drawRetroDetails(
    graphics: Phaser.GameObjects.Graphics,
    radius: number,
    hpPercent: number,
    team: "player" | "enemy"
  ): void {
    // Add some retro-style details based on health
    if (hpPercent < 0.5) {
      // Damage effects - red pixels scattered around
      graphics.fillStyle(0xff0000, 0.8);
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const x = Math.cos(angle) * (radius * 0.7);
        const y = Math.sin(angle) * (radius * 0.7);
        graphics.fillRect(x - 1, y - 1, 2, 2);
      }
    }

    if (hpPercent < 0.25) {
      // Critical damage - more intense effects
      graphics.fillStyle(0xffff00, 0.6);
      graphics.fillRect(-2, -2, 4, 4); // Center explosion effect
    }

    // Add some retro "city lights" or surface details
    if (team === "player" && hpPercent > 0.5) {
      graphics.fillStyle(0xffff00, 0.7);
      // Small yellow dots for cities
      graphics.fillRect(-10, -5, 1, 1);
      graphics.fillRect(8, 3, 1, 1);
      graphics.fillRect(-3, 12, 1, 1);
      graphics.fillRect(15, -10, 1, 1);
    }
  }

  private startGoldIncome(): void {
    this.goldTimer = this.time.addEvent({
      delay: 1000, // Every second
      callback: () => {
        this.gameState.playerGold += GAME_CONFIG.economy.goldPerSecond;
        this.updateGameState();
      },
      loop: true,
    });
  }

  private startMatchTimer(): void {
    this.matchTimer = this.time.addEvent({
      delay: 1000, // Every second
      callback: () => {
        this.gameState.matchTimeLeft = Math.max(
          0,
          this.gameState.matchTimeLeft - 1
        );

        if (this.gameState.matchTimeLeft <= 0) {
          this.endGame("time");
        }

        this.updateGameState();
      },
      loop: true,
    });
  }

  private startQuizTimer(): void {
    // Timer for global quiz interval - every 30 seconds
    this.quizTimer = this.time.addEvent({
      delay: GAME_CONFIG.quiz.globalQuizIntervalSeconds * 1000,
      callback: () => {
        if (this.gameState.isGameOver) return;

        // Randomly select a unit type to ask about
        const randomUnit =
          GAME_CONFIG.units[
            Math.floor(Math.random() * GAME_CONFIG.units.length)
          ];

        if (this.onRequestQuiz) {
          this.onRequestQuiz(randomUnit.id, (correct: boolean) => {
            // Only deploy unit if answer is correct - player must make a choice
            if (correct) {
              this.deployUnit(randomUnit.id, true);
            }
          });
        }
      },
      loop: true,
    });
  }

  private setupInput(): void {
    // Click to deploy units (will be handled by React UI)
    this.input.on("pointerdown", () => {
      // This will be handled by the UI overlay
    });
  }

  private startGameLoop(): void {
    this.time.addEvent({
      delay: 16, // ~60 FPS
      callback: () => this.updateGame(),
      loop: true,
    });
  }

  private updateGame(): void {
    if (this.gameState.isGameOver) return;

    const currentTime = this.time.now;
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update units
    this.updateUnits(deltaTime);

    // Check win conditions
    this.checkWinConditions();
  }

  private updateUnits(deltaTime: number): void {
    // Remove dead units
    this.units = this.units.filter((unit) => {
      if (UnitHelpers.isUnitDead(unit)) {
        UnitHelpers.destroyUnit(unit);
        soundManager.playUnitDestroyed();
        return false;
      }
      return true;
    });

    // Update each unit
    for (const unit of this.units) {
      // Find target
      if (!unit.target || UnitHelpers.isUnitDead(unit.target)) {
        const newTarget = UnitHelpers.findTarget(unit, this.units);
        unit.target = newTarget || undefined;
      }

      if (unit.target) {
        // Attack if in range
        const distance = Phaser.Math.Distance.Between(
          unit.x,
          unit.y,
          unit.target.x,
          unit.target.y
        );
        if (distance <= unit.range * 50) {
          if (UnitHelpers.attackTarget(unit, unit.target, this.time.now)) {
            soundManager.playUnitAttack();
          }
        } else {
          // Move towards target
          UnitHelpers.moveUnit(unit, deltaTime);
        }
      } else {
        // No target, move towards enemy base
        UnitHelpers.moveUnit(unit, deltaTime);

        // Check if reached enemy base
        const enemyBaseX = unit.team === "player" ? 3100 : 100;
        if (Math.abs(unit.x - enemyBaseX) < 30) {
          this.damageBase(
            unit.team === "player" ? "enemy" : "player",
            unit.dps
          );
          UnitHelpers.destroyUnit(unit);
          this.units = this.units.filter((u) => u !== unit);
        }
      }
    }
  }

  private damageBase(team: "player" | "enemy", damage: number): void {
    if (team === "player") {
      this.gameState.playerBaseHp = Math.max(
        0,
        this.gameState.playerBaseHp - damage
      );
    } else {
      this.gameState.enemyBaseHp = Math.max(
        0,
        this.gameState.enemyBaseHp - damage
      );
    }

    soundManager.playBaseHit();
    this.updateBases();
    this.updateGameState();
  }

  private updateBases(): void {
    if (this.playerBase) {
      this.drawBase(this.playerBase, 100, 200, "player");
    }
    if (this.enemyBase) {
      this.drawBase(this.enemyBase, 3100, 200, "enemy");
    }
  }

  private checkWinConditions(): void {
    if (this.gameState.playerBaseHp <= 0) {
      this.endGame("enemy");
    } else if (this.gameState.enemyBaseHp <= 0) {
      this.endGame("player");
    }
  }

  private endGame(winner: "player" | "enemy" | "time"): void {
    this.gameState.isGameOver = true;

    if (winner === "time") {
      // Sudden death: higher HP wins
      this.gameState.winner =
        this.gameState.playerBaseHp > this.gameState.enemyBaseHp
          ? "player"
          : "enemy";
    } else {
      this.gameState.winner = winner;
    }

    // Stop timers
    if (this.goldTimer) this.goldTimer.destroy();
    if (this.matchTimer) this.matchTimer.destroy();
    if (this.quizTimer) this.quizTimer.destroy();

    // Play victory sound
    if (this.gameState.winner === "player") {
      soundManager.playVictory();
    }

    this.updateGameState();
  }

  // Public methods for React components
  public deployUnit(unitType: string, isCorrect: boolean): void {
    // Don't allow deployment if game is over
    if (this.gameState.isGameOver) return;

    const unitConfig = GAME_CONFIG.units.find((u) => u.id === unitType);
    if (!unitConfig) return;

    // For units, no gold cost is applied - units are deployed based on quiz answers
    // Spawn unit
    const unit = UnitHelpers.createUnit(
      this,
      unitConfig,
      200, // Start position - moved right from base
      200, // Lane center
      "player",
      !isCorrect // Weaker if wrong answer
    );

    this.units.push(unit);
    soundManager.playUnitSpawn();

    // Spawn enemy unit (AI)
    this.spawnEnemyUnit();

    this.updateGameState();
  }

  private spawnEnemyUnit(): void {
    // Simple AI: randomly pick a unit type
    const randomUnit =
      GAME_CONFIG.units[Math.floor(Math.random() * GAME_CONFIG.units.length)];
    const isWeak = Math.random() < 0.9; // 30% chance of weak unit

    const unit = UnitHelpers.createUnit(
      this,
      randomUnit,
      3000, // Enemy start position - moved left from base
      200,
      "enemy",
      isWeak
    );

    this.units.push(unit);
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public castSpell(spellId: string): boolean {
    // Don't allow if game is over
    if (this.gameState.isGameOver) return false;

    const spellConfig = GAME_CONFIG.spells.find((s) => s.id === spellId);
    if (!spellConfig) return false;

    // Check if player has enough gold
    if (this.gameState.playerGold < spellConfig.cost) return false;

    // Deduct gold
    this.gameState.playerGold = Math.max(
      0,
      this.gameState.playerGold - spellConfig.cost
    );

    // Apply spell effect based on ID
    switch (spellConfig.id) {
      case "freeze":
        // Freeze enemy units for 3 seconds
        this.units.forEach((unit) => {
          if (unit.team === "enemy") {
            unit.isFrozen = true;

            // Unfreeze after 3 seconds
            this.time.delayedCall(3000, () => {
              if (unit && !UnitHelpers.isUnitDead(unit)) {
                unit.isFrozen = false;
              }
            });
          }
        });
        soundManager.playSpellCast();
        break;

      case "heal":
        // Heal base by 10%
        const healAmount = Math.floor(GAME_CONFIG.battle.baseMaxHealth * 0.1);
        this.gameState.playerBaseHp = Math.min(
          GAME_CONFIG.battle.baseMaxHealth,
          this.gameState.playerBaseHp + healAmount
        );
        this.updateBases();
        soundManager.playSpellCast();
        break;

      case "double_gold":
        // Double gold income for 10 seconds
        if (this.goldTimer) {
          this.goldTimer.destroy();
        }

        // Create a new gold timer with double rate
        this.goldTimer = this.time.addEvent({
          delay: 1000, // Every second
          callback: () => {
            this.gameState.playerGold += GAME_CONFIG.economy.goldPerSecond * 2;
            this.updateGameState();
          },
          loop: true,
          repeat: 10, // 10 seconds
        });

        // After 10 seconds, restore normal gold rate
        this.time.delayedCall(10000, () => {
          if (this.goldTimer) {
            this.goldTimer.destroy();
          }

          this.startGoldIncome();
        });
        soundManager.playSpellCast();
        break;

      default:
        return false;
    }

    this.updateGameState();
    return true;
  }

  private updateGameState(): void {
    if (this.onGameStateUpdate) {
      this.onGameStateUpdate({ ...this.gameState });
    }
  }
}
