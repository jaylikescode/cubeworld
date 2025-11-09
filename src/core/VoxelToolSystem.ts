import * as THREE from 'three';
import { VoxelWorld } from './VoxelWorld';
import { BlockType, ToolMode, VoxelPosition } from '../types/VoxelTypes';

export class VoxelToolSystem {
  private voxelWorld: VoxelWorld;
  private currentBlock: BlockType = BlockType.GRASS;
  private currentTool: ToolMode = 'place';
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private highlightMesh: THREE.LineSegments;
  private selectedPosition: VoxelPosition | null = null;
  private selectedFace: VoxelPosition | null = null;

  constructor(voxelWorld: VoxelWorld, scene: THREE.Scene) {
    this.voxelWorld = voxelWorld;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Create highlight box
    const geometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ 
      color: 0x000000, 
      linewidth: 2 
    });
    this.highlightMesh = new THREE.LineSegments(edges, material);
    this.highlightMesh.visible = false;
    scene.add(this.highlightMesh);
  }

  public setBlock(blockType: BlockType): void {
    this.currentBlock = blockType;
  }

  public getCurrentBlock(): BlockType {
    return this.currentBlock;
  }

  public setTool(tool: ToolMode): void {
    this.currentTool = tool;
  }

  public getCurrentTool(): ToolMode {
    return this.currentTool;
  }

  public updateMousePosition(x: number, y: number, canvas: HTMLElement): void {
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1;
  }

  public updateSelection(camera: THREE.Camera, chunks: THREE.Object3D[]): void {
    this.raycaster.setFromCamera(this.mouse, camera);
    
    // Raycast against all chunk meshes
    const intersects = this.raycaster.intersectObjects(chunks, false);
    
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const point = intersect.point;
      const normal = intersect.face?.normal;
      
      if (normal) {
        // Position of the clicked block
        const blockX = Math.floor(point.x + normal.x * 0.5);
        const blockY = Math.floor(point.y + normal.y * 0.5);
        const blockZ = Math.floor(point.z + normal.z * 0.5);
        
        this.selectedPosition = { x: blockX, y: blockY, z: blockZ };
        
        // Position for placing new block (on the face)
        const faceX = Math.floor(point.x - normal.x * 0.5);
        const faceY = Math.floor(point.y - normal.y * 0.5);
        const faceZ = Math.floor(point.z - normal.z * 0.5);
        
        this.selectedFace = { x: faceX, y: faceY, z: faceZ };
        
        // Update highlight
        if (this.currentTool === 'break' || this.currentTool === 'paint') {
          this.highlightMesh.position.set(faceX + 0.5, faceY + 0.5, faceZ + 0.5);
        } else {
          this.highlightMesh.position.set(blockX + 0.5, blockY + 0.5, blockZ + 0.5);
        }
        this.highlightMesh.visible = true;
      }
    } else {
      this.highlightMesh.visible = false;
      this.selectedPosition = null;
      this.selectedFace = null;
    }
  }

  public applyTool(): void {
    if (!this.selectedPosition || !this.selectedFace) return;
    
    switch (this.currentTool) {
      case 'place':
        // Place block on the face
        this.voxelWorld.setBlock(
          this.selectedPosition.x,
          this.selectedPosition.y,
          this.selectedPosition.z,
          this.currentBlock
        );
        break;
        
      case 'break':
        // Remove block at selected position
        this.voxelWorld.setBlock(
          this.selectedFace.x,
          this.selectedFace.y,
          this.selectedFace.z,
          BlockType.AIR
        );
        break;
        
      case 'paint': {
        // Change block type without replacing
        const existingBlock = this.voxelWorld.getBlock(
          this.selectedFace.x,
          this.selectedFace.y,
          this.selectedFace.z
        );
        if (existingBlock !== BlockType.AIR) {
          this.voxelWorld.setBlock(
            this.selectedFace.x,
            this.selectedFace.y,
            this.selectedFace.z,
            this.currentBlock
          );
        }
        break;
      }
        
      case 'fill':
        // Fill area with blocks (simple implementation)
        this.fillArea(this.selectedPosition, 3);
        break;
    }
  }

  private fillArea(center: VoxelPosition, radius: number): void {
    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        for (let z = -radius; z <= radius; z++) {
          const dist = Math.sqrt(x * x + y * y + z * z);
          if (dist <= radius) {
            this.voxelWorld.setBlock(
              center.x + x,
              center.y + y,
              center.z + z,
              this.currentBlock
            );
          }
        }
      }
    }
  }

  public getSelectedPosition(): VoxelPosition | null {
    return this.selectedPosition;
  }

  public dispose(): void {
    if (this.highlightMesh.geometry) {
      this.highlightMesh.geometry.dispose();
    }
    if (this.highlightMesh.material instanceof THREE.Material) {
      this.highlightMesh.material.dispose();
    }
  }
}

