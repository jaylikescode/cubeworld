import * as THREE from 'three';
import { Terrain } from './Terrain';
import { ToolType, BrushSettings } from '../types/GameTypes';

export class ToolSystem {
  private terrain: Terrain;
  private currentTool: ToolType = 'raise';
  private brushSettings: BrushSettings = { size: 5, strength: 0.5 };
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private isApplying: boolean = false;
  private brushIndicator: THREE.Mesh;

  constructor(terrain: Terrain) {
    this.terrain = terrain;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Create brush indicator
    const geometry = new THREE.RingGeometry(0.8, 1, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    this.brushIndicator = new THREE.Mesh(geometry, material);
    this.brushIndicator.rotation.x = -Math.PI / 2;
    this.brushIndicator.visible = false;
  }

  public setTool(tool: ToolType): void {
    this.currentTool = tool;
    this.updateBrushColor();
  }

  public getCurrentTool(): ToolType {
    return this.currentTool;
  }

  public setBrushSize(size: number): void {
    this.brushSettings.size = size;
    this.brushIndicator.scale.set(size, size, size);
  }

  public setBrushStrength(strength: number): void {
    this.brushSettings.strength = strength;
  }

  public getBrushSettings(): BrushSettings {
    return { ...this.brushSettings };
  }

  public getBrushIndicator(): THREE.Mesh {
    return this.brushIndicator;
  }

  private updateBrushColor(): void {
    const material = this.brushIndicator.material as THREE.MeshBasicMaterial;
    switch (this.currentTool) {
      case 'raise':
        material.color.setHex(0x00ff00); // Green
        break;
      case 'lower':
        material.color.setHex(0xff0000); // Red
        break;
      case 'smooth':
        material.color.setHex(0x0088ff); // Blue
        break;
      case 'flatten':
        material.color.setHex(0xffff00); // Yellow
        break;
      case 'water':
        material.color.setHex(0x0066cc); // Water blue
        break;
      case 'forest':
        material.color.setHex(0x2d5016); // Forest green
        break;
      case 'desert':
        material.color.setHex(0xf4d03f); // Sand
        break;
      case 'snow':
        material.color.setHex(0xffffff); // White
        break;
      default:
        material.color.setHex(0x888888); // Gray
    }
  }

  public updateMousePosition(x: number, y: number, canvas: HTMLElement): void {
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1;
  }

  public updateBrushPosition(camera: THREE.Camera): THREE.Vector3 | null {
    this.raycaster.setFromCamera(this.mouse, camera);
    const intersects = this.raycaster.intersectObject(this.terrain.mesh);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      this.brushIndicator.position.copy(point);
      this.brushIndicator.position.y += 0.1;
      this.brushIndicator.visible = true;
      return point;
    }

    this.brushIndicator.visible = false;
    return null;
  }

  public startApplying(): void {
    this.isApplying = true;
  }

  public stopApplying(): void {
    this.isApplying = false;
  }

  public isCurrentlyApplying(): boolean {
    return this.isApplying;
  }

  public applyTool(worldPoint: THREE.Vector3): void {
    if (!this.isApplying) return;

    switch (this.currentTool) {
      case 'raise':
        this.terrain.modifyTerrain(
          worldPoint,
          this.brushSettings.size,
          this.brushSettings.strength,
          'raise'
        );
        break;

      case 'lower':
        this.terrain.modifyTerrain(
          worldPoint,
          this.brushSettings.size,
          this.brushSettings.strength,
          'lower'
        );
        break;

      case 'smooth':
        this.terrain.modifyTerrain(
          worldPoint,
          this.brushSettings.size,
          this.brushSettings.strength,
          'smooth'
        );
        break;

      case 'flatten':
        this.terrain.modifyTerrain(
          worldPoint,
          this.brushSettings.size,
          this.brushSettings.strength,
          'flatten'
        );
        break;

      case 'water':
        this.terrain.paintBiome(worldPoint, this.brushSettings.size, 'shallowWater');
        break;

      case 'forest':
        this.terrain.paintBiome(worldPoint, this.brushSettings.size, 'forest');
        break;

      case 'desert':
        this.terrain.paintBiome(worldPoint, this.brushSettings.size, 'beach');
        break;

      case 'snow':
        this.terrain.paintBiome(worldPoint, this.brushSettings.size, 'peak');
        break;

      case 'regenerate':
        this.terrain.generateTerrain();
        this.stopApplying();
        break;

      case 'reset':
        this.terrain.reset();
        this.stopApplying();
        break;
    }
  }
}

