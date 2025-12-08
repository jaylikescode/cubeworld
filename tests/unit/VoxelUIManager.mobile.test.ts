import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VoxelUIManager } from '../../src/ui/VoxelUIManager';
import { VoxelGameEngine } from '../../src/core/VoxelGameEngine';
import { DeviceDetector } from '../../src/utils/DeviceDetector';

// Type helper for accessing private methods in tests
interface VoxelUIManagerPrivate {
  isMobileMode(): boolean;
  renderMobileUI(): void;
  renderDesktopUI(): void;
  deviceDetector: DeviceDetector;
}

/**
 * Mobile-specific tests for VoxelUIManager
 * Tests device mode detection and conditional UI rendering
 * Part of Phase 1: Mobile Detection and Layout Separation
 */
describe('VoxelUIManager - Mobile Detection', () => {
  let mockGameEngine: VoxelGameEngine;
  let uiManager: VoxelUIManager;

  beforeEach(() => {
    // Setup DOM elements
    document.body.innerHTML = `
      <div id="loading"></div>
      <div id="toolbar"></div>
      <div id="category-tabs"></div>
      <div id="block-grid"></div>
      <div id="block-search"></div>
      <div id="fps"></div>
      <div id="block-count"></div>
      <div id="current-tool"></div>
      <div id="current-block"></div>
      <div id="cursor-pos"></div>
    `;

    // Create mock game engine
    mockGameEngine = {
      getGameState: vi.fn().mockReturnValue({
        fps: 60,
        blockCount: 0,
        currentTool: 'place',
        currentBlock: 1,
        selectedPosition: null,
      }),
      onGameStateChange: vi.fn(),
      setBlock: vi.fn(),
      setTool: vi.fn(),
      toggleRain: vi.fn(),
      toggleSnow: vi.fn(),
      regenerateWorld: vi.fn(),
    } as unknown as VoxelGameEngine;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clear URL parameters
    window.history.replaceState({}, '', window.location.pathname);
  });

  describe('Device Mode Detection', () => {
    it('should detect mobile mode when DeviceDetector reports mobile', () => {
      // Mock DeviceDetector to return mobile
      vi.spyOn(DeviceDetector.prototype, 'isMobile').mockReturnValue(true);
      vi.spyOn(DeviceDetector.prototype, 'isTablet').mockReturnValue(false);
      vi.spyOn(DeviceDetector.prototype, 'isDesktop').mockReturnValue(false);

      uiManager = new VoxelUIManager(mockGameEngine);

      // Should detect as mobile mode
      expect((uiManager as VoxelUIManagerPrivate).isMobileMode()).toBe(true);
    });

    it('should detect mobile mode when DeviceDetector reports tablet', () => {
      // Mock DeviceDetector to return tablet
      vi.spyOn(DeviceDetector.prototype, 'isMobile').mockReturnValue(false);
      vi.spyOn(DeviceDetector.prototype, 'isTablet').mockReturnValue(true);
      vi.spyOn(DeviceDetector.prototype, 'isDesktop').mockReturnValue(false);

      uiManager = new VoxelUIManager(mockGameEngine);

      // Tablets should use mobile UI
      expect((uiManager as unknown as VoxelUIManagerPrivate).isMobileMode()).toBe(true);
    });

    it('should detect desktop mode when DeviceDetector reports desktop', () => {
      // Mock DeviceDetector to return desktop
      vi.spyOn(DeviceDetector.prototype, 'isMobile').mockReturnValue(false);
      vi.spyOn(DeviceDetector.prototype, 'isTablet').mockReturnValue(false);
      vi.spyOn(DeviceDetector.prototype, 'isDesktop').mockReturnValue(true);

      uiManager = new VoxelUIManager(mockGameEngine);

      expect((uiManager as unknown as VoxelUIManagerPrivate).isMobileMode()).toBe(false);
    });
  });

  describe('URL Parameter Override', () => {
    it('should force mobile mode when URL has ?mode=mobile', () => {
      // Mock desktop device
      vi.spyOn(DeviceDetector.prototype, 'isMobile').mockReturnValue(false);
      vi.spyOn(DeviceDetector.prototype, 'isTablet').mockReturnValue(false);
      vi.spyOn(DeviceDetector.prototype, 'isDesktop').mockReturnValue(true);

      // Set URL parameter
      window.history.replaceState({}, '', '?mode=mobile');

      uiManager = new VoxelUIManager(mockGameEngine);

      // Should override to mobile mode
      expect((uiManager as unknown as VoxelUIManagerPrivate).isMobileMode()).toBe(true);
    });

    it('should force desktop mode when URL has ?mode=desktop', () => {
      // Mock mobile device
      vi.spyOn(DeviceDetector.prototype, 'isMobile').mockReturnValue(true);
      vi.spyOn(DeviceDetector.prototype, 'isTablet').mockReturnValue(false);
      vi.spyOn(DeviceDetector.prototype, 'isDesktop').mockReturnValue(false);

      // Set URL parameter
      window.history.replaceState({}, '', '?mode=desktop');

      uiManager = new VoxelUIManager(mockGameEngine);

      // Should override to desktop mode
      expect((uiManager as unknown as VoxelUIManagerPrivate).isMobileMode()).toBe(false);
    });

    it('should ignore invalid mode parameter', () => {
      // Mock desktop device
      vi.spyOn(DeviceDetector.prototype, 'isMobile').mockReturnValue(false);
      vi.spyOn(DeviceDetector.prototype, 'isTablet').mockReturnValue(false);
      vi.spyOn(DeviceDetector.prototype, 'isDesktop').mockReturnValue(true);

      // Set invalid URL parameter
      window.history.replaceState({}, '', '?mode=invalid');

      uiManager = new VoxelUIManager(mockGameEngine);

      // Should fall back to device detection
      expect((uiManager as unknown as VoxelUIManagerPrivate).isMobileMode()).toBe(false);
    });

    it('should prioritize URL parameter over device detection', () => {
      // Mock mobile device
      vi.spyOn(DeviceDetector.prototype, 'isMobile').mockReturnValue(true);

      // But force desktop mode via URL
      window.history.replaceState({}, '', '?mode=desktop');

      uiManager = new VoxelUIManager(mockGameEngine);

      expect((uiManager as unknown as VoxelUIManagerPrivate).isMobileMode()).toBe(false);
    });
  });

  describe('Conditional UI Rendering', () => {
    it('should call renderMobileUI when in mobile mode', () => {
      // Mock mobile device
      vi.spyOn(DeviceDetector.prototype, 'isMobile').mockReturnValue(true);

      // Spy on renderMobileUI method (will be implemented)
      const renderMobileSpy = vi.spyOn(VoxelUIManager.prototype as unknown as VoxelUIManagerPrivate, 'renderMobileUI');
      const renderDesktopSpy = vi.spyOn(VoxelUIManager.prototype as unknown as VoxelUIManagerPrivate, 'renderDesktopUI');

      uiManager = new VoxelUIManager(mockGameEngine);

      // Should call renderMobileUI, not renderDesktopUI
      expect(renderMobileSpy).toHaveBeenCalledTimes(1);
      expect(renderDesktopSpy).not.toHaveBeenCalled();
    });

    it('should call renderDesktopUI when in desktop mode', () => {
      // Mock desktop device
      vi.spyOn(DeviceDetector.prototype, 'isMobile').mockReturnValue(false);
      vi.spyOn(DeviceDetector.prototype, 'isTablet').mockReturnValue(false);
      vi.spyOn(DeviceDetector.prototype, 'isDesktop').mockReturnValue(true);

      // Spy on render methods
      const renderMobileSpy = vi.spyOn(VoxelUIManager.prototype as unknown as VoxelUIManagerPrivate, 'renderMobileUI');
      const renderDesktopSpy = vi.spyOn(VoxelUIManager.prototype as unknown as VoxelUIManagerPrivate, 'renderDesktopUI');

      uiManager = new VoxelUIManager(mockGameEngine);

      // Should call renderDesktopUI, not renderMobileUI
      expect(renderDesktopSpy).toHaveBeenCalledTimes(1);
      expect(renderMobileSpy).not.toHaveBeenCalled();
    });
  });

  describe('Mobile UI Rendering', () => {
    it('should not render desktop toolbar in mobile mode', () => {
      // Mock mobile device
      vi.spyOn(DeviceDetector.prototype, 'isMobile').mockReturnValue(true);

      uiManager = new VoxelUIManager(mockGameEngine);

      const toolbar = document.getElementById('toolbar');

      // Desktop toolbar should be hidden or have mobile class
      expect(
        toolbar?.classList.contains('hidden') ||
        toolbar?.classList.contains('mobile-mode')
      ).toBe(true);
    });

    it('should preserve desktop UI elements in desktop mode', () => {
      // Mock desktop device
      vi.spyOn(DeviceDetector.prototype, 'isMobile').mockReturnValue(false);
      vi.spyOn(DeviceDetector.prototype, 'isDesktop').mockReturnValue(true);

      uiManager = new VoxelUIManager(mockGameEngine);

      const toolbar = document.getElementById('toolbar');
      const categoryTabs = document.getElementById('category-tabs');
      const blockGrid = document.getElementById('block-grid');

      // Desktop elements should be visible
      expect(toolbar?.classList.contains('hidden')).toBe(false);
      expect(categoryTabs?.children.length).toBeGreaterThan(0);
      expect(blockGrid).toBeTruthy();
    });
  });

  describe('DeviceDetector Integration', () => {
    it('should create DeviceDetector instance', () => {
      uiManager = new VoxelUIManager(mockGameEngine);

      // Should have deviceDetector property
      expect((uiManager as unknown as VoxelUIManagerPrivate).deviceDetector).toBeDefined();
      expect((uiManager as unknown as VoxelUIManagerPrivate).deviceDetector).toBeInstanceOf(DeviceDetector);
    });

    it('should use DeviceDetector methods for mode detection', () => {
      const isMobileSpy = vi.spyOn(DeviceDetector.prototype, 'isMobile');
      const isTabletSpy = vi.spyOn(DeviceDetector.prototype, 'isTablet');

      uiManager = new VoxelUIManager(mockGameEngine);
      (uiManager as unknown as VoxelUIManagerPrivate).isMobileMode();

      // Should call DeviceDetector methods
      expect(isMobileSpy).toHaveBeenCalled();
      expect(isTabletSpy).toHaveBeenCalled();
    });
  });

  describe('Backwards Compatibility', () => {
    it('should maintain existing desktop functionality', () => {
      // Mock desktop device
      vi.spyOn(DeviceDetector.prototype, 'isDesktop').mockReturnValue(true);
      vi.spyOn(DeviceDetector.prototype, 'isMobile').mockReturnValue(false);

      uiManager = new VoxelUIManager(mockGameEngine);

      // All existing methods should work
      expect(uiManager.renderCategoryTabs).toBeDefined();
      expect(uiManager.renderBlockGrid).toBeDefined();
      expect(uiManager.renderCompactToggle).toBeDefined();
      expect(uiManager.getCategoryManager).toBeDefined();

      // Call existing methods - should not throw
      expect(() => {
        uiManager.renderCategoryTabs();
        uiManager.renderBlockGrid();
        uiManager.renderCompactToggle();
      }).not.toThrow();
    });

    it('should not break existing game engine integration', () => {
      vi.spyOn(DeviceDetector.prototype, 'isDesktop').mockReturnValue(true);

      uiManager = new VoxelUIManager(mockGameEngine);

      // Game engine callbacks should be registered
      expect(mockGameEngine.onGameStateChange).toHaveBeenCalledTimes(1);
      expect(mockGameEngine.onGameStateChange).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
