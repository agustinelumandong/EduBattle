import * as Phaser from 'phaser';
import { UnitHelpers, type BattleUnit } from './helpers/unitHelpers';
import { soundManager } from './helpers/soundManager';
import { GAME_CONFIG } from '../../data/game-config';

export interface GameState {
  playerGold: number;
  playerBaseHp: number;
  enemyBaseHp: number;
  matchTimeLeft: number;
  isGameOver: boolean;
  winner?: 'player' | 'enemy';
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
  private lastTime: number = 0;
  
  // Callbacks for React components
  public onGameStateUpdate?: (state: GameState) => void;
  public onRequestQuiz?: (unitType: string, callback: (correct: boolean) => void) => void;
  
  constructor() {
    super('BattleScene');
  }
  
  create() {
    // Initialize sound
    soundManager.init();
    
    // Create battlefield background
    this.createBattlefield();
    
    // Create bases
    this.createBases();
    
    // Start gold income timer
    this.startGoldIncome();
    
    // Start match timer
    this.startMatchTimer();
    
    // Add input handling
    this.setupInput();
    
    // Start game loop
    this.startGameLoop();
  }
  
  private createBattlefield(): void {
    // Background
    this.add.rectangle(400, 200, 800, 400, 0x2D5016);
    
    // Lane lines
    this.add.line(400, 150, 0, 0, 800, 0, 0x4A5D23, 2);
    this.add.line(400, 250, 0, 0, 800, 0, 0x4A5D23, 2);
    
    // Center line
    this.add.line(400, 200, 0, 0, 0, 400, 0x6B7280, 2);
  }
  
  private createBases(): void {
    // Player base (left)
    this.playerBase = this.add.graphics();
    this.drawBase(this.playerBase, 50, 200, 'player');
    
    // Enemy base (right)
    this.enemyBase = this.add.graphics();
    this.drawBase(this.enemyBase, 750, 200, 'enemy');
  }
  
  private drawBase(graphics: Phaser.GameObjects.Graphics, x: number, y: number, team: 'player' | 'enemy'): void {
    graphics.setPosition(x, y);
    graphics.clear();
    
    const color = team === 'player' ? 0x00FFFF : 0xFF00FF;
    const hpPercent = team === 'player' 
      ? this.gameState.playerBaseHp / GAME_CONFIG.battle.baseMaxHealth
      : this.gameState.enemyBaseHp / GAME_CONFIG.battle.baseMaxHealth;
    
    // Base crystal
    graphics.fillStyle(color, 0.8);
    graphics.fillRect(-25, -40, 50, 80);
    graphics.lineStyle(3, 0xFFFFFF);
    graphics.strokeRect(-25, -40, 50, 80);
    
    // Health indicator
    const healthColor = hpPercent > 0.5 ? 0x00FF00 : 
                       hpPercent > 0.25 ? 0xFFFF00 : 0xFF0000;
    graphics.fillStyle(healthColor, 0.6);
    graphics.fillRect(-20, -35, 40 * hpPercent, 10);
    
    // Pulsing effect
    this.tweens.add({
      targets: graphics,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  private startGoldIncome(): void {
    this.goldTimer = this.time.addEvent({
      delay: 1000, // Every second
      callback: () => {
        this.gameState.playerGold += GAME_CONFIG.economy.goldPerSecond;
        this.updateGameState();
      },
      loop: true
    });
  }
  
  private startMatchTimer(): void {
    this.matchTimer = this.time.addEvent({
      delay: 1000, // Every second
      callback: () => {
        this.gameState.matchTimeLeft = Math.max(0, this.gameState.matchTimeLeft - 1);
        
        if (this.gameState.matchTimeLeft <= 0) {
          this.endGame('time');
        }
        
        this.updateGameState();
      },
      loop: true
    });
  }
  
  private setupInput(): void {
    // Click to deploy units (will be handled by React UI)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // This will be handled by the UI overlay
    });
  }
  
  private startGameLoop(): void {
    this.time.addEvent({
      delay: 16, // ~60 FPS
      callback: () => this.updateGame(),
      loop: true
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
    this.units = this.units.filter(unit => {
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
        unit.target = UnitHelpers.findTarget(unit, this.units);
      }
      
      if (unit.target) {
        // Attack if in range
        const distance = Phaser.Math.Distance.Between(unit.x, unit.y, unit.target.x, unit.target.y);
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
        const enemyBaseX = unit.team === 'player' ? 750 : 50;
        if (Math.abs(unit.x - enemyBaseX) < 30) {
          this.damageBase(unit.team === 'player' ? 'enemy' : 'player', unit.dps);
          UnitHelpers.destroyUnit(unit);
          this.units = this.units.filter(u => u !== unit);
        }
      }
    }
  }
  
  private damageBase(team: 'player' | 'enemy', damage: number): void {
    if (team === 'player') {
      this.gameState.playerBaseHp = Math.max(0, this.gameState.playerBaseHp - damage);
    } else {
      this.gameState.enemyBaseHp = Math.max(0, this.gameState.enemyBaseHp - damage);
    }
    
    soundManager.playBaseHit();
    this.updateBases();
    this.updateGameState();
  }
  
  private updateBases(): void {
    if (this.playerBase) {
      this.drawBase(this.playerBase, 50, 200, 'player');
    }
    if (this.enemyBase) {
      this.drawBase(this.enemyBase, 750, 200, 'enemy');
    }
  }
  
  private checkWinConditions(): void {
    if (this.gameState.playerBaseHp <= 0) {
      this.endGame('enemy');
    } else if (this.gameState.enemyBaseHp <= 0) {
      this.endGame('player');
    }
  }
  
  private endGame(winner: 'player' | 'enemy' | 'time'): void {
    this.gameState.isGameOver = true;
    
    if (winner === 'time') {
      // Sudden death: higher HP wins
      this.gameState.winner = this.gameState.playerBaseHp > this.gameState.enemyBaseHp ? 'player' : 'enemy';
    } else {
      this.gameState.winner = winner;
    }
    
    // Stop timers
    if (this.goldTimer) this.goldTimer.destroy();
    if (this.matchTimer) this.matchTimer.destroy();
    
    // Play victory sound
    if (this.gameState.winner === 'player') {
      soundManager.playVictory();
    }
    
    this.updateGameState();
  }
  
  // Public methods for React components
  public deployUnit(unitType: string, isCorrect: boolean): void {
    const unitConfig = GAME_CONFIG.units.find(u => u.id === unitType);
    if (!unitConfig) return;
    
    // Check if player has enough gold
    if (this.gameState.playerGold < unitConfig.cost) return;
    
    // Deduct gold
    this.gameState.playerGold -= unitConfig.cost;
    
    // Add bonus/penalty gold
    if (isCorrect) {
      this.gameState.playerGold += GAME_CONFIG.economy.correctBonus;
    } else {
      this.gameState.playerGold = Math.max(0, this.gameState.playerGold - GAME_CONFIG.economy.wrongPenalty);
    }
    
    // Spawn unit
    const unit = UnitHelpers.createUnit(
      this,
      unitConfig,
      100, // Start position
      200, // Lane center
      'player',
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
    const randomUnit = GAME_CONFIG.units[Math.floor(Math.random() * GAME_CONFIG.units.length)];
    const isWeak = Math.random() < 0.3; // 30% chance of weak unit
    
    const unit = UnitHelpers.createUnit(
      this,
      randomUnit,
      700, // Enemy start position
      200,
      'enemy',
      isWeak
    );
    
    this.units.push(unit);
  }
  
  public getGameState(): GameState {
    return { ...this.gameState };
  }
  
  private updateGameState(): void {
    if (this.onGameStateUpdate) {
      this.onGameStateUpdate({ ...this.gameState });
    }
  }
}