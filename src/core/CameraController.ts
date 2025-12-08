import * as THREE from 'three';
import { TouchManager } from '../input/TouchManager';
import { DeviceDetector } from '../utils/DeviceDetector';

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

  // Touch support
  private touchManager?: TouchManager;
  private deviceDetector: DeviceDetector;

  constructor(canvas: HTMLElement, aspect: number) {
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);

    // Initial camera position - look at terrain surface level (sea level = 32)
    this.target = new THREE.Vector3(0, 32, 0);
    this.spherical = new THREE.Spherical(80, Math.PI / 3, Math.PI / 4);
    this.lastMousePos = new THREE.Vector2();

    // Initialize device detection
    this.deviceDetector = new DeviceDetector();

    this.updateCameraPosition();
    this.setupControls(canvas);
  }

  private setupControls(canvas: HTMLElement): void {
    // Setup touch controls if device supports touch
    if (this.deviceDetector.hasTouchSupport()) {
      this.setupTouchControls(canvas as HTMLCanvasElement);
    }

    // Mouse down
    canvas.addEventListener('mousedown', (e: MouseEvent) => {
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
    canvas.addEventListener('mousemove', (e: MouseEvent) => {
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
      if (document.pointerLockElement === canvas) {
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
    canvas.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseup', handleMouseUp);

    // Prevent context menu
    canvas.addEventListener('contextmenu', (e: Event) => {
      e.preventDefault();
    });

    // Wheel zoom disabled - movement is now handled by Player system
    // Use WASD keys for movement instead

    // Keyboard controls (desktop only)
    if (this.deviceDetector.isDesktop()) {
      window.addEventListener('keydown', (e: KeyboardEvent) => {
        switch (e.key.toLowerCase()) {
          case 'r':
            this.resetView();
            break;
          case 'w':
            this.moveForward();
            break;
          case 's':
            this.moveBackward();
            break;
          case 'a':
            this.moveLeft();
            break;
          case 'd':
            this.moveRight();
            break;
        }
      });
    }
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

    // Pinch → Zoom camera
    this.touchManager.onPinch((event) => {
      // Convert scale to zoom delta
      // Scale < 1 means pinch in (zoom out)
      // Scale > 1 means pinch out (zoom in)
      const zoomDelta = -(event.deltaScale * this.spherical.radius * 0.5);
      this.zoom(zoomDelta);
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

  public destroy(): void {
    if (this.touchManager) {
      this.touchManager.destroy();
    }
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
    this.zoom(delta);
  }

  public panCamera(deltaX: number, deltaY: number): void {
    const sensitivity = 0.05;
    this.pan(deltaX * sensitivity, deltaY * sensitivity);
  }
}

