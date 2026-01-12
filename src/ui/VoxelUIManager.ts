import { VoxelGameEngine } from '../core/VoxelGameEngine';
import { VoxelGameState, BlockType, ToolMode, BLOCK_TYPES } from '../types/VoxelTypes';
import { BlockCategoryManager } from './BlockCategoryManager';
import { DeviceDetector } from '../utils/DeviceDetector';
import { OrientationManager, type Orientation } from '../utils/OrientationManager';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileBlockSheet } from './MobileBlockSheet';
import { MobileDrawer } from './MobileDrawer';
import { MobileInfoBar } from './MobileInfoBar';
import { ModeSelector } from './ModeSelector';
import { WorldSerializer } from '../services/WorldSerializer';
import { LocalStorageManager } from '../services/LocalStorageManager';
import { ModeManager, type RenderMode } from '../services/ModeManager';

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
  
  // Crafting blocks
  [BlockType.PRISMARINE]: '🔷',
  [BlockType.PRISMARINE_BRICKS]: '🔶',
  [BlockType.DARK_PRISMARINE]: '⬛',
  [BlockType.WOOL_WHITE]: '🧶',
  [BlockType.WOOL_BLACK]: '⚫',
  [BlockType.WOOL_RED]: '🔴',
  [BlockType.WOOL_BLUE]: '🔵',
  [BlockType.WOOL_GREEN]: '🟢',
  [BlockType.WOOL_YELLOW]: '🟡',
  [BlockType.BEACON]: '📡',
};

export class VoxelUIManager {
  private gameEngine: VoxelGameEngine;
  private loadingElement: HTMLElement;
  private categoryManager: BlockCategoryManager;
  private deviceDetector: DeviceDetector;
  private orientationManager?: OrientationManager;
  private isCompactMode: boolean = false;
  private currentSearchQuery: string = '';
  private mobileBottomNav?: MobileBottomNav;
  private mobileBlockSheet?: MobileBlockSheet;
  private mobileDrawer?: MobileDrawer;
  private mobileInfoBar?: MobileInfoBar;
  private modeSelector?: ModeSelector;
  private serializer: WorldSerializer;
  private storage: LocalStorageManager;
  private modeManager: ModeManager;

  constructor(gameEngine: VoxelGameEngine) {
    this.gameEngine = gameEngine;
    this.categoryManager = new BlockCategoryManager();
    this.deviceDetector = new DeviceDetector();
    this.serializer = new WorldSerializer();
    this.storage = new LocalStorageManager();

    // Initialize ModeManager
    this.modeManager = new ModeManager(this.deviceDetector, this.storage);

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

    // Listen for mode changes
    this.modeManager.onModeChange((newMode) => {
      this.handleModeSwitch(newMode);
    });
  }

  /**
   * Check if we should render mobile UI
   * Now delegates to ModeManager for consistent mode determination
   */
  private isMobileMode(): boolean {
    return this.modeManager.getCurrentMode() === 'mobile';
  }

  private initializeUI(): void {
    if (this.isMobileMode()) {
      this.renderMobileUI();
    } else {
      this.renderDesktopUI();
    }

    // Create and mount ModeSelector in info panel
    this.initializeModeSelector();
  }

  /**
   * Initialize and mount the ModeSelector component
   */
  private initializeModeSelector(): void {
    const infoPanel = document.getElementById('info-panel');
    if (infoPanel) {
      this.modeSelector = new ModeSelector(
        infoPanel,
        this.modeManager,
        this.deviceDetector
      );
    }
  }

  /**
   * Render desktop UI (original implementation)
   */
  private renderDesktopUI(): void {
    this.setupToolButtons();
    this.setupWeatherButtons();
    this.setupWorldManagementButtons();
    this.renderCategoryTabs();
    this.renderBlockGrid();
    this.setupSearchInput();
    this.renderCompactToggle();
    this.updateUI(this.gameEngine.getGameState());
  }

  /**
   * Render mobile UI
   */
  private renderMobileUI(): void {
    // Hide desktop toolbar
    const toolbar = document.getElementById('toolbar');
    if (toolbar) {
      toolbar.classList.add('hidden');
      toolbar.classList.add('mobile-mode');
    }

    // Hide desktop controls help
    const controlsHelp = document.getElementById('controls-help');
    if (controlsHelp) {
      controlsHelp.classList.add('hidden');
    }

    // Initialize OrientationManager
    this.orientationManager = new OrientationManager(this.deviceDetector);
    
    // Subscribe to orientation changes
    this.orientationManager.onOrientationChange((orientation: Orientation) => {
      this.handleOrientationChange(orientation);
    });

    // Log initial orientation info (for debugging)
    // Check if in development mode
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
        this.orientationManager.logOrientationInfo();
      }
    } catch {
      // Ignore if import.meta is not available
    }

    // Create mobile bottom navigation
    const uiOverlay = document.getElementById('ui-overlay');
    if (uiOverlay) {
      this.mobileBottomNav = new MobileBottomNav(uiOverlay);

      // Handle tool changes
      this.mobileBottomNav.onToolChange((tool: string) => {
        this.gameEngine.setTool(tool as ToolMode);

        // Open block sheet when Place or Paint tool is selected
        if ((tool === 'place' || tool === 'paint') && this.mobileBlockSheet) {
          this.mobileBlockSheet.open();
        }
      });

      // Create mobile drawer
      this.mobileDrawer = new MobileDrawer(uiOverlay, this.categoryManager);

      // Handle menu button - open drawer
      this.mobileBottomNav.onMenuOpen(() => {
        if (this.mobileDrawer) {
          this.mobileDrawer.open();
        }
      });

      // Handle category changes from drawer
      this.mobileDrawer.onCategoryChange((category: number) => {
        this.categoryManager.setCurrentCategory(category);
        // Block sheet will be updated automatically via categoryManager.onCategoryChange
      });

      // Create mobile block sheet
      this.mobileBlockSheet = new MobileBlockSheet(uiOverlay);

      // Render blocks from current category
      const currentBlocks = this.categoryManager.getCurrentBlocks();
      this.mobileBlockSheet.renderBlocks(currentBlocks);

      // Handle block selection
      this.mobileBlockSheet.onBlockSelect((block: BlockType) => {
        this.gameEngine.setBlock(block);
      });

      // Listen for category changes to update block sheet
      this.categoryManager.onCategoryChange(() => {
        if (this.mobileBlockSheet) {
          const blocks = this.categoryManager.getCurrentBlocks();
          this.mobileBlockSheet.renderBlocks(blocks);
        }
      });

      // Create mobile info bar
      this.mobileInfoBar = new MobileInfoBar(uiOverlay);
    }

    // Still need to update UI with game state
    this.updateUI(this.gameEngine.getGameState());
  }

  /**
   * Handle orientation change events
   */
  private handleOrientationChange(orientation: Orientation): void {
    console.log(`📱 Orientation changed to: ${orientation}`);

    // Get layout config for new orientation
    const layoutConfig = this.orientationManager?.getLayoutConfig();

    // Update all mobile UI components
    if (this.mobileBottomNav) {
      this.mobileBottomNav.setOrientation(orientation);
    }

    if (this.mobileBlockSheet) {
      this.mobileBlockSheet.setOrientation(orientation);
    }

    if (this.mobileInfoBar) {
      // Auto-expand in landscape if configured
      const autoExpand = layoutConfig?.infoBarAutoExpand ?? false;
      this.mobileInfoBar.setOrientation(orientation, autoExpand);
    }

    if (this.mobileDrawer) {
      this.mobileDrawer.setOrientation(orientation);
    }

    // Trigger canvas resize to adjust aspect ratio
    this.gameEngine.handleResize();
  }

  /**
   * Handle mode switching between desktop and mobile
   * This orchestrates the transition to ensure clean state management
   */
  private handleModeSwitch(newMode: RenderMode): void {
    console.log(`🔄 Switching to ${newMode} mode`);

    // 1. Preserve current game state
    const gameState = this.gameEngine.getGameState();

    // 2. Cleanup current UI
    if (newMode === 'mobile') {
      this.cleanupDesktopUI();
    } else {
      this.cleanupMobileUI();
    }

    // 3. Reconfigure CameraController for new mode
    const cameraController = this.gameEngine.getCameraController();
    cameraController.reconfigureForMode(newMode);

    // 4. Render new UI
    if (newMode === 'mobile') {
      this.renderMobileUI();
    } else {
      this.renderDesktopUI();
    }

    // 5. Restore game state
    this.gameEngine.setTool(gameState.currentTool);
    this.gameEngine.setBlock(gameState.currentBlock);

    // 6. Update ModeSelector display
    if (this.modeSelector) {
      this.modeSelector.updateDisplay(this.modeManager.getState());
    }

    // 7. Update UI with current state
    this.updateUI(gameState);

    console.log(`✅ Successfully switched to ${newMode} mode`);
  }

  /**
   * Cleanup desktop UI elements
   */
  private cleanupDesktopUI(): void {
    const toolbar = document.getElementById('toolbar');
    if (toolbar) {
      toolbar.classList.add('hidden');
    }

    const controlsHelp = document.getElementById('controls-help');
    if (controlsHelp) {
      controlsHelp.classList.add('hidden');
    }
  }

  /**
   * Cleanup mobile UI components
   * Properly destroys all mobile UI instances to prevent memory leaks
   */
  private cleanupMobileUI(): void {
    // Destroy mobile UI components
    if (this.mobileBottomNav) {
      this.mobileBottomNav.destroy();
      this.mobileBottomNav = undefined;
    }

    if (this.mobileBlockSheet) {
      this.mobileBlockSheet.destroy();
      this.mobileBlockSheet = undefined;
    }

    if (this.mobileDrawer) {
      this.mobileDrawer.destroy();
      this.mobileDrawer = undefined;
    }

    if (this.mobileInfoBar) {
      this.mobileInfoBar.destroy();
      this.mobileInfoBar = undefined;
    }

    // Clean up orientation manager
    if (this.orientationManager) {
      // OrientationManager doesn't have destroy method yet, just unset
      this.orientationManager = undefined;
    }

    // Show desktop UI elements
    const toolbar = document.getElementById('toolbar');
    if (toolbar) {
      toolbar.classList.remove('hidden');
      toolbar.classList.remove('mobile-mode');
    }

    const controlsHelp = document.getElementById('controls-help');
    if (controlsHelp) {
      controlsHelp.classList.remove('hidden');
    }
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

    // Update mobile info bar
    if (this.mobileInfoBar) {
      this.mobileInfoBar.updateFPS(state.fps);
      this.mobileInfoBar.updateBlockCount(state.blockCount);
      this.mobileInfoBar.updateCurrentTool(this.formatToolName(state.currentTool));
      
      const blockData = BLOCK_TYPES[state.currentBlock];
      this.mobileInfoBar.updateCurrentBlock(blockData.name);
      
      if (state.selectedPosition) {
        this.mobileInfoBar.updateCursorPosition(
          state.selectedPosition.x, 
          state.selectedPosition.y, 
          state.selectedPosition.z
        );
      } else {
        this.mobileInfoBar.updateCursorPosition(null, null, null);
      }
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

  /**
   * Setup world management buttons (save/load/clear/new)
   */
  private setupWorldManagementButtons(): void {
    const saveButton = document.getElementById('save-world');
    const loadButton = document.getElementById('load-world');
    const newButton = document.getElementById('new-world');
    const clearButton = document.getElementById('clear-world');

    if (saveButton) {
      saveButton.addEventListener('click', () => {
        this.handleSaveWorld();
      });
    }

    if (loadButton) {
      loadButton.addEventListener('click', () => {
        this.handleLoadWorld();
      });
    }

    if (newButton) {
      newButton.addEventListener('click', () => {
        this.handleNewWorld();
      });
    }

    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.handleClearWorld();
      });
    }
  }

  /**
   * Handle Save World button click
   */
  private handleSaveWorld(): void {
    try {
      const world = this.gameEngine.getWorld();
      const serialized = this.serializer.serialize(world);
      const success = this.storage.saveWorld(serialized);

      if (success) {
        this.showToast('success', '💾 World saved successfully!');
      } else {
        this.showToast('error', '❌ Failed to save world. Storage quota may be exceeded.');
      }
    } catch (error) {
      console.error('Save world error:', error);
      this.showToast('error', '❌ Error saving world.');
    }
  }

  /**
   * Handle Load World button click
   */
  private handleLoadWorld(): void {
    try {
      if (!this.storage.hasWorld()) {
        this.showToast('info', 'ℹ️ No saved world found.');
        return;
      }

      const loaded = this.storage.loadWorld();
      if (!loaded) {
        this.showToast('error', '❌ Failed to load world. Save data may be corrupted.');
        return;
      }

      const worldData = this.serializer.deserialize(loaded);
      const world = this.gameEngine.getWorld();
      world.loadFromData(worldData);

      this.showToast('success', '📂 World loaded successfully!');
    } catch (error) {
      console.error('Load world error:', error);
      this.showToast('error', '❌ Error loading world.');
    }
  }

  /**
   * Handle New World button click
   */
  private handleNewWorld(): void {
    const confirmed = confirm('Create a new world? This will replace the current world (unsaved changes will be lost).');
    if (!confirmed) return;

    try {
      this.gameEngine.regenerateWorld();
      this.showToast('success', '🆕 New world created!');
    } catch (error) {
      console.error('New world error:', error);
      this.showToast('error', '❌ Error creating new world.');
    }
  }

  /**
   * Handle Clear Save button click
   */
  private handleClearWorld(): void {
    const confirmed = confirm('Clear saved world data? This action cannot be undone.');
    if (!confirmed) return;

    try {
      this.storage.clearWorld();
      this.showToast('success', '🗑️ Saved world data cleared.');
    } catch (error) {
      console.error('Clear world error:', error);
      this.showToast('error', '❌ Error clearing save data.');
    }
  }

  /**
   * Show toast notification
   * @param type - Toast type (success, error, info)
   * @param message - Message to display
   */
  private showToast(type: 'success' | 'error' | 'info', message: string): void {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = document.createElement('div');
    icon.className = 'toast-icon';
    icon.textContent = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

    const messageEl = document.createElement('div');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(messageEl);
    container.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * Try to auto-load saved world on initialization
   */
  public tryAutoLoad(): void {
    try {
      if (!this.storage.hasWorld()) {
        console.log('No saved world found. Starting fresh.');
        return;
      }

      const loaded = this.storage.loadWorld();
      if (!loaded) {
        console.warn('Failed to load saved world. Starting fresh.');
        return;
      }

      const worldData = this.serializer.deserialize(loaded);
      const world = this.gameEngine.getWorld();
      world.loadFromData(worldData);

      console.log('Auto-loaded saved world successfully.');
      this.showToast('info', '📂 Loaded saved world.');
    } catch (error) {
      console.error('Auto-load error:', error);
      // Don't show error toast for auto-load failures (silent failure)
    }
  }

  /**
   * Get category manager (for testing)
   */
  public getCategoryManager(): BlockCategoryManager {
    return this.categoryManager;
  }
}
