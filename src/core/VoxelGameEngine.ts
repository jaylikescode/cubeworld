import * as THREE from 'three';
import { VoxelWorld } from './VoxelWorld';
import { CameraController } from './CameraController';
import { VoxelToolSystem } from './VoxelToolSystem';
import { ParticleSystem } from './ParticleSystem';
import { BlockType, VoxelGameState, ToolMode } from '../types/VoxelTypes';

export class VoxelGameEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private cameraController: CameraController;
  private voxelWorld: VoxelWorld;
  private toolSystem: VoxelToolSystem;
  private particleSystem: ParticleSystem;
  private clock: THREE.Clock;
  private canvas: HTMLCanvasElement;
  private gameState: VoxelGameState;
  private onStateChange: ((state: VoxelGameState) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 100, 300);

    // Initialize camera
    this.cameraController = new CameraController(canvas, window.innerWidth / window.innerHeight);

    // Initialize voxel world
    this.voxelWorld = new VoxelWorld(this.scene);

    // Initialize tool system
    this.toolSystem = new VoxelToolSystem(this.voxelWorld, this.scene);

    // Initialize particle system
    this.particleSystem = new ParticleSystem();
    this.scene.add(this.particleSystem.getGroup());
    this.scene.add(this.particleSystem.getClouds());

    // Add lighting
    this.setupLighting();

    // Initialize game state
    this.gameState = {
      currentBlock: BlockType.GRASS,
      currentTool: 'place',
      selectedPosition: null,
      fps: 60,
      blockCount: this.voxelWorld.getTotalBlockCount(),
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
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(100, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 300;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.001;
    this.scene.add(sunLight);

    // Hemisphere light
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x545454, 0.4);
    this.scene.add(hemiLight);
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      this.toolSystem.updateMousePosition(e.clientX, e.clientY, this.canvas);
    });

    this.canvas.addEventListener('click', (e: MouseEvent) => {
      if (e.button === 0) { // Left click
        this.toolSystem.applyTool();
        this.updateBlockCount();
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

    // Update tool selection
    const chunkMeshes = this.getChunkMeshes();
    this.toolSystem.updateSelection(this.cameraController.camera, chunkMeshes);
    
    // Update game state
    this.gameState.selectedPosition = this.toolSystem.getSelectedPosition();

    // Update particle system
    this.particleSystem.update(delta);

    // Update FPS
    this.gameState.fps = Math.round(1 / delta);

    // Render
    this.renderer.render(this.scene, this.cameraController.camera);
  };

  private getChunkMeshes(): THREE.Object3D[] {
    const meshes: THREE.Object3D[] = [];
    this.scene.traverse((object) => {
      if (object instanceof THREE.InstancedMesh) {
        meshes.push(object);
      }
    });
    return meshes;
  }

  private updateBlockCount(): void {
    this.gameState.blockCount = this.voxelWorld.getTotalBlockCount();
    this.emitStateChange();
  }

  public setBlock(blockType: BlockType): void {
    this.toolSystem.setBlock(blockType);
    this.gameState.currentBlock = blockType;
    this.emitStateChange();
  }

  public setTool(tool: ToolMode): void {
    this.toolSystem.setTool(tool);
    this.gameState.currentTool = tool;
    this.emitStateChange();
  }

  public regenerateWorld(): void {
    this.voxelWorld.regenerateWorld();
    this.updateBlockCount();
  }

  public toggleRain(): void {
    this.particleSystem.toggleRain();
  }

  public toggleSnow(): void {
    this.particleSystem.toggleSnow();
  }

  public getGameState(): VoxelGameState {
    return { ...this.gameState };
  }

  public onGameStateChange(callback: (state: VoxelGameState) => void): void {
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
    this.voxelWorld.dispose();
    this.toolSystem.dispose();
    this.particleSystem.dispose();
    this.renderer.dispose();
  }
}

