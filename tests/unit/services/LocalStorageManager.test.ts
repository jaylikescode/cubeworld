/**
 * LocalStorageManager Unit Tests
 * TDD: Test-Driven Development
 *
 * Tests written BEFORE implementation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageManager } from '../../../src/services/LocalStorageManager';
import type { SerializedWorld } from '../../../src/types/SerializationTypes';

describe('LocalStorageManager', () => {
  let manager: LocalStorageManager;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    manager = new LocalStorageManager();
  });

  afterEach(() => {
    // Clean up after tests
    localStorage.clear();
  });

  describe('saveWorld', () => {
    it('should save data to localStorage', () => {
      // Given: Valid SerializedWorld
      const worldData: SerializedWorld = {
        version: '1.0.0',
        timestamp: Date.now(),
        seed: 12345,
        chunks: [],
        metadata: {
          playTime: 100,
          blockCount: 500,
          lastSaved: Date.now()
        }
      };

      // When: saveWorld()
      const result = manager.saveWorld(worldData);

      // Then: localStorage contains data
      expect(result).toBe(true);
      const storedData = localStorage.getItem('cubeworld_save');
      expect(storedData).not.toBeNull();

      // Verify data can be parsed back
      const parsed = JSON.parse(storedData!);
      expect(parsed.seed).toBe(12345);
    });

    it('should return true on success', () => {
      // Given: Valid data
      const worldData: SerializedWorld = {
        version: '1.0.0',
        timestamp: Date.now(),
        seed: 99999,
        chunks: [],
        metadata: {
          playTime: 0,
          blockCount: 0,
          lastSaved: Date.now()
        }
      };

      // When: saveWorld()
      const result = manager.saveWorld(worldData);

      // Then: Returns true
      expect(result).toBe(true);
    });

    it('should overwrite existing save', () => {
      // Given: Existing save
      const oldData: SerializedWorld = {
        version: '1.0.0',
        timestamp: Date.now(),
        seed: 11111,
        chunks: [],
        metadata: {
          playTime: 100,
          blockCount: 500,
          lastSaved: Date.now()
        }
      };

      manager.saveWorld(oldData);

      // When: saveWorld() with new data
      const newData: SerializedWorld = {
        version: '1.0.0',
        timestamp: Date.now(),
        seed: 22222,
        chunks: [],
        metadata: {
          playTime: 200,
          blockCount: 600,
          lastSaved: Date.now()
        }
      };

      manager.saveWorld(newData);

      // Then: Old data is replaced
      const loaded = manager.loadWorld();
      expect(loaded).not.toBeNull();
      expect(loaded!.seed).toBe(22222);
      expect(loaded!.metadata.playTime).toBe(200);
    });

    it('should handle large data', () => {
      // Given: World with many chunks
      const chunks = Array.from({ length: 49 }, (_, i) => ({
        x: Math.floor(i / 7) - 3,
        z: (i % 7) - 3,
        // Simulate Base64 encoded chunk data (16KB per chunk)
        blocks: 'A'.repeat(16000)
      }));

      const largeData: SerializedWorld = {
        version: '1.0.0',
        timestamp: Date.now(),
        seed: 12345,
        chunks,
        metadata: {
          playTime: 1000,
          blockCount: 50000,
          lastSaved: Date.now()
        }
      };

      // When: saveWorld()
      const result = manager.saveWorld(largeData);

      // Then: Should succeed (within localStorage limits)
      expect(result).toBe(true);
    });

    it('should preserve all data fields', () => {
      // Given: World with all optional fields
      const worldData: SerializedWorld = {
        version: '1.0.0',
        timestamp: 1234567890,
        seed: 55555,
        chunks: [{
          x: 0,
          z: 0,
          blocks: 'dGVzdA==' // "test" in Base64
        }],
        metadata: {
          playTime: 300,
          blockCount: 1000,
          lastSaved: 9876543210,
          worldName: 'My Amazing World'
        }
      };

      // When: Save and load
      manager.saveWorld(worldData);
      const loaded = manager.loadWorld();

      // Then: All fields are preserved
      expect(loaded).not.toBeNull();
      expect(loaded!.version).toBe('1.0.0');
      expect(loaded!.timestamp).toBe(1234567890);
      expect(loaded!.seed).toBe(55555);
      expect(loaded!.chunks.length).toBe(1);
      expect(loaded!.chunks[0].blocks).toBe('dGVzdA==');
      expect(loaded!.metadata.worldName).toBe('My Amazing World');
    });
  });

  describe('loadWorld', () => {
    it('should load saved data', () => {
      // Given: Data in localStorage
      const worldData: SerializedWorld = {
        version: '1.0.0',
        timestamp: Date.now(),
        seed: 77777,
        chunks: [],
        metadata: {
          playTime: 500,
          blockCount: 2000,
          lastSaved: Date.now()
        }
      };

      manager.saveWorld(worldData);

      // When: loadWorld()
      const loaded = manager.loadWorld();

      // Then: Returns correct SerializedWorld
      expect(loaded).not.toBeNull();
      expect(loaded!.seed).toBe(77777);
      expect(loaded!.metadata.playTime).toBe(500);
    });

    it('should return null if no save exists', () => {
      // Given: Empty localStorage
      // (cleared in beforeEach)

      // When: loadWorld()
      const loaded = manager.loadWorld();

      // Then: Returns null
      expect(loaded).toBeNull();
    });

    it('should return null on corrupted data', () => {
      // Given: Invalid JSON in localStorage
      localStorage.setItem('cubeworld_save', '{ invalid json !!!');

      // When: loadWorld()
      const loaded = manager.loadWorld();

      // Then: Returns null (graceful degradation)
      expect(loaded).toBeNull();
    });

    it('should handle empty localStorage gracefully', () => {
      // Given: Completely empty localStorage
      localStorage.clear();

      // When: loadWorld()
      const loaded = manager.loadWorld();

      // Then: Returns null without throwing
      expect(loaded).toBeNull();
    });

    it('should parse JSON correctly', () => {
      // Given: Manually stored JSON
      const data = {
        version: '1.0.0',
        timestamp: 1000,
        seed: 88888,
        chunks: [{ x: 1, z: 2, blocks: 'abc' }],
        metadata: {
          playTime: 10,
          blockCount: 20,
          lastSaved: 3000
        }
      };

      localStorage.setItem('cubeworld_save', JSON.stringify(data));

      // When: loadWorld()
      const loaded = manager.loadWorld();

      // Then: Correctly parsed
      expect(loaded).not.toBeNull();
      expect(loaded!.seed).toBe(88888);
      expect(loaded!.chunks.length).toBe(1);
      expect(loaded!.chunks[0].x).toBe(1);
    });
  });

  describe('hasWorld', () => {
    it('should return true if save exists', () => {
      // Given: Data in localStorage
      const worldData: SerializedWorld = {
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

      manager.saveWorld(worldData);

      // When: hasWorld()
      const result = manager.hasWorld();

      // Then: Returns true
      expect(result).toBe(true);
    });

    it('should return false if no save exists', () => {
      // Given: Empty localStorage
      localStorage.clear();

      // When: hasWorld()
      const result = manager.hasWorld();

      // Then: Returns false
      expect(result).toBe(false);
    });

    it('should return false if data is corrupted', () => {
      // Given: Corrupted data
      localStorage.setItem('cubeworld_save', 'corrupted!!!');

      // When: hasWorld()
      const result = manager.hasWorld();

      // Then: Returns false (invalid data = no valid save)
      expect(result).toBe(false);
    });
  });

  describe('clearWorld', () => {
    it('should remove save data', () => {
      // Given: Data in localStorage
      const worldData: SerializedWorld = {
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

      manager.saveWorld(worldData);
      expect(manager.hasWorld()).toBe(true);

      // When: clearWorld()
      manager.clearWorld();

      // Then: localStorage is empty
      expect(manager.hasWorld()).toBe(false);
      expect(manager.loadWorld()).toBeNull();
    });

    it('should not throw if no save exists', () => {
      // Given: Empty localStorage
      localStorage.clear();

      // When & Then: clearWorld() does not throw
      expect(() => {
        manager.clearWorld();
      }).not.toThrow();
    });

    it('should completely remove the key', () => {
      // Given: Saved data
      manager.saveWorld({
        version: '1.0.0',
        timestamp: Date.now(),
        seed: 12345,
        chunks: [],
        metadata: {
          playTime: 0,
          blockCount: 0,
          lastSaved: Date.now()
        }
      });

      // When: clearWorld()
      manager.clearWorld();

      // Then: Key is completely removed
      expect(localStorage.getItem('cubeworld_save')).toBeNull();
    });
  });

  describe('getSaveSize', () => {
    it('should return 0 if no save exists', () => {
      // Given: Empty localStorage
      localStorage.clear();

      // When: getSaveSize()
      const size = manager.getSaveSize();

      // Then: Returns 0
      expect(size).toBe(0);
    });

    it('should return size in bytes', () => {
      // Given: Small data
      const worldData: SerializedWorld = {
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

      manager.saveWorld(worldData);

      // When: getSaveSize()
      const size = manager.getSaveSize();

      // Then: Returns positive number
      expect(size).toBeGreaterThan(0);
      // JSON string should be at least 100 bytes
      expect(size).toBeGreaterThan(100);
    });

    it('should return correct size for large data', () => {
      // Given: Large data with many chunks
      const chunks = Array.from({ length: 10 }, (_, i) => ({
        x: i,
        z: i,
        blocks: 'X'.repeat(1000) // 1KB per chunk
      }));

      manager.saveWorld({
        version: '1.0.0',
        timestamp: Date.now(),
        seed: 12345,
        chunks,
        metadata: {
          playTime: 0,
          blockCount: 0,
          lastSaved: Date.now()
        }
      });

      // When: getSaveSize()
      const size = manager.getSaveSize();

      // Then: Size is at least 10KB (10 chunks × 1KB)
      expect(size).toBeGreaterThan(10000);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid save/load cycles', () => {
      // Given: Multiple rapid operations
      for (let i = 0; i < 10; i++) {
        const data: SerializedWorld = {
          version: '1.0.0',
          timestamp: Date.now(),
          seed: i,
          chunks: [],
          metadata: {
            playTime: i * 10,
            blockCount: i * 100,
            lastSaved: Date.now()
          }
        };

        manager.saveWorld(data);
        const loaded = manager.loadWorld();

        expect(loaded).not.toBeNull();
        expect(loaded!.seed).toBe(i);
      }
    });

    it('should handle Unicode characters in world name', () => {
      // Given: World with Unicode name
      const data: SerializedWorld = {
        version: '1.0.0',
        timestamp: Date.now(),
        seed: 12345,
        chunks: [],
        metadata: {
          playTime: 0,
          blockCount: 0,
          lastSaved: Date.now(),
          worldName: 'My World 🌍🎮'
        }
      };

      // When: Save and load
      manager.saveWorld(data);
      const loaded = manager.loadWorld();

      // Then: Unicode preserved
      expect(loaded!.metadata.worldName).toBe('My World 🌍🎮');
    });

    it('should handle special characters in data', () => {
      // Given: Data with special characters
      const data: SerializedWorld = {
        version: '1.0.0',
        timestamp: Date.now(),
        seed: 12345,
        chunks: [{
          x: 0,
          z: 0,
          blocks: 'SGVsbG8gV29ybGQh' // Base64 can contain +/=
        }],
        metadata: {
          playTime: 0,
          blockCount: 0,
          lastSaved: Date.now()
        }
      };

      // When: Save and load
      manager.saveWorld(data);
      const loaded = manager.loadWorld();

      // Then: Special characters preserved
      expect(loaded!.chunks[0].blocks).toBe('SGVsbG8gV29ybGQh');
    });
  });
});
