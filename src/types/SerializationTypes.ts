/**
 * World Serialization Related Type Definitions
 * World Persistence System - Phase 1
 */

/**
 * Serialized world data
 * Top-level structure stored in localStorage
 */
export interface SerializedWorld {
  /** Data format version (e.g., "1.0.0") */
  version: string;

  /** Save timestamp (Unix timestamp in milliseconds) */
  timestamp: number;

  /** World generation seed */
  seed: number;

  /** Serialized chunk array */
  chunks: SerializedChunk[];

  /** World metadata */
  metadata: WorldMetadata;
}

/**
 * Serialized chunk data
 */
export interface SerializedChunk {
  /** Chunk X coordinate */
  x: number;

  /** Chunk Z coordinate */
  z: number;

  /** Base64 encoded block data (Uint8Array) */
  blocks: string;
}

/**
 * World metadata
 */
export interface WorldMetadata {
  /** Total play time (seconds) */
  playTime: number;

  /** Total block count */
  blockCount: number;

  /** Last saved timestamp (Unix timestamp) */
  lastSaved: number;

  /** World name (optional) */
  worldName?: string;
}

/**
 * Deserialized world data
 * Format passed to VoxelWorld.loadFromData()
 */
export interface WorldData {
  /** World generation seed */
  seed: number;

  /** Chunk map (key: "x,z", value: ChunkData) */
  chunks: Map<string, ChunkData>;

  /** World metadata */
  metadata: WorldMetadata;
}

/**
 * Deserialized chunk data
 */
export interface ChunkData {
  /** Chunk X coordinate */
  x: number;

  /** Chunk Z coordinate */
  z: number;

  /** Block data (16 x 64 x 16 = 16,384 bytes) */
  blocks: Uint8Array;
}

/**
 * Storage related error type
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public code: 'QUOTA_EXCEEDED' | 'CORRUPTED_DATA' | 'VERSION_MISMATCH' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'StorageError';
  }
}
