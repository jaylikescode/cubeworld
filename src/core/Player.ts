import * as THREE from 'three';
import { VoxelWorld } from './VoxelWorld';
import { BlockType } from '../types/VoxelTypes';

export class Player {
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private isOnGround: boolean = false;
  private canJump: boolean = true;
  private height: number = 1.8; // Player height in blocks
  private width: number = 0.6; // Player width (radius)
  private eyeHeight: number = 1.6; // Eye level from feet
  private jumpPower: number = 0.15;
  private gravity: number = 0.02;
  private maxFallSpeed: number = 0.5;
  private moveSpeed: number = 0.15;
  private voxelWorld: VoxelWorld;
  private mesh: THREE.Mesh | null = null;

  constructor(voxelWorld: VoxelWorld, startPosition: THREE.Vector3) {
    this.voxelWorld = voxelWorld;
    this.position = startPosition.clone();
    this.velocity = new THREE.Vector3(0, 0, 0);
  }

  /**
   * Update player physics and position
   */
  public update(delta: number, moveInput: THREE.Vector3): void {
    // Apply gravity
    if (!this.isOnGround) {
      this.velocity.y -= this.gravity * delta * 60; // Normalize for 60fps
      this.velocity.y = Math.max(this.velocity.y, -this.maxFallSpeed);
    } else {
      this.velocity.y = 0;
    }

    // Apply horizontal movement input
    this.velocity.x = moveInput.x * this.moveSpeed;
    this.velocity.z = moveInput.z * this.moveSpeed;

    // Update position with velocity
    const newPosition = this.position.clone().add(
      this.velocity.clone().multiplyScalar(delta * 60)
    );

    // Check collisions and update position
    this.checkCollisions(newPosition);

    // Update ground state
    this.checkGround();
  }

  /**
   * Check collisions with blocks
   */
  private checkCollisions(newPosition: THREE.Vector3): void {
    // Check horizontal collisions (X and Z)
    const horizontalPos = new THREE.Vector3(newPosition.x, this.position.y, newPosition.z);
    if (this.canMoveTo(horizontalPos)) {
      this.position.x = newPosition.x;
      this.position.z = newPosition.z;
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    // Check vertical collision (Y)
    const verticalPos = new THREE.Vector3(this.position.x, newPosition.y, this.position.z);
    if (this.canMoveTo(verticalPos)) {
      this.position.y = newPosition.y;
    } else {
      // Hit ceiling or ground
      if (this.velocity.y > 0) {
        // Hit ceiling
        this.velocity.y = 0;
      } else {
        // Hit ground
        this.velocity.y = 0;
        this.isOnGround = true;
      }
    }
  }

  /**
   * Check if player can move to a position
   */
  private canMoveTo(pos: THREE.Vector3): boolean {
    // Check multiple points around player (feet, middle, head)
    const checkPoints = [
      new THREE.Vector3(pos.x, pos.y, pos.z), // Feet center
      new THREE.Vector3(pos.x + this.width, pos.y, pos.z), // Right
      new THREE.Vector3(pos.x - this.width, pos.y, pos.z), // Left
      new THREE.Vector3(pos.x, pos.y, pos.z + this.width), // Forward
      new THREE.Vector3(pos.x, pos.y, pos.z - this.width), // Back
      new THREE.Vector3(pos.x, pos.y + this.height, pos.z), // Head center
      new THREE.Vector3(pos.x, pos.y + this.height / 2, pos.z), // Middle
    ];

    for (const point of checkPoints) {
      const blockX = Math.floor(point.x);
      const blockY = Math.floor(point.y);
      const blockZ = Math.floor(point.z);

      const block = this.voxelWorld.getBlock(blockX, blockY, blockZ);
      
      // Can't move through non-air blocks
      if (block !== BlockType.AIR && block !== BlockType.WATER) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if player is on ground
   */
  private checkGround(): void {
    const feetY = Math.floor(this.position.y);
    const blockBelow = this.voxelWorld.getBlock(
      Math.floor(this.position.x),
      feetY - 1,
      Math.floor(this.position.z)
    );

    this.isOnGround = blockBelow !== BlockType.AIR && blockBelow !== BlockType.WATER;
    
    // Also check if player is standing on a block
    if (!this.isOnGround) {
      const currentBlock = this.voxelWorld.getBlock(
        Math.floor(this.position.x),
        feetY,
        Math.floor(this.position.z)
      );
      this.isOnGround = currentBlock !== BlockType.AIR && currentBlock !== BlockType.WATER;
    }
  }

  /**
   * Make player jump
   */
  public jump(): void {
    if (this.isOnGround && this.canJump) {
      this.velocity.y = this.jumpPower;
      this.isOnGround = false;
      this.canJump = false;
      
      // Reset jump cooldown
      setTimeout(() => {
        this.canJump = true;
      }, 100);
    }
  }

  /**
   * Get player position
   */
  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  /**
   * Get eye position (for camera)
   */
  public getEyePosition(): THREE.Vector3 {
    return this.position.clone().add(new THREE.Vector3(0, this.eyeHeight, 0));
  }

  /**
   * Set player position
   */
  public setPosition(pos: THREE.Vector3): void {
    this.position.copy(pos);
  }

  /**
   * Get velocity
   */
  public getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }

  /**
   * Check if on ground
   */
  public getIsOnGround(): boolean {
    return this.isOnGround;
  }

  /**
   * Create visual representation of player (optional, for debugging)
   */
  public createMesh(scene: THREE.Scene): void {
    if (this.mesh) {
      scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      if (this.mesh.material instanceof THREE.Material) {
        this.mesh.material.dispose();
      }
    }

    // Simple cylinder representation (for debugging/visualization)
    const geometry = new THREE.CylinderGeometry(this.width, this.width, this.height, 8);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00, 
      transparent: true, 
      opacity: 0.3,
      wireframe: true 
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.mesh.position.y += this.height / 2;
    scene.add(this.mesh);
  }

  /**
   * Update visual mesh position
   */
  public updateMesh(): void {
    if (this.mesh) {
      this.mesh.position.copy(this.position);
      this.mesh.position.y += this.height / 2;
    }
  }

  /**
   * Dispose player resources
   */
  public dispose(): void {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      if (this.mesh.material instanceof THREE.Material) {
        this.mesh.material.dispose();
      }
    }
  }
}

