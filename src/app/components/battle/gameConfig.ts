import * as Phaser from 'phaser';
import PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin';

const gameConfig: Phaser.Types.Core.GameConfig = {
  width: 1000,
  height: 400,
  type: Phaser.AUTO,
  backgroundColor: '#2D5016',
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 0 }, // No gravity for top-down battle
      debug: false
    }
  },
  plugins: {
    scene: [
      { plugin: PhaserMatterCollisionPlugin, key: 'matterCollision', mapping: 'matterCollision' }
    ]
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 400
  },
  fps: { target: 60, forceSetTimeOut: true },
  input: {
    gamepad: false,
    mouse: true,
    touch: true,
    keyboard: false
  }
};

export default gameConfig;