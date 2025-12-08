import * as THREE from 'three';
import { VoxelWorld } from './VoxelWorld';
import { CameraController } from './CameraController';
import { VoxelToolSystem } from './VoxelToolSystem';
import { ParticleSystem } from './ParticleSystem';
import { Player } from './Player';
import { Inventory } from './Inventory';
import { CraftingSystem } from './CraftingSystem';
import { BlockType, VoxelGameState, ToolMode } from '../types/VoxelTypes';

export class VoxelGameEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private cameraController: CameraController;
  private voxelWorld: VoxelWorld;
  private toolSystem: VoxelToolSystem;
  private particleSystem: ParticleSystem;
  private player: Player;
  private clock: THREE.Clock;
  private canvas: HTMLCanvasElement;
  private gameState: VoxelGameState;
  private onStateChange: ((state: VoxelGameState) => void) | null = null;
  private inventory: Inventory;
  private craftingSystem: CraftingSystem;

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

    // Find safe spawn position above ground
    const startPosition = this.voxelWorld.findSafeSpawnPosition(0, 0, 20);
    this.player = new Player(this.voxelWorld, startPosition);

    // Initialize tool system
    this.toolSystem = new VoxelToolSystem(this.voxelWorld, this.scene);

    // Initialize particle system
    this.particleSystem = new ParticleSystem();
    this.scene.add(this.particleSystem.getGroup());
    this.scene.add(this.particleSystem.getClouds());

    // Add lighting
    this.setupLighting();

    // Initialize inventory and crafting system
    this.inventory = new Inventory();
    this.craftingSystem = new CraftingSystem();

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

    // Jump with space key
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        this.player.jump();
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

    // Get movement input from camera controller
    const movementInput = this.cameraController.getMovementInput();
    
    // Update player physics and position
    this.player.update(delta, movementInput);
    
    // Sync camera position with player eye position
    const eyePos = this.player.getEyePosition();
    this.cameraController.setPosition(eyePos);

    // Update mouse to center (crosshair position) for block selection
    this.toolSystem.updateToCenter(this.canvas);

    // Update tool selection using crosshair
    const chunkMeshes = this.getChunkMeshes();
    this.toolSystem.updateSelection(this.cameraController.camera, chunkMeshes);
    
    // Update game state
    this.gameState.selectedPosition = this.toolSystem.getSelectedPosition();

    // Update pickaxe indicator visibility
    this.updatePickaxeIndicator();

    // Update particle system
    this.particleSystem.update(delta);

    // Update FPS
    this.gameState.fps = Math.round(1 / delta);

    // Render
    this.renderer.render(this.scene, this.cameraController.camera);
  };

  private updatePickaxeIndicator(): void {
    const pickaxeIndicator = document.getElementById('pickaxe-indicator');
    if (!pickaxeIndicator) return;

    const currentTool = this.toolSystem.getCurrentTool();
    
    if (currentTool === 'break') {
      pickaxeIndicator.classList.add('visible');
      
      // Add breaking animation if block is selected
      if (this.gameState.selectedPosition) {
        pickaxeIndicator.classList.add('breaking');
      } else {
        pickaxeIndicator.classList.remove('breaking');
      }
    } else {
      pickaxeIndicator.classList.remove('visible', 'breaking');
    }
  }

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

  public getWorld(): VoxelWorld {
    return this.voxelWorld;
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

  public handleResize(): void {
    this.onResize();
  }

  public getInventory(): Inventory {
    return this.inventory;
  }

  public getCraftingSystem(): CraftingSystem {
    return this.craftingSystem;
  }

  public dispose(): void {
    this.player.dispose();
    this.voxelWorld.dispose();
    this.toolSystem.dispose();
    this.particleSystem.dispose();
    this.renderer.dispose();
  }
}

