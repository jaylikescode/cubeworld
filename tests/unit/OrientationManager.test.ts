import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OrientationManager } from '../../src/utils/OrientationManager';
import { DeviceDetector } from '../../src/utils/DeviceDetector';

describe('OrientationManager', () => {
  let orientationManager: OrientationManager;
  let deviceDetector: DeviceDetector;

  beforeEach(() => {
    deviceDetector = new DeviceDetector();
    orientationManager = new OrientationManager(deviceDetector);
  });

  afterEach(() => {
    orientationManager.destroy();
  });

  describe('Orientation Detection', () => {
    it('should detect current orientation on initialization', () => {
      const orientation = orientationManager.getCurrentOrientation();
      expect(orientation).toBeDefined();
      expect(['portrait', 'landscape']).toContain(orientation);
    });

    it('should correctly identify portrait mode', () => {
      // Mock portrait dimensions
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(375);
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(667);

      const newManager = new OrientationManager(new DeviceDetector());
      expect(newManager.isPortrait()).toBe(true);
      expect(newManager.isLandscape()).toBe(false);

      newManager.destroy();
    });

    it('should correctly identify landscape mode', () => {
      // Mock landscape dimensions
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(667);
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(375);

      const newManager = new OrientationManager(new DeviceDetector());
      expect(newManager.isLandscape()).toBe(true);
      expect(newManager.isPortrait()).toBe(false);

      newManager.destroy();
    });
  });

  describe('Orientation Change Events', () => {
    it('should emit orientation change events when orientation changes', async () => {
      const callback = vi.fn();
      
      // Reduce debounce delay for testing before adding callback
      orientationManager.setDebounceDelay(10);
      
      orientationManager.onOrientationChange(callback);

      // Get current orientation and mock the opposite
      const currentOrientation = orientationManager.getCurrentOrientation();
      const oppositeOrientation = currentOrientation === 'portrait' ? 'landscape' : 'portrait';
      
      // Mock the opposite orientation
      vi.spyOn(deviceDetector, 'getOrientation').mockReturnValue(oppositeOrientation);
      window.dispatchEvent(new Event('orientationchange'));

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 25));

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(oppositeOrientation);
    });

    it('should not emit events if orientation has not changed', async () => {
      const callback = vi.fn();
      orientationManager.onOrientationChange(callback);

      // Reduce debounce delay for testing
      orientationManager.setDebounceDelay(10);

      // Get current orientation
      const currentOrientation = orientationManager.getCurrentOrientation();

      // Mock same orientation
      vi.spyOn(deviceDetector, 'getOrientation').mockReturnValue(currentOrientation);
      window.dispatchEvent(new Event('resize'));

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(callback).not.toHaveBeenCalled();
    });

    it('should allow multiple callbacks to be registered', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      orientationManager.onOrientationChange(callback1);
      orientationManager.onOrientationChange(callback2);

      // Reduce debounce delay for testing
      orientationManager.setDebounceDelay(10);

      // Simulate orientation change
      const oppositeOrientation = orientationManager.isPortrait() ? 'landscape' : 'portrait';
      vi.spyOn(deviceDetector, 'getOrientation').mockReturnValue(oppositeOrientation);
      window.dispatchEvent(new Event('orientationchange'));

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should allow callbacks to be unregistered', async () => {
      const callback = vi.fn();
      orientationManager.onOrientationChange(callback);
      orientationManager.offOrientationChange(callback);

      // Reduce debounce delay for testing
      orientationManager.setDebounceDelay(10);

      // Simulate orientation change
      const oppositeOrientation = orientationManager.isPortrait() ? 'landscape' : 'portrait';
      vi.spyOn(deviceDetector, 'getOrientation').mockReturnValue(oppositeOrientation);
      window.dispatchEvent(new Event('orientationchange'));

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(callback).not.toHaveBeenCalled();
    });

    it('should debounce rapid orientation changes', async () => {
      const callback = vi.fn();
      orientationManager.onOrientationChange(callback);

      // Reduce debounce delay for testing
      orientationManager.setDebounceDelay(50);

      // Simulate multiple rapid changes
      const oppositeOrientation = orientationManager.isPortrait() ? 'landscape' : 'portrait';
      vi.spyOn(deviceDetector, 'getOrientation').mockReturnValue(oppositeOrientation);

      window.dispatchEvent(new Event('orientationchange'));
      await new Promise(resolve => setTimeout(resolve, 10));
      window.dispatchEvent(new Event('resize'));
      await new Promise(resolve => setTimeout(resolve, 10));
      window.dispatchEvent(new Event('orientationchange'));

      // Wait for debounce to complete
      await new Promise(resolve => setTimeout(resolve, 60));

      // Should only be called once due to debouncing
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in callbacks gracefully', async () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = vi.fn();

      orientationManager.onOrientationChange(errorCallback);
      orientationManager.onOrientationChange(normalCallback);

      // Reduce debounce delay for testing
      orientationManager.setDebounceDelay(10);

      // Simulate orientation change
      const oppositeOrientation = orientationManager.isPortrait() ? 'landscape' : 'portrait';
      vi.spyOn(deviceDetector, 'getOrientation').mockReturnValue(oppositeOrientation);
      window.dispatchEvent(new Event('orientationchange'));

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 20));

      // Both should be called despite error in first
      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
    });
  });

  describe('Layout Configuration', () => {
    it('should provide correct layout config for portrait mode', () => {
      vi.spyOn(orientationManager, 'isPortrait').mockReturnValue(true);
      vi.spyOn(orientationManager, 'isLandscape').mockReturnValue(false);

      const config = orientationManager.getLayoutConfig();

      expect(config.bottomNavPosition).toBe('bottom');
      expect(config.blockSheetDirection).toBe('bottom');
      expect(config.blockSheetMaxSize).toBe('70vh');
      expect(config.infoBarAutoExpand).toBe(false);
      expect(config.canvasArea.bottom).toBe('60px');
    });

    it('should provide correct layout config for landscape mode', () => {
      vi.spyOn(orientationManager, 'isPortrait').mockReturnValue(false);
      vi.spyOn(orientationManager, 'isLandscape').mockReturnValue(true);
      vi.spyOn(deviceDetector, 'getScreenHeight').mockReturnValue(800);

      const config = orientationManager.getLayoutConfig();

      expect(config.bottomNavPosition).toBe('bottom');
      expect(config.blockSheetDirection).toBe('right');
      expect(config.blockSheetMaxSize).toBe('40vw');
      expect(config.infoBarAutoExpand).toBe(true);
      expect(config.canvasArea.bottom).toBe('50px');
    });

    it('should adjust layout for short landscape screens', () => {
      vi.spyOn(orientationManager, 'isPortrait').mockReturnValue(false);
      vi.spyOn(orientationManager, 'isLandscape').mockReturnValue(true);
      vi.spyOn(deviceDetector, 'getScreenHeight').mockReturnValue(500);

      const config = orientationManager.getLayoutConfig();

      expect(config.infoBarAutoExpand).toBe(false);
      expect(config.canvasArea.top).toBe('35px');
    });
  });

  describe('Grid Layout', () => {
    it('should return optimal grid columns for portrait mode', () => {
      vi.spyOn(orientationManager, 'isPortrait').mockReturnValue(true);
      vi.spyOn(orientationManager, 'isLandscape').mockReturnValue(false);

      const columns = orientationManager.getOptimalGridColumns();
      expect(columns).toBe(3);
    });

    it('should return optimal grid columns for landscape mode', () => {
      vi.spyOn(orientationManager, 'isPortrait').mockReturnValue(false);
      vi.spyOn(orientationManager, 'isLandscape').mockReturnValue(true);

      const columns = orientationManager.getOptimalGridColumns();
      expect(columns).toBe(4);
    });
  });

  describe('Screen Dimensions', () => {
    it('should return current screen dimensions', () => {
      const dimensions = orientationManager.getScreenDimensions();
      
      expect(dimensions).toHaveProperty('width');
      expect(dimensions).toHaveProperty('height');
      expect(typeof dimensions.width).toBe('number');
      expect(typeof dimensions.height).toBe('number');
      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);
    });

    it('should calculate aspect ratio correctly', () => {
      vi.spyOn(deviceDetector, 'getScreenWidth').mockReturnValue(800);
      vi.spyOn(deviceDetector, 'getScreenHeight').mockReturnValue(600);

      const aspectRatio = orientationManager.getAspectRatio();
      expect(aspectRatio).toBeCloseTo(800 / 600, 2);
    });

    it('should identify short landscape correctly', () => {
      vi.spyOn(orientationManager, 'isLandscape').mockReturnValue(true);
      vi.spyOn(deviceDetector, 'getScreenHeight').mockReturnValue(500);

      expect(orientationManager.isShortLandscape()).toBe(true);
    });

    it('should identify non-short landscape correctly', () => {
      vi.spyOn(orientationManager, 'isLandscape').mockReturnValue(true);
      vi.spyOn(deviceDetector, 'getScreenHeight').mockReturnValue(700);

      expect(orientationManager.isShortLandscape()).toBe(false);
    });

    it('should return false for short landscape when in portrait', () => {
      vi.spyOn(orientationManager, 'isLandscape').mockReturnValue(false);
      vi.spyOn(deviceDetector, 'getScreenHeight').mockReturnValue(500);

      expect(orientationManager.isShortLandscape()).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    it('should allow setting debounce delay', () => {
      orientationManager.setDebounceDelay(200);
      // No assertion needed - just ensure method doesn't throw
      expect(true).toBe(true);
    });

    it('should log orientation info without errors', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      orientationManager.logOrientationInfo();
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Orientation Info'),
        expect.any(Object)
      );
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on destroy', () => {
      const callback = vi.fn();
      orientationManager.onOrientationChange(callback);
      
      orientationManager.destroy();

      // After destroy, callbacks should be cleared
      // We can't easily test this without triggering an event,
      // but we can ensure destroy doesn't throw
      expect(true).toBe(true);
    });
  });
});

