/**
 * WorldSerializer
 *
 * Converts world data to/from a format storable in storage by serializing/deserializing it.
 *
 * Responsibilities:
 * - Convert VoxelWorld to SerializedWorld (serialize)
 * - Convert SerializedWorld to WorldData (deserialize)
 * - Uint8Array <-> Base64 conversion
 * - Data validation
 */

import type { VoxelWorld } from '../core/VoxelWorld';
import type {
  SerializedWorld,
  SerializedChunk,
  WorldData,
  ChunkData,
  WorldMetadata
} from '../types/SerializationTypes';
import { StorageError } from '../types/SerializationTypes';
import type { Chunk } from '../types/VoxelTypes';

export class WorldSerializer {
  /** Current serialization format version */
  private static readonly VERSION = '1.0.0';

  /** Supported version list (backward compatibility) */
  private static readonly SUPPORTED_VERSIONS = ['1.0.0'];

  /**
   * Convert VoxelWorld to serialized data
   *
   * @param world - VoxelWorld instance to serialize
   * @returns Serialized world data
   */
  serialize(world: VoxelWorld): SerializedWorld {
    const now = Date.now();

    // Serialize chunks
    const chunks = this.serializeChunks(world);

    // Create metadata
    const metadata: WorldMetadata = {
      playTime: 0, // TODO: Track actual play time in Phase 2
      blockCount: world.getTotalBlockCount(),
      lastSaved: now,
      worldName: undefined // TODO: Add world name feature in Phase 2
    };

    return {
      version: WorldSerializer.VERSION,
      timestamp: now,
      seed: world.getSeed(),
      chunks,
      metadata
    };
  }

  /**
   * Convert serialized data to WorldData
   *
   * @param data - Serialized world data
   * @returns Deserialized world data
   * @throws {StorageError} If version mismatch or data corruption
   */
  deserialize(data: SerializedWorld): WorldData {
    // Validate version
    this.validateVersion(data.version);

    // Validate required fields
    this.validateData(data);

    // Deserialize chunks
    const chunks = this.deserializeChunks(data.chunks);

    return {
      seed: data.seed,
      chunks,
      metadata: data.metadata
    };
  }

  /**
   * Serialize all chunks in the world
   */
  private serializeChunks(world: VoxelWorld): SerializedChunk[] {
    const chunks = world.getChunks();
    const serializedChunks: SerializedChunk[] = [];

    chunks.forEach((chunk: Chunk) => {
      serializedChunks.push({
        x: chunk.x,
        z: chunk.z,
        blocks: this.encodeBlocks(chunk.blocks)
      });
    });

    return serializedChunks;
  }

  /**
   * Deserialize serialized chunks into a Map
   */
  private deserializeChunks(chunks: SerializedChunk[]): Map<string, ChunkData> {
    const chunkMap = new Map<string, ChunkData>();

    for (const serializedChunk of chunks) {
      const key = `${serializedChunk.x},${serializedChunk.z}`;

      try {
        const blocks = this.decodeBlocks(serializedChunk.blocks);

        // Validate block data size
        const expectedSize = 16 * 64 * 16; // CHUNK_SIZE x CHUNK_HEIGHT x CHUNK_SIZE
        if (blocks.length !== expectedSize) {
          throw new Error(`Invalid chunk size: expected ${expectedSize}, got ${blocks.length}`);
        }

        chunkMap.set(key, {
          x: serializedChunk.x,
          z: serializedChunk.z,
          blocks
        });
      } catch (error) {
        throw new StorageError(
          `Failed to deserialize chunk at (${serializedChunk.x}, ${serializedChunk.z}): ${error}`,
          'CORRUPTED_DATA'
        );
      }
    }

    return chunkMap;
  }

  /**
   * Encode Uint8Array to Base64 string
   *
   * Browser-compatible Base64 encoding
   */
  private encodeBlocks(blocks: Uint8Array): string {
    // Convert Uint8Array to binary string
    let binary = '';
    const len = blocks.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(blocks[i]);
    }

    // Encode to Base64
    return btoa(binary);
  }

  /**
   * Decode Base64 string to Uint8Array
   *
   * Browser-compatible Base64 decoding
   */
  private decodeBlocks(encoded: string): Uint8Array {
    try {
      // Decode Base64 to binary string
      const binary = atob(encoded);

      // Convert binary string to Uint8Array
      const len = binary.length;
      const bytes = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      return bytes;
    } catch (error) {
      throw new Error('Invalid Base64 encoding');
    }
  }

  /**
   * Validate data version
   */
  private validateVersion(version: string): void {
    if (!WorldSerializer.SUPPORTED_VERSIONS.includes(version)) {
      throw new StorageError(
        `Unsupported data version: ${version}. Supported versions: ${WorldSerializer.SUPPORTED_VERSIONS.join(', ')}`,
        'VERSION_MISMATCH'
      );
    }
  }

  /**
   * Validate required fields of serialized data
   */
  private validateData(data: SerializedWorld): void {
    // Validate existence of required fields
    if (typeof data.version !== 'string') {
      throw new StorageError('Missing or invalid version field', 'CORRUPTED_DATA');
    }

    if (typeof data.timestamp !== 'number') {
      throw new StorageError('Missing or invalid timestamp field', 'CORRUPTED_DATA');
    }

    if (typeof data.seed !== 'number') {
      throw new StorageError('Missing or invalid seed field', 'CORRUPTED_DATA');
    }

    if (!Array.isArray(data.chunks)) {
      throw new StorageError('Missing or invalid chunks field', 'CORRUPTED_DATA');
    }

    if (!data.metadata || typeof data.metadata !== 'object') {
      throw new StorageError('Missing or invalid metadata field', 'CORRUPTED_DATA');
    }

    // Validate metadata required fields
    const { metadata } = data;
    if (typeof metadata.playTime !== 'number') {
      throw new StorageError('Missing or invalid metadata.playTime', 'CORRUPTED_DATA');
    }

    if (typeof metadata.blockCount !== 'number') {
      throw new StorageError('Missing or invalid metadata.blockCount', 'CORRUPTED_DATA');
    }

    if (typeof metadata.lastSaved !== 'number') {
      throw new StorageError('Missing or invalid metadata.lastSaved', 'CORRUPTED_DATA');
    }
  }
}
