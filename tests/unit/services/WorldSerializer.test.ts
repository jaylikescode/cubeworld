/**
 * WorldSerializer Unit Tests
 * TDD: Test-Driven Development
 *
 * Tests written BEFORE implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorldSerializer } from '../../../src/services/WorldSerializer';
import { VoxelWorld } from '../../../src/core/VoxelWorld';
import type { SerializedWorld } from '../../../src/types/SerializationTypes';
import { StorageError } from '../../../src/types/SerializationTypes';
import * as THREE from 'three';
import { BlockType } from '../../../src/types/VoxelTypes';

describe('WorldSerializer', () => {
  let serializer: WorldSerializer;
  let scene: THREE.Scene;

  beforeEach(() => {
    serializer = new WorldSerializer();
    scene = new THREE.Scene();
  });

  describe('serialize', () => {
    it('should serialize world with correct version', () => {
      // Given: VoxelWorld with known state
      const world = new VoxelWorld(scene, 12345);

      // When: serialize()
      const result = serializer.serialize(world);

      // Then: version === "1.0.0"
      expect(result.version).toBe('1.0.0');
    });

    it('should serialize seed correctly', () => {
      // Given: VoxelWorld with seed 12345
      const world = new VoxelWorld(scene, 12345);

      // When: serialize()
      const result = serializer.serialize(world);

      // Then: data.seed === 12345
      expect(result.seed).toBe(12345);
    });

    it('should serialize with random seed if not provided', () => {
      // Given: VoxelWorld without explicit seed
      const world = new VoxelWorld(scene);

      // When: serialize()
      const result = serializer.serialize(world);

      // Then: seed is a number
      expect(typeof result.seed).toBe('number');
      expect(result.seed).toBeGreaterThan(0);
      expect(result.seed).toBeLessThan(1);
    });

    it('should serialize chunks as Base64 strings', () => {
      // Given: VoxelWorld with chunks
      const world = new VoxelWorld(scene, 12345);

      // When: serialize()
      const result = serializer.serialize(world);

      // Then: chunks are present and have Base64 strings
      expect(result.chunks.length).toBeGreaterThan(0);
      expect(typeof result.chunks[0].blocks).toBe('string');

      // Base64 validation: should only contain valid Base64 characters
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      expect(base64Regex.test(result.chunks[0].blocks)).toBe(true);
    });

    it('should include chunk coordinates', () => {
      // Given: VoxelWorld
      const world = new VoxelWorld(scene, 12345);

      // When: serialize()
      const result = serializer.serialize(world);

      // Then: each chunk has x and z coordinates
      result.chunks.forEach(chunk => {
        expect(typeof chunk.x).toBe('number');
        expect(typeof chunk.z).toBe('number');
      });
    });

    it('should include metadata with required fields', () => {
      // Given: VoxelWorld
      const world = new VoxelWorld(scene, 12345);

      // When: serialize()
      const result = serializer.serialize(world);

      // Then: metadata includes required fields
      expect(result.metadata).toBeDefined();
      expect(typeof result.metadata.playTime).toBe('number');
      expect(typeof result.metadata.blockCount).toBe('number');
      expect(typeof result.metadata.lastSaved).toBe('number');
    });

    it('should set timestamp to current time', () => {
      // Given: VoxelWorld
      const world = new VoxelWorld(scene, 12345);
      const beforeTime = Date.now();

      // When: serialize()
      const result = serializer.serialize(world);

      // Then: timestamp is close to current time (within 1 second)
      const afterTime = Date.now();
      expect(result.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(result.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should serialize correct number of chunks', () => {
      // Given: VoxelWorld with default render distance (3)
      // Expected chunks: 7x7 = 49 chunks
      const world = new VoxelWorld(scene, 12345);

      // When: serialize()
      const result = serializer.serialize(world);

      // Then: 49 chunks
      expect(result.chunks.length).toBe(49);
    });

    it('should handle world with modified blocks', () => {
      // Given: VoxelWorld with some blocks modified
      const world = new VoxelWorld(scene, 12345);
      world.setBlock(0, 33, 0, BlockType.DIAMOND_BLOCK);
      world.setBlock(1, 33, 0, BlockType.GOLD_BLOCK);

      // When: serialize()
      const result = serializer.serialize(world);

      // Then: serialization succeeds
      expect(result.chunks.length).toBe(49);
      expect(result.metadata.blockCount).toBeGreaterThan(0);
    });
  });

  describe('deserialize', () => {
    it('should deserialize valid data correctly', () => {
      // Given: Valid SerializedWorld
      const world = new VoxelWorld(scene, 12345);
      const serialized = serializer.serialize(world);

      // When: deserialize()
      const result = serializer.deserialize(serialized);

      // Then: Returns WorldData with correct seed
      expect(result.seed).toBe(12345);
      expect(result.chunks).toBeInstanceOf(Map);
      expect(result.metadata).toBeDefined();
    });

    it('should decode Base64 to Uint8Array', () => {
      // Given: Serialized world with Base64 blocks
      const world = new VoxelWorld(scene, 12345);
      const serialized = serializer.serialize(world);

      // When: deserialize()
      const result = serializer.deserialize(serialized);

      // Then: ChunkData.blocks is Uint8Array
      const firstChunk = result.chunks.values().next().value;
      expect(firstChunk.blocks).toBeInstanceOf(Uint8Array);
      expect(firstChunk.blocks.length).toBe(16 * 64 * 16); // 16,384
    });

    it('should preserve chunk coordinates', () => {
      // Given: Serialized world
      const world = new VoxelWorld(scene, 12345);
      const serialized = serializer.serialize(world);

      // When: deserialize()
      const result = serializer.deserialize(serialized);

      // Then: Coordinates are preserved
      result.chunks.forEach((chunkData, key) => {
        const [x, z] = key.split(',').map(Number);
        expect(chunkData.x).toBe(x);
        expect(chunkData.z).toBe(z);
      });
    });

    it('should handle empty chunks array', () => {
      // Given: SerializedWorld with empty chunks
      const emptyWorld: SerializedWorld = {
        version: '1.0.0',
        timestamp: Date.now(),
        seed: 12345,
        chunks: [],
        metadata: {
          playTime: 0,
          blockCount: 0,
          lastSaved: Date.now()
        }
      };

      // When: deserialize()
      const result = serializer.deserialize(emptyWorld);

      // Then: Returns empty Map
      expect(result.chunks.size).toBe(0);
      expect(result.seed).toBe(12345);
    });

    it('should throw on invalid version', () => {
      // Given: SerializedWorld with invalid version
      const invalidData: SerializedWorld = {
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

      // When & Then: deserialize() throws
      expect(() => {
        serializer.deserialize(invalidData);
      }).toThrow(StorageError);

      expect(() => {
        serializer.deserialize(invalidData);
      }).toThrow('Unsupported data version');
    });

    it('should throw on corrupted Base64 data', () => {
      // Given: SerializedWorld with invalid Base64
      const world = new VoxelWorld(scene, 12345);
      const serialized = serializer.serialize(world);

      // Corrupt the Base64 data
      serialized.chunks[0].blocks = 'invalid!!!base64***';

      // When & Then: deserialize() throws
      expect(() => {
        serializer.deserialize(serialized);
      }).toThrow(StorageError);
    });

    it('should validate chunk data size', () => {
      // Given: Serialized world
      const world = new VoxelWorld(scene, 12345);
      const serialized = serializer.serialize(world);

      // When: deserialize()
      const result = serializer.deserialize(serialized);

      // Then: Each chunk has correct size
      result.chunks.forEach(chunkData => {
        expect(chunkData.blocks.length).toBe(16 * 64 * 16);
      });
    });
  });

  describe('round-trip serialization', () => {
    it('should preserve data through serialize/deserialize cycle', () => {
      // Given: VoxelWorld with known seed
      const originalSeed = 12345;
      const world = new VoxelWorld(scene, originalSeed);

      // When: serialize() then deserialize()
      const serialized = serializer.serialize(world);
      const deserialized = serializer.deserialize(serialized);

      // Then: Data matches original
      expect(deserialized.seed).toBe(originalSeed);
      expect(deserialized.chunks.size).toBe(49);
    });

    it('should preserve modified blocks through round-trip', () => {
      // Given: VoxelWorld with modified blocks
      const world = new VoxelWorld(scene, 12345);
      world.setBlock(0, 33, 0, BlockType.DIAMOND_BLOCK);
      world.setBlock(1, 33, 1, BlockType.GOLD_BLOCK);

      const originalBlock1 = world.getBlock(0, 33, 0);
      const originalBlock2 = world.getBlock(1, 33, 1);

      // When: serialize/deserialize
      const serialized = serializer.serialize(world);
      const deserialized = serializer.deserialize(serialized);

      // Create new world and load data
      const newWorld = new VoxelWorld(scene);
      newWorld.loadFromData(deserialized);

      // Then: Blocks are preserved
      expect(newWorld.getBlock(0, 33, 0)).toBe(originalBlock1);
      expect(newWorld.getBlock(1, 33, 1)).toBe(originalBlock2);
    });

    it('should handle multiple round-trips without data corruption', () => {
      // Given: VoxelWorld
      const world = new VoxelWorld(scene, 12345);

      // When: Multiple serialize/deserialize cycles
      let data = serializer.serialize(world);

      for (let i = 0; i < 3; i++) {
        const deserialized = serializer.deserialize(data);

        // Create temporary world
        const tempWorld = new VoxelWorld(scene);
        tempWorld.loadFromData(deserialized);

        // Serialize again
        data = serializer.serialize(tempWorld);
      }

      // Then: Data remains consistent
      const final = serializer.deserialize(data);
      expect(final.seed).toBe(12345);
      expect(final.chunks.size).toBe(49);
    });
  });

  describe('error handling', () => {
    it('should handle missing required fields', () => {
      // Given: Invalid data without required field
      const invalid = {
        version: '1.0.0',
        // missing timestamp
        seed: 12345,
        chunks: [],
        metadata: {
          playTime: 0,
          blockCount: 0,
          lastSaved: Date.now()
        }
      } as SerializedWorld;

      // When & Then: deserialize() throws
      expect(() => {
        serializer.deserialize(invalid);
      }).toThrow();
    });

    it('should validate metadata structure', () => {
      // Given: Invalid metadata
      const invalid = {
        version: '1.0.0',
        timestamp: Date.now(),
        seed: 12345,
        chunks: [],
        metadata: {} as { playTime: number; blockCount: number; lastSaved: number }
      } as SerializedWorld;

      // When & Then: deserialize() throws
      expect(() => {
        serializer.deserialize(invalid);
      }).toThrow();
    });
  });

  describe('performance', () => {
    it('should serialize 49 chunks in reasonable time', () => {
      // Given: VoxelWorld with 49 chunks
      const world = new VoxelWorld(scene, 12345);

      // When: serialize() with timing
      const start = performance.now();
      serializer.serialize(world);
      const duration = performance.now() - start;

      // Then: completes in < 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should deserialize in reasonable time', () => {
      // Given: Serialized world
      const world = new VoxelWorld(scene, 12345);
      const serialized = serializer.serialize(world);

      // When: deserialize() with timing
      const start = performance.now();
      serializer.deserialize(serialized);
      const duration = performance.now() - start;

      // Then: completes in < 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});
