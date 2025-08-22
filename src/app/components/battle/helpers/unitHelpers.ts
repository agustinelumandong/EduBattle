import * as Phaser from "phaser";
import type { UnitConfig } from "../../../data/game-config";

export interface BattleUnit extends Phaser.GameObjects.Graphics {
  body: Phaser.Physics.Matter.Sprite["body"];
  unitId: string;
  unitType: string;
  team: "player" | "enemy";
  hp: number;
  maxHp: number;
  dps: number;
  range: number;
  speed: number;
  isWrongAnswer: boolean;
  lastAttackTime: number;
  isFrozen?: boolean; // New property for freeze spell
  freezeOverlay?: Phaser.GameObjects.Graphics; // Visual freeze effect
  target?: BattleUnit;
  healthBar?: Phaser.GameObjects.Graphics;
}

export class UnitHelpers {
  static createUnit(
    scene: Phaser.Scene,
    config: UnitConfig,
    x: number,
    y: number,
    team: "player" | "enemy",
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
      shape: { type: "circle", radius: 20 }, // Bigger collision for bigger ships
      isStatic: false,
      isSensor: false,
    });

    return graphics;
  }

  static drawUnit(
    unit: BattleUnit,
    config: UnitConfig,
    isWrongAnswer: boolean
  ): void {
    unit.clear();

    const baseColor = UnitHelpers.getUnitColor(config.subject);
    const randomColor = UnitHelpers.getRandomShipColor(baseColor, unit.team);
    const color = isWrongAnswer ? 0x666666 : randomColor; // Gray for wrong answers, random for others
    const size = isWrongAnswer ? 16 : 20; // Much bigger spaceships!

    // Draw retro spaceship based on unit type
    UnitHelpers.drawRetroSpaceship(unit, config.id, color, size, unit.team);
  }

  static drawRetroSpaceship(
    graphics: Phaser.GameObjects.Graphics,
    unitType: string,
    color: number,
    size: number,
    team: "player" | "enemy"
  ): void {
    const direction = team === "player" ? 1 : -1; // Player ships face right, enemy left

    graphics.fillStyle(color, 0.9);
    graphics.lineStyle(1, 0xffffff, 0.8);

    switch (unitType) {
      case "knight":
        // Heavy Fighter Spaceship - Math Knight
        UnitHelpers.drawHeavyFighter(graphics, size, direction);
        break;

      case "mage":
        // Energy Cruiser - Science Mage
        UnitHelpers.drawEnergyCruiser(graphics, size, direction);
        break;

      case "archer":
        // Scout Ship - History Archer
        UnitHelpers.drawScoutShip(graphics, size, direction);
        break;

      default:
        // Default basic ship
        UnitHelpers.drawBasicShip(graphics, size, direction);
    }

    // Add engine trail effect
    UnitHelpers.drawEngineTrail(graphics, size, direction);
  }

  static drawHeavyFighter(
    graphics: Phaser.GameObjects.Graphics,
    size: number,
    direction: number
  ): void {
    // Main hull - rectangular and chunky
    graphics.fillRect(-size * direction, -size * 0.6, size * 1.8, size * 1.2);
    graphics.strokeRect(-size * direction, -size * 0.6, size * 1.8, size * 1.2);

    // Cockpit
    graphics.fillStyle(0x87ceeb, 0.8);
    graphics.fillRect(
      size * 0.3 * direction,
      -size * 0.3,
      size * 0.4,
      size * 0.6
    );

    // Wings
    graphics.fillStyle(0x666666, 0.8);
    graphics.fillRect(
      -size * 0.2 * direction,
      -size * 1.2,
      size * 0.6,
      size * 0.6
    );
    graphics.fillRect(
      -size * 0.2 * direction,
      size * 0.6,
      size * 0.6,
      size * 0.6
    );
  }

  static drawEnergyCruiser(
    graphics: Phaser.GameObjects.Graphics,
    size: number,
    direction: number
  ): void {
    // Main hull - sleek and elongated
    graphics.fillEllipse(0, 0, size * 2, size * 0.8);
    graphics.strokeEllipse(0, 0, size * 2, size * 0.8);

    // Energy core
    graphics.fillStyle(0x00ffff, 0.9);
    graphics.fillCircle(0, 0, size * 0.3);

    // Energy wings
    graphics.fillStyle(0x4169e1, 0.7);
    graphics.fillRect(
      -size * 0.8 * direction,
      -size * 0.9,
      size * 0.4,
      size * 0.4
    );
    graphics.fillRect(
      -size * 0.8 * direction,
      size * 0.5,
      size * 0.4,
      size * 0.4
    );
  }

  static drawScoutShip(
    graphics: Phaser.GameObjects.Graphics,
    size: number,
    direction: number
  ): void {
    // Main hull - sleek elongated diamond shape
    graphics.fillRect(
      -size * 0.8 * direction,
      -size * 0.4,
      size * 1.6,
      size * 0.8
    );
    graphics.strokeRect(
      -size * 0.8 * direction,
      -size * 0.4,
      size * 1.6,
      size * 0.8
    );

    // Pointed nose
    graphics.fillRect(
      size * 0.8 * direction,
      -size * 0.2,
      size * 0.4,
      size * 0.4
    );

    // Wing extensions
    graphics.fillStyle(0x888888, 0.8);
    graphics.fillRect(
      -size * 0.6 * direction,
      -size * 0.8,
      size * 0.8,
      size * 0.3
    );
    graphics.fillRect(
      -size * 0.6 * direction,
      size * 0.5,
      size * 0.8,
      size * 0.3
    );

    // Scanner dome (instead of array)
    graphics.fillStyle(0xff6b6b, 0.8);
    graphics.fillCircle(-size * 0.2 * direction, 0, size * 0.25);

    // Navigation lights
    graphics.fillStyle(0x00ff00, 0.9);
    graphics.fillRect(
      -size * 0.4 * direction,
      -size * 0.6,
      size * 0.1,
      size * 0.1
    );
    graphics.fillStyle(0xff0000, 0.9);
    graphics.fillRect(
      -size * 0.4 * direction,
      size * 0.5,
      size * 0.1,
      size * 0.1
    );
  }

  static drawBasicShip(
    graphics: Phaser.GameObjects.Graphics,
    size: number,
    direction: number
  ): void {
    // Simple rectangular ship
    graphics.fillRect(-size * direction, -size * 0.5, size * 1.5, size);
    graphics.strokeRect(-size * direction, -size * 0.5, size * 1.5, size);
  }

  static drawEngineTrail(
    graphics: Phaser.GameObjects.Graphics,
    size: number,
    direction: number
  ): void {
    // Engine glow trail
    const trailLength = size * 0.8;
    const trailX = -size * 1.2 * direction;

    graphics.fillStyle(0xff4500, 0.6);
    graphics.fillRect(trailX, -size * 0.2, trailLength, size * 0.4);

    // Inner bright trail
    graphics.fillStyle(0xffff00, 0.8);
    graphics.fillRect(trailX, -size * 0.1, trailLength * 0.6, size * 0.2);
  }

  static updateHealthBar(unit: BattleUnit): void {
    if (!unit.healthBar) return;

    unit.healthBar.clear();

    const barWidth = 40; // Bigger health bars for bigger ships
    const barHeight = 6;
    const x = unit.x - barWidth / 2;
    const y = unit.y - 35; // Position higher above bigger ships

    // Background
    unit.healthBar.fillStyle(0x000000, 0.5);
    unit.healthBar.fillRect(x, y, barWidth, barHeight);

    // Health fill
    const healthPercent = unit.hp / unit.maxHp;
    const healthColor =
      healthPercent > 0.5
        ? 0x00ff00
        : healthPercent > 0.25
        ? 0xffff00
        : 0xff0000;

    unit.healthBar.fillStyle(healthColor, 0.8);
    unit.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);

    // Border
    unit.healthBar.lineStyle(1, 0xffffff);
    unit.healthBar.strokeRect(x, y, barWidth, barHeight);
  }

  static getUnitColor(subject: string): number {
    switch (subject) {
      case "math":
        return 0x3b82f6; // Blue
      case "science":
        return 0x10b981; // Green
      case "history":
        return 0xf59e0b; // Amber
      case "language":
        return 0x8b5cf6; // Purple
      default:
        return 0x6b7280; // Gray
    }
  }

  static getRandomShipColor(
    baseColor: number,
    team: "player" | "enemy"
  ): number {
    const colorVariations = [
      // Bright and diverse colors for chaos!
      0xff6b6b, // Red
      0x4ecdc4, // Teal
      0x45b7d1, // Sky Blue
      0x96ceb4, // Mint Green
      0xfeca57, // Yellow
      0xff9ff3, // Pink
      0x54a0ff, // Blue
      0x5f27cd, // Purple
      0x00d2d3, // Cyan
      0xff9f43, // Orange
      0xa55eea, // Violet
      0x26de81, // Green
      0xfd79a8, // Hot Pink
      0xe17055, // Coral
      0x74b9ff, // Light Blue
      0x6c5ce7, // Indigo
      0xa29bfe, // Lavender
      0xfd63a3, // Magenta
      0x00b894, // Emerald
      0xe84393, // Rose
    ];

    // For enemy ships, add some darker/more menacing variations
    if (team === "enemy") {
      const enemyColors = [
        0x8b0000, // Dark Red
        0x2f1b69, // Dark Purple
        0x1e3799, // Dark Blue
        0x40407a, // Dark Gray-Blue
        0x706fd3, // Purple-Gray
        0x2c2c54, // Very Dark Blue
        0x40394a, // Dark Purple-Gray
        ...colorVariations,
      ];
      return enemyColors[Math.floor(Math.random() * enemyColors.length)];
    }

    // For player ships, use the full bright palette
    return colorVariations[Math.floor(Math.random() * colorVariations.length)];
  }

  static moveUnit(unit: BattleUnit, deltaTime: number): void {
    if (!unit.body || unit.isFrozen) return; // Don't move if frozen

    const direction = unit.team === "player" ? 1 : -1;
    const velocity = (unit.speed * deltaTime) / 1000;

    unit.setPosition(unit.x + velocity * direction, unit.y);

    // Update health bar position
    if (unit.healthBar) {
      UnitHelpers.updateHealthBar(unit);
    }

    // Update freeze effect position
    UnitHelpers.updateFreezeEffect(unit);
  }

  static findTarget(
    unit: BattleUnit,
    allUnits: BattleUnit[]
  ): BattleUnit | null {
    const enemyTeam = unit.team === "player" ? "enemy" : "player";
    const enemies = allUnits.filter((u) => u.team === enemyTeam && u.hp > 0);

    if (enemies.length === 0) return null;

    // Find closest enemy within range
    let closestEnemy: BattleUnit | null = null;
    let closestDistance = unit.range * 60; // Bigger range for bigger ships

    for (const enemy of enemies) {
      const distance = Phaser.Math.Distance.Between(
        unit.x,
        unit.y,
        enemy.x,
        enemy.y
      );
      if (distance <= closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    }

    return closestEnemy;
  }

  static attackTarget(
    unit: BattleUnit,
    target: BattleUnit,
    currentTime: number
  ): boolean {
    const attackCooldown = 1000; // 1 second between attacks

    // Don't attack if frozen
    if (unit.isFrozen || currentTime - unit.lastAttackTime < attackCooldown) {
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

    // Create different projectiles based on unit type
    switch (attacker.unitType) {
      case "knight":
        UnitHelpers.createLaserProjectile(attacker, target);
        break;
      case "mage":
        UnitHelpers.createEnergyBall(attacker, target);
        break;
      case "archer":
        UnitHelpers.createMissile(attacker, target);
        break;
      default:
        UnitHelpers.createBasicProjectile(attacker, target);
    }
  }

  static createLaserProjectile(attacker: BattleUnit, target: BattleUnit): void {
    const scene = attacker.scene;

    // Capture target position before animation starts
    const targetX = target.x;
    const targetY = target.y;

    // Create thick laser beam
    const laser = scene.add.graphics();
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0xffff00, 0x00ffff];
    const laserColor = colors[Math.floor(Math.random() * colors.length)];

    laser.lineStyle(4, laserColor, 0.9);
    laser.lineBetween(attacker.x, attacker.y, targetX, targetY);

    // Add inner bright core
    laser.lineStyle(2, 0xffffff, 1);
    laser.lineBetween(attacker.x, attacker.y, targetX, targetY);

    // Fade out quickly
    scene.tweens.add({
      targets: laser,
      alpha: 0,
      duration: 150,
      onComplete: () => laser.destroy(),
    });
  }

  static createEnergyBall(attacker: BattleUnit, target: BattleUnit): void {
    const scene = attacker.scene;

    // Capture target position before animation starts
    const targetX = target.x;
    const targetY = target.y;

    // Create energy ball projectile
    const energyBall = scene.add.graphics();
    const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xff6600, 0x6600ff];
    const ballColor = colors[Math.floor(Math.random() * colors.length)];

    energyBall.fillStyle(ballColor, 0.8);
    energyBall.fillCircle(0, 0, 6);
    energyBall.lineStyle(2, 0xffffff, 0.9);
    energyBall.strokeCircle(0, 0, 6);

    energyBall.setPosition(attacker.x, attacker.y);

    // Animate to target using captured position
    scene.tweens.add({
      targets: energyBall,
      x: targetX,
      y: targetY,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        // Create explosion effect at captured position
        UnitHelpers.createExplosion(scene, targetX, targetY, ballColor);
        energyBall.destroy();
      },
    });

    // Add spinning animation
    scene.tweens.add({
      targets: energyBall,
      rotation: Math.PI * 4,
      duration: 300,
      ease: "Linear",
    });
  }

  static createMissile(attacker: BattleUnit, target: BattleUnit): void {
    const scene = attacker.scene;

    // Capture target position before animation starts
    const targetX = target.x;
    const targetY = target.y;

    // Create missile projectile
    const missile = scene.add.graphics();
    const colors = [0xff4500, 0xff6347, 0xdc143c, 0xb22222, 0xff1493];
    const missileColor = colors[Math.floor(Math.random() * colors.length)];

    // Missile body
    missile.fillStyle(missileColor, 0.9);
    missile.fillRect(-4, -2, 8, 4);
    missile.lineStyle(1, 0xffffff, 0.8);
    missile.strokeRect(-4, -2, 8, 4);

    // Missile trail
    missile.fillStyle(0xffff00, 0.6);
    missile.fillRect(-8, -1, 4, 2);

    missile.setPosition(attacker.x, attacker.y);

    // Calculate angle to target using captured position
    const angle = Phaser.Math.Angle.Between(
      attacker.x,
      attacker.y,
      targetX,
      targetY
    );
    missile.setRotation(angle);

    // Animate to target with slight curve using captured position
    const midX = (attacker.x + targetX) / 2 + (Math.random() - 0.5) * 50;
    const midY = (attacker.y + targetY) / 2 + (Math.random() - 0.5) * 50;

    // First part of trajectory
    scene.tweens.add({
      targets: missile,
      x: midX,
      y: midY,
      duration: 200,
      ease: "Power1",
      onComplete: () => {
        // Second part to target using captured position
        scene.tweens.add({
          targets: missile,
          x: targetX,
          y: targetY,
          duration: 200,
          ease: "Power2",
          onComplete: () => {
            UnitHelpers.createExplosion(scene, targetX, targetY, missileColor);
            missile.destroy();
          },
        });
      },
    });
  }

  static createBasicProjectile(attacker: BattleUnit, target: BattleUnit): void {
    const scene = attacker.scene;

    // Capture target position before animation starts
    const targetX = target.x;
    const targetY = target.y;

    // Simple but colorful projectile
    const projectile = scene.add.graphics();
    const colors = [0xff69b4, 0x32cd32, 0xff4500, 0x1e90ff, 0xffd700, 0x9370db];
    const color = colors[Math.floor(Math.random() * colors.length)];

    projectile.fillStyle(color, 0.8);
    projectile.fillCircle(0, 0, 3);
    projectile.setPosition(attacker.x, attacker.y);

    scene.tweens.add({
      targets: projectile,
      x: targetX,
      y: targetY,
      duration: 250,
      ease: "Linear",
      onComplete: () => projectile.destroy(),
    });
  }

  static createExplosion(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: number
  ): void {
    // Create explosion particles
    for (let i = 0; i < 8; i++) {
      const particle = scene.add.graphics();
      particle.fillStyle(color, 0.8);
      particle.fillCircle(0, 0, Math.random() * 3 + 2);
      particle.setPosition(x, y);

      const angle = (Math.PI * 2 * i) / 8;
      const distance = Math.random() * 30 + 20;

      scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 400,
        ease: "Power2",
        onComplete: () => particle.destroy(),
      });
    }
  }

  static isUnitDead(unit: BattleUnit): boolean {
    return unit.hp <= 0;
  }

  static destroyUnit(unit: BattleUnit): void {
    if (unit.healthBar) {
      unit.healthBar.destroy();
    }
    if (unit.freezeOverlay) {
      unit.freezeOverlay.destroy();
    }
    unit.destroy();
  }

  static addFreezeEffect(unit: BattleUnit): void {
    // Don't add if already frozen
    if (unit.freezeOverlay) return;

    // Create blue freeze overlay on the ship
    unit.freezeOverlay = unit.scene.add.graphics();
    unit.freezeOverlay.setPosition(unit.x, unit.y);

    // Draw blue ice effect around the ship
    unit.freezeOverlay.fillStyle(0x87ceeb, 0.4); // Light blue
    unit.freezeOverlay.fillCircle(0, 0, 25); // Bigger than ship

    // Add ice crystal outline
    unit.freezeOverlay.lineStyle(2, 0xffffff, 0.8);
    unit.freezeOverlay.strokeCircle(0, 0, 25);

    // Add ice crystal details
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const x1 = Math.cos(angle) * 15;
      const y1 = Math.sin(angle) * 15;
      const x2 = Math.cos(angle) * 25;
      const y2 = Math.sin(angle) * 25;
      unit.freezeOverlay.lineBetween(x1, y1, x2, y2);
    }

    // Add pulsing animation
    unit.scene.tweens.add({
      targets: unit.freezeOverlay,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  static removeFreezeEffect(unit: BattleUnit): void {
    if (unit.freezeOverlay) {
      unit.freezeOverlay.destroy();
      unit.freezeOverlay = undefined;
    }
  }

  static updateFreezeEffect(unit: BattleUnit): void {
    if (unit.freezeOverlay) {
      unit.freezeOverlay.setPosition(unit.x, unit.y);
    }
  }
}
