import * as Phaser from "phaser";
import { GAME_CONFIG } from "../../data/game-config";
import { soundManager } from "./helpers/soundManager";
import { UnitHelpers, type BattleUnit } from "./helpers/unitHelpers";

export interface GameState {
  playerBaseHp: number;
  enemyBaseHp: number;
  matchTimeLeft: number;
  isGameOver: boolean;
  isSuddenDeath: boolean; // New: Sudden death mode flag
  winner?: "player" | "enemy";
}

export default class BattleScene extends Phaser.Scene {
  private units: BattleUnit[] = [];
  private gameState: GameState = {
    playerBaseHp: GAME_CONFIG.battle.baseMaxHealth,
    enemyBaseHp: GAME_CONFIG.battle.baseMaxHealth,
    matchTimeLeft: GAME_CONFIG.battle.matchDurationMinutes * 60,
    isGameOver: false,
    isSuddenDeath: false, // Initialize sudden death as false
  };

  private playerBase?: Phaser.GameObjects.Graphics;
  private enemyBase?: Phaser.GameObjects.Graphics;
  private matchTimer?: Phaser.Time.TimerEvent;
  private quizTimer?: Phaser.Time.TimerEvent; // Timer for global quiz interval
  private isQuizActive: boolean = false;
  private isFirstQuiz: boolean = true;
  private isSpellQuizActive: boolean = false; // Track if a quiz is currently active
  private lastTime: number = 0;

  // Spell cooldowns
  private spellCooldowns: Map<string, number> = new Map();

  // Prevent double-spawning in development mode
  private lastSpawnTime: number = 0;

  // Freeze effect properties
  private freezeOverlay?: Phaser.GameObjects.Graphics;
  private snowflakes: Phaser.GameObjects.Graphics[] = [];
  private freezeIndicator?: Phaser.GameObjects.Graphics;

  // Sudden death properties
  private suddenDeathOverlay?: Phaser.GameObjects.Graphics;
  private suddenDeathText?: Phaser.GameObjects.Text;

  // Callbacks for React components
  public onGameStateUpdate?: (state: GameState) => void;
  public onRequestQuiz?: (
    unitType: string,
    callback: (correct: boolean) => void
  ) => void;
  public onSceneReady?: () => void;
  public onRequestSpellQuiz?: (
    spellId: string,
    callback: (correct: boolean) => void
  ) => void;

  constructor() {
    super("BattleScene");
  }

  private setupCamera(): void {
    // Set camera bounds to cover the entire world (3200 x 800)
    this.cameras.main.setBounds(0, 0, 3200, 800);

    // Start camera centered on player base area
    this.cameras.main.setZoom(1);
    this.cameras.main.centerOn(400, 400); // Start view on left side near player base
    
    // Set initial cursor style for camera movement
    // this.game.canvas.style.cursor = "grab";

    // Enable camera controls with mouse/touch
    // this.input.on("pointerdown", () => {
      // Change cursor to grabbing when dragging starts
    //   this.game.canvas.style.cursor = "grabbing";
    // });

    // this.input.on("pointerup", () => {
    //   // Change cursor back to grab when dragging stops
    //   this.game.canvas.style.cursor = "grab";
    // });

    // this.input.on("pointerout", () => {
    //   // Reset cursor when pointer leaves canvas
    //   this.game.canvas.style.cursor = "default";
    // });

    // this.input.on("pointerover", () => {
    //   // Set grab cursor when pointer enters canvas
    //   this.game.canvas.style.cursor = "grab";
    // });

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

    this.input.keyboard?.on("keydown-LEFT", () => {
      this.cameras.main.scrollX -= 50;
    });
    this.input.keyboard?.on("keydown-RIGHT", () => {
      this.cameras.main.scrollX += 50;
    });

    this.input.keyboard?.on("keydown-D", () => {
      this.cameras.main.scrollX += 50;
    });

    this.input.keyboard?.on("keydown-SPACE", () => {
      // Center camera on action (middle of battlefield)
      this.cameras.main.centerOn(1600, 400);
    });
  }

  create() {
    // Initialize sound
    soundManager.init();

    // Load and start background music immediately
    // Make sure you put your music file at: EduBattle/public/music/background-music.mp3
    soundManager.loadBackgroundMusic("/music/background-music.mp3", true);

    // Set up camera for expanded world
    this.setupCamera();

    // Create battlefield background
    this.createBattlefield();

    // Create bases
    this.createBases();

    // Start match timer
    this.startMatchTimer();

    // Start global quiz timer
    this.startQuizTimer();

    // Add input handling
    this.setupInput();

    // Start game loop
    this.startGameLoop();

    // Notify that scene is ready
    if (this.onSceneReady) {
      this.onSceneReady();
    }
  }

  private createBattlefield(): void {
    // Space background - black with stars (full screen height)
    this.add.rectangle(1600, 400, 3200, 800, 0x000000);

    // Create random stars across the battlefield
    this.createStars();

    // Lane lines - make them more space-like (dim blue/cyan)
    // this.add.line(1600, 300, 0, 0, 3200, 0, 0x1e40af, 1);
    // this.add.line(1600, 500, 0, 0, 3200, 0, 0x1e40af, 1);

    // Center line - dim and space-like
    // this.add.line(1600, 400, 0, 0, 0, 800, 0x374151, 1);
  }

  private createStars(): void {
    // Create random stars of varying sizes across the expanded battlefield
    const starCount = 500; // More stars for full screen

    for (let i = 0; i < starCount; i++) {
      // Random position across the entire 3200x800 battlefield
      const x = Math.random() * 3200;
      const y = Math.random() * 800;

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
    // Player base (left) - positioned partially off-screen (more visible)
    this.playerBase = this.add.graphics();
    this.drawBase(this.playerBase, 10, 400, "player"); // More visible on left

    // Enemy base (right) - positioned partially off-screen (more visible)
    this.enemyBase = this.add.graphics();
    this.drawBase(this.enemyBase, 3190, 400, "enemy"); // More visible on right
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
    const radius = 120; // Much bigger planets!

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
    graphics.fillStyle(atmosphereColor, 0.3);
    graphics.fillCircle(0, 0, radius + 20); // Bigger atmosphere for bigger planets

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

    // Add orbital ring for enemy Mars planet
    if (team === "enemy") {
      this.drawOrbitalRing(graphics, radius);
    }
  }

  private drawRetroLandmasses(
    graphics: Phaser.GameObjects.Graphics,
    continentColor: number,
    radius: number
  ): void {
    graphics.fillStyle(continentColor, 0.9);

    // Scale factor for bigger planets
    const scale = radius / 30; // Scale based on radius

    // Draw chunky, pixel-art style landmasses (scaled up)
    // Continent 1 (top-left area)
    graphics.fillRect(-20 * scale, -15 * scale, 12 * scale, 8 * scale);
    graphics.fillRect(-15 * scale, -10 * scale, 8 * scale, 6 * scale);

    // Continent 2 (right side)
    graphics.fillRect(5 * scale, -8 * scale, 10 * scale, 12 * scale);
    graphics.fillRect(12 * scale, 0, 6 * scale, 8 * scale);

    // Continent 3 (bottom)
    graphics.fillRect(-8 * scale, 10 * scale, 14 * scale, 6 * scale);
    graphics.fillRect(-5 * scale, 16 * scale, 8 * scale, 4 * scale);

    // Small islands
    graphics.fillRect(-25 * scale, 5 * scale, 4 * scale, 3 * scale);
    graphics.fillRect(18 * scale, -20 * scale, 3 * scale, 4 * scale);
  }

  private drawRetroDetails(
    graphics: Phaser.GameObjects.Graphics,
    radius: number,
    hpPercent: number,
    team: "player" | "enemy"
  ): void {
    const scale = radius / 30; // Scale factor for bigger planets

    // Add some retro-style details based on health
    if (hpPercent < 0.5) {
      // Damage effects - red pixels scattered around
      graphics.fillStyle(0xff0000, 0.8);
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const x = Math.cos(angle) * (radius * 0.7);
        const y = Math.sin(angle) * (radius * 0.7);
        graphics.fillRect(x - 2 * scale, y - 2 * scale, 4 * scale, 4 * scale);
      }
    }

    if (hpPercent < 0.25) {
      // Critical damage - more intense effects
      graphics.fillStyle(0xffff00, 0.6);
      graphics.fillRect(-4 * scale, -4 * scale, 8 * scale, 8 * scale); // Center explosion effect
    }

    // Add some retro "city lights" or surface details
    if (team === "player" && hpPercent > 0.5) {
      graphics.fillStyle(0xffff00, 0.7);
      // Scaled city lights
      graphics.fillRect(-10 * scale, -5 * scale, 2 * scale, 2 * scale);
      graphics.fillRect(8 * scale, 3 * scale, 2 * scale, 2 * scale);
      graphics.fillRect(-3 * scale, 12 * scale, 2 * scale, 2 * scale);
      graphics.fillRect(15 * scale, -10 * scale, 2 * scale, 2 * scale);
    }
  }

  private drawOrbitalRing(
    graphics: Phaser.GameObjects.Graphics,
    planetRadius: number
  ): void {
    const ringRadius = planetRadius + 25; // Bigger ring for bigger planet
    const ringThickness = 5; // Thicker ring
    const scale = planetRadius / 30;

    // Main orbital ring
    graphics.lineStyle(ringThickness, 0xff6b6b, 0.6);
    graphics.strokeCircle(0, 0, ringRadius);

    // Inner ring detail
    graphics.lineStyle(2, 0xffa726, 0.4);
    graphics.strokeCircle(0, 0, ringRadius - 4);

    // Add some orbital debris/stations as scaled rectangles
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const x = Math.cos(angle) * ringRadius;
      const y = Math.sin(angle) * ringRadius;

      graphics.fillStyle(0xff5722, 0.8);
      graphics.fillRect(x - 2 * scale, y - 2 * scale, 4 * scale, 4 * scale);
    }
  }

  private createFreezeEffect(): void {
    // Create freeze overlay
    this.freezeOverlay = this.add.graphics();
    this.freezeOverlay.fillStyle(0x87ceeb, 0.15); // Light blue overlay
    this.freezeOverlay.fillRect(0, 0, 3200, 800);

    // Create corner freeze indicator
    this.createFreezeIndicator();

    // Create snowflakes
    this.createSnowflakes();

    // Remove freeze effect after 3 seconds
    this.time.delayedCall(3000, () => {
      this.removeFreezeEffect();
    });
  }

  private createFreezeIndicator(): void {
    this.freezeIndicator = this.add.graphics();
    this.freezeIndicator.setPosition(50, 50); // Top-left corner

    // Ice crystal shape
    this.freezeIndicator.lineStyle(3, 0x87ceeb, 0.9);
    this.freezeIndicator.fillStyle(0xb0e0e6, 0.7);

    // Draw snowflake/ice crystal
    const size = 20;

    // Main cross
    this.freezeIndicator.lineBetween(-size, 0, size, 0);
    this.freezeIndicator.lineBetween(0, -size, 0, size);

    // Diagonal cross
    this.freezeIndicator.lineBetween(
      -size * 0.7,
      -size * 0.7,
      size * 0.7,
      size * 0.7
    );
    this.freezeIndicator.lineBetween(
      -size * 0.7,
      size * 0.7,
      size * 0.7,
      -size * 0.7
    );

    // Small decorative branches
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const x1 = Math.cos(angle) * size * 0.5;
      const y1 = Math.sin(angle) * size * 0.5;
      const x2 = Math.cos(angle) * size * 0.8;
      const y2 = Math.sin(angle) * size * 0.8;
      this.freezeIndicator.lineBetween(x1, y1, x2, y2);
    }

    // Add pulsing animation
    this.tweens.add({
      targets: this.freezeIndicator,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: 5,
      ease: "Sine.easeInOut",
    });
  }

  private createSnowflakes(): void {
    // Create 50 snowflakes across the battlefield
    for (let i = 0; i < 50; i++) {
      const snowflake = this.add.graphics();

      // Random position across battlefield
      const x = Math.random() * 3200;
      const y = Math.random() * 800;
      snowflake.setPosition(x, y);

      // Draw snowflake
      const size = Math.random() * 3 + 2; // 2-5 pixel size
      snowflake.fillStyle(0xffffff, 0.8);
      snowflake.lineStyle(1, 0x87ceeb, 0.6);

      // Simple 6-pointed star
      for (let j = 0; j < 6; j++) {
        const angle = (Math.PI * 2 * j) / 6;
        const x1 = Math.cos(angle) * size;
        const y1 = Math.sin(angle) * size;
        snowflake.lineBetween(0, 0, x1, y1);
      }

      this.snowflakes.push(snowflake);

      // Add falling animation
      this.tweens.add({
        targets: snowflake,
        y: y + 100,
        x: x + (Math.random() - 0.5) * 50, // Slight horizontal drift
        alpha: 0,
        duration: 3000,
        ease: "Linear",
        onComplete: () => {
          snowflake.destroy();
        },
      });

      // Add rotation
      this.tweens.add({
        targets: snowflake,
        rotation: Math.PI * 2,
        duration: 2000 + Math.random() * 1000,
        repeat: -1,
        ease: "Linear",
      });
    }
  }

  private removeFreezeEffect(): void {
    // Remove freeze overlay
    if (this.freezeOverlay) {
      this.tweens.add({
        targets: this.freezeOverlay,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.freezeOverlay?.destroy();
          this.freezeOverlay = undefined;
        },
      });
    }

    // Remove freeze indicator
    if (this.freezeIndicator) {
      this.freezeIndicator.destroy();
      this.freezeIndicator = undefined;
    }

    // Clean up any remaining snowflakes
    this.snowflakes.forEach((snowflake) => {
      if (snowflake && snowflake.active) {
        snowflake.destroy();
      }
    });
    this.snowflakes = [];
  }

  private triggerSuddenDeath(): void {
    console.log("🔥 SUDDEN DEATH MODE ACTIVATED!");

    // Set sudden death state
    this.gameState.isSuddenDeath = true;

    // Create visual effects
    this.createSuddenDeathEffect();

    // Spawn massive waves of units
    this.spawnMassiveWaves();

    // Make bases invulnerable (they won't take damage from units)
    // The victory condition is now: first base to take damage loses

    // Update game state
    this.updateGameState();

    // Play sudden death sound
    soundManager.playSpellCast(); // We'll use this for now, can add specific sound later
  }

  private createSuddenDeathEffect(): void {
    // Create dramatic overlay
    this.suddenDeathOverlay = this.add.graphics();
    this.suddenDeathOverlay.fillStyle(0xff0000, 0.1); // Red tint
    this.suddenDeathOverlay.fillRect(0, 0, 3200, 800);

    // Create "SUDDEN DEATH!" text
    this.suddenDeathText = this.add.text(1600, 200, "🔥 SUDDEN DEATH! 🔥", {
      fontSize: "64px",
      fontStyle: "bold",
      color: "#ff0000",
      stroke: "#ffffff",
      strokeThickness: 4,
    });
    this.suddenDeathText.setOrigin(0.5);

    // Add dramatic animation
    this.tweens.add({
      targets: this.suddenDeathText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      repeat: 5,
      ease: "Power2",
    });

    // Add screen shake
    this.cameras.main.shake(1000, 0.02);

    // Remove text after 3 seconds
    this.time.delayedCall(3000, () => {
      if (this.suddenDeathText) {
        this.suddenDeathText.destroy();
        this.suddenDeathText = undefined;
      }
    });
  }

  private spawnMassiveWaves(): void {
    console.log("⚔️ Spawning massive waves for sudden death!");

    // Spawn massive player wave (10-15 units)
    const playerWaveSize = 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < playerWaveSize; i++) {
      const randomUnit =
        GAME_CONFIG.units[Math.floor(Math.random() * GAME_CONFIG.units.length)];
      const spawnY = 200 + (i % 8) * 50; // Spread across height
      const spawnX = 100 + (i % 5) * 30; // Stagger horizontally

      const unit = UnitHelpers.createUnit(
        this,
        randomUnit,
        spawnX,
        spawnY,
        "player",
        false // Normal strength for sudden death
      );

      this.units.push(unit);
    }

    // Spawn massive enemy wave (10-15 units)
    const enemyWaveSize = 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < enemyWaveSize; i++) {
      const randomUnit =
        GAME_CONFIG.units[Math.floor(Math.random() * GAME_CONFIG.units.length)];
      const spawnY = 200 + (i % 8) * 50; // Spread across height
      const spawnX = 3100 - (i % 5) * 30; // Stagger horizontally from right

      const unit = UnitHelpers.createUnit(
        this,
        randomUnit,
        spawnX,
        spawnY,
        "enemy",
        false // Normal strength for sudden death
      );

      this.units.push(unit);
    }

    console.log(
      `⚔️ Spawned ${playerWaveSize} player units and ${enemyWaveSize} enemy units!`
    );
    soundManager.playUnitSpawn();
  }

  private createMeteorStrike(backfired: boolean = false): void {
    // Get target units based on whether spell backfired
    const targetTeam = backfired ? "player" : "enemy";
    const targetUnits = this.units.filter(
      (unit) =>
        unit.team === targetTeam &&
        typeof unit.x === "number" &&
        typeof unit.y === "number" &&
        Number.isFinite(unit.x) &&
        Number.isFinite(unit.y)
    );

    console.log(
      `☄️ Meteor strike targeting ${targetTeam} units (${targetUnits.length} targets)`
    );

    if (targetUnits.length === 0) return;

    // Create meteors for each target unit with random delays
    targetUnits.forEach((unit, index) => {
      // Capture unit position up-front
      const targetX = unit.x;
      const targetY = unit.y;

      // Validate captured coordinates; skip if invalid
      if (
        typeof targetX !== "number" ||
        typeof targetY !== "number" ||
        !Number.isFinite(targetX) ||
        !Number.isFinite(targetY)
      ) {
        return;
      }

      const delay = index * 200 + Math.random() * 500; // Stagger meteors

      this.time.delayedCall(delay, () => {
        // Always create the meteor - it will damage any units in the area when it lands
        this.createSingleMeteor(targetX, targetY, targetTeam);
      });
    });

    // Create additional meteors to cover the entire enemy formation area
    if (targetTeam === "enemy") {
      // Cover enemy spawn area (right side of battlefield)
      const enemySpawnArea = {
        minX: 2800, // Enemy base area
        maxX: 3200,
        minY: 200, // Cover most of the height
        maxY: 600,
      };

      // Create 5-8 meteors across the enemy formation area
      for (let i = 0; i < 6 + Math.floor(Math.random() * 3); i++) {
        const randomX =
          enemySpawnArea.minX +
          Math.random() * (enemySpawnArea.maxX - enemySpawnArea.minX);
        const randomY =
          enemySpawnArea.minY +
          Math.random() * (enemySpawnArea.maxY - enemySpawnArea.minY);
        const delay = Math.random() * 1500 + 500; // 0.5 to 2 seconds delay

        this.time.delayedCall(delay, () => {
          this.createSingleMeteor(randomX, randomY, targetTeam);
        });
      }
    } else if (targetTeam === "player") {
      // Cover player spawn area (left side of battlefield)
      const playerSpawnArea = {
        minX: 0,
        maxX: 400,
        minY: 200,
        maxY: 600,
      };

      // Create 5-8 meteors across the player formation area
      for (let i = 0; i < 6 + Math.floor(Math.random() * 3); i++) {
        const randomX =
          playerSpawnArea.minX +
          Math.random() * (playerSpawnArea.maxX - playerSpawnArea.minX);
        const randomY =
          playerSpawnArea.minY +
          Math.random() * (playerSpawnArea.maxY - playerSpawnArea.minY);
        const delay = Math.random() * 1500 + 500; // 0.5 to 2 seconds delay

        this.time.delayedCall(delay, () => {
          this.createSingleMeteor(randomX, randomY, targetTeam);
        });
      }
    }
  }

  private createSingleMeteor(
    targetX: number,
    targetY: number,
    targetTeam: "player" | "enemy" = "enemy"
  ): void {
    // Guard against invalid coordinates
    if (
      typeof targetX !== "number" ||
      typeof targetY !== "number" ||
      !Number.isFinite(targetX) ||
      !Number.isFinite(targetY)
    ) {
      return;
    }
    // Create meteor starting from high above the target
    const startX = targetX + (Math.random() - 0.5) * 100;
    const startY = -100;

    const meteor = this.add.graphics();
    meteor.setPosition(startX, startY);

    // Draw meteor (orange/red glowing rock)
    meteor.fillStyle(0xff4500, 1);
    meteor.fillCircle(0, 0, 8);
    meteor.fillStyle(0xff6347, 0.8);
    meteor.fillCircle(0, 0, 6);
    meteor.fillStyle(0xffd700, 0.6);
    meteor.fillCircle(0, 0, 4);

    // Create trailing fire effect
    const trail = this.add.graphics();
    trail.setPosition(startX, startY);

    // Animate meteor falling
    this.tweens.add({
      targets: meteor,
      x: targetX,
      y: targetY,
      duration: 800,
      ease: "Power2",
      onUpdate: () => {
        // Update trail position
        trail.setPosition(meteor.x, meteor.y);

        // Redraw trail
        trail.clear();
        trail.fillStyle(0xff4500, 0.4);
        trail.fillRect(-3, -20, 6, 20);
        trail.fillStyle(0xffd700, 0.3);
        trail.fillRect(-2, -15, 4, 15);
      },
      onComplete: () => {
        // Impact explosion
        this.createMeteorExplosion(targetX, targetY);

        // Damage nearby units based on target team
        this.damageUnitsInRadius(targetX, targetY, 60, 40, targetTeam);

        // Clean up
        meteor.destroy();
        trail.destroy();
      },
    });
  }

  private createMeteorExplosion(x: number, y: number): void {
    // Create explosion graphics
    const explosion = this.add.graphics();
    explosion.setPosition(x, y);

    // Draw explosion rings
    explosion.fillStyle(0xffffff, 0.8);
    explosion.fillCircle(0, 0, 5);
    explosion.fillStyle(0xffd700, 0.6);
    explosion.fillCircle(0, 0, 15);
    explosion.fillStyle(0xff4500, 0.4);
    explosion.fillCircle(0, 0, 30);
    explosion.fillStyle(0xff0000, 0.2);
    explosion.fillCircle(0, 0, 50);

    // Create explosion particles
    for (let i = 0; i < 12; i++) {
      const particle = this.add.graphics();
      particle.setPosition(x, y);

      const colors = [0xff4500, 0xff6347, 0xffd700, 0xffffff];
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.fillStyle(color, 0.8);
      particle.fillCircle(0, 0, Math.random() * 4 + 2);

      const angle = (Math.PI * 2 * i) / 12;
      const distance = Math.random() * 60 + 30;

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 600,
        ease: "Power2",
        onComplete: () => particle.destroy(),
      });
    }

    // Fade out explosion
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      duration: 400,
      onComplete: () => explosion.destroy(),
    });

    // Screen shake effect
    this.cameras.main.shake(200, 0.01);
  }

  private damageUnitsInRadius(
    x: number,
    y: number,
    radius: number,
    damage: number,
    targetTeam: "player" | "enemy" = "enemy"
  ): void {
    this.units.forEach((unit) => {
      // First check if unit exists and is valid
      if (!unit || typeof unit !== "object") {
        return; // Skip undefined/null units
      }

      if (
        unit.team === targetTeam &&
        unit.x !== undefined &&
        unit.y !== undefined &&
        unit.hp > 0 // Only process living units
      ) {
        const distance = Phaser.Math.Distance.Between(unit.x, unit.y, x, y);
        if (distance <= radius) {
          // Deal damage
          unit.hp = Math.max(0, unit.hp - damage);

          // Create damage number with different color for player units
          const damageColor = targetTeam === "player" ? 0xff0000 : 0xff4500; // Red for player, orange for enemy
          this.createDamageNumber(unit.x, unit.y, damage, damageColor);

          // Check if unit died
          if (unit.hp <= 0) {
            UnitHelpers.destroyUnit(unit);
          } else {
            // Update health bar
            UnitHelpers.updateHealthBar(unit);
          }
        }
      }
    });
  }

  private createDamageNumber(
    x: number,
    y: number,
    damage: number,
    color: number
  ): void {
    const damageText = this.add.text(x, y - 20, `-${damage}`, {
      fontSize: "16px",
      color: `#${color.toString(16).padStart(6, "0")}`,
      fontStyle: "bold",
    });

    damageText.setOrigin(0.5);

    this.tweens.add({
      targets: damageText,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: "Power2",
      onComplete: () => damageText.destroy(),
    });
  }

  private startMatchTimer(): void {
    this.matchTimer = this.time.addEvent({
      delay: 1000, // Every second
      callback: () => {
        // Pause main timer when ANY quiz is active, but keep battle running
        if (this.isQuizActive || this.isSpellQuizActive) return;

        this.gameState.matchTimeLeft = Math.max(
          0,
          this.gameState.matchTimeLeft - 1
        );

        if (
          this.gameState.matchTimeLeft <= 0 &&
          !this.gameState.isSuddenDeath
        ) {
          this.triggerSuddenDeath();
        }

        this.updateGameState();
      },
      loop: true,
    });
  }

  private startQuizTimer(): void {
    this.scheduleNextQuiz();
  }

  private scheduleNextQuiz(): void {
    // Don't schedule if game is over
    if (this.gameState.isGameOver) return;

    // Clear any existing quiz timer to prevent overlaps
    if (this.quizTimer) {
      this.quizTimer.destroy();
      this.quizTimer = undefined;
    }

    // Use 5 seconds for first quiz, 15 seconds for subsequent quizzes
    const delay = this.isFirstQuiz
      ? 5000
      : GAME_CONFIG.quiz.globalQuizIntervalSeconds * 1000;

    console.log(
      `⏰ Scheduling ${this.isFirstQuiz ? "FIRST" : "next"} quiz in ${
        delay / 1000
      } seconds`
    );

    // Schedule next quiz (one-shot, not looping)
    this.quizTimer = this.time.addEvent({
      delay: delay,
      callback: () => {
        // Double-check conditions before showing quiz
        if (this.gameState.isGameOver) {
          console.log("❌ Game over - not showing quiz");
          return;
        }

        if (this.isQuizActive || this.isSpellQuizActive) {
          console.log("❌ Quiz already active - rescheduling in 2 seconds");
          // If quiz is still active, try again in 2 seconds
          this.time.delayedCall(2000, () => this.scheduleNextQuiz());
          return;
        }

        // Set quiz as active to prevent new ones
        this.isQuizActive = true;
        console.log("✅ Starting quiz - isQuizActive set to true");

        // Mark that we're no longer on the first quiz
        if (this.isFirstQuiz) {
          this.isFirstQuiz = false;
        }

        // Randomly select a unit type to ask about
        const randomUnit =
          GAME_CONFIG.units[
            Math.floor(Math.random() * GAME_CONFIG.units.length)
          ];

        // 🚨 IMMEDIATE ENEMY SPAWN - Creates pressure while player is stuck in quiz!
        console.log("⚔️ Enemy gets head start - spawning units immediately!");
        this.spawnEnemyUnits();

        // Show visual indicator that enemy got advantage
        this.showEnemyAdvantageMessage();

        if (this.onRequestQuiz) {
          console.log("📝 Quiz triggered:", randomUnit.id);

          this.onRequestQuiz(randomUnit.id, (correct: boolean) => {
            console.log("✅ Quiz answered:", correct);
            // Reset quiz active flag when quiz is completed
            this.isQuizActive = false;

            // Always deploy units - correct answer = strong units, wrong/skip = weak units
            this.deployUnit(randomUnit.id, correct);

            // Schedule the next quiz only after this one is completed
            console.log("⏰ Scheduling next quiz in 15 seconds");
            this.scheduleNextQuiz();
          });
        }
      },
      loop: false, // Important: Not looping!
    });
  }

  // Public method to reset quiz state (called from React when quiz closes)
  public resetQuizState(): void {
    // Reset both types of quiz states
    this.isQuizActive = false;
    this.isSpellQuizActive = false;
    // Note: Don't schedule next quiz here - it should be handled by the quiz callback
  }

  // Public method to reset game state (called when restarting)
  public resetGameState(): void {
    this.gameState = {
      playerBaseHp: GAME_CONFIG.battle.baseMaxHealth,
      enemyBaseHp: GAME_CONFIG.battle.baseMaxHealth,
      matchTimeLeft: GAME_CONFIG.battle.matchDurationMinutes * 60,
      isGameOver: false,
      isSuddenDeath: false,
    };

    // Reset other state variables
    this.isFirstQuiz = true;
    this.isQuizActive = false;
    this.isSpellQuizActive = false;

    // Clear any existing effects
    if (this.suddenDeathOverlay) {
      this.suddenDeathOverlay.destroy();
      this.suddenDeathOverlay = undefined;
    }
    if (this.suddenDeathText) {
      this.suddenDeathText.destroy();
      this.suddenDeathText = undefined;
    }

    this.startMatchTimer();
    this.startQuizTimer();

    // Update game state
    this.updateGameState();
  }

  private showEnemyAdvantageMessage(): void {
    // Add screen shake for dramatic effect
    this.cameras.main.shake(300, 0.01);
  }

  private getRandomSpawnCount(): number {
    const random = Math.random() * 100;

    if (random < 70) {
      return 5; // 70% chance for 3 units
    } else if (random < 95) {
      return 6; // 25% chance for 4 units (70% + 25% = 95%)
    } else {
      return 8; // 5% chance for 5 units (remaining 5%)
    }
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
    // Remove dead units and clean up undefined/null entries
    this.units = this.units.filter((unit) => {
      // Remove undefined/null units
      if (!unit || typeof unit !== "object") {
        return false;
      }

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
        // Store target reference to prevent it from becoming undefined mid-check
        const target = unit.target;

        // Check if target still exists and has valid position
        if (
          target &&
          typeof target.x === "number" &&
          typeof target.y === "number"
        ) {
          // Attack if in range
          const distance = Phaser.Math.Distance.Between(
            unit.x,
            unit.y,
            target.x,
            target.y
          );
          if (distance <= unit.range * 60) {
            // Bigger range for bigger ships
            if (UnitHelpers.attackTarget(unit, target, this.time.now)) {
              soundManager.playUnitAttack();
            }
          } else {
            // Move towards target
            UnitHelpers.moveUnit(unit, deltaTime);
          }
        } else {
          // Target is invalid, clear it
          unit.target = undefined;
        }
      } else {
        // No target, move towards enemy base
        UnitHelpers.moveUnit(unit, deltaTime);

        // Check if reached enemy base
        const enemyBaseX = unit.team === "player" ? 3160 : 40;
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
    // In sudden death mode, any base damage means instant defeat for that team
    if (this.gameState.isSuddenDeath) {
      console.log(
        `💥 SUDDEN DEATH: ${team} base took damage! ${
          team === "player" ? "ENEMY" : "PLAYER"
        } WINS!`
      );

      // Determine winner (opposite of who took damage)
      const winner = team === "player" ? "enemy" : "player";
      this.endGame(winner);
      return;
    }

    // Normal damage logic
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
      this.drawBase(this.playerBase, 10, 400, "player"); // More visible on left
    }
    if (this.enemyBase) {
      this.drawBase(this.enemyBase, 3190, 400, "enemy"); // More visible on right
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

    // Clean up sudden death effects if they exist
    if (this.suddenDeathOverlay) {
      this.suddenDeathOverlay.destroy();
      this.suddenDeathOverlay = undefined;
    }
    if (this.suddenDeathText) {
      this.suddenDeathText.destroy();
      this.suddenDeathText = undefined;
    }

    // Stop timers
    if (this.matchTimer) this.matchTimer.destroy();
    if (this.quizTimer) this.quizTimer.destroy();

    // Stop background music
    soundManager.stopBackgroundMusic();

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

    // Prevent double-spawning (protects against rapid duplicate calls)
    const currentTime = Date.now();
    if (currentTime - this.lastSpawnTime < 100) {
      return; // Ignore duplicate calls within 100ms
    }
    this.lastSpawnTime = currentTime;

    // Get random spawn count for player (2-4 units)
    const playerSpawnCount = this.getRandomSpawnCount();

    // Spawn multiple units for player
    for (let i = 0; i < playerSpawnCount; i++) {
      // Randomize unit type for each spawn (except first one which uses quiz answer)
      const currentUnitConfig =
        i === 0
          ? unitConfig
          : GAME_CONFIG.units[
              Math.floor(Math.random() * GAME_CONFIG.units.length)
            ];

      // Stagger spawn positions slightly
      const spawnY = 400 + (i - Math.floor(playerSpawnCount / 2)) * 40; // Spread vertically
      const spawnX = 200 + i * 30; // Slight horizontal offset

      const unit = UnitHelpers.createUnit(
        this,
        currentUnitConfig,
        spawnX,
        spawnY,
        "player",
        !isCorrect // Weaker if wrong answer
      );

      this.units.push(unit);
    }

    soundManager.playUnitSpawn();

    // Spawn enemy units (AI) - also multiple
    // this.spawnEnemyUnits();

    this.updateGameState();
  }

  private spawnEnemyUnits(): void {
    // Get random spawn count for enemy (2-4 units)
    const enemySpawnCount = this.getRandomSpawnCount();

    // Spawn multiple units for enemy
    for (let i = 0; i < enemySpawnCount; i++) {
      // Randomize unit type for each spawn
      const randomUnit =
        GAME_CONFIG.units[Math.floor(Math.random() * GAME_CONFIG.units.length)];

      // Enemy always spawns normal strength units (no buff/debuff)
      const isWeak = false; // Always normal strength

      // Stagger spawn positions slightly
      const spawnY = 400 + (i - Math.floor(enemySpawnCount / 2)) * 40; // Spread vertically
      const spawnX = 3000 - i * 30; // Slight horizontal offset (move left from base)

      const unit = UnitHelpers.createUnit(
        this,
        randomUnit,
        spawnX,
        spawnY,
        "enemy",
        isWeak
      );

      this.units.push(unit);
    }
    soundManager.playEnemySpawn();
  }

  // Keep old method for backward compatibility if needed elsewhere
  private spawnEnemyUnit(): void {
    // Simple AI: randomly pick a unit type
    const randomUnit =
      GAME_CONFIG.units[Math.floor(Math.random() * GAME_CONFIG.units.length)];
    const isWeak = false; // Enemy always normal strength

    const unit = UnitHelpers.createUnit(
      this,
      randomUnit,
      3000, // Enemy start position - moved left from base
      400, // Lane center (full screen)
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

    // Check cooldown
    const currentTime = this.time.now;
    const lastCast = this.spellCooldowns.get(spellId) || 0;
    const cooldownTime = spellConfig.cooldownSeconds * 1000;

    if (currentTime - lastCast < cooldownTime) {
      return false; // Still on cooldown
    }

    // Trigger a quiz!
    if (this.onRequestSpellQuiz) {
      console.log(`🧙‍♂️ Casting spell ${spellConfig.name} - quiz required!`);

      // Set spell quiz as active
      this.isSpellQuizActive = true;

      this.onRequestSpellQuiz(spellId, (correct: boolean) => {
        console.log(`🧙‍♂️ Spell quiz callback received: correct = ${correct}`);
        console.log(
          `✨ Spell quiz result: ${correct ? "SUCCESS" : "BACKFIRE"}`
        );

        // Reset spell quiz state
        this.isSpellQuizActive = false;

        // Set cooldown regardless of success/failure
        this.spellCooldowns.set(spellId, this.time.now);

        if (correct) {
          // Cast spell on enemies (normal effect)
          console.log("✅ Spell SUCCESS - targeting enemies");
          this.executeSpell(spellId, false); // false = not backfired
        } else {
          // BACKFIRE! Cast spell on player instead
          console.log("💥 SPELL BACKFIRED! Casting on player!");
          this.executeSpell(spellId, true); // true = backfired
        }

        this.updateGameState();
      });

      return true; // Quiz was triggered successfully
    }

    return false;
  }

  private executeSpell(spellId: string, backfired: boolean): void {
    const targetTeam = backfired ? "player" : "enemy";
    console.log(`🎯 Executing ${spellId} on ${targetTeam} units`);

    // Apply spell effect based on ID
    switch (spellId) {
      case "freeze":
        // Freeze units for 3 seconds
        console.log(`❄️ Freezing ${targetTeam} units only`);
        let frozenCount = 0;
        this.units.forEach((unit) => {
          if (unit.team === targetTeam) {
            unit.isFrozen = true;
            frozenCount++;
            console.log(
              `🧊 Freezing ${unit.team} unit at (${unit.x}, ${unit.y})`
            );

            // Add blue freeze effect to the ship
            UnitHelpers.addFreezeEffect(unit);

            // Unfreeze after 3 seconds
            this.time.delayedCall(3000, () => {
              if (unit && !UnitHelpers.isUnitDead(unit)) {
                unit.isFrozen = false;
                // Remove freeze effect from ship
                UnitHelpers.removeFreezeEffect(unit);
                console.log(`🔥 Unfrozen ${unit.team} unit`);
              }
            });
          }
        });
        console.log(
          `❄️ Total frozen units: ${frozenCount} (${targetTeam} team)`
        );

        // Create freeze visual effect only if targeting enemies
        if (!backfired) {
          console.log("🌨️ Creating screen freeze effect (targeting enemies)");
          this.createFreezeEffect();
        } else {
          console.log("💥 No screen freeze effect (spell backfired)");
        }
        soundManager.playSpellCast();
        break;

      case "meteor":
        // Meteor strike on units
        console.log(`☄️ Meteor spell case - backfired = ${backfired}`);
        this.createMeteorStrike(backfired);
        soundManager.playSpellCast();
        break; 

      default:
        break;
    }
  }

  private updateGameState(): void {
    if (this.onGameStateUpdate) {
      this.onGameStateUpdate({ ...this.gameState });
    }
  }
}
