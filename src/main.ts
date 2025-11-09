import { VoxelGameEngine } from './core/VoxelGameEngine';
import { VoxelUIManager } from './ui/VoxelUIManager';

// Extend Window interface for debugging
declare global {
  interface Window {
    game?: VoxelGameEngine;
    ui?: VoxelUIManager;
  }
}

// Main entry point
function init(): void {
  console.log('🌍 Creator of Worlds - Initializing...');

  // Get canvas element
  const canvas = document.createElement('canvas');
  const container = document.getElementById('canvas-container');
  
  if (!container) {
    console.error('Canvas container not found!');
    return;
  }

  container.insertBefore(canvas, container.firstChild);

  // Initialize voxel game engine
  const gameEngine = new VoxelGameEngine(canvas);
  console.log('✅ Voxel game engine initialized');

  // Initialize UI manager
  const uiManager = new VoxelUIManager(gameEngine);
  console.log('✅ UI manager initialized');

  // Welcome message
  console.log(`
╔═══════════════════════════════════════╗
║   🧱 CREATOR OF WORLDS 🧱            ║
║       (Minecraft-Style!)              ║
╠═══════════════════════════════════════╣
║  Build your voxel world!              ║
║                                       ║
║  Place blocks, mine resources,        ║
║  and create amazing structures!       ║
║                                       ║
║  Controls:                            ║
║  • Left Click: Place/Break blocks     ║
║  • Right Click + Drag: Rotate camera  ║
║  • Mouse Wheel: Zoom                  ║
║  • Middle Click + Drag: Pan           ║
║  • WASD: Move camera                  ║
║  • R: Reset view                      ║
╚═══════════════════════════════════════╝
  `);

  console.log('🎮 Game ready! Start creating your world...');

  // Make game engine globally accessible for debugging
  window.game = gameEngine;
  window.ui = uiManager;
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

