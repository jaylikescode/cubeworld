import * as THREE from 'three';
import { BlockType, BLOCK_TYPES, Chunk, WorldSettings } from '../types/VoxelTypes';
import { NoiseGenerator } from '../utils/NoiseGenerator';
import { WORLD_CONSTANTS } from '../constants/WorldConstants';

export class VoxelWorld {
  private chunks: Map<string, Chunk>;
  private worldSettings: WorldSettings;
  private noiseGenerator: NoiseGenerator;
  private blockGeometry: THREE.BoxGeometry;
  private scene: THREE.Scene;
  private seed: number; // ✨ NEW: Store seed for serialization

  constructor(scene: THREE.Scene, seed?: number) { // ✨ MODIFIED: Optional seed parameter
    this.scene = scene;
    this.chunks = new Map();
    this.worldSettings = {
      chunkSize: WORLD_CONSTANTS.CHUNK_SIZE,
      chunkHeight: WORLD_CONSTANTS.CHUNK_HEIGHT,
      renderDistance: WORLD_CONSTANTS.DEFAULT_RENDER_DISTANCE,
      seaLevel: WORLD_CONSTANTS.SEA_LEVEL,
    };

    // ✨ MODIFIED: Use provided seed or generate random
    this.seed = seed ?? Math.random();
    this.noiseGenerator = new NoiseGenerator(this.seed);
    this.blockGeometry = new THREE.BoxGeometry(1, 1, 1);

    this.generateWorld();
  }

  private getChunkKey(chunkX: number, chunkZ: number): string {
    return `${chunkX},${chunkZ}`;
  }

  private getBlockIndex(x: number, y: number, z: number): number {
    const { chunkSize, chunkHeight } = this.worldSettings;
    return x + chunkSize * (y + chunkHeight * z);
  }

  private generateWorld(): void {
    const { renderDistance } = this.worldSettings;
    
    // Generate chunks in a grid around origin
    for (let cx = -renderDistance; cx <= renderDistance; cx++) {
      for (let cz = -renderDistance; cz <= renderDistance; cz++) {
        this.generateChunk(cx, cz);
      }
    }
  }

  private generateChunk(chunkX: number, chunkZ: number): void {
    const { chunkSize, chunkHeight, seaLevel } = this.worldSettings;
    const blocks = new Uint8Array(chunkSize * chunkHeight * chunkSize);
    
    // Generate terrain with 3D noise
    for (let x = 0; x < chunkSize; x++) {
      for (let z = 0; z < chunkSize; z++) {
        const worldX = chunkX * chunkSize + x;
        const worldZ = chunkZ * chunkSize + z;
        
        // Get height from noise
        const height = this.getTerrainHeight(worldX, worldZ);
        
        for (let y = 0; y < chunkHeight; y++) {
          const index = this.getBlockIndex(x, y, z);
          
          if (y === WORLD_CONSTANTS.BEDROCK_LEVEL) {
            // Bedrock at bottom
            blocks[index] = BlockType.BEDROCK;
          } else if (y < height - WORLD_CONSTANTS.STONE_DEPTH) {
            // Stone underground
            blocks[index] = BlockType.STONE;
          } else if (y < height - WORLD_CONSTANTS.DIRT_DEPTH) {
            // Dirt layer
            blocks[index] = BlockType.DIRT;
          } else if (y === height - 1 && y >= seaLevel) {
            // Grass on top above sea level
            blocks[index] = BlockType.GRASS;
          } else if (y === height - 1 && y < seaLevel) {
            // Sand near water
            blocks[index] = BlockType.SAND;
          } else if (y < seaLevel && y >= height) {
            // Water
            blocks[index] = BlockType.WATER;
          } else {
            // Air
            blocks[index] = BlockType.AIR;
          }

          // Add snow on high peaks
          if (y >= height && height > seaLevel + WORLD_CONSTANTS.SNOW_MIN_HEIGHT && y < height + WORLD_CONSTANTS.SNOW_LAYER_THICKNESS) {
            blocks[index] = BlockType.SNOW;
          }
        }
        
        // Randomly place trees
        if (height >= seaLevel + WORLD_CONSTANTS.TREE_MIN_ALTITUDE && Math.random() < WORLD_CONSTANTS.TREE_SPAWN_PROBABILITY) {
          this.placeTree(blocks, x, height, z);
        }
      }
    }
    
    const chunk: Chunk = {
      x: chunkX,
      z: chunkZ,
      blocks,
      mesh: null,
    };
    
    this.chunks.set(this.getChunkKey(chunkX, chunkZ), chunk);
    this.buildChunkMesh(chunk);
  }

  private getTerrainHeight(worldX: number, worldZ: number): number {
    const { chunkHeight, seaLevel } = this.worldSettings;

    // Multiple octaves of noise for varied terrain
    const continentalness = this.noiseGenerator.fbm(
      worldX * WORLD_CONSTANTS.CONTINENTAL_SCALE,
      worldZ * WORLD_CONSTANTS.CONTINENTAL_SCALE,
      WORLD_CONSTANTS.CONTINENTAL_OCTAVES,
      0.5,
      2.0
    );
    const erosion = this.noiseGenerator.fbm(
      worldX * WORLD_CONSTANTS.EROSION_SCALE,
      worldZ * WORLD_CONSTANTS.EROSION_SCALE,
      WORLD_CONSTANTS.EROSION_OCTAVES,
      0.5,
      2.0
    );
    const peaks = this.noiseGenerator.getRidged(
      worldX * WORLD_CONSTANTS.PEAKS_SCALE,
      worldZ * WORLD_CONSTANTS.PEAKS_SCALE,
      WORLD_CONSTANTS.PEAKS_OCTAVES
    );

    // Combine noise layers
    let height = seaLevel;
    height += continentalness * WORLD_CONSTANTS.CONTINENTAL_AMPLITUDE;
    height += erosion * WORLD_CONSTANTS.EROSION_AMPLITUDE;
    height += peaks * WORLD_CONSTANTS.PEAKS_AMPLITUDE;

    return Math.floor(Math.max(1, Math.min(chunkHeight - 1, height)));
  }

  private placeTree(blocks: Uint8Array, x: number, y: number, z: number): void {
    const { chunkSize, chunkHeight } = this.worldSettings;
    const trunkHeight = WORLD_CONSTANTS.MIN_TREE_HEIGHT + Math.floor(Math.random() * WORLD_CONSTANTS.MAX_TREE_VARIATION);

    // Trunk
    for (let ty = 0; ty < trunkHeight; ty++) {
      const treeY = y + ty;
      if (treeY < chunkHeight && x >= 0 && x < chunkSize && z >= 0 && z < chunkSize) {
        const index = this.getBlockIndex(x, treeY, z);
        blocks[index] = BlockType.WOOD;
      }
    }

    // Leaves (simple sphere)
    const leafRadius = WORLD_CONSTANTS.TREE_LEAF_RADIUS;
    for (let lx = -leafRadius; lx <= leafRadius; lx++) {
      for (let ly = -1; ly <= leafRadius; ly++) {
        for (let lz = -leafRadius; lz <= leafRadius; lz++) {
          const dist = Math.sqrt(lx * lx + ly * ly + lz * lz);
          if (dist <= leafRadius) {
            const leafX = x + lx;
            const leafY = y + trunkHeight + ly;
            const leafZ = z + lz;
            
            if (leafX >= 0 && leafX < chunkSize && 
                leafY < chunkHeight && 
                leafZ >= 0 && leafZ < chunkSize) {
              const index = this.getBlockIndex(leafX, leafY, leafZ);
              if (blocks[index] === BlockType.AIR) {
                blocks[index] = BlockType.LEAVES;
              }
            }
          }
        }
      }
    }
  }

  private buildChunkMesh(chunk: Chunk): void {
    const { chunkSize, chunkHeight } = this.worldSettings;
    const blocks = chunk.blocks;
    
    // Count visible blocks for instancing
    const visibleBlocks: Array<{ x: number; y: number; z: number; type: BlockType }> = [];
    
    for (let x = 0; x < chunkSize; x++) {
      for (let y = 0; y < chunkHeight; y++) {
        for (let z = 0; z < chunkSize; z++) {
          const index = this.getBlockIndex(x, y, z);
          const blockType = blocks[index];
          
          if (blockType !== BlockType.AIR && this.isBlockVisible(blocks, x, y, z)) {
            visibleBlocks.push({ x, y, z, type: blockType });
          }
        }
      }
    }
    
    if (visibleBlocks.length === 0) return;
    
    // Create instanced mesh
    // Note: Don't use vertexColors for InstancedMesh - it uses instanceColor automatically
    const material = new THREE.MeshLambertMaterial();
    const instancedMesh = new THREE.InstancedMesh(
      this.blockGeometry,
      material,
      visibleBlocks.length
    );
    
    // Enable per-instance coloring
    instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(visibleBlocks.length * 3),
      3
    );
    
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    
    visibleBlocks.forEach((block, i) => {
      const worldX = chunk.x * chunkSize + block.x;
      const worldY = block.y;
      const worldZ = chunk.z * chunkSize + block.z;
      
      matrix.setPosition(worldX, worldY, worldZ);
      instancedMesh.setMatrixAt(i, matrix);
      
      const blockData = BLOCK_TYPES[block.type as BlockType];
      color.copy(blockData.color);
      instancedMesh.setColorAt(i, color);
    });
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.instanceColor.needsUpdate = true;
    
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    
    // Remove old mesh if exists
    if (chunk.mesh) {
      this.scene.remove(chunk.mesh);
      chunk.mesh.geometry.dispose();
      if (Array.isArray(chunk.mesh.material)) {
        chunk.mesh.material.forEach(m => m.dispose());
      } else {
        chunk.mesh.material.dispose();
      }
    }
    
    chunk.mesh = instancedMesh;
    this.scene.add(instancedMesh);
  }

  private isBlockVisible(blocks: Uint8Array, x: number, y: number, z: number): boolean {
    const { chunkSize, chunkHeight } = this.worldSettings;
    
    // Check if any neighbor is air or transparent
    const neighbors = [
      { dx: 1, dy: 0, dz: 0 },
      { dx: -1, dy: 0, dz: 0 },
      { dx: 0, dy: 1, dz: 0 },
      { dx: 0, dy: -1, dz: 0 },
      { dx: 0, dy: 0, dz: 1 },
      { dx: 0, dy: 0, dz: -1 },
    ];
    
    for (const { dx, dy, dz } of neighbors) {
      const nx = x + dx;
      const ny = y + dy;
      const nz = z + dz;
      
      // Out of bounds means visible
      if (nx < 0 || nx >= chunkSize || ny < 0 || ny >= chunkHeight || nz < 0 || nz >= chunkSize) {
        return true;
      }
      
      const neighborIndex = this.getBlockIndex(nx, ny, nz);
      const neighborType = blocks[neighborIndex] as BlockType;
      
      // If neighbor is air or transparent, this block is visible
      if (neighborType === BlockType.AIR || BLOCK_TYPES[neighborType]?.transparent) {
        return true;
      }
    }
    
    return false;
  }

  public getBlock(worldX: number, worldY: number, worldZ: number): BlockType {
    const { chunkSize, chunkHeight } = this.worldSettings;
    const chunkX = Math.floor(worldX / chunkSize);
    const chunkZ = Math.floor(worldZ / chunkSize);
    const chunk = this.chunks.get(this.getChunkKey(chunkX, chunkZ));
    
    if (!chunk) return BlockType.AIR;
    
    const localX = ((worldX % chunkSize) + chunkSize) % chunkSize;
    const localZ = ((worldZ % chunkSize) + chunkSize) % chunkSize;
    
    if (worldY < 0 || worldY >= chunkHeight) return BlockType.AIR;
    
    const index = this.getBlockIndex(localX, worldY, localZ);
    return chunk.blocks[index];
  }

  public setBlock(worldX: number, worldY: number, worldZ: number, blockType: BlockType): void {
    const { chunkSize, chunkHeight } = this.worldSettings;
    const chunkX = Math.floor(worldX / chunkSize);
    const chunkZ = Math.floor(worldZ / chunkSize);
    const chunk = this.chunks.get(this.getChunkKey(chunkX, chunkZ));
    
    if (!chunk || worldY < 0 || worldY >= chunkHeight) return;
    
    const localX = ((worldX % chunkSize) + chunkSize) % chunkSize;
    const localZ = ((worldZ % chunkSize) + chunkSize) % chunkSize;
    
    const index = this.getBlockIndex(localX, worldY, localZ);
    chunk.blocks[index] = blockType;
    
    // Rebuild chunk mesh
    this.buildChunkMesh(chunk);
    
    // Also rebuild neighboring chunks if on edge
    if (localX === 0) this.rebuildChunk(chunkX - 1, chunkZ);
    if (localX === chunkSize - 1) this.rebuildChunk(chunkX + 1, chunkZ);
    if (localZ === 0) this.rebuildChunk(chunkX, chunkZ - 1);
    if (localZ === chunkSize - 1) this.rebuildChunk(chunkX, chunkZ + 1);
  }

  private rebuildChunk(chunkX: number, chunkZ: number): void {
    const chunk = this.chunks.get(this.getChunkKey(chunkX, chunkZ));
    if (chunk) {
      this.buildChunkMesh(chunk);
    }
  }

  public getTotalBlockCount(): number {
    let count = 0;
    this.chunks.forEach(chunk => {
      for (let i = 0; i < chunk.blocks.length; i++) {
        if (chunk.blocks[i] !== BlockType.AIR) {
          count++;
        }
      }
    });
    return count;
  }

  public regenerateWorld(): void {
    // Clear existing chunks
    this.chunks.forEach(chunk => {
      if (chunk.mesh) {
        this.scene.remove(chunk.mesh);
        chunk.mesh.geometry.dispose();
        if (Array.isArray(chunk.mesh.material)) {
          chunk.mesh.material.forEach(m => m.dispose());
        } else {
          chunk.mesh.material.dispose();
        }
      }
    });
    this.chunks.clear();
    
    // Generate new seed
    this.noiseGenerator = new NoiseGenerator(Math.random());
    
    // Regenerate world
    this.generateWorld();
  }

  public dispose(): void {
    this.chunks.forEach(chunk => {
      if (chunk.mesh) {
        this.scene.remove(chunk.mesh);
        chunk.mesh.geometry.dispose();
        if (Array.isArray(chunk.mesh.material)) {
          chunk.mesh.material.forEach(m => m.dispose());
        } else {
          chunk.mesh.material.dispose();
        }
      }
    });
    this.chunks.clear();
    this.blockGeometry.dispose();
  }

  // ✨ NEW: Getter methods for serialization
  /**
   * Get the world generation seed
   * @returns The seed number used for world generation
   */
  public getSeed(): number {
    return this.seed;
  }

  /**
   * Get all chunks in the world
   * @returns Map of chunk keys to Chunk objects
   */
  public getChunks(): Map<string, Chunk> {
    return this.chunks;
  }

  // ✨ NEW: Load world from deserialized data
  /**
   * Load world from deserialized data
   * Clears existing chunks and rebuilds from saved data
   *
   * @param data - WorldData from deserializer
   */
  public loadFromData(data: import('../types/SerializationTypes').WorldData): void {
    // Clear existing chunks
    this.chunks.forEach(chunk => {
      if (chunk.mesh) {
        this.scene.remove(chunk.mesh);
        chunk.mesh.geometry.dispose();
        if (Array.isArray(chunk.mesh.material)) {
          chunk.mesh.material.forEach(m => m.dispose());
        } else {
          chunk.mesh.material.dispose();
        }
      }
    });
    this.chunks.clear();

    // Set seed from loaded data
    this.seed = data.seed;
    this.noiseGenerator = new NoiseGenerator(this.seed);

    // Load chunks
    data.chunks.forEach((chunkData, key) => {
      const chunk: Chunk = {
        x: chunkData.x,
        z: chunkData.z,
        blocks: chunkData.blocks,
        mesh: null
      };

      this.chunks.set(key, chunk);
      this.buildChunkMesh(chunk);
    });
  }
}

