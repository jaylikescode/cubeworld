/**
 * Touch gesture types
 */
export enum TouchGesture {
  TAP = 'tap',
  LONG_PRESS = 'long_press',
  DRAG = 'drag',
  PINCH = 'pinch',
}

/**
 * Touch point data
 */
export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  timestamp: number;
}

/**
 * Tap event data
 */
export interface TapEvent {
  x: number;
  y: number;
}

/**
 * Long press event data
 */
export interface LongPressEvent {
  x: number;
  y: number;
}

/**
 * Drag event data
 */
export interface DragEvent {
  deltaX: number;
  deltaY: number;
  fingerCount: number;
  x: number;
  y: number;
}

/**
 * Pinch event data
 */
export interface PinchEvent {
  scale: number;
  deltaScale: number;
  centerX: number;
  centerY: number;
}

/**
 * TouchManager - Manages touch events and gesture recognition
 */
export class TouchManager {
  private canvas: HTMLCanvasElement;
  private activeTouches: Map<number, TouchPoint> = new Map();
  private longPressTimers: Map<number, number> = new Map();

  // Gesture thresholds
  private readonly TAP_THRESHOLD_MS = 300;
  private readonly TAP_MOVE_THRESHOLD_PX = 10;
  private readonly LONG_PRESS_DURATION_MS = 500;
  private readonly LONG_PRESS_MOVE_THRESHOLD_PX = 10;

  // Event callbacks
  private tapCallbacks: ((event: TapEvent) => void)[] = [];
  private longPressCallbacks: ((event: LongPressEvent) => void)[] = [];
  private dragCallbacks: ((event: DragEvent) => void)[] = [];
  private pinchCallbacks: ((event: PinchEvent) => void)[] = [];

  // Event handlers (bound to this)
  private boundTouchStart: (e: TouchEvent) => void;
  private boundTouchMove: (e: TouchEvent) => void;
  private boundTouchEnd: (e: TouchEvent) => void;
  private boundTouchCancel: (e: TouchEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // Bind event handlers
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
    this.boundTouchCancel = this.handleTouchCancel.bind(this);

    // Attach event listeners
    this.canvas.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.boundTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', this.boundTouchCancel, { passive: false });
  }

  /**
   * Clean up event listeners
   */
  public destroy(): void {
    this.canvas.removeEventListener('touchstart', this.boundTouchStart);
    this.canvas.removeEventListener('touchmove', this.boundTouchMove);
    this.canvas.removeEventListener('touchend', this.boundTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.boundTouchCancel);

    // Clear all timers
    this.longPressTimers.forEach(timer => clearTimeout(timer));
    this.longPressTimers.clear();
    this.activeTouches.clear();
  }

  /**
   * Handle touchstart event
   */
  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();

    const rect = this.canvas.getBoundingClientRect();

    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const touchPoint: TouchPoint = {
        id: touch.identifier,
        x,
        y,
        startX: x,
        startY: y,
        timestamp: Date.now(),
      };

      this.activeTouches.set(touch.identifier, touchPoint);

      // Start long press timer
      this.startLongPressTimer(touchPoint);
    }
  }

  /**
   * Handle touchmove event
   */
  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();

    if (e.touches.length === 0) return;

    const rect = this.canvas.getBoundingClientRect();

    // First pass: Detect gestures with current positions BEFORE updating
    if (e.touches.length === 1) {
      // Single finger drag
      const touch = e.touches[0];
      const touchPoint = this.activeTouches.get(touch.identifier);

      if (touchPoint) {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const deltaX = x - touchPoint.x;
        const deltaY = y - touchPoint.y;

        // Only trigger if there's actual movement
        if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
          this.triggerDragCallbacks({
            deltaX,
            deltaY,
            fingerCount: 1,
            x,
            y,
          });
        }
      }
    } else if (e.touches.length === 2) {
      // Two finger gestures (pinch, pan)
      this.handleTwoFingerGestures(e.touches[0], e.touches[1]);
    }

    // Second pass: Update touch positions (and add any missing touches)
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      let touchPoint = this.activeTouches.get(touch.identifier);

      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // If touch doesn't exist yet (edge case), add it
      if (!touchPoint) {
        touchPoint = {
          id: touch.identifier,
          x,
          y,
          startX: x,
          startY: y,
          timestamp: Date.now(),
        };
        this.activeTouches.set(touch.identifier, touchPoint);
      } else {
        // Check if moved beyond long press threshold
        const totalDistance = Math.sqrt(
          Math.pow(x - touchPoint.startX, 2) + Math.pow(y - touchPoint.startY, 2)
        );

        if (totalDistance > this.LONG_PRESS_MOVE_THRESHOLD_PX) {
          this.cancelLongPressTimer(touchPoint.id);
        }

        // Update position
        touchPoint.x = x;
        touchPoint.y = y;
      }
    }
  }

  /**
   * Handle touchend event
   */
  private handleTouchEnd(e: TouchEvent): void {
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const touchPoint = this.activeTouches.get(touch.identifier);

      if (!touchPoint) continue;

      // Cancel long press timer
      this.cancelLongPressTimer(touch.identifier);

      // Check if it's a tap
      const duration = Date.now() - touchPoint.timestamp;
      const distance = Math.sqrt(
        Math.pow(touch.clientX - this.canvas.getBoundingClientRect().left - touchPoint.startX, 2) +
        Math.pow(touch.clientY - this.canvas.getBoundingClientRect().top - touchPoint.startY, 2)
      );

      if (duration < this.TAP_THRESHOLD_MS && distance < this.TAP_MOVE_THRESHOLD_PX) {
        this.triggerTapCallbacks({
          x: touchPoint.startX,
          y: touchPoint.startY,
        });
      }

      // Remove touch point
      this.activeTouches.delete(touch.identifier);
    }
  }

  /**
   * Handle touchcancel event
   */
  private handleTouchCancel(e: TouchEvent): void {
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      this.cancelLongPressTimer(touch.identifier);
      this.activeTouches.delete(touch.identifier);
    }
  }

  /**
   * Handle two finger gestures (pinch and pan)
   */
  private handleTwoFingerGestures(touch1: Touch, touch2: Touch): void {
    const rect = this.canvas.getBoundingClientRect();

    const x1 = touch1.clientX - rect.left;
    const y1 = touch1.clientY - rect.top;
    const x2 = touch2.clientX - rect.left;
    const y2 = touch2.clientY - rect.top;

    // Calculate distance between fingers
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    // Calculate center point
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    // Get previous touch positions for pinch detection
    const touchPoint1 = this.activeTouches.get(touch1.identifier);
    const touchPoint2 = this.activeTouches.get(touch2.identifier);

    // Detect pinch if we have previous positions
    if (touchPoint1 && touchPoint2) {
      const previousDistance = Math.sqrt(
        Math.pow(touchPoint2.x - touchPoint1.x, 2) +
        Math.pow(touchPoint2.y - touchPoint1.y, 2)
      );

      if (previousDistance > 0) {
        const scale = distance / previousDistance;
        const deltaScale = scale - 1;

        this.triggerPinchCallbacks({
          scale,
          deltaScale,
          centerX,
          centerY,
        });
      }

      // Two finger drag (pan)
      const deltaX = (x1 + x2) / 2 - (touchPoint1.x + touchPoint2.x) / 2;
      const deltaY = (y1 + y2) / 2 - (touchPoint1.y + touchPoint2.y) / 2;

      if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
        this.triggerDragCallbacks({
          deltaX,
          deltaY,
          fingerCount: 2,
          x: centerX,
          y: centerY,
        });
      }
    }
  }

  /**
   * Start long press timer
   */
  private startLongPressTimer(touchPoint: TouchPoint): void {
    const timer = window.setTimeout(() => {
      // Check if touch is still active and hasn't moved
      const currentTouch = this.activeTouches.get(touchPoint.id);
      if (!currentTouch) return;

      const distance = Math.sqrt(
        Math.pow(currentTouch.x - currentTouch.startX, 2) +
        Math.pow(currentTouch.y - currentTouch.startY, 2)
      );

      if (distance <= this.LONG_PRESS_MOVE_THRESHOLD_PX) {
        this.triggerLongPressCallbacks({
          x: currentTouch.x,
          y: currentTouch.y,
        });
      }

      this.longPressTimers.delete(touchPoint.id);
    }, this.LONG_PRESS_DURATION_MS);

    this.longPressTimers.set(touchPoint.id, timer);
  }

  /**
   * Cancel long press timer
   */
  private cancelLongPressTimer(touchId: number): void {
    const timer = this.longPressTimers.get(touchId);
    if (timer) {
      clearTimeout(timer);
      this.longPressTimers.delete(touchId);
    }
  }

  /**
   * Trigger tap callbacks
   */
  private triggerTapCallbacks(event: TapEvent): void {
    this.tapCallbacks.forEach(callback => callback(event));
  }

  /**
   * Trigger long press callbacks
   */
  private triggerLongPressCallbacks(event: LongPressEvent): void {
    this.longPressCallbacks.forEach(callback => callback(event));
  }

  /**
   * Trigger drag callbacks
   */
  private triggerDragCallbacks(event: DragEvent): void {
    this.dragCallbacks.forEach(callback => callback(event));
  }

  /**
   * Trigger pinch callbacks
   */
  private triggerPinchCallbacks(event: PinchEvent): void {
    this.pinchCallbacks.forEach(callback => callback(event));
  }

  /**
   * Subscribe to tap events
   */
  public onTap(callback: (event: TapEvent) => void): () => void {
    this.tapCallbacks.push(callback);
    return () => {
      const index = this.tapCallbacks.indexOf(callback);
      if (index > -1) {
        this.tapCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to long press events
   */
  public onLongPress(callback: (event: LongPressEvent) => void): () => void {
    this.longPressCallbacks.push(callback);
    return () => {
      const index = this.longPressCallbacks.indexOf(callback);
      if (index > -1) {
        this.longPressCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to drag events
   */
  public onDrag(callback: (event: DragEvent) => void): () => void {
    this.dragCallbacks.push(callback);
    return () => {
      const index = this.dragCallbacks.indexOf(callback);
      if (index > -1) {
        this.dragCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to pinch events
   */
  public onPinch(callback: (event: PinchEvent) => void): () => void {
    this.pinchCallbacks.push(callback);
    return () => {
      const index = this.pinchCallbacks.indexOf(callback);
      if (index > -1) {
        this.pinchCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get number of active touch points
   */
  public getActiveTouchCount(): number {
    return this.activeTouches.size;
  }
}
