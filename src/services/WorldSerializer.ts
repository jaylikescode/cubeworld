/**
 * WorldSerializer
 *
 * 월드 데이터를 직렬화/역직렬화하여 저장소에 저장 가능한 형식으로 변환
 *
 * Responsibilities:
 * - VoxelWorld를 SerializedWorld로 변환 (serialize)
 * - SerializedWorld를 WorldData로 변환 (deserialize)
 * - Uint8Array <-> Base64 변환
 * - 데이터 유효성 검증
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
  /** 현재 직렬화 포맷 버전 */
  private static readonly VERSION = '1.0.0';

  /** 지원하는 버전 목록 (하위 호환성) */
  private static readonly SUPPORTED_VERSIONS = ['1.0.0'];

  /**
   * VoxelWorld를 직렬화된 데이터로 변환
   *
   * @param world - 직렬화할 VoxelWorld 인스턴스
   * @returns 직렬화된 월드 데이터
   */
  serialize(world: VoxelWorld): SerializedWorld {
    const now = Date.now();

    // 청크 직렬화
    const chunks = this.serializeChunks(world);

    // 메타데이터 생성
    const metadata: WorldMetadata = {
      playTime: 0, // TODO: Phase 2에서 실제 플레이 타임 추적
      blockCount: world.getTotalBlockCount(),
      lastSaved: now,
      worldName: undefined // TODO: Phase 2에서 월드 이름 기능 추가
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
   * 직렬화된 데이터를 WorldData로 변환
   *
   * @param data - 직렬화된 월드 데이터
   * @returns 역직렬화된 월드 데이터
   * @throws {StorageError} 버전 불일치 또는 데이터 손상 시
   */
  deserialize(data: SerializedWorld): WorldData {
    // 버전 검증
    this.validateVersion(data.version);

    // 필수 필드 검증
    this.validateData(data);

    // 청크 역직렬화
    const chunks = this.deserializeChunks(data.chunks);

    return {
      seed: data.seed,
      chunks,
      metadata: data.metadata
    };
  }

  /**
   * 월드의 모든 청크를 직렬화
   */
  private serializeChunks(world: VoxelWorld): SerializedChunk[] {
    const chunks = world.getChunks();
    const serializedChunks: SerializedChunk[] = [];

    chunks.forEach((chunk: Chunk, key: string) => {
      serializedChunks.push({
        x: chunk.x,
        z: chunk.z,
        blocks: this.encodeBlocks(chunk.blocks)
      });
    });

    return serializedChunks;
  }

  /**
   * 직렬화된 청크들을 Map으로 역직렬화
   */
  private deserializeChunks(chunks: SerializedChunk[]): Map<string, ChunkData> {
    const chunkMap = new Map<string, ChunkData>();

    for (const serializedChunk of chunks) {
      const key = `${serializedChunk.x},${serializedChunk.z}`;

      try {
        const blocks = this.decodeBlocks(serializedChunk.blocks);

        // 블록 데이터 크기 검증
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
   * Uint8Array를 Base64 문자열로 인코딩
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
   * Base64 문자열을 Uint8Array로 디코딩
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
   * 데이터 버전 검증
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
   * 직렬화된 데이터의 필수 필드 검증
   */
  private validateData(data: SerializedWorld): void {
    // 필수 필드 존재 여부 검증
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

    // 메타데이터 필수 필드 검증
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
