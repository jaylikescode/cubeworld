/**
 * World Persistence Integration Tests
 *
 * Full save/load flow test
 * Integration of WorldSerializer + LocalStorageManager + VoxelWorld
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { VoxelWorld } from '../../src/core/VoxelWorld';
import { WorldSerializer } from '../../src/services/WorldSerializer';
import { LocalStorageManager } from '../../src/services/LocalStorageManager';
import { BlockType } from '../../src/types/VoxelTypes';

describe('World Persistence Integration', () => {
  let scene: THREE.Scene;
  let serializer: WorldSerializer;
  let storage: LocalStorageManager;

  beforeEach(() => {
    scene = new THREE.Scene();
    serializer = new WorldSerializer();
    storage = new LocalStorageManager();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('basic save and load', () => {
    it('should save and load world correctly', () => {
      // Given: VoxelWorld with known seed
      const originalSeed = 12345;
      const world = new VoxelWorld(scene, originalSeed);

      // When: Serialize and save
      const serialized = serializer.serialize(world);
      const saveResult = storage.saveWorld(serialized);

      // Then: Save succeeds
      expect(saveResult).toBe(true);
      expect(storage.hasWorld()).toBe(true);

      // And when: Load into new world
      const loaded = storage.loadWorld();
      expect(loaded).not.toBeNull();

      const worldData = serializer.deserialize(loaded!);
      const newWorld = new VoxelWorld(scene);
      newWorld.loadFromData(worldData);

      // Then: Seed is preserved
      expect(newWorld.getSeed()).toBe(originalSeed);
      expect(newWorld.getChunks().size).toBe(49); // 7x7 chunks
    });

    it('should preserve world with random seed', () => {
      // Given: World with random seed
      const world = new VoxelWorld(scene);
      const originalSeed = world.getSeed();

      // When: Save and load
      const serialized = serializer.serialize(world);
      storage.saveWorld(serialized);

      const loaded = storage.loadWorld();
      const worldData = serializer.deserialize(loaded!);

      const newWorld = new VoxelWorld(scene);
      newWorld.loadFromData(worldData);

      // Then: Random seed is preserved
      expect(newWorld.getSeed()).toBe(originalSeed);
    });
  });

  describe('modified blocks persistence', () => {
    it('should preserve placed blocks', () => {
      // Given: VoxelWorld with some blocks placed
      const world = new VoxelWorld(scene, 55555);

      // Place blocks at specific positions
      world.setBlock(0, 33, 0, BlockType.DIAMOND_BLOCK);
      world.setBlock(1, 33, 0, BlockType.GOLD_BLOCK);
      world.setBlock(2, 33, 0, BlockType.EMERALD_BLOCK);
      world.setBlock(0, 34, 0, BlockType.IRON_BLOCK);

      // When: Save and load
      const serialized = serializer.serialize(world);
      storage.saveWorld(serialized);

      const loaded = storage.loadWorld();
      const worldData = serializer.deserialize(loaded!);

      const newWorld = new VoxelWorld(scene);
      newWorld.loadFromData(worldData);

      // Then: All blocks are preserved
      expect(newWorld.getBlock(0, 33, 0)).toBe(BlockType.DIAMOND_BLOCK);
      expect(newWorld.getBlock(1, 33, 0)).toBe(BlockType.GOLD_BLOCK);
      expect(newWorld.getBlock(2, 33, 0)).toBe(BlockType.EMERALD_BLOCK);
      expect(newWorld.getBlock(0, 34, 0)).toBe(BlockType.IRON_BLOCK);
    });

    it('should preserve broken blocks (air)', () => {
      // Given: World with some blocks broken
      const world = new VoxelWorld(scene, 66666);

      // Break blocks (set to AIR)
      world.setBlock(0, 32, 0, BlockType.AIR);
      world.setBlock(1, 32, 0, BlockType.AIR);

      // When: Save and load
      const serialized = serializer.serialize(world);
      storage.saveWorld(serialized);

      const loaded = storage.loadWorld();
      const worldData = serializer.deserialize(loaded!);

      const newWorld = new VoxelWorld(scene);
      newWorld.loadFromData(worldData);

      // Then: Air blocks are preserved
      expect(newWorld.getBlock(0, 32, 0)).toBe(BlockType.AIR);
      expect(newWorld.getBlock(1, 32, 0)).toBe(BlockType.AIR);
    });

    it('should preserve complex structures', () => {
      // Given: World with a small structure (3x3x3 cube)
      const world = new VoxelWorld(scene, 77777);

      // Build a small stone cube
      for (let x = 0; x < 3; x++) {
        for (let y = 33; y < 36; y++) {
          for (let z = 0; z < 3; z++) {
            world.setBlock(x, y, z, BlockType.STONE_BRICK);
          }
        }
      }

      // When: Save and load
      const serialized = serializer.serialize(world);
      storage.saveWorld(serialized);

      const loaded = storage.loadWorld();
      const worldData = serializer.deserialize(loaded!);

      const newWorld = new VoxelWorld(scene);
      newWorld.loadFromData(worldData);

      // Then: Entire structure is preserved
      for (let x = 0; x < 3; x++) {
        for (let y = 33; y < 36; y++) {
          for (let z = 0; z < 3; z++) {
            expect(newWorld.getBlock(x, y, z)).toBe(BlockType.STONE_BRICK);
          }
        }
      }
    });
  });

  describe('page refresh simulation', () => {
    it('should simulate complete page refresh cycle', () => {
      // ========== First Session ==========
      // Given: User creates world and builds something
      const world1 = new VoxelWorld(scene, 99999);

      world1.setBlock(5, 33, 5, BlockType.BRICK);
      world1.setBlock(6, 33, 5, BlockType.BRICK);
      world1.setBlock(5, 34, 5, BlockType.BRICK);

      // User saves before closing
      const serialized = serializer.serialize(world1);
      storage.saveWorld(serialized);

      // Clean up (simulate page close)
      world1.dispose();

      // ========== Page Refresh ==========
      // New scene (simulate fresh page load)
      const newScene = new THREE.Scene();

      // Check if save exists
      expect(storage.hasWorld()).toBe(true);

      // ========== Second Session ==========
      // Load saved world
      const loaded = storage.loadWorld();
      expect(loaded).not.toBeNull();

      const worldData = serializer.deserialize(loaded!);
      const world2 = new VoxelWorld(newScene);
      world2.loadFromData(worldData);

      // Then: Everything is preserved
      expect(world2.getSeed()).toBe(99999);
      expect(world2.getBlock(5, 33, 5)).toBe(BlockType.BRICK);
      expect(world2.getBlock(6, 33, 5)).toBe(BlockType.BRICK);
      expect(world2.getBlock(5, 34, 5)).toBe(BlockType.BRICK);
    });

    it('should handle multiple save cycles', () => {
      // Simulate: Build -> Save -> Build more -> Save -> Load
      const world = new VoxelWorld(scene, 11111);

      // First build session
      world.setBlock(0, 33, 0, BlockType.WOOD);
      const serialized1 = serializer.serialize(world);
      storage.saveWorld(serialized1);

      // Continue building
      world.setBlock(1, 33, 0, BlockType.WOOD);
      world.setBlock(2, 33, 0, BlockType.WOOD);
      const serialized2 = serializer.serialize(world);
      storage.saveWorld(serialized2); // Overwrites previous save

      // Load
      const loaded = storage.loadWorld();
      const worldData = serializer.deserialize(loaded!);

      const newWorld = new VoxelWorld(scene);
      newWorld.loadFromData(worldData);

      // Then: Latest state is preserved
      expect(newWorld.getBlock(0, 33, 0)).toBe(BlockType.WOOD);
      expect(newWorld.getBlock(1, 33, 0)).toBe(BlockType.WOOD);
      expect(newWorld.getBlock(2, 33, 0)).toBe(BlockType.WOOD);
    });
  });

  describe('metadata persistence', () => {
    it('should preserve block count metadata', () => {
      // Given: World with blocks
      const world = new VoxelWorld(scene, 22222);

      const originalBlockCount = world.getTotalBlockCount();

      // When: Save and load
      const serialized = serializer.serialize(world);
      expect(serialized.metadata.blockCount).toBe(originalBlockCount);

      storage.saveWorld(serialized);
      const loaded = storage.loadWorld();

      // Then: Metadata is preserved
      expect(loaded!.metadata.blockCount).toBe(originalBlockCount);
    });

    it('should update timestamp on each save', async () => {
      // Given: World
      const world = new VoxelWorld(scene, 33333);

      // When: Save twice with delay
      const serialized1 = serializer.serialize(world);
      const timestamp1 = serialized1.timestamp;

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 10));

      const serialized2 = serializer.serialize(world);
      const timestamp2 = serialized2.timestamp;

      // Then: Timestamps are different
      expect(timestamp2).toBeGreaterThan(timestamp1);
    });
  });

  describe('error handling', () => {
    it('should handle loading when no save exists', () => {
      // Given: Empty localStorage
      expect(storage.hasWorld()).toBe(false);

      // When: Try to load
      const loaded = storage.loadWorld();

      // Then: Returns null gracefully
      expect(loaded).toBeNull();
    });

    it('should handle corrupted save data', () => {
      // Given: Corrupted data in localStorage
      localStorage.setItem('cubeworld_save', '{ corrupted !!!');

      // When: Try to load
      const loaded = storage.loadWorld();

      // Then: Returns null gracefully
      expect(loaded).toBeNull();
      expect(storage.hasWorld()).toBe(false);
    });

    it('should handle version mismatch gracefully', () => {
      // Given: Future version data
      const futureData = {
        version: '999.0.0',
        timestamp: Date.now(),
        seed: 12345,
        chunks: [],
        metadata: {
          playTime: 0,
          blockCount: 0,
          lastSaved: Date.now()
        }
      };

      storage.saveWorld(futureData);
      const loaded = storage.loadWorld();

      // When: Try to deserialize
      // Then: Should throw with clear error
      expect(() => {
        serializer.deserialize(loaded!);
      }).toThrow('Unsupported data version');
    });
  });

  describe('performance', () => {
    it('should save/load within performance budget', () => {
      // Given: Full world
      const world = new VoxelWorld(scene, 44444);

      // When: Measure save time
      const saveStart = performance.now();
      const serialized = serializer.serialize(world);
      storage.saveWorld(serialized);
      const saveDuration = performance.now() - saveStart;

      // When: Measure load time
      const loadStart = performance.now();
      const loaded = storage.loadWorld();
      const worldData = serializer.deserialize(loaded!);
      const newWorld = new VoxelWorld(scene);
      newWorld.loadFromData(worldData);
      const loadDuration = performance.now() - loadStart;

      // Then: Both operations complete in < 1 second
      expect(saveDuration).toBeLessThan(1000);
      expect(loadDuration).toBeLessThan(1000);

      console.log(`Save time: ${saveDuration.toFixed(2)}ms`);
      console.log(`Load time: ${loadDuration.toFixed(2)}ms`);
    });

    it('should handle save size within localStorage limits', () => {
      // Given: Full world
      const world = new VoxelWorld(scene, 55555);

      // When: Save
      const serialized = serializer.serialize(world);
      storage.saveWorld(serialized);

      const size = storage.getSaveSize();

      // Then: Size is reasonable (< 2MB)
      expect(size).toBeLessThan(2 * 1024 * 1024);

      console.log(`Save size: ${(size / 1024).toFixed(2)} KB`);
    });
  });

  describe('clear functionality', () => {
    it('should allow starting fresh after clear', () => {
      // Given: Saved world
      const world1 = new VoxelWorld(scene, 66666);
      world1.setBlock(0, 33, 0, BlockType.DIAMOND_BLOCK);

      const serialized = serializer.serialize(world1);
      storage.saveWorld(serialized);
      expect(storage.hasWorld()).toBe(true);

      // When: Clear save
      storage.clearWorld();

      // Then: No save exists
      expect(storage.hasWorld()).toBe(false);
      expect(storage.loadWorld()).toBeNull();

      // And: Can create new world with different seed
      const world2 = new VoxelWorld(scene, 77777);
      expect(world2.getSeed()).toBe(77777);
      expect(world2.getBlock(0, 33, 0)).not.toBe(BlockType.DIAMOND_BLOCK);
    });
  });
});
