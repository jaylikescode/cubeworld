import * as THREE from 'three';
import { Terrain } from './Terrain';
import { CameraController } from './CameraController';
import { ToolSystem } from './ToolSystem';
import { ParticleSystem } from './ParticleSystem';
import { WorldSettings, GameState, ToolType } from '../types/GameTypes';

export class GameEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private cameraController: CameraController;
  private terrain: Terrain;
  private toolSystem: ToolSystem;
  private particleSystem: ParticleSystem;
  private clock: THREE.Clock;
  private canvas: HTMLCanvasElement;
  private gameState: GameState;
  private onStateChange: ((state: GameState) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

    // Initialize camera
    this.cameraController = new CameraController(canvas, window.innerWidth / window.innerHeight);

    // Initialize world
    const worldSettings: WorldSettings = {
      width: 100,
      height: 100,
      segments: 128,
      maxElevation: 15,
      noiseScale: 0.05,
      octaves: 5,
      persistence: 0.5,
      lacunarity: 2.0,
    };

    this.terrain = new Terrain(worldSettings);
    this.scene.add(this.terrain.mesh);

    // Initialize tool system
    this.toolSystem = new ToolSystem(this.terrain);
    this.scene.add(this.toolSystem.getBrushIndicator());

    // Initialize particle system
    this.particleSystem = new ParticleSystem();
    this.scene.add(this.particleSystem.getGroup());
    this.scene.add(this.particleSystem.getClouds());

    // Add lighting
    this.setupLighting();

    // Initialize game state
    this.gameState = {
      currentTool: 'raise',
      brushSettings: this.toolSystem.getBrushSettings(),
      worldSettings,
      isPainting: false,
      fps: 60,
      vertexCount: this.terrain.getVertexCount(),
    };

    // Setup event listeners
    this.setupEventListeners();

    // Start animation loop
    this.animate();
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(50, 50, 25);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    this.scene.add(sunLight);

    // Hemisphere light
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x545454, 0.4);
    this.scene.add(hemiLight);

    // Add sun visual
    const sunGeometry = new THREE.SphereGeometry(3, 16, 16);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.copy(sunLight.position);
    this.scene.add(sun);
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      this.toolSystem.updateMousePosition(e.clientX, e.clientY, this.canvas);
    });

    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 0) { // Left click
        this.toolSystem.startApplying();
        this.gameState.isPainting = true;
        this.emitStateChange();
      }
    });

    this.canvas.addEventListener('mouseup', (e: MouseEvent) => {
      if (e.button === 0) {
        this.toolSystem.stopApplying();
        this.gameState.isPainting = false;
        this.emitStateChange();
      }
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        this.setTool('smooth');
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
      }
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.onResize();
    });
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    // Update brush position
    const worldPoint = this.toolSystem.updateBrushPosition(this.cameraController.camera);

    // Apply tool if active
    if (worldPoint && this.toolSystem.isCurrentlyApplying()) {
      this.toolSystem.applyTool(worldPoint);
    }

    // Update particle system
    this.particleSystem.update(delta);

    // Update FPS
    this.gameState.fps = Math.round(1 / delta);

    // Render
    this.renderer.render(this.scene, this.cameraController.camera);
  };

  public setTool(tool: ToolType): void {
    this.toolSystem.setTool(tool);
    this.gameState.currentTool = tool;
    this.emitStateChange();

    // Handle special tools
    if (tool === 'regenerate') {
      this.regenerateWorld();
    } else if (tool === 'reset') {
      this.resetWorld();
    }
  }

  public setBrushSize(size: number): void {
    this.toolSystem.setBrushSize(size);
    this.gameState.brushSettings.size = size;
    this.emitStateChange();
  }

  public setBrushStrength(strength: number): void {
    this.toolSystem.setBrushStrength(strength);
    this.gameState.brushSettings.strength = strength;
    this.emitStateChange();
  }

  public regenerateWorld(): void {
    this.terrain.generateTerrain();
    this.gameState.vertexCount = this.terrain.getVertexCount();
    this.emitStateChange();
  }

  public resetWorld(): void {
    this.terrain.reset();
    this.gameState.vertexCount = this.terrain.getVertexCount();
    this.emitStateChange();
  }

  public toggleRain(): void {
    this.particleSystem.toggleRain();
  }

  public toggleSnow(): void {
    this.particleSystem.toggleSnow();
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public onGameStateChange(callback: (state: GameState) => void): void {
    this.onStateChange = callback;
  }

  private emitStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getGameState());
    }
  }

  private onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.cameraController.resize(width / height);
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
    this.terrain.dispose();
    this.particleSystem.dispose();
    this.renderer.dispose();
  }
}

