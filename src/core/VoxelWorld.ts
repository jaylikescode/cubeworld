import * as THREE from 'three';
import { BlockType, Chunk, WorldSettings } from '../types/VoxelTypes';
import { NoiseGenerator } from '../utils/NoiseGenerator';
import { WORLD_CONSTANTS } from '../constants/WorldConstants';
import { GreedyMesher } from '../graphics/GreedyMesher';
import { TextureAtlas } from '../graphics/TextureAtlas';
import { createVoxelMaterial } from '../graphics/VoxelMaterial';

export class VoxelWorld {
  private chunks: Map<string, Chunk>;
  private worldSettings: WorldSettings;
  private noiseGenerator: NoiseGenerator;
  // private blockGeometry: THREE.BoxGeometry; // No longer needed for Greedy Meshing
  private scene: THREE.Scene;
  private seed: number;
  
  // ✨ NEW: Graphics systems
  private textureAtlas: TextureAtlas;
  private greedyMesher: GreedyMesher;
  private voxelMaterial: THREE.MeshLambertMaterial;

  constructor(scene: THREE.Scene, seed?: number) {
    this.scene = scene;
    this.chunks = new Map();
    this.worldSettings = {
      chunkSize: WORLD_CONSTANTS.CHUNK_SIZE,
      chunkHeight: WORLD_CONSTANTS.CHUNK_HEIGHT,
      renderDistance: WORLD_CONSTANTS.DEFAULT_RENDER_DISTANCE,
      seaLevel: WORLD_CONSTANTS.SEA_LEVEL,
    };

    this.seed = seed ?? Math.random();
    this.noiseGenerator = new NoiseGenerator(this.seed);
    // this.blockGeometry = new THREE.BoxGeometry(1, 1, 1);

    // Initialize graphics systems
    this.textureAtlas = new TextureAtlas();
    this.greedyMesher = new GreedyMesher(this.textureAtlas);
    this.voxelMaterial = createVoxelMaterial(this.textureAtlas);

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
    // Remove old mesh if exists
    if (chunk.mesh) {
      this.scene.remove(chunk.mesh);
      chunk.mesh.geometry.dispose();
      // Material is reused, so don't dispose it unless we want to recreate it
      // But chunk.mesh.material refers to this.voxelMaterial (shared).
      // However, if we assigned an array of materials or something else, check.
      // Here we use shared material.
    }

    // Generate geometry using Greedy Mesher
    const geometry = this.greedyMesher.buildMesh(chunk);
    
    // If geometry is empty (e.g. chunk full of air or completely surrounded), skip
    if (geometry.attributes.position.count === 0) {
      chunk.mesh = null;
      geometry.dispose();
      return;
    }

    // Create mesh
    const mesh = new THREE.Mesh(geometry, this.voxelMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    chunk.mesh = mesh;
    this.scene.add(mesh);
  }

  // Helper for setting blocks (and rebuilding mesh)
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

  /**
   * Find the topmost solid block at a given X, Z position
   */
  public getSurfaceHeight(worldX: number, worldZ: number): number {
    const { chunkHeight } = this.worldSettings;
    
    // Search from top to bottom for first solid block
    for (let y = chunkHeight - 1; y >= 0; y--) {
      const block = this.getBlock(worldX, y, worldZ);
      if (block !== BlockType.AIR && block !== BlockType.WATER) {
        return y + 1; // Return position above the block
      }
    }
    
    // Fallback to sea level if no solid block found
    return this.worldSettings.seaLevel + 1;
  }

  /**
   * Find a safe spawn position above ground
   */
  public findSafeSpawnPosition(startX: number = 0, startZ: number = 0, searchRadius: number = 20): THREE.Vector3 {
    let bestY = 0;
    let bestX = startX;
    let bestZ = startZ;
    let highestY = 0;
    
    // Search in a spiral pattern for a good spawn location
    for (let radius = 0; radius <= searchRadius; radius++) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const x = Math.floor(startX + Math.cos(angle) * radius);
        const z = Math.floor(startZ + Math.sin(angle) * radius);
        const y = this.getSurfaceHeight(x, z);
        
        // Prefer higher ground (but not too high)
        if (y > highestY && y < this.worldSettings.chunkHeight - 10) {
          highestY = y;
          bestX = x;
          bestZ = z;
          bestY = y;
        }
        
        // If we found a reasonable height (above sea level, not too high), use it
        if (y >= this.worldSettings.seaLevel && y < this.worldSettings.seaLevel + 20) {
          return new THREE.Vector3(bestX, y + 1, bestZ);
        }
      }
    }
    
    // Return best found position
    return new THREE.Vector3(bestX, bestY + 1, bestZ);
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
    // This is needed because greedy meshing (and culling) depends on neighbor blocks
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
      }
    });
    this.chunks.clear();
    
    // Generate new seed
    this.seed = Math.random();
    this.noiseGenerator = new NoiseGenerator(this.seed);
    
    // Regenerate world
    this.generateWorld();
  }

  public dispose(): void {
    this.chunks.forEach(chunk => {
      if (chunk.mesh) {
        this.scene.remove(chunk.mesh);
        chunk.mesh.geometry.dispose();
      }
    });
    this.chunks.clear();
    // this.blockGeometry.dispose();
    
    this.textureAtlas.dispose();
    this.voxelMaterial.dispose();
  }

  public getSeed(): number {
    return this.seed;
  }

  public getChunks(): Map<string, Chunk> {
    return this.chunks;
  }

  public loadFromData(data: import('../types/SerializationTypes').WorldData): void {
    // Clear existing chunks
    this.chunks.forEach(chunk => {
      if (chunk.mesh) {
        this.scene.remove(chunk.mesh);
        chunk.mesh.geometry.dispose();
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
