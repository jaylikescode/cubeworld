import * as THREE from 'three';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  private target: THREE.Vector3;
  private spherical: THREE.Spherical;
  private isDragging: boolean = false;
  private isPanning: boolean = false;
  private lastMousePos: THREE.Vector2;
  private minDistance: number = 10;
  private maxDistance: number = 200;
  private minPolarAngle: number = 0.1;
  private maxPolarAngle: number = Math.PI / 2 - 0.1;

  constructor(canvas: HTMLElement, aspect: number) {
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    
    // Initial camera position - look at terrain surface level (sea level = 32)
    this.target = new THREE.Vector3(0, 32, 0);
    this.spherical = new THREE.Spherical(80, Math.PI / 3, Math.PI / 4);
    this.lastMousePos = new THREE.Vector2();

    this.updateCameraPosition();
    this.setupControls(canvas);
  }

  private setupControls(canvas: HTMLElement): void {
    // Mouse down
    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 2) { // Right click
        this.isDragging = true;
      } else if (e.button === 1) { // Middle click
        this.isPanning = true;
      }
      this.lastMousePos.set(e.clientX, e.clientY);
    });

    // Mouse move
    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const deltaX = e.clientX - this.lastMousePos.x;
      const deltaY = e.clientY - this.lastMousePos.y;

      if (this.isDragging) {
        this.rotate(deltaX * 0.005, deltaY * 0.005);
      } else if (this.isPanning) {
        this.pan(deltaX * 0.05, deltaY * 0.05);
      }

      this.lastMousePos.set(e.clientX, e.clientY);
    });

    // Mouse up
    const handleMouseUp = () => {
      this.isDragging = false;
      this.isPanning = false;
    };
    canvas.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseup', handleMouseUp);

    // Prevent context menu
    canvas.addEventListener('contextmenu', (e: Event) => {
      e.preventDefault();
    });

    // Wheel zoom
    canvas.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      this.zoom(e.deltaY * 0.01);
    }, { passive: false });

    // Keyboard controls
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

  private rotate(deltaAzimuth: number, deltaPolar: number): void {
    this.spherical.theta -= deltaAzimuth;
    this.spherical.phi += deltaPolar;
    this.spherical.phi = THREE.MathUtils.clamp(
      this.spherical.phi,
      this.minPolarAngle,
      this.maxPolarAngle
    );
    this.updateCameraPosition();
  }

  private zoom(delta: number): void {
    this.spherical.radius += delta;
    this.spherical.radius = THREE.MathUtils.clamp(
      this.spherical.radius,
      this.minDistance,
      this.maxDistance
    );
    this.updateCameraPosition();
  }

  private pan(deltaX: number, deltaY: number): void {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    
    this.camera.getWorldDirection(forward);
    right.crossVectors(forward, this.camera.up).normalize();
    
    forward.y = 0;
    forward.normalize();
    
    this.target.addScaledVector(right, -deltaX * 0.1);
    this.target.addScaledVector(forward, deltaY * 0.1);
    
    this.updateCameraPosition();
  }

  private moveForward(): void {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    this.target.addScaledVector(forward, 2);
    this.updateCameraPosition();
  }

  private moveBackward(): void {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    this.target.addScaledVector(forward, -2);
    this.updateCameraPosition();
  }

  private moveLeft(): void {
    const right = new THREE.Vector3();
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    right.crossVectors(forward, this.camera.up).normalize();
    this.target.addScaledVector(right, -2);
    this.updateCameraPosition();
  }

  private moveRight(): void {
    const right = new THREE.Vector3();
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    right.crossVectors(forward, this.camera.up).normalize();
    this.target.addScaledVector(right, 2);
    this.updateCameraPosition();
  }

  private resetView(): void {
    this.target.set(0, 32, 0);
    this.spherical.set(80, Math.PI / 3, Math.PI / 4);
    this.updateCameraPosition();
  }

  private updateCameraPosition(): void {
    const position = new THREE.Vector3().setFromSpherical(this.spherical);
    position.add(this.target);
    this.camera.position.copy(position);
    this.camera.lookAt(this.target);
  }

  public getTarget(): THREE.Vector3 {
    return this.target.clone();
  }

  public getDistance(): number {
    return this.spherical.radius;
  }

  public resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}

