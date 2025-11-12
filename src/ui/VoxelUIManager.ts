import { VoxelGameEngine } from '../core/VoxelGameEngine';
import { VoxelGameState, BlockType, ToolMode, BLOCK_TYPES, BlockCategory } from '../types/VoxelTypes';
import { BlockCategoryManager } from './BlockCategoryManager';

/**
 * Block icon mapping for UI display
 */
const BLOCK_ICONS: Record<BlockType, string> = {
  // Air and liquids
  [BlockType.AIR]: '⬛',
  [BlockType.WATER]: '💧',
  [BlockType.LAVA]: '🌋',

  // Natural blocks
  [BlockType.GRASS]: '🟩',
  [BlockType.DIRT]: '🟫',
  [BlockType.STONE]: '⬜',
  [BlockType.SAND]: '🟨',
  [BlockType.GRAVEL]: '◽',
  [BlockType.CLAY]: '🟧',
  [BlockType.SNOW]: '❄️',
  [BlockType.ICE]: '🧊',
  [BlockType.BEDROCK]: '⬛',
  [BlockType.SANDSTONE]: '🟫',
  [BlockType.RED_SAND]: '🟥',
  [BlockType.PODZOL]: '🟤',
  [BlockType.MYCELIUM]: '🟣',
  [BlockType.NETHERRACK]: '🔴',
  [BlockType.END_STONE]: '🟡',
  [BlockType.OBSIDIAN]: '⬛',

  // Wood types
  [BlockType.WOOD]: '🪵',
  [BlockType.OAK_LOG]: '🪵',
  [BlockType.BIRCH_LOG]: '🪵',
  [BlockType.SPRUCE_LOG]: '🪵',
  [BlockType.DARK_OAK_LOG]: '🪵',
  [BlockType.ACACIA_LOG]: '🪵',

  // Leaves
  [BlockType.LEAVES]: '🍃',
  [BlockType.OAK_LEAVES]: '🍃',
  [BlockType.BIRCH_LEAVES]: '🍃',
  [BlockType.SPRUCE_LEAVES]: '🍃',
  [BlockType.DARK_OAK_LEAVES]: '🍃',
  [BlockType.ACACIA_LEAVES]: '🍃',

  // Ores
  [BlockType.COAL_ORE]: '⚫',
  [BlockType.IRON_ORE]: '⚪',
  [BlockType.GOLD_ORE]: '🟡',
  [BlockType.DIAMOND_ORE]: '💎',
  [BlockType.EMERALD_ORE]: '🟢',
  [BlockType.REDSTONE_ORE]: '🔴',
  [BlockType.LAPIS_ORE]: '🔵',
  [BlockType.COPPER_ORE]: '🟠',
  [BlockType.QUARTZ_ORE]: '⚪',

  // Mineral blocks
  [BlockType.COAL_BLOCK]: '⬛',
  [BlockType.IRON_BLOCK]: '⬜',
  [BlockType.GOLD_BLOCK]: '🟨',
  [BlockType.DIAMOND_BLOCK]: '💎',
  [BlockType.EMERALD_BLOCK]: '🟩',
  [BlockType.REDSTONE_BLOCK]: '🟥',

  // Building blocks
  [BlockType.PLANK]: '🟫',
  [BlockType.OAK_PLANK]: '🟫',
  [BlockType.BIRCH_PLANK]: '🟫',
  [BlockType.SPRUCE_PLANK]: '🟫',
  [BlockType.COBBLESTONE]: '🪨',
  [BlockType.STONE_BRICK]: '⬜',
  [BlockType.BRICK]: '🧱',
  [BlockType.GLASS]: '🔷',
  [BlockType.CONCRETE]: '⬜',
  [BlockType.WHITE_CONCRETE]: '⬜',
  [BlockType.GRAY_CONCRETE]: '◽',
  [BlockType.BLACK_CONCRETE]: '⬛',
  [BlockType.RED_CONCRETE]: '🟥',
  [BlockType.BLUE_CONCRETE]: '🟦',
  [BlockType.GREEN_CONCRETE]: '🟩',

  // Decoration
  [BlockType.FLOWER]: '🌸',
  [BlockType.ROSE]: '🌹',
  [BlockType.DANDELION]: '🌼',
  [BlockType.TULIP]: '🌷',
  [BlockType.MUSHROOM]: '🍄',
  [BlockType.RED_MUSHROOM]: '🍄',
  [BlockType.BROWN_MUSHROOM]: '🍄',
  [BlockType.TORCH]: '🔥',
  [BlockType.LANTERN]: '🏮',
};

export class VoxelUIManager {
  private gameEngine: VoxelGameEngine;
  private loadingElement: HTMLElement;
  private categoryManager: BlockCategoryManager;
  private isCompactMode: boolean = false;
  private currentSearchQuery: string = '';

  constructor(gameEngine: VoxelGameEngine) {
    this.gameEngine = gameEngine;
    this.categoryManager = new BlockCategoryManager();

    this.loadingElement = document.getElementById('loading')!;
    this.hideLoading();

    this.initializeUI();

    // Listen for game state changes
    gameEngine.onGameStateChange((state: VoxelGameState) => {
      this.updateUI(state);
    });

    // Listen for category changes
    this.categoryManager.onCategoryChange(() => {
      this.renderBlockGrid();
    });
  }

  private initializeUI(): void {
    this.setupToolButtons();
    this.setupWeatherButtons();
    this.renderCategoryTabs();
    this.renderBlockGrid();
    this.setupSearchInput();
    this.renderCompactToggle();
    this.updateUI(this.gameEngine.getGameState());
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

  /**
   * Render category tabs
   */
  public renderCategoryTabs(): void {
    const categoryTabsContainer = document.getElementById('category-tabs');
    if (!categoryTabsContainer) return;

    categoryTabsContainer.innerHTML = '';

    const categories = this.categoryManager.getAllCategoriesWithInfo();

    categories.forEach(({ category, name, icon, blockCount, isActive }) => {
      const button = document.createElement('button');
      button.className = `category-tab ${isActive ? 'active' : ''}`;
      button.setAttribute('data-category', category.toString());
      button.setAttribute('aria-label', `${name} category with ${blockCount} blocks`);
      button.setAttribute('aria-pressed', isActive.toString());
      button.textContent = `${icon} ${name} (${blockCount})`;

      button.addEventListener('click', () => {
        this.categoryManager.setCurrentCategory(category);
        this.renderCategoryTabs(); // Update active state
      });

      categoryTabsContainer.appendChild(button);
    });
  }

  /**
   * Render block grid for current category
   */
  public renderBlockGrid(): void {
    const blockGridContainer = document.getElementById('block-grid');
    if (!blockGridContainer) return;

    blockGridContainer.innerHTML = '';

    let blocksToDisplay: BlockType[];

    if (this.currentSearchQuery) {
      blocksToDisplay = this.categoryManager.searchBlocks(this.currentSearchQuery, false);
    } else {
      blocksToDisplay = this.categoryManager.getCurrentBlocks();
    }

    if (blocksToDisplay.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = this.currentSearchQuery
        ? `No blocks found for "${this.currentSearchQuery}"`
        : 'No blocks in this category';
      blockGridContainer.appendChild(noResults);
      return;
    }

    blocksToDisplay.forEach(blockType => {
      const blockData = BLOCK_TYPES[blockType];
      const button = document.createElement('button');
      button.className = 'block-button';
      button.setAttribute('data-block', blockType.toString());
      button.setAttribute('aria-label', blockData.name);
      button.setAttribute('aria-pressed', 'false');

      const icon = BLOCK_ICONS[blockType] || '❓';
      button.textContent = `${icon} ${blockData.name}`;

      // Apply block color as background
      const color = blockData.color;
      const r = Math.floor(color.r * 255);
      const g = Math.floor(color.g * 255);
      const b = Math.floor(color.b * 255);
      button.style.background = `linear-gradient(135deg, rgb(${r}, ${g}, ${b}) 0%, rgb(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.8)}, ${Math.floor(b * 0.8)}) 100%)`;

      // Set text color based on background brightness
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      button.style.color = brightness > 128 ? '#000' : '#fff';

      button.addEventListener('click', () => {
        this.selectBlock(blockType);
      });

      blockGridContainer.appendChild(button);
    });

    // Update active state
    this.updateActiveBlockButton();
  }

  /**
   * Select a block and update UI
   */
  private selectBlock(blockType: BlockType): void {
    // Update active state
    const blockButtons = document.querySelectorAll('[data-block]');
    blockButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });

    const selectedButton = document.querySelector(`[data-block="${blockType}"]`);
    if (selectedButton) {
      selectedButton.classList.add('active');
      selectedButton.setAttribute('aria-pressed', 'true');
    }

    this.gameEngine.setBlock(blockType);
  }

  /**
   * Update active block button based on game state
   */
  private updateActiveBlockButton(): void {
    const currentBlock = this.gameEngine.getGameState().currentBlock;
    const blockButtons = document.querySelectorAll('[data-block]');

    blockButtons.forEach(btn => {
      const blockType = parseInt(btn.getAttribute('data-block')!);
      if (blockType === currentBlock) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  /**
   * Setup search input
   */
  private setupSearchInput(): void {
    const searchInput = document.getElementById('block-search') as HTMLInputElement;
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      this.currentSearchQuery = searchInput.value.trim();
      this.renderBlockGrid();
    });
  }

  /**
   * Render compact mode toggle
   */
  public renderCompactToggle(): void {
    const toolbar = document.getElementById('toolbar');
    if (!toolbar) return;

    // Check if toggle already exists
    let toggleButton = toolbar.querySelector('.compact-toggle') as HTMLElement;

    if (!toggleButton) {
      toggleButton = document.createElement('button');
      toggleButton.className = 'compact-toggle';
      toggleButton.textContent = '◀';
      toggleButton.title = 'Toggle compact mode';
      toolbar.insertBefore(toggleButton, toolbar.firstChild);
    }

    toggleButton.addEventListener('click', () => {
      this.isCompactMode = !this.isCompactMode;
      toolbar.classList.toggle('compact', this.isCompactMode);

      const blockGrid = document.getElementById('block-grid');
      const categoryTabs = document.getElementById('category-tabs');
      const searchContainer = document.getElementById('search-container');

      if (this.isCompactMode) {
        blockGrid?.classList.add('hidden');
        categoryTabs?.classList.add('hidden');
        searchContainer?.classList.add('hidden');
        toggleButton.textContent = '▶';
      } else {
        blockGrid?.classList.remove('hidden');
        categoryTabs?.classList.remove('hidden');
        searchContainer?.classList.remove('hidden');
        toggleButton.textContent = '◀';
      }
    });
  }

  /**
   * Setup tool buttons (legacy support)
   */
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

  /**
   * Setup weather buttons (legacy support)
   */
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

  /**
   * Update UI with current game state
   */
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

    // Update active block button
    this.updateActiveBlockButton();
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

  /**
   * Get category manager (for testing)
   */
  public getCategoryManager(): BlockCategoryManager {
    return this.categoryManager;
  }
}
