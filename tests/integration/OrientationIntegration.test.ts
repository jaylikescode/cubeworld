import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VoxelUIManager } from '../../src/ui/VoxelUIManager';
import { VoxelGameEngine } from '../../src/core/VoxelGameEngine';
import { OrientationManager } from '../../src/utils/OrientationManager';

// Mock VoxelGameEngine
vi.mock('../../src/core/VoxelGameEngine', () => {
  return {
    VoxelGameEngine: class {
      constructor() {}
      onGameStateChange = vi.fn();
      getGameState = vi.fn().mockReturnValue({
        currentBlock: 1,
        currentTool: 'place',
        selectedPosition: null,
        fps: 60,
        blockCount: 100
      });
      setTool = vi.fn();
      setBlock = vi.fn();
      regenerateWorld = vi.fn();
      toggleRain = vi.fn();
      toggleSnow = vi.fn();
      handleResize = vi.fn();
      getWorld = vi.fn().mockReturnValue({});
    }
  };
});

// Mock DeviceDetector
vi.mock('../../src/utils/DeviceDetector', () => {
  return {
    DeviceDetector: class {
      constructor() {}
      isMobile = vi.fn().mockReturnValue(true);
      isTablet = vi.fn().mockReturnValue(false);
      isDesktop = vi.fn().mockReturnValue(false);
      getOrientation = vi.fn().mockReturnValue('portrait');
      getScreenWidth = vi.fn().mockReturnValue(375);
      getScreenHeight = vi.fn().mockReturnValue(667);
      hasTouchSupport = vi.fn().mockReturnValue(true);
    }
  };
});

describe('Orientation Integration', () => {
  let uiManager: VoxelUIManager;
  let gameEngine: VoxelGameEngine;
  let container: HTMLElement;

  beforeEach(() => {
    // Setup DOM environment
    document.body.innerHTML = `
      <div id="loading"></div>
      <div id="ui-overlay"></div>
      <div id="toolbar"></div>
      <div id="controls-help"></div>
      <div id="category-tabs"></div>
      <div id="block-grid"></div>
      <input type="text" id="block-search" />
      <div id="toast-container"></div>
    `;
    
    container = document.getElementById('ui-overlay')!;
    
    // Create mock game engine
    gameEngine = new VoxelGameEngine({} as HTMLCanvasElement);
    
    // Create UI Manager
    uiManager = new VoxelUIManager(gameEngine);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('should initialize with Mobile components in mobile mode', () => {
    // Check if mobile components are initialized
    // Since they are private properties, we can check if their DOM elements exist
    expect(document.querySelector('.mobile-bottom-nav')).not.toBeNull();
    expect(document.querySelector('.mobile-info-bar')).not.toBeNull();
    
    // Desktop toolbar should be hidden
    const toolbar = document.getElementById('toolbar');
    expect(toolbar?.classList.contains('hidden')).toBe(true);
  });

  it('should handle orientation change events', async () => {
    // Access the orientation manager from the UI manager (via private access hack for testing)
    const orientationManager = (uiManager as unknown as { orientationManager: OrientationManager }).orientationManager;
    
    // Spy on handleResize
    const resizeSpy = vi.spyOn(gameEngine, 'handleResize');
    
    // Spy on component setOrientation methods
    // We need to get references to the actual component instances
    const mobileBottomNav = (uiManager as unknown as { mobileBottomNav: { setOrientation: (orientation: string) => void } }).mobileBottomNav;
    const mobileBlockSheet = (uiManager as unknown as { mobileBlockSheet: { setOrientation: (orientation: string) => void } }).mobileBlockSheet;
    const mobileInfoBar = (uiManager as unknown as { mobileInfoBar: { setOrientation: (orientation: string, autoExpand: boolean) => void } }).mobileInfoBar;
    const mobileDrawer = (uiManager as unknown as { mobileDrawer: { setOrientation: (orientation: string) => void } }).mobileDrawer;
    
    const navSpy = vi.spyOn(mobileBottomNav, 'setOrientation');
    const sheetSpy = vi.spyOn(mobileBlockSheet, 'setOrientation');
    const infoSpy = vi.spyOn(mobileInfoBar, 'setOrientation');
    const drawerSpy = vi.spyOn(mobileDrawer, 'setOrientation');
    
    // Reduce debounce for testing
    orientationManager.setDebounceDelay(10);
    
    // Mock orientation change
    // We need to access the device detector to change its return value
    const deviceDetector = (uiManager as unknown as { deviceDetector: { getOrientation: () => string } }).deviceDetector;
    vi.spyOn(deviceDetector, 'getOrientation').mockReturnValue('landscape');
    
    // Trigger orientation change
    window.dispatchEvent(new Event('orientationchange'));
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // Verify all components were updated
    expect(navSpy).toHaveBeenCalledWith('landscape');
    expect(sheetSpy).toHaveBeenCalledWith('landscape');
    expect(infoSpy).toHaveBeenCalled(); // Called with (orientation, autoExpand)
    expect(infoSpy.mock.calls[0][0]).toBe('landscape');
    expect(drawerSpy).toHaveBeenCalledWith('landscape');
    
    // Verify engine resize was called
    expect(resizeSpy).toHaveBeenCalled();
  });

  it('should update DOM attributes on orientation change', async () => {
    const orientationManager = (uiManager as unknown as { orientationManager: OrientationManager }).orientationManager;
    orientationManager.setDebounceDelay(10);

    const deviceDetector = (uiManager as unknown as { deviceDetector: { getOrientation: () => string } }).deviceDetector;
    vi.spyOn(deviceDetector, 'getOrientation').mockReturnValue('landscape');
    
    window.dispatchEvent(new Event('orientationchange'));
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // Check DOM elements
    const nav = document.querySelector('.mobile-bottom-nav');
    const sheet = document.querySelector('.mobile-block-sheet');
    const bar = document.querySelector('.mobile-info-bar');
    const drawer = document.querySelector('.mobile-drawer');
    
    expect(nav?.classList.contains('landscape')).toBe(true);
    expect(sheet?.classList.contains('landscape')).toBe(true);
    expect(bar?.classList.contains('landscape')).toBe(true);
    expect(drawer?.classList.contains('landscape')).toBe(true);
    
    expect(nav?.getAttribute('data-orientation')).toBe('landscape');
  });
});

