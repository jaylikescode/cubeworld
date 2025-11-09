import { GameEngine } from '../core/GameEngine';
import { GameState, ToolType } from '../types/GameTypes';

export class UIManager {
  private gameEngine: GameEngine;
  private loadingElement: HTMLElement;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
    
    this.loadingElement = document.getElementById('loading')!;
    this.hideLoading();
    
    this.setupToolButtons();
    this.setupSliders();
    this.setupWeatherButtons();
    this.updateUI(gameEngine.getGameState());
    
    // Listen for game state changes
    gameEngine.onGameStateChange((state: GameState) => {
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
    const toolButtons = document.querySelectorAll('.tool-button');
    
    toolButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const tool = button.getAttribute('data-tool') as ToolType;
        
        if (tool === 'regenerate' || tool === 'reset') {
          // Special tools don't stay active
          this.gameEngine.setTool(tool);
          return;
        }

        // Update active state
        toolButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        this.gameEngine.setTool(tool);
      });
    });
  }

  private setupSliders(): void {
    const brushSizeSlider = document.getElementById('brush-size') as HTMLInputElement;
    const brushSizeValue = document.getElementById('brush-size-value')!;
    const brushStrengthSlider = document.getElementById('brush-strength') as HTMLInputElement;
    const brushStrengthValue = document.getElementById('brush-strength-value')!;

    brushSizeSlider.addEventListener('input', () => {
      const value = parseFloat(brushSizeSlider.value);
      brushSizeValue.textContent = value.toFixed(1);
      this.gameEngine.setBrushSize(value);
    });

    brushStrengthSlider.addEventListener('input', () => {
      const value = parseFloat(brushStrengthSlider.value);
      brushStrengthValue.textContent = value.toFixed(1);
      this.gameEngine.setBrushStrength(value);
    });
  }

  private setupWeatherButtons(): void {
    // Add weather buttons to toolbar
    const toolbar = document.getElementById('toolbar')!;
    const weatherSection = document.createElement('div');
    weatherSection.className = 'tool-section';
    weatherSection.innerHTML = `
      <h3>Weather</h3>
      <button class="tool-button" id="toggle-rain">🌧️ Toggle Rain</button>
      <button class="tool-button" id="toggle-snow">❄️ Toggle Snow</button>
    `;
    toolbar.appendChild(weatherSection);

    document.getElementById('toggle-rain')!.addEventListener('click', () => {
      this.gameEngine.toggleRain();
    });

    document.getElementById('toggle-snow')!.addEventListener('click', () => {
      this.gameEngine.toggleSnow();
    });
  }

  private updateUI(state: GameState): void {
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

    // Update vertex count
    const verticesElement = document.getElementById('vertices');
    if (verticesElement) {
      verticesElement.textContent = state.vertexCount.toLocaleString();
    }

    // Update current tool
    const currentToolElement = document.getElementById('current-tool');
    if (currentToolElement) {
      currentToolElement.textContent = this.formatToolName(state.currentTool);
    }

    // Update cursor position (if available)
    const cursorPosElement = document.getElementById('cursor-pos');
    if (cursorPosElement) {
      // This will be updated by the game engine in real-time
    }
  }

  private formatToolName(tool: ToolType): string {
    const names: Record<ToolType, string> = {
      raise: 'Raise Terrain',
      lower: 'Lower Terrain',
      smooth: 'Smooth Terrain',
      flatten: 'Flatten Area',
      water: 'Add Water',
      forest: 'Plant Forest',
      desert: 'Create Desert',
      snow: 'Snow Cover',
      regenerate: 'Regenerate World',
      reset: 'Reset All',
    };
    return names[tool] || tool;
  }
}

