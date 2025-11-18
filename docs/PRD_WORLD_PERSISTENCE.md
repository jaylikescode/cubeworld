# PRD: 월드 지속성 시스템 (World Persistence System)

## 📋 문서 정보
- **작성일**: 2025-01-17
- **버전**: 1.0
- **개발 방법론**: TDD (Test-Driven Development)
- **원칙**: Clean & Simple, Stable, Step-by-step

---

## 🎯 목표 (Goals)

### 비즈니스 목표
1. **사용자 경험 개선**: 페이지 새로고침 후에도 작업 내용 보존
2. **사용자 참여 증가**: 진행상황이 저장되어 재방문율 증가
3. **데이터 기반**: 향후 클라우드 저장소로 확장 가능한 기반 마련

### 기술 목표
1. **안정성**: 기존 기능 100% 유지, 0개의 regression
2. **확장성**: Phase 2-4를 위한 clean architecture
3. **테스트 커버리지**: 80% 이상 유지
4. **성능**: 저장/로드 시간 < 1초 (49 청크 기준)

---

## 🔍 현재 상태 분석 (Current State)

### 문제점
```typescript
// VoxelWorld.ts:23 - 매번 새로운 랜덤 시드
this.noiseGenerator = new NoiseGenerator(Math.random());

// VoxelWorld.ts:26 - 자동 생성
this.generateWorld();
```

**결과**:
- ❌ 페이지 새로고침 시 모든 변경사항 손실
- ❌ 사용자가 만든 건축물 사라짐
- ❌ 진행상황 추적 불가능

### 영향 받는 사용자 시나리오
1. 사용자가 30분간 성을 건설
2. 실수로 브라우저 새로고침
3. **모든 작업 손실** 😞

---

## 📐 설계 원칙 (Design Principles)

### 1. Single Responsibility Principle (SRP)
- `WorldSerializer`: 데이터 변환만 담당
- `LocalStorageManager`: 저장소 관리만 담당
- `VoxelWorld`: 월드 로직만 담당 (저장 로직 분리)

### 2. Open/Closed Principle (OCP)
- 기존 `VoxelWorld` 수정 최소화 (constructor 파라미터 추가만)
- 새로운 기능은 새로운 클래스로 추가

### 3. Dependency Inversion Principle (DIP)
- Interface 기반 설계
- Mock 테스트 가능한 구조

### 4. KISS (Keep It Simple, Stupid)
- 복잡한 압축 알고리즘 사용 안 함 (Phase 1)
- 간단한 Base64 인코딩만 사용
- 최적화는 필요시에만 (premature optimization 방지)

---

## 🏗️ 아키텍처 설계 (Architecture Design)

### 시스템 다이어그램
```
┌─────────────────────────────────────────────────────────┐
│                    VoxelUIManager                        │
│  (UI 레이어 - 사용자 인터랙션)                              │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ saves/loads
                 ▼
┌─────────────────────────────────────────────────────────┐
│              LocalStorageManager                         │
│  (저장소 레이어 - localStorage CRUD)                      │
│                                                           │
│  Methods:                                                │
│  - saveWorld(data: SerializedWorld): boolean             │
│  - loadWorld(): SerializedWorld | null                   │
│  - hasWorld(): boolean                                   │
│  - clearWorld(): void                                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ uses
                 ▼
┌─────────────────────────────────────────────────────────┐
│                WorldSerializer                           │
│  (직렬화 레이어 - 데이터 변환)                              │
│                                                           │
│  Methods:                                                │
│  - serialize(world: VoxelWorld): SerializedWorld         │
│  - deserialize(data: SerializedWorld): WorldData         │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ serializes/deserializes
                 ▼
┌─────────────────────────────────────────────────────────┐
│                   VoxelWorld                             │
│  (도메인 레이어 - 비즈니스 로직)                            │
│                                                           │
│  Modified:                                               │
│  - constructor(scene, seed?) // seed 옵션 추가           │
│  - getSeed(): number // getter 추가                      │
│  - getChunks(): Map<string, Chunk> // getter 추가        │
│                                                           │
│  New (minimal):                                          │
│  - loadFromData(data: WorldData): void                   │
└─────────────────────────────────────────────────────────┘
```

### 데이터 플로우
```
저장 (Save):
User Click [Save]
  → VoxelUIManager.saveWorld()
  → WorldSerializer.serialize(voxelWorld)
  → SerializedWorld { version, seed, chunks, metadata }
  → LocalStorageManager.saveWorld(serializedWorld)
  → localStorage.setItem('cubeworld_save', JSON.stringify(data))

불러오기 (Load):
Page Load
  → LocalStorageManager.hasWorld() ? true
  → LocalStorageManager.loadWorld()
  → WorldSerializer.deserialize(data)
  → VoxelWorld.loadFromData(worldData)
  → Rebuild meshes
```

---

## 📊 데이터 모델 (Data Models)

### TypeScript Interfaces

```typescript
/**
 * 직렬화된 월드 데이터
 * localStorage에 저장되는 최상위 구조
 */
interface SerializedWorld {
  version: string;           // 데이터 포맷 버전 (예: "1.0.0")
  timestamp: number;         // 저장 시각 (Unix timestamp)
  seed: number;              // 월드 생성 시드
  chunks: SerializedChunk[]; // 청크 배열
  metadata: WorldMetadata;   // 메타데이터
}

/**
 * 직렬화된 청크 데이터
 */
interface SerializedChunk {
  x: number;                 // 청크 X 좌표
  z: number;                 // 청크 Z 좌표
  blocks: string;            // Base64 인코딩된 Uint8Array
}

/**
 * 월드 메타데이터
 */
interface WorldMetadata {
  playTime: number;          // 총 플레이 타임 (초)
  blockCount: number;        // 총 블록 수
  lastSaved: number;         // 마지막 저장 시각
  worldName?: string;        // 월드 이름 (옵션)
}

/**
 * 역직렬화된 월드 데이터
 * VoxelWorld.loadFromData()에 전달
 */
interface WorldData {
  seed: number;
  chunks: Map<string, ChunkData>;
  metadata: WorldMetadata;
}

/**
 * 역직렬화된 청크 데이터
 */
interface ChunkData {
  x: number;
  z: number;
  blocks: Uint8Array;
}
```

### 데이터 크기 계산

```
청크당 블록 수: 16 x 64 x 16 = 16,384 블록
청크당 메모리: 16,384 bytes = 16 KB

49 청크 (7x7):
- Raw: 49 × 16 KB = 784 KB
- Base64 인코딩: 784 KB × 1.33 ≈ 1,043 KB ≈ 1 MB
- JSON 오버헤드: +10% ≈ 1.15 MB

localStorage 한도: 5-10 MB (브라우저별 상이)
→ 충분한 공간 ✅
```

---

## 🧪 TDD 개발 계획 (TDD Development Plan)

### Phase 1: 기본 직렬화 (Basic Serialization)

#### Step 1.1: WorldSerializer - 테스트 작성
**파일**: `tests/unit/services/WorldSerializer.test.ts`

```typescript
describe('WorldSerializer', () => {
  describe('serialize', () => {
    it('should serialize world with correct version', () => {
      // Given: VoxelWorld with known state
      // When: serialize()
      // Then: version === "1.0.0"
    });

    it('should serialize seed correctly', () => {
      // Given: VoxelWorld with seed 12345
      // When: serialize()
      // Then: data.seed === 12345
    });

    it('should serialize chunks as Base64 strings', () => {
      // Given: VoxelWorld with 1 chunk
      // When: serialize()
      // Then: chunks[0].blocks is valid Base64
    });

    it('should include metadata', () => {
      // Given: VoxelWorld
      // When: serialize()
      // Then: metadata includes playTime, blockCount
    });
  });

  describe('deserialize', () => {
    it('should deserialize valid data correctly', () => {
      // Given: Valid SerializedWorld
      // When: deserialize()
      // Then: Returns WorldData with correct seed
    });

    it('should decode Base64 to Uint8Array', () => {
      // Given: SerializedChunk with Base64 blocks
      // When: deserialize()
      // Then: ChunkData.blocks is Uint8Array
    });

    it('should handle empty chunks array', () => {
      // Given: SerializedWorld with empty chunks
      // When: deserialize()
      // Then: Returns empty Map
    });

    it('should throw on invalid version', () => {
      // Given: SerializedWorld with version "999.0.0"
      // When: deserialize()
      // Then: Throws error
    });
  });

  describe('round-trip', () => {
    it('should preserve data through serialize/deserialize', () => {
      // Given: VoxelWorld
      // When: serialize() then deserialize()
      // Then: Data matches original
    });
  });
});
```

#### Step 1.1: WorldSerializer - 구현
**파일**: `src/services/WorldSerializer.ts`

```typescript
import { VoxelWorld } from '../core/VoxelWorld';
import type { SerializedWorld, WorldData } from '../types/SerializationTypes';

export class WorldSerializer {
  private static readonly VERSION = '1.0.0';

  /**
   * VoxelWorld를 직렬화된 데이터로 변환
   */
  serialize(world: VoxelWorld): SerializedWorld {
    // Implementation after tests
  }

  /**
   * 직렬화된 데이터를 WorldData로 변환
   */
  deserialize(data: SerializedWorld): WorldData {
    // Implementation after tests
  }

  /**
   * Uint8Array를 Base64 문자열로 인코딩
   */
  private encodeBlocks(blocks: Uint8Array): string {
    // Implementation
  }

  /**
   * Base64 문자열을 Uint8Array로 디코딩
   */
  private decodeBlocks(encoded: string): Uint8Array {
    // Implementation
  }
}
```

---

#### Step 1.2: LocalStorageManager - 테스트 작성
**파일**: `tests/unit/services/LocalStorageManager.test.ts`

```typescript
describe('LocalStorageManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('saveWorld', () => {
    it('should save data to localStorage', () => {
      // Given: Valid SerializedWorld
      // When: saveWorld()
      // Then: localStorage contains data
    });

    it('should return true on success', () => {
      // Given: Valid data
      // When: saveWorld()
      // Then: Returns true
    });

    it('should return false on quota exceeded', () => {
      // Given: Very large data (mock)
      // When: saveWorld()
      // Then: Returns false
    });

    it('should overwrite existing save', () => {
      // Given: Existing save
      // When: saveWorld() with new data
      // Then: Old data is replaced
    });
  });

  describe('loadWorld', () => {
    it('should load saved data', () => {
      // Given: Data in localStorage
      // When: loadWorld()
      // Then: Returns correct SerializedWorld
    });

    it('should return null if no save exists', () => {
      // Given: Empty localStorage
      // When: loadWorld()
      // Then: Returns null
    });

    it('should return null on corrupted data', () => {
      // Given: Invalid JSON in localStorage
      // When: loadWorld()
      // Then: Returns null (graceful degradation)
    });
  });

  describe('hasWorld', () => {
    it('should return true if save exists', () => {
      // Given: Data in localStorage
      // When: hasWorld()
      // Then: Returns true
    });

    it('should return false if no save exists', () => {
      // Given: Empty localStorage
      // When: hasWorld()
      // Then: Returns false
    });
  });

  describe('clearWorld', () => {
    it('should remove save data', () => {
      // Given: Data in localStorage
      // When: clearWorld()
      // Then: localStorage is empty
    });

    it('should not throw if no save exists', () => {
      // Given: Empty localStorage
      // When: clearWorld()
      // Then: No error
    });
  });
});
```

#### Step 1.2: LocalStorageManager - 구현
**파일**: `src/services/LocalStorageManager.ts`

```typescript
import type { SerializedWorld } from '../types/SerializationTypes';

export class LocalStorageManager {
  private static readonly STORAGE_KEY = 'cubeworld_save';

  /**
   * 월드 데이터를 localStorage에 저장
   */
  saveWorld(data: SerializedWorld): boolean {
    // Implementation after tests
  }

  /**
   * localStorage에서 월드 데이터 로드
   */
  loadWorld(): SerializedWorld | null {
    // Implementation after tests
  }

  /**
   * 저장된 월드가 있는지 확인
   */
  hasWorld(): boolean {
    // Implementation after tests
  }

  /**
   * 저장된 월드 데이터 삭제
   */
  clearWorld(): void {
    // Implementation after tests
  }

  /**
   * 저장 용량 확인 (bytes)
   */
  getSaveSize(): number {
    // Implementation after tests
  }
}
```

---

#### Step 1.3: VoxelWorld 확장 - 테스트 작성
**파일**: `tests/unit/core/VoxelWorld.test.ts` (기존 파일 확장)

```typescript
describe('VoxelWorld - Persistence Extensions', () => {
  describe('constructor with seed', () => {
    it('should use provided seed', () => {
      // Given: seed = 12345
      // When: new VoxelWorld(scene, 12345)
      // Then: getSeed() === 12345
    });

    it('should generate random seed if not provided', () => {
      // Given: No seed
      // When: new VoxelWorld(scene)
      // Then: getSeed() is a number
    });

    it('should generate same world with same seed', () => {
      // Given: seed = 12345
      // When: Create two worlds with same seed
      // Then: Terrain is identical
    });
  });

  describe('getSeed', () => {
    it('should return current seed', () => {
      // Test implementation
    });
  });

  describe('getChunks', () => {
    it('should return chunks map', () => {
      // Test implementation
    });
  });

  describe('loadFromData', () => {
    it('should load chunks from WorldData', () => {
      // Given: WorldData with 2 chunks
      // When: loadFromData()
      // Then: World has 2 chunks
    });

    it('should clear existing chunks before loading', () => {
      // Given: World with existing chunks
      // When: loadFromData()
      // Then: Old chunks are removed
    });

    it('should rebuild meshes after loading', () => {
      // Given: WorldData
      // When: loadFromData()
      // Then: Meshes are created
    });

    it('should preserve seed from loaded data', () => {
      // Given: WorldData with seed 99999
      // When: loadFromData()
      // Then: getSeed() === 99999
    });
  });
});
```

#### Step 1.3: VoxelWorld 확장 - 구현
**파일**: `src/core/VoxelWorld.ts` (기존 파일 수정)

```typescript
export class VoxelWorld {
  private chunks: Map<string, Chunk>;
  private worldSettings: WorldSettings;
  private noiseGenerator: NoiseGenerator;
  private blockGeometry: THREE.BoxGeometry;
  private scene: THREE.Scene;
  private seed: number; // ✨ NEW

  constructor(scene: THREE.Scene, seed?: number) { // ✨ MODIFIED
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

  // ✨ NEW: Seed getter
  public getSeed(): number {
    return this.seed;
  }

  // ✨ NEW: Chunks getter (for serialization)
  public getChunks(): Map<string, Chunk> {
    return this.chunks;
  }

  // ✨ NEW: Load world from deserialized data
  public loadFromData(data: WorldData): void {
    // Implementation after tests
  }

  // ... existing methods remain unchanged
}
```

---

#### Step 1.4: 통합 테스트
**파일**: `tests/integration/WorldPersistence.integration.test.ts`

```typescript
describe('World Persistence Integration', () => {
  it('should save and load world correctly', () => {
    // Given: VoxelWorld with some blocks placed
    const scene = new THREE.Scene();
    const world = new VoxelWorld(scene, 12345);

    // Place some blocks
    world.setBlock(0, 33, 0, BlockType.DIAMOND_BLOCK);
    world.setBlock(1, 33, 0, BlockType.GOLD_BLOCK);

    // When: Serialize and save
    const serializer = new WorldSerializer();
    const storage = new LocalStorageManager();

    const serialized = serializer.serialize(world);
    storage.saveWorld(serialized);

    // And: Load into new world
    const loaded = storage.loadWorld();
    const worldData = serializer.deserialize(loaded!);

    const newWorld = new VoxelWorld(scene);
    newWorld.loadFromData(worldData);

    // Then: Blocks are preserved
    expect(newWorld.getBlock(0, 33, 0)).toBe(BlockType.DIAMOND_BLOCK);
    expect(newWorld.getBlock(1, 33, 0)).toBe(BlockType.GOLD_BLOCK);
    expect(newWorld.getSeed()).toBe(12345);
  });

  it('should handle page refresh simulation', () => {
    // Simulate complete save/load cycle
  });
});
```

---

#### Step 1.5: UI 통합 - 테스트 작성
**파일**: `tests/unit/ui/VoxelUIManager.test.ts` (확장)

```typescript
describe('VoxelUIManager - Save/Load UI', () => {
  describe('Save button', () => {
    it('should call saveWorld on click', () => {
      // Test implementation
    });

    it('should show success message after save', () => {
      // Test implementation
    });

    it('should show error message on save failure', () => {
      // Test implementation
    });
  });

  describe('Load button', () => {
    it('should be disabled if no save exists', () => {
      // Test implementation
    });

    it('should load world on click', () => {
      // Test implementation
    });
  });

  describe('Clear button', () => {
    it('should show confirmation dialog', () => {
      // Test implementation
    });

    it('should clear save on confirmation', () => {
      // Test implementation
    });
  });
});
```

#### Step 1.5: UI 통합 - 구현
**파일**: `src/ui/VoxelUIManager.ts` (기존 파일 확장)

```typescript
import { LocalStorageManager } from '../services/LocalStorageManager';
import { WorldSerializer } from '../services/WorldSerializer';

export class VoxelUIManager {
  // ... existing properties
  private storageManager: LocalStorageManager;
  private serializer: WorldSerializer;

  constructor(gameEngine: VoxelGameEngine) {
    // ... existing initialization

    this.storageManager = new LocalStorageManager();
    this.serializer = new WorldSerializer();

    this.setupSaveLoadUI();
  }

  private setupSaveLoadUI(): void {
    // Add save/load buttons to existing toolbar
  }

  private saveWorld(): void {
    // Implementation
  }

  private loadWorld(): void {
    // Implementation
  }

  private clearSave(): void {
    // Implementation
  }
}
```

---

## 📝 타입 정의 (Type Definitions)

**파일**: `src/types/SerializationTypes.ts` (신규)

```typescript
/**
 * 직렬화 관련 타입 정의
 */

export interface SerializedWorld {
  version: string;
  timestamp: number;
  seed: number;
  chunks: SerializedChunk[];
  metadata: WorldMetadata;
}

export interface SerializedChunk {
  x: number;
  z: number;
  blocks: string; // Base64 encoded Uint8Array
}

export interface WorldMetadata {
  playTime: number;
  blockCount: number;
  lastSaved: number;
  worldName?: string;
}

export interface WorldData {
  seed: number;
  chunks: Map<string, ChunkData>;
  metadata: WorldMetadata;
}

export interface ChunkData {
  x: number;
  z: number;
  blocks: Uint8Array;
}

/**
 * 저장소 에러 타입
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public code: 'QUOTA_EXCEEDED' | 'CORRUPTED_DATA' | 'VERSION_MISMATCH'
  ) {
    super(message);
    this.name = 'StorageError';
  }
}
```

---

## ✅ 완료 기준 (Definition of Done)

### Phase 1 완료 조건

#### 기능 요구사항
- [ ] 사용자가 "저장" 버튼을 클릭하면 현재 월드가 저장됨
- [ ] 페이지 새로고침 후 저장된 월드가 자동으로 로드됨
- [ ] 사용자가 "새로운 월드" 버튼을 클릭하면 새 월드 생성
- [ ] 사용자가 "저장 삭제" 버튼을 클릭하면 저장 데이터 삭제

#### 기술 요구사항
- [ ] 모든 단위 테스트 통과 (80% 커버리지)
- [ ] 통합 테스트 통과
- [ ] 기존 테스트 269개 모두 통과 (regression 없음)
- [ ] TypeScript 타입 에러 0개
- [ ] ESLint 경고 0개

#### 성능 요구사항
- [ ] 저장 시간 < 1초 (49 청크)
- [ ] 로드 시간 < 1초
- [ ] 저장 데이터 크기 < 2MB

#### 문서화 요구사항
- [ ] API 문서 작성 (JSDoc)
- [ ] 사용자 가이드 업데이트
- [ ] README 업데이트

---

## 🚀 개발 일정 (Development Schedule)

### Week 1: 기반 구축
- **Day 1-2**: 타입 정의 및 WorldSerializer 테스트/구현
- **Day 3-4**: LocalStorageManager 테스트/구현
- **Day 5**: 통합 테스트 작성

### Week 2: VoxelWorld 통합 및 UI
- **Day 1-2**: VoxelWorld 확장 (테스트/구현)
- **Day 3-4**: UI 통합 (테스트/구현)
- **Day 5**: 통합 테스트 및 버그 수정

### Week 3: 테스트 및 최적화 (버퍼)
- **Day 1-2**: 엣지 케이스 테스트
- **Day 3**: 성능 최적화
- **Day 4**: 문서화
- **Day 5**: 코드 리뷰 및 배포 준비

**총 개발 기간**: 2-3주 (여유 포함)

---

## 🔒 리스크 관리 (Risk Management)

### 식별된 리스크

| 리스크 | 확률 | 영향 | 대응 방안 |
|--------|------|------|-----------|
| localStorage 용량 초과 | 중 | 중 | 에러 처리 및 사용자 알림, 압축 고려 (Phase 2) |
| 기존 기능 손상 (regression) | 낮 | 높 | TDD 방식, 기존 테스트 유지 |
| 브라우저 호환성 문제 | 낮 | 중 | localStorage 지원 체크, polyfill |
| 데이터 손상 | 낮 | 높 | 버전 체크, validation, 백업 기능 |

### 대응 전략
1. **localStorage 용량 초과**:
   ```typescript
   try {
     localStorage.setItem(key, value);
   } catch (e) {
     if (e.name === 'QuotaExceededError') {
       // 사용자에게 알림
       alert('저장 공간이 부족합니다. 이전 저장 데이터를 삭제해주세요.');
       return false;
     }
   }
   ```

2. **Regression 방지**:
   - 모든 변경 전 테스트 실행
   - CI/CD에서 자동 테스트
   - 코드 리뷰 필수

3. **브라우저 호환성**:
   ```typescript
   if (typeof Storage === 'undefined') {
     console.warn('localStorage not supported');
     // Fallback: 메모리에만 저장
   }
   ```

---

## 📊 성공 지표 (Success Metrics)

### 기술 지표
- **테스트 커버리지**: > 80%
- **빌드 성공률**: 100%
- **타입 안전성**: 100% (타입 에러 0개)

### 사용자 지표 (추후 측정)
- **재방문율**: +20% 목표
- **평균 세션 시간**: +30% 목표
- **저장 기능 사용률**: > 50%

---

## 🔄 다음 단계 (Next Steps)

### Phase 2 Preview: Auto-Save
- 5분마다 자동 저장
- 변경사항 추적 (dirty flag)
- 백그라운드 저장

### Phase 3 Preview: Cloud Storage
- Supabase 연동
- 멀티 디바이스 동기화
- 사용자 인증

---

## 📚 참고 자료 (References)

### 내부 문서
- [WORLD_PERSISTENCE_PLAN.md](./WORLD_PERSISTENCE_PLAN.md) - 전체 로드맵
- [CURRENT_ANALYSIS.md](./CURRENT_ANALYSIS.md) - 현재 상태 분석

### 외부 자료
- [localStorage MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Base64 Encoding](https://developer.mozilla.org/en-US/docs/Glossary/Base64)
- [TDD Best Practices](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

## ✍️ 변경 이력 (Change Log)

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2025-01-17 | 초안 작성 | Development Team |

---

**승인**: ⬜ Product Owner  ⬜ Tech Lead  ⬜ QA Lead

**상태**: 🟡 초안 (Draft)
