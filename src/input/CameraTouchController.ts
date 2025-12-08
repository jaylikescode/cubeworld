import { CameraController } from '../core/CameraController';

/**
 * Touch gesture types
 */
type GestureType = 'none' | 'rotate' | 'pinch' | 'pan';

/**
 * Touch point tracking
 */
interface TouchPoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

/**
 * Velocity tracking for momentum
 */
interface Velocity {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * CameraTouchController
 * Handles touch input for camera control on mobile devices
 *
 * Features:
 * - Single finger drag → camera rotation
 * - Two finger pinch → zoom
 * - Two finger drag → camera pan
 * - Momentum/inertia after gesture release
 */
export class CameraTouchController {
  private canvas: HTMLCanvasElement;
  private cameraController: CameraController;
  private enabled: boolean = true;

  // Touch state
  private touches: Map<number, TouchPoint> = new Map();
  private gestureType: GestureType = 'none';
  private previousDistance: number = 0;
  private previousMidpoint: { x: number; y: number } = { x: 0, y: 0 };

  // Sensitivity settings
  private rotationSensitivity: number = 1.0;
  private zoomSensitivity: number = 1.0;
  private panSensitivity: number = 1.0;

  // Momentum
  private momentumEnabled: boolean = true;
  private velocity: Velocity = { x: 0, y: 0, timestamp: 0 };
  private momentumAnimationId: number | null = null;
  private readonly MOMENTUM_FRICTION = 0.92;
  private readonly MOMENTUM_MIN_VELOCITY = 0.1;

  // Event handlers (stored for cleanup)
  private boundHandleTouchStart: (e: TouchEvent) => void;
  private boundHandleTouchMove: (e: TouchEvent) => void;
  private boundHandleTouchEnd: (e: TouchEvent) => void;
  private boundHandleTouchCancel: (e: TouchEvent) => void;

  constructor(canvas: HTMLCanvasElement, cameraController: CameraController) {
    this.canvas = canvas;
    this.cameraController = cameraController;

    // Bind event handlers
    this.boundHandleTouchStart = this.handleTouchStart.bind(this);
    this.boundHandleTouchMove = this.handleTouchMove.bind(this);
    this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
    this.boundHandleTouchCancel = this.handleTouchCancel.bind(this);

    // Attach event listeners
    this.canvas.addEventListener('touchstart', this.boundHandleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.boundHandleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.boundHandleTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', this.boundHandleTouchCancel, { passive: false });
  }

  /**
   * Handle touch start
   */
  private handleTouchStart(event: TouchEvent): void {
    if (!this.enabled) return;

    event.preventDefault();

    // Stop momentum
    this.stopMomentum();

    // Update touch tracking
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      this.touches.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      });
    }

    // Determine gesture type
    this.updateGestureType();

    // Initialize state for gesture
    if (this.gestureType === 'pinch' || this.gestureType === 'pan') {
      const touchArray = Array.from(this.touches.values());
      if (touchArray.length >= 2) {
        this.previousDistance = this.calculateDistance(touchArray[0], touchArray[1]);
        this.previousMidpoint = this.calculateMidpoint(touchArray[0], touchArray[1]);
      }
    }
  }

  /**
   * Handle touch move
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this.enabled) return;

    event.preventDefault();

    const previousTouches = new Map(this.touches);

    // Update touch tracking
    this.touches.clear();
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      this.touches.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      });
    }

    // Update gesture type (may change from pinch to pan)
    this.updateGestureType();

    // Process gesture
    if (this.gestureType === 'rotate' && this.touches.size === 1) {
      this.handleRotateGesture(previousTouches);
    } else if (this.gestureType === 'pinch' && this.touches.size === 2) {
      this.handlePinchGesture();
    } else if (this.gestureType === 'pan' && this.touches.size === 2) {
      this.handlePanGesture();
    }
  }

  /**
   * Handle touch end
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (!this.enabled) return;

    event.preventDefault();

    // Calculate velocity before removing touches (for momentum)
    if (this.momentumEnabled && this.gestureType === 'rotate' && this.touches.size === 1) {
      this.calculateVelocity();
      this.startMomentum();
    }

    // Remove ended touches
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.touches.delete(touch.identifier);
    }

    // Update remaining touches
    this.touches.clear();
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      this.touches.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      });
    }

    // Reset gesture type
    this.updateGestureType();
  }

  /**
   * Handle touch cancel
   */
  private handleTouchCancel(event: TouchEvent): void {
    this.handleTouchEnd(event);
  }

  /**
   * Update gesture type based on touch count
   */
  private updateGestureType(): void {
    const touchCount = this.touches.size;

    if (touchCount === 0) {
      this.gestureType = 'none';
    } else if (touchCount === 1) {
      this.gestureType = 'rotate';
    } else if (touchCount === 2) {
      // Determine if pinch or pan
      const touchArray = Array.from(this.touches.values());
      const distance = this.calculateDistance(touchArray[0], touchArray[1]);

      // If distance changed significantly, it's a pinch, otherwise pan
      if (this.previousDistance === 0) {
        this.gestureType = 'pinch';
      } else {
        const distanceChange = Math.abs(distance - this.previousDistance);
        // If distance changes more than 5px, treat as pinch
        if (distanceChange > 5) {
          this.gestureType = 'pinch';
        } else {
          this.gestureType = 'pan';
        }
      }
    }
  }

  /**
   * Handle rotate gesture (single finger drag)
   */
  private handleRotateGesture(previousTouches: Map<number, TouchPoint>): void {
    const currentTouch = Array.from(this.touches.values())[0];
    const previousTouch = previousTouches.get(currentTouch.id);

    if (!previousTouch) return;

    const deltaX = (currentTouch.x - previousTouch.x) * this.rotationSensitivity;
    const deltaY = (currentTouch.y - previousTouch.y) * this.rotationSensitivity;

    this.cameraController.rotateCamera(deltaX, deltaY);
  }

  /**
   * Handle pinch gesture (zoom)
   */
  private handlePinchGesture(): void {
    const touchArray = Array.from(this.touches.values());
    if (touchArray.length < 2) return;

    const currentDistance = this.calculateDistance(touchArray[0], touchArray[1]);

    if (this.previousDistance > 0) {
      const distanceChange = currentDistance - this.previousDistance;
      const zoomDelta = -distanceChange * 0.01 * this.zoomSensitivity;

      this.cameraController.zoomCamera(zoomDelta);
    }

    this.previousDistance = currentDistance;
  }

  /**
   * Handle pan gesture (two finger drag)
   */
  private handlePanGesture(): void {
    const touchArray = Array.from(this.touches.values());
    if (touchArray.length < 2) return;

    const currentMidpoint = this.calculateMidpoint(touchArray[0], touchArray[1]);

    if (this.previousMidpoint.x !== 0 && this.previousMidpoint.y !== 0) {
      const deltaX = (currentMidpoint.x - this.previousMidpoint.x) * this.panSensitivity;
      const deltaY = (currentMidpoint.y - this.previousMidpoint.y) * this.panSensitivity;

      this.cameraController.panCamera(deltaX, deltaY);
    }

    this.previousMidpoint = currentMidpoint;
  }

  /**
   * Calculate distance between two touch points
   */
  private calculateDistance(touch1: TouchPoint, touch2: TouchPoint): number {
    const dx = touch2.x - touch1.x;
    const dy = touch2.y - touch1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate midpoint between two touch points
   */
  private calculateMidpoint(touch1: TouchPoint, touch2: TouchPoint): { x: number; y: number } {
    return {
      x: (touch1.x + touch2.x) / 2,
      y: (touch1.y + touch2.y) / 2,
    };
  }

  /**
   * Calculate velocity for momentum
   */
  private calculateVelocity(): void {
    const currentTouch = Array.from(this.touches.values())[0];
    if (!currentTouch) return;

    const now = Date.now();
    const dt = now - this.velocity.timestamp;

    if (dt > 0 && dt < 100) {
      // Only calculate if time delta is reasonable
      this.velocity = {
        x: ((currentTouch.x - this.velocity.x) / dt) * 16.67, // Normalize to ~60fps
        y: ((currentTouch.y - this.velocity.y) / dt) * 16.67,
        timestamp: now,
      };
    } else {
      this.velocity = {
        x: currentTouch.x,
        y: currentTouch.y,
        timestamp: now,
      };
    }
  }

  /**
   * Start momentum animation
   */
  private startMomentum(): void {
    if (!this.momentumEnabled) return;

    this.stopMomentum(); // Stop any existing momentum

    let lastX = 0;
    let lastY = 0;
    let velocityX = this.velocity.x;
    let velocityY = this.velocity.y;

    const animate = (): void => {
      // Apply friction
      velocityX *= this.MOMENTUM_FRICTION;
      velocityY *= this.MOMENTUM_FRICTION;

      // Stop if velocity is too small
      if (Math.abs(velocityX) < this.MOMENTUM_MIN_VELOCITY && Math.abs(velocityY) < this.MOMENTUM_MIN_VELOCITY) {
        this.stopMomentum();
        return;
      }

      // Apply rotation
      const deltaX = velocityX - lastX;
      const deltaY = velocityY - lastY;

      if (Math.abs(deltaX) > 0.01 || Math.abs(deltaY) > 0.01) {
        this.cameraController.rotateCamera(deltaX * this.rotationSensitivity, deltaY * this.rotationSensitivity);
      }

      lastX = velocityX;
      lastY = velocityY;

      // Continue animation
      this.momentumAnimationId = requestAnimationFrame(animate);
    };

    this.momentumAnimationId = requestAnimationFrame(animate);
  }

  /**
   * Stop momentum animation
   */
  private stopMomentum(): void {
    if (this.momentumAnimationId !== null) {
      cancelAnimationFrame(this.momentumAnimationId);
      this.momentumAnimationId = null;
    }
    this.velocity = { x: 0, y: 0, timestamp: 0 };
  }

  /**
   * Get current touch count
   */
  public getTouchCount(): number {
    return this.touches.size;
  }

  /**
   * Get current gesture type
   */
  public getGestureType(): GestureType {
    return this.gestureType;
  }

  /**
   * Set rotation sensitivity
   */
  public setRotationSensitivity(sensitivity: number): void {
    this.rotationSensitivity = sensitivity;
  }

  /**
   * Set zoom sensitivity
   */
  public setZoomSensitivity(sensitivity: number): void {
    this.zoomSensitivity = sensitivity;
  }

  /**
   * Set pan sensitivity
   */
  public setPanSensitivity(sensitivity: number): void {
    this.panSensitivity = sensitivity;
  }

  /**
   * Enable or disable momentum
   */
  public setMomentumEnabled(enabled: boolean): void {
    this.momentumEnabled = enabled;
    if (!enabled) {
      this.stopMomentum();
    }
  }

  /**
   * Enable controller
   */
  public enable(): void {
    this.enabled = true;
  }

  /**
   * Disable controller
   */
  public disable(): void {
    this.enabled = false;
    this.touches.clear();
    this.gestureType = 'none';
    this.stopMomentum();
  }

  /**
   * Check if controller is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Clean up and remove event listeners
   */
  public destroy(): void {
    this.stopMomentum();
    this.canvas.removeEventListener('touchstart', this.boundHandleTouchStart);
    this.canvas.removeEventListener('touchmove', this.boundHandleTouchMove);
    this.canvas.removeEventListener('touchend', this.boundHandleTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.boundHandleTouchCancel);
    this.touches.clear();
  }
}
