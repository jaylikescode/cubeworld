import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TouchBlockController } from '../../src/input/TouchBlockController';
import { BlockType } from '../../src/types/VoxelTypes';

/**
 * TouchBlockController Tests
 * Part of Phase 2.2: Touch Block Placement/Removal
 *
 * Functionality:
 * - Tap to place/remove blocks
 * - Visual tap feedback
 * - Long press for alternative actions (e.g., quick delete mode)
 * - Prevent accidental taps during camera movement
 */
describe('TouchBlockController', () => {
  let controller: TouchBlockController;
  let canvas: HTMLCanvasElement;
  let mockPlaceBlockCallback: ReturnType<typeof vi.fn>;
  let mockRemoveBlockCallback: ReturnType<typeof vi.fn>;
  let mockGetBlockAtPositionCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create canvas element for testing
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);

    // Create mock callbacks
    mockPlaceBlockCallback = vi.fn();
    mockRemoveBlockCallback = vi.fn();
    mockGetBlockAtPositionCallback = vi.fn().mockReturnValue(BlockType.AIR);

    controller = new TouchBlockController(canvas, {
      onPlaceBlock: mockPlaceBlockCallback,
      onRemoveBlock: mockRemoveBlockCallback,
      getBlockAtPosition: mockGetBlockAtPositionCallback,
    });
  });

  afterEach(() => {
    controller.destroy();
    document.body.removeChild(canvas);
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should create controller instance', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(TouchBlockController);
    });

    it('should attach touch event listeners', () => {
      const addEventListenerSpy = vi.spyOn(canvas, 'addEventListener');

      const newController = new TouchBlockController(canvas, {
        onPlaceBlock: mockPlaceBlockCallback,
        onRemoveBlock: mockRemoveBlockCallback,
        getBlockAtPosition: mockGetBlockAtPositionCallback,
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), expect.any(Object));
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function), expect.any(Object));

      newController.destroy();
    });

    it('should be enabled by default', () => {
      expect(controller.isEnabled()).toBe(true);
    });

    it('should have default current block type', () => {
      expect(controller.getCurrentBlock()).toBe(BlockType.GRASS);
    });
  });

  describe('Tap to Place Block', () => {
    it('should place block on quick tap', () => {
      // Set current block
      controller.setCurrentBlock(BlockType.STONE);

      // Simulate tap
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      // Quick release (within tap threshold)
      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd);

      // Should call place block
      expect(mockPlaceBlockCallback).toHaveBeenCalledWith(100, 100, BlockType.STONE);
    });

    it('should not place block if touch moved too much', () => {
      controller.setCurrentBlock(BlockType.STONE);

      // Start touch
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      // Move significantly (camera drag)
      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 150, clientY: 150, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchMove);

      // Release
      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 150, clientY: 150, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd);

      // Should NOT place block (was a drag)
      expect(mockPlaceBlockCallback).not.toHaveBeenCalled();
    });

    it('should not place block if touch duration too long', () => {
      controller.setCurrentBlock(BlockType.STONE);

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      // Wait longer than tap threshold
      vi.useFakeTimers();
      vi.advanceTimersByTime(400);

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd);

      // Should NOT place block (was a long press)
      expect(mockPlaceBlockCallback).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should not place block during multi-touch', () => {
      controller.setCurrentBlock(BlockType.STONE);

      // Two finger touch
      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100, identifier: 0 } as Touch,
          { clientX: 200, clientY: 200, identifier: 1 } as Touch,
        ],
      });
      canvas.dispatchEvent(touchStart);

      const touchEnd = new TouchEvent('touchend', {
        touches: [{ clientX: 200, clientY: 200, identifier: 1 } as Touch],
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd);

      // Should NOT place block (multi-touch is for camera control)
      expect(mockPlaceBlockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Tap to Remove Block', () => {
    it('should remove block when tapping existing block', () => {
      // Mock existing block at position
      mockGetBlockAtPositionCallback.mockReturnValue(BlockType.STONE);

      // Tap to remove
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd);

      // Should call remove block
      expect(mockRemoveBlockCallback).toHaveBeenCalledWith(100, 100);
      expect(mockPlaceBlockCallback).not.toHaveBeenCalled();
    });

    it('should place block when tapping empty space', () => {
      // Mock empty space
      mockGetBlockAtPositionCallback.mockReturnValue(BlockType.AIR);
      controller.setCurrentBlock(BlockType.WOOD);

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd);

      // Should place block
      expect(mockPlaceBlockCallback).toHaveBeenCalledWith(100, 100, BlockType.WOOD);
      expect(mockRemoveBlockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Visual Feedback', () => {
    it('should show tap feedback indicator on touch', () => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      // Check if feedback element exists
      const feedback = document.querySelector('.touch-feedback');
      expect(feedback).toBeTruthy();
    });

    it('should remove tap feedback after animation', () => {
      vi.useFakeTimers();

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd);

      // Initially should exist
      expect(document.querySelector('.touch-feedback')).toBeTruthy();

      // After animation duration
      vi.advanceTimersByTime(500);

      // Should be removed
      expect(document.querySelector('.touch-feedback')).toBeFalsy();

      vi.useRealTimers();
    });

    it('should position feedback at touch location', () => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 150, clientY: 200, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      const feedback = document.querySelector('.touch-feedback') as HTMLElement;
      expect(feedback).toBeTruthy();

      // Check if positioned correctly (accounting for canvas offset)
      const style = feedback.style;
      expect(style.left).toBeTruthy();
      expect(style.top).toBeTruthy();
    });
  });

  describe('Long Press', () => {
    it('should trigger long press callback', (done) => {
      const longPressCallback = vi.fn();
      controller.onLongPress(longPressCallback);

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      // Wait for long press duration
      setTimeout(() => {
        expect(longPressCallback).toHaveBeenCalledWith(100, 100);
        done();
      }, 600);
    });

    it('should not trigger long press if touch moved', (done) => {
      const longPressCallback = vi.fn();
      controller.onLongPress(longPressCallback);

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      // Move touch
      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 120, clientY: 120, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchMove);

      setTimeout(() => {
        expect(longPressCallback).not.toHaveBeenCalled();
        done();
      }, 600);
    });

    it('should enable quick delete mode on long press', (done) => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      // Wait for long press duration
      setTimeout(() => {
        // Should be in quick delete mode
        expect(controller.isQuickDeleteMode()).toBe(true);
        done();
      }, 600);
    });

    it('should exit quick delete mode on touch end', (done) => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      setTimeout(() => {
        expect(controller.isQuickDeleteMode()).toBe(true);

        const touchEnd = new TouchEvent('touchend', {
          touches: [],
          changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
        });
        canvas.dispatchEvent(touchEnd);

        expect(controller.isQuickDeleteMode()).toBe(false);
        done();
      }, 600);
    });
  });

  describe('Current Block Management', () => {
    it('should set current block type', () => {
      controller.setCurrentBlock(BlockType.DIAMOND_ORE);
      expect(controller.getCurrentBlock()).toBe(BlockType.DIAMOND_ORE);
    });

    it('should use current block when placing', () => {
      mockGetBlockAtPositionCallback.mockReturnValue(BlockType.AIR);

      controller.setCurrentBlock(BlockType.GOLD_BLOCK);

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd);

      expect(mockPlaceBlockCallback).toHaveBeenCalledWith(100, 100, BlockType.GOLD_BLOCK);
    });
  });

  describe('Enable/Disable', () => {
    it('should enable controller', () => {
      controller.disable();
      expect(controller.isEnabled()).toBe(false);

      controller.enable();
      expect(controller.isEnabled()).toBe(true);
    });

    it('should not process touches when disabled', () => {
      controller.disable();
      mockGetBlockAtPositionCallback.mockReturnValue(BlockType.AIR);

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd);

      expect(mockPlaceBlockCallback).not.toHaveBeenCalled();
      expect(mockRemoveBlockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Tap Threshold Configuration', () => {
    it('should allow configuring tap movement threshold', () => {
      controller.setTapMovementThreshold(20);

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      // Move 15px (within new threshold)
      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 115, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchMove);

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 115, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd);

      // Should still place block (within threshold)
      expect(mockPlaceBlockCallback).toHaveBeenCalled();
    });

    it('should allow configuring tap duration threshold', () => {
      vi.useFakeTimers();

      controller.setTapDurationThreshold(400);

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      // Wait 350ms (within new threshold)
      vi.advanceTimersByTime(350);

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd);

      // Should place block
      expect(mockPlaceBlockCallback).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on destroy', () => {
      const removeEventListenerSpy = vi.spyOn(canvas, 'removeEventListener');

      controller.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    });

    it('should remove all feedback elements on destroy', () => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      expect(document.querySelector('.touch-feedback')).toBeTruthy();

      controller.destroy();

      expect(document.querySelector('.touch-feedback')).toBeFalsy();
    });
  });
});
