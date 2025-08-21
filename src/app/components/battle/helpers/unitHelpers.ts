import * as Phaser from 'phaser';
import type { UnitConfig } from '../../../data/game-config';

export interface BattleUnit extends Phaser.GameObjects.Graphics {
  unitId: string;
  unitType: string;
  team: 'player' | 'enemy';
  hp: number;
  maxHp: number;
  dps: number;
  range: number;
  speed: number;
  isWrongAnswer: boolean;
  lastAttackTime: number;
  target?: BattleUnit;
  healthBar?: Phaser.GameObjects.Graphics;
}

export class UnitHelpers {
  static createUnit(
    scene: Phaser.Scene,
    config: UnitConfig,
    x: number,
    y: number,
    team: 'player' | 'enemy',
    isWrongAnswer: boolean = false
  ): BattleUnit {
    const graphics = scene.add.graphics() as BattleUnit;
    
    // Apply wrong answer modifiers
    const hpMod = isWrongAnswer ? config.wrongMod.hp : 1;
    const dpsMod = isWrongAnswer ? config.wrongMod.dps : 1;
    
    // Initialize unit properties
    graphics.unitId = `${config.id}_${Date.now()}_${Math.random()}`;
    graphics.unitType = config.id;
    graphics.team = team;
    graphics.maxHp = Math.floor(config.hp * hpMod);
    graphics.hp = graphics.maxHp;
    graphics.dps = Math.floor(config.dps * dpsMod);
    graphics.range = config.range || 1;
    graphics.speed = config.speed;
    graphics.isWrongAnswer = isWrongAnswer;
    graphics.lastAttackTime = 0;
    
    graphics.setPosition(x, y);
    
    // Draw unit based on type
    UnitHelpers.drawUnit(graphics, config, isWrongAnswer);
    
    // Create health bar
    graphics.healthBar = scene.add.graphics();
    UnitHelpers.updateHealthBar(graphics);
    
    // Add physics
    scene.matter.add.gameObject(graphics, {
      shape: { type: 'circle', radius: 12 },
      isStatic: false,
      isSensor: false
    });
    
    return graphics;
  }
  
  static drawUnit(unit: BattleUnit, config: UnitConfig, isWrongAnswer: boolean): void {
    unit.clear();
    
    const baseColor = UnitHelpers.getUnitColor(config.subject);
    const color = isWrongAnswer ? 0x666666 : baseColor; // Gray for wrong answers
    const size = isWrongAnswer ? 10 : 12; // Smaller for wrong answers
    
    unit.fillStyle(color, 0.8);
    unit.strokeLineWidth(2);
    unit.lineStyle(2, 0x000000);
    
    switch (config.id) {
      case 'knight':
        // Shield and sword shape
        unit.fillRect(-size, -size, size * 2, size * 2);
        unit.strokeRect(-size, -size, size * 2, size * 2);
        // Shield detail
        unit.fillStyle(0xC0C0C0, 0.6);
        unit.fillRect(-size * 0.5, -size * 0.8, size, size * 0.4);
        break;
        
      case 'mage':
        // Circular mage with staff
        unit.fillCircle(0, 0, size);
        unit.strokeCircle(0, 0, size);
        // Staff
        unit.lineStyle(3, 0x8B4513);
        unit.lineBetween(0, -size, 0, -size * 1.5);
        // Orb on top
        unit.fillStyle(0x00FFFF, 0.8);
        unit.fillCircle(0, -size * 1.5, 3);
        break;
        
      case 'archer':
        // Triangle archer shape
        unit.fillTriangle(-size, size, size, size, 0, -size);
        unit.strokeTriangle(-size, size, size, size, 0, -size);
        // Bow
        unit.lineStyle(2, 0x8B4513);
        unit.strokeEllipse(size * 0.5, 0, 8, 16);
        break;
        
      default:
        // Default circle
        unit.fillCircle(0, 0, size);
        unit.strokeCircle(0, 0, size);
    }
    
    // Add subject icon
    const iconSize = size * 0.5;
    unit.fillStyle(0xFFFFFF, 1);
    unit.fillCircle(0, 0, iconSize);
    unit.strokeCircle(0, 0, iconSize);
  }
  
  static updateHealthBar(unit: BattleUnit): void {
    if (!unit.healthBar) return;
    
    unit.healthBar.clear();
    
    const barWidth = 24;
    const barHeight = 4;
    const x = unit.x - barWidth / 2;
    const y = unit.y - 20;
    
    // Background
    unit.healthBar.fillStyle(0x000000, 0.5);
    unit.healthBar.fillRect(x, y, barWidth, barHeight);
    
    // Health fill
    const healthPercent = unit.hp / unit.maxHp;
    const healthColor = healthPercent > 0.5 ? 0x00FF00 : 
                       healthPercent > 0.25 ? 0xFFFF00 : 0xFF0000;
    
    unit.healthBar.fillStyle(healthColor, 0.8);
    unit.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);
    
    // Border
    unit.healthBar.lineStyle(1, 0xFFFFFF);
    unit.healthBar.strokeRect(x, y, barWidth, barHeight);
  }
  
  static getUnitColor(subject: string): number {
    switch (subject) {
      case 'math': return 0x3B82F6; // Blue
      case 'science': return 0x10B981; // Green
      case 'history': return 0xF59E0B; // Amber
      case 'language': return 0x8B5CF6; // Purple
      default: return 0x6B7280; // Gray
    }
  }
  
  static moveUnit(unit: BattleUnit, deltaTime: number): void {
    if (!unit.body) return;
    
    const direction = unit.team === 'player' ? 1 : -1;
    const velocity = (unit.speed * deltaTime) / 1000;
    
    unit.setPosition(unit.x + (velocity * direction), unit.y);
    
    // Update health bar position
    if (unit.healthBar) {
      UnitHelpers.updateHealthBar(unit);
    }
  }
  
  static findTarget(unit: BattleUnit, allUnits: BattleUnit[]): BattleUnit | null {
    const enemyTeam = unit.team === 'player' ? 'enemy' : 'player';
    const enemies = allUnits.filter(u => u.team === enemyTeam && u.hp > 0);
    
    if (enemies.length === 0) return null;
    
    // Find closest enemy within range
    let closestEnemy: BattleUnit | null = null;
    let closestDistance = unit.range * 50; // Convert range to pixels
    
    for (const enemy of enemies) {
      const distance = Phaser.Math.Distance.Between(unit.x, unit.y, enemy.x, enemy.y);
      if (distance <= closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    }
    
    return closestEnemy;
  }
  
  static attackTarget(unit: BattleUnit, target: BattleUnit, currentTime: number): boolean {
    const attackCooldown = 1000; // 1 second between attacks
    
    if (currentTime - unit.lastAttackTime < attackCooldown) {
      return false;
    }
    
    // Deal damage
    target.hp = Math.max(0, target.hp - unit.dps);
    unit.lastAttackTime = currentTime;
    
    // Update target's health bar
    UnitHelpers.updateHealthBar(target);
    
    // Visual attack effect
    UnitHelpers.createAttackEffect(unit, target);
    
    return true;
  }
  
  static createAttackEffect(attacker: BattleUnit, target: BattleUnit): void {
    if (!attacker.scene) return;
    
    const line = attacker.scene.add.graphics();
    line.lineStyle(2, 0xFFFF00, 0.8);
    line.lineBetween(attacker.x, attacker.y, target.x, target.y);
    
    // Fade out the attack line
    attacker.scene.tweens.add({
      targets: line,
      alpha: 0,
      duration: 200,
      onComplete: () => line.destroy()
    });
  }
  
  static isUnitDead(unit: BattleUnit): boolean {
    return unit.hp <= 0;
  }
  
  static destroyUnit(unit: BattleUnit): void {
    if (unit.healthBar) {
      unit.healthBar.destroy();
    }
    unit.destroy();
  }
}