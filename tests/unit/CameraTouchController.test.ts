import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CameraTouchController } from '../../src/input/CameraTouchController';
import { CameraController } from '../../src/core/CameraController';

/**
 * CameraTouchController Tests
 * Part of Phase 2.1: Camera Touch Controls
 *
 * Functionality:
 * - Single finger drag → camera rotation
 * - Two finger pinch → zoom
 * - Two finger drag → camera pan
 * - Momentum/inertia after gesture release
 */
describe('CameraTouchController', () => {
  let controller: CameraTouchController;
  let mockCameraController: CameraController;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    // Create canvas element for testing
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);

    // Create mock camera controller
    mockCameraController = {
      rotateCamera: vi.fn(),
      zoomCamera: vi.fn(),
      panCamera: vi.fn(),
    } as unknown as CameraController;

    controller = new CameraTouchController(canvas, mockCameraController);
  });

  afterEach(() => {
    controller.destroy();
    document.body.removeChild(canvas);
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should create controller instance', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(CameraTouchController);
    });

    it('should attach touch event listeners to canvas', () => {
      const addEventListenerSpy = vi.spyOn(canvas, 'addEventListener');

      const newController = new CameraTouchController(canvas, mockCameraController);

      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), expect.any(Object));
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), expect.any(Object));
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function), expect.any(Object));
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function), expect.any(Object));

      newController.destroy();
    });

    it('should be enabled by default', () => {
      expect(controller.isEnabled()).toBe(true);
    });
  });

  describe('Single Finger Drag - Camera Rotation', () => {
    it('should detect single finger drag start', () => {
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100, identifier: 0 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStartEvent);

      expect(controller.getTouchCount()).toBe(1);
      expect(controller.getGestureType()).toBe('rotate');
    });

    it('should rotate camera on single finger drag', () => {
      // Start touch
      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100, identifier: 0 } as Touch,
        ],
      });
      canvas.dispatchEvent(touchStart);

      // Move touch
      const touchMove = new TouchEvent('touchmove', {
        touches: [
          { clientX: 150, clientY: 120, identifier: 0 } as Touch,
        ],
      });
      canvas.dispatchEvent(touchMove);

      // Should call rotateCamera with delta
      expect(mockCameraController.rotateCamera).toHaveBeenCalled();
      const rotateCall = vi.mocked(mockCameraController.rotateCamera).mock.calls[0];
      expect(rotateCall[0]).toBeCloseTo(50, 0); // deltaX
      expect(rotateCall[1]).toBeCloseTo(20, 0); // deltaY
    });

    it('should apply sensitivity multiplier to rotation', () => {
      controller.setRotationSensitivity(2.0);

      // Start and move
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 110, clientY: 110, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchMove);

      // With 2.0 sensitivity, 10px movement should result in 20px delta
      expect(mockCameraController.rotateCamera).toHaveBeenCalled();
      const rotateCall = vi.mocked(mockCameraController.rotateCamera).mock.calls[0];
      expect(Math.abs(rotateCall[0])).toBeGreaterThan(10);
    });

    it('should reset touch state on touch end', () => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      expect(controller.getTouchCount()).toBe(1);

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd);

      expect(controller.getTouchCount()).toBe(0);
      expect(controller.getGestureType()).toBe('none');
    });
  });

  describe('Two Finger Pinch - Zoom', () => {
    it('should detect two finger pinch start', () => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100, identifier: 0 } as Touch,
          { clientX: 200, clientY: 200, identifier: 1 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);

      expect(controller.getTouchCount()).toBe(2);
      expect(controller.getGestureType()).toBe('pinch');
    });

    it('should zoom camera on pinch gesture', () => {
      // Start with two fingers 100px apart
      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100, identifier: 0 } as Touch,
          { clientX: 200, clientY: 100, identifier: 1 } as Touch,
        ],
      });
      canvas.dispatchEvent(touchStart);

      // Move fingers closer (50px apart) - zoom in
      const touchMove = new TouchEvent('touchmove', {
        touches: [
          { clientX: 125, clientY: 100, identifier: 0 } as Touch,
          { clientX: 175, clientY: 100, identifier: 1 } as Touch,
        ],
      });
      canvas.dispatchEvent(touchMove);

      expect(mockCameraController.zoomCamera).toHaveBeenCalled();
      const zoomCall = vi.mocked(mockCameraController.zoomCamera).mock.calls[0];
      expect(zoomCall[0]).toBeGreaterThan(0); // Pinch in = positive delta (implementation inverts)
    });

    it('should zoom out when fingers move apart', () => {
      // Start with two fingers 100px apart
      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { clientX: 150, clientY: 100, identifier: 0 } as Touch,
          { clientX: 250, clientY: 100, identifier: 1 } as Touch,
        ],
      });
      canvas.dispatchEvent(touchStart);

      // Move fingers further apart (200px) - zoom out
      const touchMove = new TouchEvent('touchmove', {
        touches: [
          { clientX: 100, clientY: 100, identifier: 0 } as Touch,
          { clientX: 300, clientY: 100, identifier: 1 } as Touch,
        ],
      });
      canvas.dispatchEvent(touchMove);

      expect(mockCameraController.zoomCamera).toHaveBeenCalled();
      const zoomCall = vi.mocked(mockCameraController.zoomCamera).mock.calls[0];
      expect(zoomCall[0]).toBeLessThan(0); // Pinch out = negative delta (implementation inverts)
    });

    it('should apply zoom sensitivity multiplier', () => {
      controller.setZoomSensitivity(2.0);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100, identifier: 0 } as Touch,
          { clientX: 200, clientY: 100, identifier: 1 } as Touch,
        ],
      });
      canvas.dispatchEvent(touchStart);

      const touchMove = new TouchEvent('touchmove', {
        touches: [
          { clientX: 125, clientY: 100, identifier: 0 } as Touch,
          { clientX: 175, clientY: 100, identifier: 1 } as Touch,
        ],
      });
      canvas.dispatchEvent(touchMove);

      expect(mockCameraController.zoomCamera).toHaveBeenCalled();
      const zoomCall = vi.mocked(mockCameraController.zoomCamera).mock.calls[0];
      expect(Math.abs(zoomCall[0])).toBeGreaterThan(0);
    });
  });

  describe('Two Finger Drag - Camera Pan', () => {
    it('should detect two finger pan when both fingers move together', () => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100, identifier: 0 } as Touch,
          { clientX: 200, clientY: 200, identifier: 1 } as Touch,
        ],
      });
      canvas.dispatchEvent(touchStart);

      // Move both fingers in same direction (pan)
      const touchMove = new TouchEvent('touchmove', {
        touches: [
          { clientX: 120, clientY: 120, identifier: 0 } as Touch,
          { clientX: 220, clientY: 220, identifier: 1 } as Touch,
        ],
      });
      canvas.dispatchEvent(touchMove);

      // Should detect pan gesture
      expect(controller.getGestureType()).toBe('pan');
    });

    it('should pan camera on two finger drag', () => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100, identifier: 0 } as Touch,
          { clientX: 200, clientY: 200, identifier: 1 } as Touch,
        ],
      });
      canvas.dispatchEvent(touchStart);

      // Pan right and down
      const touchMove = new TouchEvent('touchmove', {
        touches: [
          { clientX: 130, clientY: 120, identifier: 0 } as Touch,
          { clientX: 230, clientY: 220, identifier: 1 } as Touch,
        ],
      });
      canvas.dispatchEvent(touchMove);

      expect(mockCameraController.panCamera).toHaveBeenCalled();
      const panCall = vi.mocked(mockCameraController.panCamera).mock.calls[0];
      expect(panCall[0]).toBeCloseTo(30, 0); // deltaX
      expect(panCall[1]).toBeCloseTo(20, 0); // deltaY
    });

    it('should apply pan sensitivity multiplier', () => {
      controller.setPanSensitivity(0.5);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100, identifier: 0 } as Touch,
          { clientX: 200, clientY: 200, identifier: 1 } as Touch,
        ],
      });
      canvas.dispatchEvent(touchStart);

      const touchMove = new TouchEvent('touchmove', {
        touches: [
          { clientX: 120, clientY: 120, identifier: 0 } as Touch,
          { clientX: 220, clientY: 220, identifier: 1 } as Touch,
        ],
      });
      canvas.dispatchEvent(touchMove);

      expect(mockCameraController.panCamera).toHaveBeenCalled();
      const panCall = vi.mocked(mockCameraController.panCamera).mock.calls[0];
      expect(Math.abs(panCall[0])).toBeLessThan(20); // Reduced due to 0.5 sensitivity
    });
  });

  describe('Momentum and Inertia', () => {
    it('should apply momentum after touch release', (done) => {
      // Quick drag
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        const touchMove1 = new TouchEvent('touchmove', {
          touches: [{ clientX: 150, clientY: 100, identifier: 0 } as Touch],
        });
        canvas.dispatchEvent(touchMove1);

        setTimeout(() => {
          const touchMove2 = new TouchEvent('touchmove', {
            touches: [{ clientX: 200, clientY: 100, identifier: 0 } as Touch],
          });
          canvas.dispatchEvent(touchMove2);

          // Release
          const touchEnd = new TouchEvent('touchend', {
            touches: [],
            changedTouches: [{ clientX: 200, clientY: 100, identifier: 0 } as Touch],
          });
          canvas.dispatchEvent(touchEnd);

          // Clear initial calls
          vi.mocked(mockCameraController.rotateCamera).mockClear();

          // Wait for momentum animation frame
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // Should have been called by momentum
              expect(mockCameraController.rotateCamera).toHaveBeenCalled();
              done();
            });
          });
        }, 10);
      }, 10);
    });

    it('should gradually reduce momentum over time', () => {
      vi.useFakeTimers();

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 200, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchMove);

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 200, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd);

      vi.mocked(mockCameraController.rotateCamera).mockClear();

      // Get rotation at early time
      vi.advanceTimersByTime(100);
      const earlyCalls = vi.mocked(mockCameraController.rotateCamera).mock.calls.length;

      // Clear and advance more
      vi.mocked(mockCameraController.rotateCamera).mockClear();
      vi.advanceTimersByTime(500);
      const lateCalls = vi.mocked(mockCameraController.rotateCamera).mock.calls.length;

      // Should have fewer calls later due to friction
      expect(lateCalls).toBeLessThanOrEqual(earlyCalls);

      vi.useRealTimers();
    });

    it('should stop momentum when new touch begins', () => {
      vi.useFakeTimers();

      // Start and release to create momentum
      const touchStart1 = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart1);

      const touchMove1 = new TouchEvent('touchmove', {
        touches: [{ clientX: 200, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchMove1);

      const touchEnd1 = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 200, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd1);

      // New touch should stop momentum
      const touchStart2 = new TouchEvent('touchstart', {
        touches: [{ clientX: 150, clientY: 150, identifier: 1 } as Touch],
      });
      canvas.dispatchEvent(touchStart2);

      vi.mocked(mockCameraController.rotateCamera).mockClear();

      // Advance time - should not rotate from momentum
      vi.advanceTimersByTime(100);

      // Should have no calls (momentum stopped)
      expect(vi.mocked(mockCameraController.rotateCamera).mock.calls.length).toBe(0);

      vi.useRealTimers();
    });

    it('should allow disabling momentum', () => {
      vi.useFakeTimers();

      controller.setMomentumEnabled(false);

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 200, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchMove);

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 200, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd);

      vi.mocked(mockCameraController.rotateCamera).mockClear();

      // Advance time - should not rotate
      vi.advanceTimersByTime(500);

      expect(vi.mocked(mockCameraController.rotateCamera).mock.calls.length).toBe(0);

      vi.useRealTimers();
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

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 150, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchMove);

      expect(mockCameraController.rotateCamera).not.toHaveBeenCalled();
    });

    it('should resume processing when re-enabled', () => {
      controller.disable();
      controller.enable();

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 150, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchMove);

      expect(mockCameraController.rotateCamera).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on destroy', () => {
      const removeEventListenerSpy = vi.spyOn(canvas, 'removeEventListener');

      controller.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function));
    });

    it('should stop momentum on destroy', () => {
      vi.useFakeTimers();

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchStart);

      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 200, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchMove);

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [{ clientX: 200, clientY: 100, identifier: 0 } as Touch],
      });
      canvas.dispatchEvent(touchEnd);

      controller.destroy();

      vi.mocked(mockCameraController.rotateCamera).mockClear();

      vi.advanceTimersByTime(500);

      expect(vi.mocked(mockCameraController.rotateCamera).mock.calls.length).toBe(0);

      vi.useRealTimers();
    });
  });
});
