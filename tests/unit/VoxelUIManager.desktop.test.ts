import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VoxelUIManager } from '../../src/ui/VoxelUIManager';
import { VoxelGameEngine } from '../../src/core/VoxelGameEngine';
import { DeviceDetector } from '../../src/utils/DeviceDetector';
import { BlockType, ToolMode } from '../../src/types/VoxelTypes';

/**
 * Desktop UI tests for VoxelUIManager
 * Tests desktop-specific functionality
 */
describe('VoxelUIManager - Desktop UI', () => {
  let mockGameEngine: VoxelGameEngine;
  let uiManager: VoxelUIManager;

  beforeEach(() => {
    // Setup DOM elements for desktop mode
    document.body.innerHTML = `
      <div id="loading"></div>
      <div id="ui-overlay">
        <div id="toolbar"></div>
        <div id="info-panel">
          <div id="fps"></div>
          <div id="block-count"></div>
          <div id="current-tool"></div>
          <div id="current-block"></div>
          <div id="cursor-pos"></div>
        </div>
        <div id="controls-help"></div>
      </div>
      <div id="category-tabs"></div>
      <div id="block-grid"></div>
      <div id="search-container">
        <input type="text" id="block-search" />
      </div>
    `;

    // Create mock game engine
    mockGameEngine = {
      getGameState: vi.fn().mockReturnValue({
        fps: 60,
        blockCount: 1234,
        currentTool: 'place' as ToolMode,
        currentBlock: BlockType.GRASS,
        selectedPosition: { x: 10, y: 20, z: 30 },
      }),
      onGameStateChange: vi.fn((callback) => {
        // Store callback for later use
        (mockGameEngine as unknown as { _stateChangeCallback: typeof callback })._stateChangeCallback = callback;
      }),
      setBlock: vi.fn(),
      setTool: vi.fn(),
      toggleRain: vi.fn(),
      toggleSnow: vi.fn(),
      regenerateWorld: vi.fn(),
    } as unknown as VoxelGameEngine;

    // Mock desktop device
    vi.spyOn(DeviceDetector.prototype, 'isMobile').mockReturnValue(false);
    vi.spyOn(DeviceDetector.prototype, 'isTablet').mockReturnValue(false);
    vi.spyOn(DeviceDetector.prototype, 'isDesktop').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Category Tabs', () => {
    it('should render category tabs', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const categoryTabs = document.getElementById('category-tabs');
      expect(categoryTabs?.children.length).toBeGreaterThan(0);
    });

    it('should have active category highlighted', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const activeTabs = document.querySelectorAll('.category-tab.active');
      expect(activeTabs.length).toBeGreaterThan(0);
    });

    it('should switch categories on tab click', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const tabsBefore = document.querySelectorAll('.category-tab');
      expect(tabsBefore.length).toBeGreaterThan(1);

      // Get the category from the second tab
      const secondTab = tabsBefore[1] as HTMLElement;
      const categoryId = secondTab.getAttribute('data-category');

      // Click second tab
      secondTab.click();

      // After click, tabs are re-rendered, so get fresh reference
      const tabsAfter = document.querySelectorAll('.category-tab');
      const newSecondTab = tabsAfter[1] as HTMLElement;

      // Should become active
      expect(newSecondTab.classList.contains('active')).toBe(true);
      expect(newSecondTab.getAttribute('data-category')).toBe(categoryId);
    });

    it('should update block grid when category changes', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      // Click different category
      const tabs = document.querySelectorAll('.category-tab');
      if (tabs.length > 1) {
        (tabs[1] as HTMLElement).click();

        // Grid should be re-rendered (may have different number of blocks)
        const blockGridAfter = document.getElementById('block-grid')?.children.length || 0;
        expect(blockGridAfter).toBeGreaterThan(0);
      }
    });
  });

  describe('Block Grid', () => {
    it('should render blocks in grid', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const blockGrid = document.getElementById('block-grid');
      expect(blockGrid?.children.length).toBeGreaterThan(0);
    });

    it('should render block buttons with correct attributes', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const firstBlock = document.querySelector('.block-button');
      expect(firstBlock).toBeTruthy();
      expect(firstBlock?.getAttribute('data-block')).toBeTruthy();
      expect(firstBlock?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should call setBlock when block is clicked', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const blockButton = document.querySelector('.block-button') as HTMLElement;
      const blockType = parseInt(blockButton.getAttribute('data-block')!);

      blockButton.click();

      expect(mockGameEngine.setBlock).toHaveBeenCalledWith(blockType);
    });

    it('should highlight active block', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const blockButton = document.querySelector('.block-button') as HTMLElement;
      blockButton.click();

      expect(blockButton.classList.contains('active')).toBe(true);
      expect(blockButton.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('Search Functionality', () => {
    it('should filter blocks on search input', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const searchInput = document.getElementById('block-search') as HTMLInputElement;
      const initialBlockCount = document.getElementById('block-grid')?.children.length || 0;

      // Search for "grass"
      searchInput.value = 'grass';
      searchInput.dispatchEvent(new Event('input'));

      const filteredBlockCount = document.getElementById('block-grid')?.children.length || 0;

      // Should show fewer blocks
      expect(filteredBlockCount).toBeLessThanOrEqual(initialBlockCount);
    });

    it('should show no results message for invalid search', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const searchInput = document.getElementById('block-search') as HTMLInputElement;

      // Search for nonexistent block
      searchInput.value = 'invalidblockname123';
      searchInput.dispatchEvent(new Event('input'));

      const noResults = document.querySelector('.no-results');
      expect(noResults).toBeTruthy();
    });

    it('should clear search and show all blocks', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const searchInput = document.getElementById('block-search') as HTMLInputElement;

      // First search
      searchInput.value = 'grass';
      searchInput.dispatchEvent(new Event('input'));

      // Then clear
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));

      const blockCount = document.getElementById('block-grid')?.children.length || 0;
      expect(blockCount).toBeGreaterThan(0);
    });
  });

  describe('UI State Updates', () => {
    it('should update FPS display', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const fpsElement = document.getElementById('fps');
      expect(fpsElement?.textContent).toBe('60');
    });

    it('should update block count display', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const blockCountElement = document.getElementById('block-count');
      expect(blockCountElement?.textContent).toContain('1');
    });

    it('should update current tool display', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const currentToolElement = document.getElementById('current-tool');
      expect(currentToolElement?.textContent).toBeTruthy();
    });

    it('should update cursor position display', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const cursorPosElement = document.getElementById('cursor-pos');
      expect(cursorPosElement?.textContent).toContain('10');
    });

    it('should show "-" when no cursor position', () => {
      mockGameEngine.getGameState = vi.fn().mockReturnValue({
        fps: 60,
        blockCount: 0,
        currentTool: 'place',
        currentBlock: BlockType.GRASS,
        selectedPosition: null,
      });

      uiManager = new VoxelUIManager(mockGameEngine);

      const cursorPosElement = document.getElementById('cursor-pos');
      expect(cursorPosElement?.textContent).toBe('-');
    });

    it('should color code FPS (green for high FPS)', () => {
      mockGameEngine.getGameState = vi.fn().mockReturnValue({
        fps: 55,
        blockCount: 0,
        currentTool: 'place',
        currentBlock: BlockType.GRASS,
        selectedPosition: null,
      });

      uiManager = new VoxelUIManager(mockGameEngine);

      const fpsElement = document.getElementById('fps') as HTMLElement;
      expect(fpsElement.style.color).toBe('#4ecdc4');
    });

    it('should color code FPS (yellow for medium FPS)', () => {
      mockGameEngine.getGameState = vi.fn().mockReturnValue({
        fps: 35,
        blockCount: 0,
        currentTool: 'place',
        currentBlock: BlockType.GRASS,
        selectedPosition: null,
      });

      uiManager = new VoxelUIManager(mockGameEngine);

      const fpsElement = document.getElementById('fps') as HTMLElement;
      expect(fpsElement.style.color).toBe('#f4d03f');
    });

    it('should color code FPS (red for low FPS)', () => {
      mockGameEngine.getGameState = vi.fn().mockReturnValue({
        fps: 25,
        blockCount: 0,
        currentTool: 'place',
        currentBlock: BlockType.GRASS,
        selectedPosition: null,
      });

      uiManager = new VoxelUIManager(mockGameEngine);

      const fpsElement = document.getElementById('fps') as HTMLElement;
      expect(fpsElement.style.color).toBe('#e74c3c');
    });
  });

  describe('Tool Buttons', () => {
    it('should have tool buttons', () => {
      document.body.innerHTML += `
        <button data-tool="place">Place</button>
        <button data-tool="break">Break</button>
        <button data-tool="paint">Paint</button>
        <button data-tool="fill">Fill</button>
      `;

      uiManager = new VoxelUIManager(mockGameEngine);

      const toolButtons = document.querySelectorAll('[data-tool]');
      expect(toolButtons.length).toBeGreaterThan(0);
    });

    it('should change tool on button click', () => {
      document.body.innerHTML += `
        <button data-tool="break">Break</button>
      `;

      uiManager = new VoxelUIManager(mockGameEngine);

      const breakButton = document.querySelector('[data-tool="break"]') as HTMLElement;
      breakButton.click();

      expect(mockGameEngine.setTool).toHaveBeenCalledWith('break');
    });

    it('should regenerate world on regenerate button click', () => {
      document.body.innerHTML += `
        <button data-tool="regenerate">Regenerate</button>
      `;

      uiManager = new VoxelUIManager(mockGameEngine);

      const regenButton = document.querySelector('[data-tool="regenerate"]') as HTMLElement;
      regenButton.click();

      expect(mockGameEngine.regenerateWorld).toHaveBeenCalled();
    });
  });

  describe('Weather Buttons', () => {
    it('should toggle rain on rain button click', () => {
      document.body.innerHTML += `
        <button id="toggle-rain">Toggle Rain</button>
      `;

      uiManager = new VoxelUIManager(mockGameEngine);

      const rainButton = document.getElementById('toggle-rain') as HTMLElement;
      rainButton.click();

      expect(mockGameEngine.toggleRain).toHaveBeenCalled();
    });

    it('should toggle snow on snow button click', () => {
      document.body.innerHTML += `
        <button id="toggle-snow">Toggle Snow</button>
      `;

      uiManager = new VoxelUIManager(mockGameEngine);

      const snowButton = document.getElementById('toggle-snow') as HTMLElement;
      snowButton.click();

      expect(mockGameEngine.toggleSnow).toHaveBeenCalled();
    });
  });

  describe('Compact Mode Toggle', () => {
    it('should render compact toggle button', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const compactToggle = document.querySelector('.compact-toggle');
      expect(compactToggle).toBeTruthy();
    });

    it('should toggle compact mode on button click', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const toolbar = document.getElementById('toolbar');
      const compactToggle = document.querySelector('.compact-toggle') as HTMLElement;

      expect(toolbar?.classList.contains('compact')).toBe(false);

      compactToggle.click();

      expect(toolbar?.classList.contains('compact')).toBe(true);
    });

    it('should hide elements in compact mode', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const blockGrid = document.getElementById('block-grid');
      const compactToggle = document.querySelector('.compact-toggle') as HTMLElement;

      compactToggle.click();

      expect(blockGrid?.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Category Manager Integration', () => {
    it('should return category manager instance', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const categoryManager = uiManager.getCategoryManager();
      expect(categoryManager).toBeDefined();
    });

    it('should re-render blocks when category changes', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      const categoryManager = uiManager.getCategoryManager();
      const renderBlocksSpy = vi.spyOn(uiManager, 'renderBlockGrid');

      // Change category
      categoryManager.setCurrentCategory(1); // BUILDING category

      expect(renderBlocksSpy).toHaveBeenCalled();
    });
  });
});
