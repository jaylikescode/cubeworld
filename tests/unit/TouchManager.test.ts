import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TouchManager, TouchGesture } from '../../src/input/TouchManager';

describe('TouchManager', () => {
  let touchManager: TouchManager;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    // Create a mock canvas element
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);

    touchManager = new TouchManager(canvas);
  });

  afterEach(() => {
    touchManager.destroy();
    document.body.removeChild(canvas);
  });

  describe('initialization', () => {
    it('should create a TouchManager instance', () => {
      expect(touchManager).toBeDefined();
      expect(touchManager).toBeInstanceOf(TouchManager);
    });

    it('should attach event listeners to canvas', () => {
      const addEventListenerSpy = vi.spyOn(canvas, 'addEventListener');
      const newTouchManager = new TouchManager(canvas);

      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: false });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: false });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function), { passive: false });

      newTouchManager.destroy();
    });

    it('should remove event listeners on destroy', () => {
      const removeEventListenerSpy = vi.spyOn(canvas, 'removeEventListener');
      const newTouchManager = new TouchManager(canvas);
      newTouchManager.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function));
    });
  });

  describe('touch point tracking', () => {
    it('should track active touch points', () => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);
      expect(touchManager.getActiveTouchCount()).toBe(1);
    });

    it('should track multiple simultaneous touches', () => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200 } as Touch,
          { identifier: 1, clientX: 300, clientY: 400 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);
      expect(touchManager.getActiveTouchCount()).toBe(2);
    });

    it('should clear touches on touchend', () => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200 } as Touch,
        ],
      });

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [
          { identifier: 0, clientX: 100, clientY: 200 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);
      expect(touchManager.getActiveTouchCount()).toBe(1);

      canvas.dispatchEvent(touchEnd);
      expect(touchManager.getActiveTouchCount()).toBe(0);
    });

    it('should normalize touch coordinates relative to canvas', () => {
      const callback = vi.fn();
      touchManager.onTap(callback);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);
      canvas.dispatchEvent(touchEnd);

      // Verify callback was called with normalized coordinates
      expect(callback).toHaveBeenCalled();
      const callArgs = callback.mock.calls[0][0];
      expect(callArgs.x).toBeDefined();
      expect(callArgs.y).toBeDefined();
    });
  });

  describe('tap gesture detection', () => {
    it('should detect single tap', () => {
      const callback = vi.fn();
      touchManager.onTap(callback);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);
      canvas.dispatchEvent(touchEnd);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
      }));
    });

    it('should not detect tap if touch moved too far', () => {
      const callback = vi.fn();
      touchManager.onTap(callback);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      const touchMove = new TouchEvent('touchmove', {
        touches: [
          { identifier: 0, clientX: 200, clientY: 300, pageX: 200, pageY: 300 } as Touch,
        ],
      });

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [
          { identifier: 0, clientX: 200, clientY: 300, pageX: 200, pageY: 300 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);
      canvas.dispatchEvent(touchMove);
      canvas.dispatchEvent(touchEnd);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should not detect tap if duration too long', async () => {
      const callback = vi.fn();
      touchManager.onTap(callback);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);

      // Wait longer than tap threshold (typically 300ms)
      await new Promise(resolve => setTimeout(resolve, 350));

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchEnd);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('long press gesture detection', () => {
    it('should detect long press', async () => {
      const callback = vi.fn();
      touchManager.onLongPress(callback);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);

      // Wait for long press threshold (typically 500ms)
      await new Promise(resolve => setTimeout(resolve, 550));

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
      }));
    });

    it('should cancel long press on touch move', async () => {
      const callback = vi.fn();
      touchManager.onLongPress(callback);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);

      // Move before long press threshold
      await new Promise(resolve => setTimeout(resolve, 200));

      const touchMove = new TouchEvent('touchmove', {
        touches: [
          { identifier: 0, clientX: 150, clientY: 250, pageX: 150, pageY: 250 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchMove);

      // Wait remaining time
      await new Promise(resolve => setTimeout(resolve, 400));

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('drag gesture detection', () => {
    it('should detect single finger drag', () => {
      const callback = vi.fn();
      touchManager.onDrag(callback);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      const touchMove = new TouchEvent('touchmove', {
        touches: [
          { identifier: 0, clientX: 150, clientY: 250, pageX: 150, pageY: 250 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);
      canvas.dispatchEvent(touchMove);

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        deltaX: expect.any(Number),
        deltaY: expect.any(Number),
        fingerCount: 1,
      }));
    });

    it('should track drag delta correctly', () => {
      const callback = vi.fn();
      touchManager.onDrag(callback);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      const touchMove = new TouchEvent('touchmove', {
        touches: [
          { identifier: 0, clientX: 150, clientY: 250, pageX: 150, pageY: 250 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);
      canvas.dispatchEvent(touchMove);

      expect(callback).toHaveBeenCalled();
      const dragData = callback.mock.calls[0][0];
      expect(Math.abs(dragData.deltaX)).toBeGreaterThan(0);
      expect(Math.abs(dragData.deltaY)).toBeGreaterThan(0);
    });

    it('should detect two finger drag', () => {
      const callback = vi.fn();
      touchManager.onDrag(callback);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
          { identifier: 1, clientX: 300, clientY: 400, pageX: 300, pageY: 400 } as Touch,
        ],
      });

      const touchMove = new TouchEvent('touchmove', {
        touches: [
          { identifier: 0, clientX: 110, clientY: 210, pageX: 110, pageY: 210 } as Touch,
          { identifier: 1, clientX: 310, clientY: 410, pageX: 310, pageY: 410 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);
      canvas.dispatchEvent(touchMove);

      expect(callback).toHaveBeenCalled();
      const dragData = callback.mock.calls[0][0];
      expect(dragData.fingerCount).toBe(2);
    });
  });

  describe('pinch gesture detection', () => {
    it('should detect pinch gesture', () => {
      const callback = vi.fn();
      touchManager.onPinch(callback);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
          { identifier: 1, clientX: 300, clientY: 200, pageX: 300, pageY: 200 } as Touch,
        ],
      });

      // Pinch in (fingers closer)
      const touchMove = new TouchEvent('touchmove', {
        touches: [
          { identifier: 0, clientX: 150, clientY: 200, pageX: 150, pageY: 200 } as Touch,
          { identifier: 1, clientX: 250, clientY: 200, pageX: 250, pageY: 200 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);
      canvas.dispatchEvent(touchMove);

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        scale: expect.any(Number),
        deltaScale: expect.any(Number),
      }));
    });

    it('should calculate pinch scale correctly', () => {
      const callback = vi.fn();
      touchManager.onPinch(callback);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
          { identifier: 1, clientX: 300, clientY: 200, pageX: 300, pageY: 200 } as Touch,
        ],
      });

      // Pinch out (fingers farther apart)
      const touchMove = new TouchEvent('touchmove', {
        touches: [
          { identifier: 0, clientX: 50, clientY: 200, pageX: 50, pageY: 200 } as Touch,
          { identifier: 1, clientX: 350, clientY: 200, pageX: 350, pageY: 200 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);
      canvas.dispatchEvent(touchMove);

      expect(callback).toHaveBeenCalled();
      const pinchData = callback.mock.calls[0][0];
      expect(pinchData.scale).toBeGreaterThan(1); // Pinch out = zoom in
    });

    it('should only detect pinch with two fingers', () => {
      const callback = vi.fn();
      touchManager.onPinch(callback);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      const touchMove = new TouchEvent('touchmove', {
        touches: [
          { identifier: 0, clientX: 150, clientY: 250, pageX: 150, pageY: 250 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);
      canvas.dispatchEvent(touchMove);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('gesture event callbacks', () => {
    it('should support multiple callbacks for same gesture', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      touchManager.onTap(callback1);
      touchManager.onTap(callback2);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);
      canvas.dispatchEvent(touchEnd);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should allow unsubscribing from callbacks', () => {
      const callback = vi.fn();
      const unsubscribe = touchManager.onTap(callback);

      unsubscribe();

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      const touchEnd = new TouchEvent('touchend', {
        touches: [],
        changedTouches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);
      canvas.dispatchEvent(touchEnd);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('gesture type enum', () => {
    it('should have defined gesture types', () => {
      expect(TouchGesture.TAP).toBeDefined();
      expect(TouchGesture.LONG_PRESS).toBeDefined();
      expect(TouchGesture.DRAG).toBeDefined();
      expect(TouchGesture.PINCH).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle touch cancel event', () => {
      const callback = vi.fn();
      touchManager.onTap(callback);

      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      const touchCancel = new TouchEvent('touchcancel', {
        touches: [],
        changedTouches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
      });

      canvas.dispatchEvent(touchStart);
      canvas.dispatchEvent(touchCancel);

      expect(touchManager.getActiveTouchCount()).toBe(0);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle rapid touch events', () => {
      const callback = vi.fn();
      touchManager.onTap(callback);

      for (let i = 0; i < 10; i++) {
        const touchStart = new TouchEvent('touchstart', {
          touches: [
            { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
          ],
        });

        const touchEnd = new TouchEvent('touchend', {
          touches: [],
          changedTouches: [
            { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
          ],
        });

        canvas.dispatchEvent(touchStart);
        canvas.dispatchEvent(touchEnd);
      }

      expect(callback).toHaveBeenCalledTimes(10);
    });

    it('should prevent default on touch events', () => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [
          { identifier: 0, clientX: 100, clientY: 200, pageX: 100, pageY: 200 } as Touch,
        ],
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(touchStart, 'preventDefault');
      canvas.dispatchEvent(touchStart);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should handle touch events with no touches gracefully', () => {
      expect(() => {
        const touchEnd = new TouchEvent('touchend', {
          touches: [],
          changedTouches: [],
        });

        canvas.dispatchEvent(touchEnd);
      }).not.toThrow();
    });
  });

  describe('performance', () => {
    it('should handle many simultaneous touch events efficiently', () => {
      const callback = vi.fn();
      touchManager.onDrag(callback);

      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        const touchMove = new TouchEvent('touchmove', {
          touches: [
            { identifier: 0, clientX: 100 + i, clientY: 200 + i, pageX: 100 + i, pageY: 200 + i } as Touch,
          ],
        });

        canvas.dispatchEvent(touchMove);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should process 100 touch moves in less than 50ms
      expect(duration).toBeLessThan(50);
    });
  });
});
