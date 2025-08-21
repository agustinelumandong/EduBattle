import * as Phaser from "phaser";
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";

const gameConfig: Phaser.Types.Core.GameConfig = {
  width: 3200, // 4× the original viewport width (800 × 4)
  height: 800, // Increased height for full screen
  type: Phaser.AUTO,
  backgroundColor: "#000000", // Black space background
  physics: {
    default: "matter",
    matter: {
      gravity: { x: 0, y: 0 }, // No gravity for top-down battle
      debug: false,
    },
  },
  plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin,
        key: "matterCollision",
        mapping: "matterCollision",
      },
    ],
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: "100%",
    height: "100%",
  },
  fps: { target: 60, forceSetTimeOut: true },
  input: {
    gamepad: false,
    mouse: true,
    touch: true,
    keyboard: true, // Enable keyboard for camera controls,
  },
};

export default gameConfig;
