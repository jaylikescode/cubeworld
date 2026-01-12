import * as THREE from 'three';
import { TouchManager } from '../input/TouchManager';
import { DeviceDetector } from '../utils/DeviceDetector';
import type { RenderMode } from '../services/ModeManager';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  private position: THREE.Vector3;
  private euler: THREE.Euler;
  private isDragging: boolean = false;
  private isPanning: boolean = false;
  private lastMousePos: THREE.Vector2;
  private sensitivity: number = 0.002;
  private maxPitch: number = Math.PI / 2 - 0.1; // Prevent flipping
  private arrowKeyRotationSpeed: number = 0.05; // Rotation speed for arrow keys
  private pressedKeys: Set<string> = new Set();

  // FOV-based zoom settings
  private readonly defaultFov: number = 60;
  private readonly minFov: number = 30; // Zoomed in (narrow view)
  private readonly maxFov: number = 90; // Zoomed out (wide view)
  private currentFov: number = 60;

  // Touch support
  private touchManager?: TouchManager;
  private deviceDetector: DeviceDetector;

  // Canvas reference for event listener management
  private canvas: HTMLElement;

  constructor(canvas: HTMLElement, aspect: number) {
    this.canvas = canvas;
    this.camera = new THREE.PerspectiveCamera(this.defaultFov, aspect, 0.1, 1000);

    // Initial camera position - at terrain surface level (sea level = 32)
    this.position = new THREE.Vector3(0, 40, 0);
    // Euler angles: yaw (Y-axis rotation for left/right), pitch (X-axis rotation for up/down)
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.lastMousePos = new THREE.Vector2();

    // Initialize device detection
    this.deviceDetector = new DeviceDetector();

    this.updateCameraRotation();

    // Determine initial mode for setup
    const initialMode = this.determineInitialMode();
    this.setupControls(initialMode);
  }

  /**
   * Determine initial render mode (for constructor use only)
   * Priority: URL param > device detection
   * Note: ModeManager will handle localStorage priority
   */
  private determineInitialMode(): RenderMode {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('mode');
    if (urlMode === 'desktop' || urlMode === 'mobile') {
      return urlMode;
    }

    // Device detection fallback
    if (this.deviceDetector.isMobile() || this.deviceDetector.isTablet()) {
      return 'mobile';
    }
    return 'desktop';
  }

  private setupControls(mode: RenderMode): void {
    // Setup touch controls only in mobile mode
    if (mode === 'mobile') {
      this.setupTouchControls(this.canvas as HTMLCanvasElement);
    }

    // Mouse down
    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 2) {
        // Right click
        this.isDragging = true;
      } else if (e.button === 1) {
        // Middle click
        this.isPanning = true;
      }
      this.lastMousePos.set(e.clientX, e.clientY);
    });

    // Mouse move - FPS-style rotation
    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const deltaX = e.clientX - this.lastMousePos.x;
      const deltaY = e.clientY - this.lastMousePos.y;

      if (this.isDragging) {
        // Side movement = Yaw (left/right turn)
        // Up/Down movement = Pitch (up/down look)
        this.rotate(deltaX * this.sensitivity, deltaY * this.sensitivity);
      } else if (this.isPanning) {
        this.pan(deltaX * 0.05, deltaY * 0.05);
      }

      this.lastMousePos.set(e.clientX, e.clientY);
    });

    // Pointer lock change (for better FPS experience)
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === this.canvas) {
        // Pointer is locked, continue dragging
        this.isDragging = true;
      } else {
        this.isDragging = false;
      }
    });

    // Mouse up
    const handleMouseUp = () => {
      if (this.isDragging && document.pointerLockElement) {
        document.exitPointerLock();
      }
      this.isDragging = false;
      this.isPanning = false;
    };
    this.canvas.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseup', handleMouseUp);

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e: Event) => {
      e.preventDefault();
    });

    // Wheel zoom - using FOV adjustment for FPS-style camera
    this.canvas.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      // deltaY > 0 = scroll down = zoom out (increase FOV)
      // deltaY < 0 = scroll up = zoom in (decrease FOV)
      const zoomDelta = e.deltaY * 0.05;
      this.zoomCamera(zoomDelta);
    }, { passive: false });

    // Keyboard controls - attach to both window and canvas
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      this.pressedKeys.add(key);

      // Prevent default behavior for game controls (unless typing in an input)
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' ||
                          target.tagName === 'TEXTAREA' ||
                          target.isContentEditable;

      if (!isInputField && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'r'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (key === 'r' && !isInputField) {
        this.resetView();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      this.pressedKeys.delete(key);

      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' ||
                          target.tagName === 'TEXTAREA' ||
                          target.isContentEditable;

      if (!isInputField && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    this.canvas.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    this.canvas.addEventListener('keyup', handleKeyUp, true);

    // Start continuous rotation loop for arrow keys
    this.startContinuousRotation();
  }

  private setupTouchControls(canvas: HTMLCanvasElement): void {
    this.touchManager = new TouchManager(canvas);

    // Single finger drag → Rotate camera
    this.touchManager.onDrag((event) => {
      if (event.fingerCount === 1) {
        // Convert pixel delta to rotation
        // Adjust sensitivity based on screen size for better control
        const sensitivity = this.deviceDetector.isMobile() ? 0.008 : 0.006;
        this.rotate(-event.deltaX * sensitivity, -event.deltaY * sensitivity);
      } else if (event.fingerCount === 2) {
        // Two finger drag → Pan camera
        const sensitivity = this.deviceDetector.isMobile() ? 0.08 : 0.06;
        this.pan(event.deltaX * sensitivity, event.deltaY * sensitivity);
      }
    });

    // Pinch → Zoom camera using FOV adjustment
    this.touchManager.onPinch((event) => {
      // deltaScale > 1 = pinch out = zoom in (decrease FOV)
      // deltaScale < 1 = pinch in = zoom out (increase FOV)
      const zoomDelta = -(event.deltaScale - 1) * 50; // Invert and scale for FOV adjustment
      this.zoomCamera(zoomDelta);
    });

    // Long press → Reset view
    this.touchManager.onLongPress(() => {
      this.resetView();
      // Could add haptic feedback here if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    });
  }

  /**
   * Clean up event listeners and resources
   * Called before reconfiguring or destroying the controller
   */
  public cleanup(): void {
    // Clean up touch controls
    if (this.touchManager) {
      this.touchManager.destroy();
      this.touchManager = undefined;
    }

    // TODO: Implement full event listener cleanup for mouse/keyboard
    // For now, event listeners remain attached but will be overridden
    // on reconfigure. This is acceptable for runtime mode switching.
    // Full cleanup can be added later if memory leaks are observed.
  }

  /**
   * Reconfigure controls for a new render mode
   * Cleans up existing controls and sets up new ones
   */
  public reconfigureForMode(mode: RenderMode): void {
    // Clean up existing controls
    this.cleanup();

    // Set up controls for new mode
    this.setupControls(mode);
  }

  /**
   * Alias for cleanup() for backwards compatibility
   */
  public destroy(): void {
    this.cleanup();
  }

  private startContinuousRotation(): void {
    const update = () => {
      // Arrow keys for rotation
      if (this.pressedKeys.has('arrowleft')) {
        this.rotate(this.arrowKeyRotationSpeed, 0);
      }
      if (this.pressedKeys.has('arrowright')) {
        this.rotate(-this.arrowKeyRotationSpeed, 0);
      }
      if (this.pressedKeys.has('arrowup')) {
        this.rotate(0, this.arrowKeyRotationSpeed);
      }
      if (this.pressedKeys.has('arrowdown')) {
        this.rotate(0, -this.arrowKeyRotationSpeed);
      }
      
      // Movement is now handled by Player system
      // WASD input is collected via getMovementInput()
      
      requestAnimationFrame(update);
    };
    update();
  }

  private rotate(deltaYaw: number, deltaPitch: number): void {
    // Yaw: horizontal rotation (left/right) - around Y axis
    this.euler.y -= deltaYaw;
    
    // Pitch: vertical rotation (up/down) - around X axis
    this.euler.x -= deltaPitch;
    
    // Clamp pitch to prevent flipping
    this.euler.x = THREE.MathUtils.clamp(
      this.euler.x,
      -this.maxPitch,
      this.maxPitch
    );
    
    this.updateCameraRotation();
  }

  private pan(deltaX: number, deltaY: number): void {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    
    this.camera.getWorldDirection(forward);
    right.crossVectors(forward, this.camera.up).normalize();
    
    forward.y = 0;
    forward.normalize();
    
    this.position.addScaledVector(right, -deltaX * 0.1);
    this.position.addScaledVector(forward, deltaY * 0.1);
    
    this.updateCameraRotation();
  }

  // Movement methods removed - movement is now handled by Player system

  private resetView(): void {
    this.position.set(0, 40, 0);
    this.euler.set(0, 0, 0, 'YXZ');
    this.updateCameraRotation();
  }

  private updateCameraRotation(): void {
    // Apply position
    this.camera.position.copy(this.position);
    
    // Apply rotation using Euler angles
    this.camera.rotation.copy(this.euler);
  }

  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  public getTarget(): THREE.Vector3 {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return this.position.clone().add(direction);
  }

  public resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  // Public methods for programmatic camera control (used by CameraTouchController)
  public rotateCamera(deltaX: number, deltaY: number): void {
    // Convert pixel delta to rotation with appropriate sensitivity
    const sensitivity = 0.005;
    this.rotate(deltaX * sensitivity, deltaY * sensitivity);
  }

  public zoomCamera(delta: number): void {
    // Adjust FOV for zoom effect (FOV-based zoom for FPS camera)
    // Positive delta = increase FOV = zoom out
    // Negative delta = decrease FOV = zoom in
    this.currentFov += delta;
    this.currentFov = THREE.MathUtils.clamp(
      this.currentFov,
      this.minFov,
      this.maxFov
    );

    this.camera.fov = this.currentFov;
    this.camera.updateProjectionMatrix();
  }

  public panCamera(deltaX: number, deltaY: number): void {
    const sensitivity = 0.05;
    this.pan(deltaX * sensitivity, deltaY * sensitivity);
  }

  /**
   * Get movement input vector based on pressed keys
   */
  public getMovementInput(): THREE.Vector3 {
    const input = new THREE.Vector3(0, 0, 0);
    
    if (this.pressedKeys.has('w')) {
      input.z -= 1; // Forward
    }
    if (this.pressedKeys.has('s')) {
      input.z += 1; // Backward
    }
    if (this.pressedKeys.has('a')) {
      input.x -= 1; // Left
    }
    if (this.pressedKeys.has('d')) {
      input.x += 1; // Right
    }
    
    // Normalize diagonal movement
    if (input.length() > 0) {
      input.normalize();
    }
    
    // Transform input to camera space
    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    forward.applyEuler(this.euler);
    right.applyEuler(this.euler);
    
    // Keep on horizontal plane
    forward.y = 0;
    right.y = 0;
    forward.normalize();
    right.normalize();
    
    // Calculate final movement direction
    const movement = new THREE.Vector3();
    movement.addScaledVector(forward, -input.z);
    movement.addScaledVector(right, input.x);
    
    return movement;
  }

  /**
   * Set camera position (for following player)
   */
  public setPosition(pos: THREE.Vector3): void {
    this.position.copy(pos);
    this.updateCameraRotation();
  }

  /**
   * Get current Euler rotation
   */
  public getRotation(): THREE.Euler {
    return this.euler.clone();
  }
}

