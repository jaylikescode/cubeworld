import { VoxelGameEngine } from '../core/VoxelGameEngine';
import { VoxelGameState, BlockType, ToolMode, BLOCK_TYPES } from '../types/VoxelTypes';

export class VoxelUIManager {
  private gameEngine: VoxelGameEngine;
  private loadingElement: HTMLElement;

  constructor(gameEngine: VoxelGameEngine) {
    this.gameEngine = gameEngine;
    
    this.loadingElement = document.getElementById('loading')!;
    this.hideLoading();
    
    this.setupToolButtons();
    this.setupBlockButtons();
    this.setupWeatherButtons();
    this.updateUI(gameEngine.getGameState());
    
    // Listen for game state changes
    gameEngine.onGameStateChange((state: VoxelGameState) => {
      this.updateUI(state);
    });
  }

  private hideLoading(): void {
    setTimeout(() => {
      this.loadingElement.style.opacity = '0';
      this.loadingElement.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        this.loadingElement.style.display = 'none';
      }, 500);
    }, 1000);
  }

  private setupToolButtons(): void {
    const toolButtons = document.querySelectorAll('[data-tool]');
    
    toolButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const tool = button.getAttribute('data-tool');
        
        if (tool === 'regenerate') {
          this.gameEngine.regenerateWorld();
          return;
        }
        
        // Update active state
        toolButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        this.gameEngine.setTool(tool as ToolMode);
      });
    });
  }

  private setupBlockButtons(): void {
    const blockButtons = document.querySelectorAll('[data-block]');
    
    blockButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const blockType = parseInt(button.getAttribute('data-block')!) as BlockType;
        
        // Update active state
        blockButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        this.gameEngine.setBlock(blockType);
      });
    });
  }

  private setupWeatherButtons(): void {
    const rainButton = document.getElementById('toggle-rain');
    const snowButton = document.getElementById('toggle-snow');
    
    if (rainButton) {
      rainButton.addEventListener('click', () => {
        this.gameEngine.toggleRain();
      });
    }
    
    if (snowButton) {
      snowButton.addEventListener('click', () => {
        this.gameEngine.toggleSnow();
      });
    }
  }

  private updateUI(state: VoxelGameState): void {
    // Update FPS
    const fpsElement = document.getElementById('fps');
    if (fpsElement) {
      fpsElement.textContent = state.fps.toString();
      
      // Color code FPS
      if (state.fps >= 50) {
        fpsElement.style.color = '#4ecdc4';
      } else if (state.fps >= 30) {
        fpsElement.style.color = '#f4d03f';
      } else {
        fpsElement.style.color = '#e74c3c';
      }
    }

    // Update block count
    const blockCountElement = document.getElementById('block-count');
    if (blockCountElement) {
      blockCountElement.textContent = state.blockCount.toLocaleString();
    }

    // Update current tool
    const currentToolElement = document.getElementById('current-tool');
    if (currentToolElement) {
      currentToolElement.textContent = this.formatToolName(state.currentTool);
    }

    // Update current block
    const currentBlockElement = document.getElementById('current-block');
    if (currentBlockElement) {
      const blockData = BLOCK_TYPES[state.currentBlock];
      currentBlockElement.textContent = blockData.name;
    }

    // Update cursor position
    const cursorPosElement = document.getElementById('cursor-pos');
    if (cursorPosElement && state.selectedPosition) {
      cursorPosElement.textContent = `${state.selectedPosition.x}, ${state.selectedPosition.y}, ${state.selectedPosition.z}`;
    } else if (cursorPosElement) {
      cursorPosElement.textContent = '-';
    }
  }

  private formatToolName(tool: ToolMode): string {
    const names: Record<ToolMode | 'regenerate', string> = {
      place: 'Place Block',
      break: 'Break Block',
      paint: 'Paint Block',
      fill: 'Fill Area',
      regenerate: 'Regenerate',
    };
    return names[tool] || tool;
  }
}

