/**
 * 월드 직렬화 관련 타입 정의
 * World Persistence System - Phase 1
 */

/**
 * 직렬화된 월드 데이터
 * localStorage에 저장되는 최상위 구조
 */
export interface SerializedWorld {
  /** 데이터 포맷 버전 (예: "1.0.0") */
  version: string;

  /** 저장 시각 (Unix timestamp in milliseconds) */
  timestamp: number;

  /** 월드 생성 시드 */
  seed: number;

  /** 직렬화된 청크 배열 */
  chunks: SerializedChunk[];

  /** 월드 메타데이터 */
  metadata: WorldMetadata;
}

/**
 * 직렬화된 청크 데이터
 */
export interface SerializedChunk {
  /** 청크 X 좌표 */
  x: number;

  /** 청크 Z 좌표 */
  z: number;

  /** Base64 인코딩된 블록 데이터 (Uint8Array) */
  blocks: string;
}

/**
 * 월드 메타데이터
 */
export interface WorldMetadata {
  /** 총 플레이 타임 (초) */
  playTime: number;

  /** 총 블록 수 */
  blockCount: number;

  /** 마지막 저장 시각 (Unix timestamp) */
  lastSaved: number;

  /** 월드 이름 (옵션) */
  worldName?: string;
}

/**
 * 역직렬화된 월드 데이터
 * VoxelWorld.loadFromData()에 전달되는 형식
 */
export interface WorldData {
  /** 월드 생성 시드 */
  seed: number;

  /** 청크 맵 (key: "x,z", value: ChunkData) */
  chunks: Map<string, ChunkData>;

  /** 월드 메타데이터 */
  metadata: WorldMetadata;
}

/**
 * 역직렬화된 청크 데이터
 */
export interface ChunkData {
  /** 청크 X 좌표 */
  x: number;

  /** 청크 Z 좌표 */
  z: number;

  /** 블록 데이터 (16 x 64 x 16 = 16,384 bytes) */
  blocks: Uint8Array;
}

/**
 * 저장소 관련 에러 타입
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
