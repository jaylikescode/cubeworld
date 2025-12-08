import { BlockType } from '../types/VoxelTypes';

/**
 * Touch block controller callbacks
 */
export interface TouchBlockCallbacks {
  onPlaceBlock: (x: number, y: number, blockType: BlockType) => void;
  onRemoveBlock: (x: number, y: number) => void;
  getBlockAtPosition: (x: number, y: number) => BlockType;
}

/**
 * Touch point tracking
 */
interface TouchPoint {
  x: number;
  y: number;
  startX: number;
  startY: number;
  timestamp: number;
  moved: boolean;
}

/**
 * TouchBlockController
 * Handles touch input for block placement and removal on mobile devices
 *
 * Features:
 * - Tap to place/remove blocks
 * - Visual tap feedback
 * - Long press for quick delete mode
 * - Prevents accidental taps during camera movement
 */
export class TouchBlockController {
  private canvas: HTMLCanvasElement;
  private callbacks: TouchBlockCallbacks;
  private enabled: boolean = true;

  // Touch state
  private currentTouch: TouchPoint | null = null;
  private touchCount: number = 0;

  // Current block type
  private currentBlock: BlockType = BlockType.GRASS;

  // Quick delete mode
  private quickDeleteMode: boolean = false;
  private longPressTimer: number | null = null;

  // Tap thresholds
  private tapMovementThreshold: number = 10; // pixels
  private tapDurationThreshold: number = 300; // milliseconds
  private longPressDuration: number = 500; // milliseconds

  // Callbacks
  private longPressCallbacks: ((x: number, y: number) => void)[] = [];

  // Event handlers (stored for cleanup)
  private boundHandleTouchStart: (e: TouchEvent) => void;
  private boundHandleTouchMove: (e: TouchEvent) => void;
  private boundHandleTouchEnd: (e: TouchEvent) => void;
  private boundHandleTouchCancel: (e: TouchEvent) => void;

  // Feedback elements
  private feedbackElements: HTMLElement[] = [];

  constructor(canvas: HTMLCanvasElement, callbacks: TouchBlockCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;

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

    // Track touch count
    this.touchCount = event.touches.length;

    // Only handle single touch for block placement
    if (event.touches.length !== 1) {
      this.cancelLongPress();
      return;
    }

    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Store touch info
    this.currentTouch = {
      x,
      y,
      startX: x,
      startY: y,
      timestamp: Date.now(),
      moved: false,
    };

    // Show visual feedback
    this.showTapFeedback(touch.clientX, touch.clientY);

    // Start long press timer
    this.startLongPressTimer(x, y);
  }

  /**
   * Handle touch move
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this.enabled || !this.currentTouch) return;

    // Track touch count
    this.touchCount = event.touches.length;

    if (event.touches.length !== 1) return;

    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Calculate movement distance
    const deltaX = x - this.currentTouch.startX;
    const deltaY = y - this.currentTouch.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Mark as moved if beyond threshold
    if (distance > this.tapMovementThreshold) {
      this.currentTouch.moved = true;
      this.cancelLongPress();
    }

    // Update current position
    this.currentTouch.x = x;
    this.currentTouch.y = y;
  }

  /**
   * Handle touch end
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (!this.enabled) return;

    // Cancel long press
    this.cancelLongPress();

    // Update touch count
    this.touchCount = event.touches.length;

    // Only process single touch
    if (this.touchCount > 0 || !this.currentTouch) {
      this.currentTouch = null;
      this.quickDeleteMode = false;
      return;
    }

    const touch = event.changedTouches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Check if this was a tap
    const duration = Date.now() - this.currentTouch.timestamp;
    const isTap = !this.currentTouch.moved && duration < this.tapDurationThreshold;

    if (isTap) {
      this.handleTap(x, y);
    }

    // Reset state
    this.currentTouch = null;
    this.quickDeleteMode = false;
  }

  /**
   * Handle touch cancel
   */
  private handleTouchCancel(event: TouchEvent): void {
    this.handleTouchEnd(event);
  }

  /**
   * Handle tap gesture
   */
  private handleTap(x: number, y: number): void {
    // Check if there's a block at this position
    const existingBlock = this.callbacks.getBlockAtPosition(x, y);

    if (existingBlock !== BlockType.AIR) {
      // Remove block
      this.callbacks.onRemoveBlock(x, y);
    } else {
      // Place block
      this.callbacks.onPlaceBlock(x, y, this.currentBlock);
    }
  }

  /**
   * Start long press timer
   */
  private startLongPressTimer(x: number, y: number): void {
    this.cancelLongPress();

    this.longPressTimer = window.setTimeout(() => {
      if (!this.currentTouch || this.currentTouch.moved) return;

      // Trigger long press
      this.quickDeleteMode = true;
      this.longPressCallbacks.forEach(callback => callback(x, y));

      // Haptic feedback if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, this.longPressDuration);
  }

  /**
   * Cancel long press timer
   */
  private cancelLongPress(): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  /**
   * Show visual tap feedback
   */
  private showTapFeedback(x: number, y: number): void {
    const feedback = document.createElement('div');
    feedback.className = 'touch-feedback';
    feedback.style.position = 'fixed';
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y}px`;
    feedback.style.width = '40px';
    feedback.style.height = '40px';
    feedback.style.marginLeft = '-20px';
    feedback.style.marginTop = '-20px';
    feedback.style.borderRadius = '50%';
    feedback.style.border = '2px solid rgba(78, 205, 196, 0.8)';
    feedback.style.pointerEvents = 'none';
    feedback.style.zIndex = '10000';
    feedback.style.animation = 'touch-pulse 0.4s ease-out';

    document.body.appendChild(feedback);
    this.feedbackElements.push(feedback);

    // Remove after animation
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
      const index = this.feedbackElements.indexOf(feedback);
      if (index > -1) {
        this.feedbackElements.splice(index, 1);
      }
    }, 400);
  }

  /**
   * Set current block type
   */
  public setCurrentBlock(blockType: BlockType): void {
    this.currentBlock = blockType;
  }

  /**
   * Get current block type
   */
  public getCurrentBlock(): BlockType {
    return this.currentBlock;
  }

  /**
   * Check if in quick delete mode
   */
  public isQuickDeleteMode(): boolean {
    return this.quickDeleteMode;
  }

  /**
   * Register long press callback
   */
  public onLongPress(callback: (x: number, y: number) => void): void {
    this.longPressCallbacks.push(callback);
  }

  /**
   * Set tap movement threshold
   */
  public setTapMovementThreshold(threshold: number): void {
    this.tapMovementThreshold = threshold;
  }

  /**
   * Set tap duration threshold
   */
  public setTapDurationThreshold(threshold: number): void {
    this.tapDurationThreshold = threshold;
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
    this.currentTouch = null;
    this.cancelLongPress();
    this.quickDeleteMode = false;
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
    this.cancelLongPress();
    this.canvas.removeEventListener('touchstart', this.boundHandleTouchStart);
    this.canvas.removeEventListener('touchmove', this.boundHandleTouchMove);
    this.canvas.removeEventListener('touchend', this.boundHandleTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.boundHandleTouchCancel);

    // Remove all feedback elements
    this.feedbackElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.feedbackElements = [];

    this.currentTouch = null;
  }
}
