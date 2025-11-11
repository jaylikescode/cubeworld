# 🗺️ CubeWorld 개발 로드맵 - Phase별 상세 계획

## 📋 전체 개요

이 문서는 CubeWorld를 완성도 높은 게임으로 발전시키기 위한 **4개 Phase**로 구성된 개발 계획입니다.

### 예상 타임라인
- **Phase 1**: 기반 강화 (2주)
- **Phase 2**: 콘텐츠 확장 (3주)
- **Phase 3**: 게임플레이 (4주)
- **Phase 4**: 폴리싱 (2주)
- **총 기간**: 약 11주 (2.5개월)

---

## 🎯 Phase 1: 기반 강화 및 시스템 개선 (2주)

### 목표
현재 코드베이스를 더 확장 가능하고 유지보수하기 쉽게 만들기

### 1.1 테스트 인프라 구축 (3일)

#### 작업 내용
- [ ] Vitest 설치 및 설정
- [ ] 테스트 디렉토리 구조 생성
- [ ] 유틸리티 함수 테스트 작성
- [ ] 블록 시스템 테스트 작성
- [ ] CI/CD 파이프라인 설정

#### 파일 생성
```
tests/
├── unit/
│   ├── NoiseGenerator.test.ts
│   ├── VoxelWorld.test.ts
│   └── BlockTypes.test.ts
├── integration/
│   └── ToolSystem.test.ts
└── setup.ts
```

#### 예시 코드
```typescript
// tests/unit/BlockTypes.test.ts
import { describe, it, expect } from 'vitest';
import { BlockType, BLOCK_TYPES } from '../../src/types/VoxelTypes';

describe('BlockTypes', () => {
  it('should have data for all block types', () => {
    Object.values(BlockType).forEach(type => {
      if (typeof type === 'number') {
        expect(BLOCK_TYPES[type]).toBeDefined();
      }
    });
  });

  it('should have transparent flag for water', () => {
    expect(BLOCK_TYPES[BlockType.WATER].transparent).toBe(true);
  });
});
```

### 1.2 설정 시스템 구축 (2일)

#### 작업 내용
- [ ] 설정 타입 정의
- [ ] 설정 관리 클래스 생성
- [ ] LocalStorage 연동
- [ ] UI에 설정 패널 추가

#### 파일 생성
```typescript
// src/config/GameConfig.ts
export interface GameConfig {
  graphics: {
    renderDistance: number;
    shadowQuality: 'low' | 'medium' | 'high';
    particleCount: number;
    fogEnabled: boolean;
  };
  controls: {
    mouseSensitivity: number;
    invertY: boolean;
    keyBindings: Record<string, string>;
  };
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
  };
  gameplay: {
    autoSave: boolean;
    showTooltips: boolean;
  };
}

export class ConfigManager {
  private config: GameConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig(): GameConfig {
    const saved = localStorage.getItem('cubeworld_config');
    return saved ? JSON.parse(saved) : this.getDefaultConfig();
  }

  saveConfig(): void {
    localStorage.setItem('cubeworld_config', JSON.stringify(this.config));
  }

  getDefaultConfig(): GameConfig {
    return {
      graphics: {
        renderDistance: 3,
        shadowQuality: 'medium',
        particleCount: 1000,
        fogEnabled: true,
      },
      controls: {
        mouseSensitivity: 1.0,
        invertY: false,
        keyBindings: {
          forward: 'w',
          backward: 's',
          left: 'a',
          right: 'd',
        },
      },
      audio: {
        masterVolume: 0.7,
        musicVolume: 0.5,
        sfxVolume: 0.8,
      },
      gameplay: {
        autoSave: true,
        showTooltips: true,
      },
    };
  }
}
```

### 1.3 상수 분리 및 매직 넘버 제거 (2일)

#### 파일 생성
```typescript
// src/constants/WorldConstants.ts
export const WORLD_CONSTANTS = {
  CHUNK_SIZE: 16,
  CHUNK_HEIGHT: 64,
  DEFAULT_RENDER_DISTANCE: 3,
  SEA_LEVEL: 32,
  MAX_HEIGHT: 64,
  BEDROCK_LEVEL: 0,
} as const;

// src/constants/BlockConstants.ts
export const BLOCK_CONSTANTS = {
  TREE_SPAWN_CHANCE: 0.02,
  MIN_TREE_HEIGHT: 4,
  MAX_TREE_HEIGHT: 6,
  LEAF_RADIUS: 2,
  SNOW_HEIGHT_THRESHOLD: 47,
} as const;

// src/constants/GraphicsConstants.ts
export const GRAPHICS_CONSTANTS = {
  SKY_COLOR: 0x87ceeb,
  FOG_NEAR: 100,
  FOG_FAR: 300,
  SHADOW_MAP_SIZE: 2048,
  MAX_PIXEL_RATIO: 2,
  TARGET_FPS: 60,
} as const;
```

### 1.4 에러 처리 시스템 (2일)

#### 파일 생성
```typescript
// src/utils/ErrorHandler.ts
export class GameError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: GameError[] = [];

  static getInstance(): ErrorHandler {
    if (!this.instance) {
      this.instance = new ErrorHandler();
    }
    return this.instance;
  }

  handleError(error: GameError): void {
    console.error(`[${error.code}] ${error.message}`, error.context);
    this.errorLog.push(error);
    this.showErrorToUser(error);
  }

  private showErrorToUser(error: GameError): void {
    // UI에 에러 토스트 표시
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = error.message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 5000);
  }
}

// 사용 예시
try {
  // 위험한 작업
} catch (e) {
  ErrorHandler.getInstance().handleError(
    new GameError(
      'Failed to load chunk',
      'CHUNK_LOAD_ERROR',
      { chunkX: 0, chunkZ: 0 }
    )
  );
}
```

### 1.5 코드 문서화 (1일)

#### 작업 내용
- [ ] JSDoc 주석 추가
- [ ] API 문서 생성 (TypeDoc)
- [ ] 아키텍처 다이어그램 작성

---

## 🎨 Phase 2: 콘텐츠 확장 (3주)

### 목표
더 다양한 블록, 구조물, 시각적 요소 추가

### 2.1 블록 시스템 확장 (4일)

#### 새로운 블록 30종 추가
```typescript
// src/types/VoxelTypes.ts
export enum BlockType {
  // 기존 블록 (0-10)
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  SAND = 4,
  WATER = 5,
  WOOD = 6,
  LEAVES = 7,
  SNOW = 8,
  COBBLESTONE = 9,
  BEDROCK = 10,

  // 건축 블록 (11-20)
  BRICK = 11,
  GLASS = 12,
  PLANK = 13,
  CONCRETE_WHITE = 14,
  CONCRETE_RED = 15,
  CONCRETE_BLUE = 16,
  CONCRETE_GREEN = 17,
  CONCRETE_YELLOW = 18,
  MARBLE = 19,
  TILE = 20,

  // 자연 블록 (21-30)
  CLAY = 21,
  GRAVEL = 22,
  ICE = 23,
  CACTUS = 24,
  FLOWER_RED = 25,
  FLOWER_YELLOW = 26,
  MUSHROOM_RED = 27,
  MUSHROOM_BROWN = 28,
  PUMPKIN = 29,
  MELON = 30,

  // 광물 블록 (31-40)
  COAL_ORE = 31,
  IRON_ORE = 32,
  GOLD_ORE = 33,
  DIAMOND_ORE = 34,
  EMERALD_ORE = 35,
  COPPER_ORE = 36,
  COAL_BLOCK = 37,
  IRON_BLOCK = 38,
  GOLD_BLOCK = 39,
  DIAMOND_BLOCK = 40,
}
```

#### 블록 카테고리 시스템
```typescript
// src/types/BlockCategory.ts
export enum BlockCategory {
  NATURAL = 'Natural',
  BUILDING = 'Building',
  MINERAL = 'Mineral',
  DECORATION = 'Decoration',
}

export interface BlockDataExtended extends BlockData {
  category: BlockCategory;
  hardness: number;
  tool?: 'pickaxe' | 'axe' | 'shovel';
  dropItem?: ItemType;
  dropCount?: number;
}
```

### 2.2 텍스처 시스템 구현 (5일)

#### 작업 내용
- [ ] 텍스처 아틀라스 생성
- [ ] UV 매핑 시스템
- [ ] 텍스처 로더
- [ ] 블록별 텍스처 적용

#### 파일 구조
```
assets/
├── textures/
│   ├── blocks/
│   │   ├── grass_top.png (16x16)
│   │   ├── grass_side.png
│   │   ├── dirt.png
│   │   ├── stone.png
│   │   └── ... (40+ textures)
│   └── atlas.png (256x256)
└── models/
    └── (추후 사용)
```

#### 텍스처 시스템 코드
```typescript
// src/graphics/TextureManager.ts
export class TextureManager {
  private textureAtlas: THREE.Texture;
  private uvMapping: Map<BlockType, UVCoords>;

  constructor() {
    this.loadTextureAtlas();
    this.generateUVMapping();
  }

  async loadTextureAtlas(): Promise<void> {
    const loader = new THREE.TextureLoader();
    this.textureAtlas = await loader.loadAsync('/assets/textures/atlas.png');
    this.textureAtlas.magFilter = THREE.NearestFilter;
    this.textureAtlas.minFilter = THREE.NearestFilter;
  }

  getUVForBlock(blockType: BlockType, face: BlockFace): UVCoords {
    // 블록 타입과 면에 따른 UV 좌표 반환
    const baseUV = this.uvMapping.get(blockType);
    // 각 면에 대한 오프셋 적용
    return this.calculateFaceUV(baseUV, face);
  }
}

// VoxelWorld.ts 수정
private buildChunkMesh(chunk: Chunk): void {
  // 기존 단색 material 대신 텍스처 material 사용
  const material = new THREE.MeshLambertMaterial({
    map: this.textureManager.getAtlas(),
    transparent: true,
  });
  
  // UV 좌표 설정
  // ...
}
```

### 2.3 구조물 생성 시스템 (6일)

#### 구조물 타입 정의
```typescript
// src/structures/StructureTypes.ts
export interface Structure {
  name: string;
  blocks: BlockPlacement[];
  size: { width: number; height: number; depth: number };
  originOffset: { x: number; y: number; z: number };
}

export interface BlockPlacement {
  x: number;
  y: number;
  z: number;
  blockType: BlockType;
}

// 구조물 라이브러리
export const STRUCTURES = {
  SMALL_HOUSE: {
    name: 'Small House',
    size: { width: 5, height: 4, depth: 5 },
    originOffset: { x: 2, y: 0, z: 2 },
    blocks: [
      // 바닥
      ...generateFloor(5, 5, BlockType.PLANK),
      // 벽
      ...generateWalls(5, 4, 5, BlockType.PLANK),
      // 지붕
      ...generateRoof(5, 5, BlockType.BRICK),
      // 문
      { x: 2, y: 1, z: 0, blockType: BlockType.AIR },
      { x: 2, y: 2, z: 0, blockType: BlockType.AIR },
    ],
  },

  TOWER: {
    name: 'Tower',
    size: { width: 3, height: 10, depth: 3 },
    originOffset: { x: 1, y: 0, z: 1 },
    blocks: generateTower(3, 10, BlockType.STONE),
  },

  CASTLE: {
    name: 'Castle',
    size: { width: 20, height: 15, depth: 20 },
    originOffset: { x: 10, y: 0, z: 10 },
    blocks: generateCastle(),
  },
};

// 구조물 생성 헬퍼 함수
function generateFloor(width: number, depth: number, blockType: BlockType): BlockPlacement[] {
  const blocks: BlockPlacement[] = [];
  for (let x = 0; x < width; x++) {
    for (let z = 0; z < depth; z++) {
      blocks.push({ x, y: 0, z, blockType });
    }
  }
  return blocks;
}

function generateWalls(
  width: number,
  height: number,
  depth: number,
  blockType: BlockType
): BlockPlacement[] {
  const blocks: BlockPlacement[] = [];
  for (let y = 1; y < height; y++) {
    // 4개 벽면
    for (let x = 0; x < width; x++) {
      blocks.push({ x, y, z: 0, blockType }); // 앞벽
      blocks.push({ x, y, z: depth - 1, blockType }); // 뒷벽
    }
    for (let z = 1; z < depth - 1; z++) {
      blocks.push({ x: 0, y, z, blockType }); // 좌벽
      blocks.push({ x: width - 1, y, z, blockType }); // 우벽
    }
  }
  return blocks;
}
```

#### 구조물 배치 시스템
```typescript
// src/structures/StructureManager.ts
export class StructureManager {
  constructor(private voxelWorld: VoxelWorld) {}

  placeStructure(
    structure: Structure,
    worldX: number,
    worldY: number,
    worldZ: number
  ): void {
    const { originOffset, blocks } = structure;

    blocks.forEach(block => {
      const finalX = worldX + block.x - originOffset.x;
      const finalY = worldY + block.y - originOffset.y;
      const finalZ = worldZ + block.z - originOffset.z;

      this.voxelWorld.setBlock(finalX, finalY, finalZ, block.blockType);
    });
  }

  // 지형에 맞춰 자동 배치
  placeStructureOnTerrain(
    structure: Structure,
    worldX: number,
    worldZ: number
  ): void {
    // 지형 높이 찾기
    let groundY = 0;
    for (let y = 63; y >= 0; y--) {
      const block = this.voxelWorld.getBlock(worldX, y, worldZ);
      if (block !== BlockType.AIR) {
        groundY = y + 1;
        break;
      }
    }

    this.placeStructure(structure, worldX, groundY, worldZ);
  }
}
```

### 2.4 인벤토리 시스템 기초 (4일)

#### 인벤토리 타입 정의
```typescript
// src/inventory/InventoryTypes.ts
export interface InventoryItem {
  type: ItemType;
  count: number;
  maxStack: number;
}

export interface Inventory {
  slots: (InventoryItem | null)[];
  maxSlots: number;
  selectedSlot: number;
}

export enum ItemType {
  // 블록 아이템 (BlockType과 매핑)
  GRASS_BLOCK = 1,
  DIRT_BLOCK = 2,
  STONE_BLOCK = 3,
  // ...

  // 도구 아이템
  WOODEN_PICKAXE = 1001,
  STONE_PICKAXE = 1002,
  IRON_PICKAXE = 1003,
  DIAMOND_PICKAXE = 1004,

  WOODEN_AXE = 1011,
  STONE_AXE = 1012,
  IRON_AXE = 1013,

  WOODEN_SHOVEL = 1021,
  STONE_SHOVEL = 1022,
  IRON_SHOVEL = 1023,
}
```

#### 인벤토리 관리 클래스
```typescript
// src/inventory/InventoryManager.ts
export class InventoryManager {
  private inventory: Inventory;

  constructor() {
    this.inventory = {
      slots: new Array(36).fill(null),
      maxSlots: 36,
      selectedSlot: 0,
    };
  }

  addItem(itemType: ItemType, count: number = 1): boolean {
    // 기존 슬롯에 추가 가능한지 확인
    for (let i = 0; i < this.inventory.maxSlots; i++) {
      const slot = this.inventory.slots[i];
      if (slot && slot.type === itemType && slot.count < slot.maxStack) {
        const addAmount = Math.min(count, slot.maxStack - slot.count);
        slot.count += addAmount;
        count -= addAmount;
        if (count === 0) return true;
      }
    }

    // 빈 슬롯에 추가
    for (let i = 0; i < this.inventory.maxSlots; i++) {
      if (!this.inventory.slots[i]) {
        this.inventory.slots[i] = {
          type: itemType,
          count: Math.min(count, this.getMaxStack(itemType)),
          maxStack: this.getMaxStack(itemType),
        };
        count -= this.inventory.slots[i]!.count;
        if (count === 0) return true;
      }
    }

    return false; // 인벤토리 가득 참
  }

  removeItem(slotIndex: number, count: number = 1): boolean {
    const slot = this.inventory.slots[slotIndex];
    if (!slot || slot.count < count) return false;

    slot.count -= count;
    if (slot.count === 0) {
      this.inventory.slots[slotIndex] = null;
    }
    return true;
  }

  getSelectedItem(): InventoryItem | null {
    return this.inventory.slots[this.inventory.selectedSlot];
  }

  private getMaxStack(itemType: ItemType): number {
    // 도구는 1개, 블록은 64개
    if (itemType >= 1000) return 1;
    return 64;
  }
}
```

---

## 🎮 Phase 3: 게임플레이 메커니즘 (4주)

### 목표
게임을 실제로 플레이할 수 있게 만들기

### 3.1 플레이어 캐릭터 시스템 (5일)

#### 플레이어 모델 생성
```typescript
// src/entities/Player.ts
export class Player {
  private model: THREE.Group;
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private onGround: boolean = false;
  private health: number = 20;
  private hunger: number = 20;

  constructor(scene: THREE.Scene, startPos: THREE.Vector3) {
    this.position = startPos.clone();
    this.velocity = new THREE.Vector3();
    this.model = this.createPlayerModel();
    scene.add(this.model);
  }

  private createPlayerModel(): THREE.Group {
    const group = new THREE.Group();

    // 몸통
    const bodyGeo = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x3498db });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.4;
    group.add(body);

    // 머리
    const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xfdbcb4 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.4;
    group.add(head);

    // 팔 (왼쪽)
    const armGeo = new THREE.BoxGeometry(0.3, 1.0, 0.3);
    const armMat = new THREE.MeshLambertMaterial({ color: 0x3498db });
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.55, 1.4, 0);
    group.add(leftArm);

    // 팔 (오른쪽)
    const rightArm = new THREE.Mesh(armGeo, armMat.clone());
    rightArm.position.set(0.55, 1.4, 0);
    group.add(rightArm);

    // 다리 (왼쪽)
    const legGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.2, 0.6, 0);
    group.add(leftLeg);

    // 다리 (오른쪽)
    const rightLeg = new THREE.Mesh(legGeo, legMat.clone());
    rightLeg.position.set(0.2, 0.6, 0);
    group.add(rightLeg);

    return group;
  }

  update(delta: number, voxelWorld: VoxelWorld): void {
    // 중력 적용
    this.velocity.y -= 9.8 * delta;

    // 위치 업데이트
    this.position.add(this.velocity.clone().multiplyScalar(delta));

    // 충돌 감지
    this.checkCollisions(voxelWorld);

    // 모델 위치 업데이트
    this.model.position.copy(this.position);
  }

  private checkCollisions(voxelWorld: VoxelWorld): void {
    // 발 위치 확인
    const footY = Math.floor(this.position.y - 1);
    const blockBelow = voxelWorld.getBlock(
      Math.floor(this.position.x),
      footY,
      Math.floor(this.position.z)
    );

    if (blockBelow !== BlockType.AIR) {
      this.onGround = true;
      this.velocity.y = 0;
      this.position.y = footY + 2; // 블록 위에 서기
    } else {
      this.onGround = false;
    }
  }

  move(direction: THREE.Vector3, speed: number): void {
    const movement = direction.clone().multiplyScalar(speed);
    this.velocity.x = movement.x;
    this.velocity.z = movement.z;
  }

  jump(): void {
    if (this.onGround) {
      this.velocity.y = 5.0;
      this.onGround = false;
    }
  }
}
```

### 3.2 NPC/몹 시스템 (6일)

#### 엔티티 기본 클래스
```typescript
// src/entities/Entity.ts
export abstract class Entity {
  protected model: THREE.Group;
  protected position: THREE.Vector3;
  protected rotation: number = 0;
  protected health: number;
  protected maxHealth: number;
  protected velocity: THREE.Vector3;
  protected id: string;

  constructor(
    protected scene: THREE.Scene,
    startPos: THREE.Vector3,
    maxHealth: number
  ) {
    this.id = Math.random().toString(36).substring(7);
    this.position = startPos.clone();
    this.velocity = new THREE.Vector3();
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.model = this.createModel();
    this.scene.add(this.model);
  }

  abstract createModel(): THREE.Group;
  abstract update(delta: number, voxelWorld: VoxelWorld): void;

  takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.onDeath();
    }
  }

  protected onDeath(): void {
    this.scene.remove(this.model);
    // 아이템 드롭 등
  }

  getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  dispose(): void {
    this.scene.remove(this.model);
    this.model.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        }
      }
    });
  }
}
```

#### 동물 NPC (소)
```typescript
// src/entities/animals/Cow.ts
export class Cow extends Entity {
  private walkTimer: number = 0;
  private direction: THREE.Vector2;
  private changeDirectionTimer: number = 0;

  constructor(scene: THREE.Scene, startPos: THREE.Vector3) {
    super(scene, startPos, 10);
    this.direction = new THREE.Vector2(
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
  }

  createModel(): THREE.Group {
    const group = new THREE.Group();

    // 몸통
    const bodyGeo = new THREE.BoxGeometry(1.0, 0.8, 1.6);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.0;
    group.add(body);

    // 머리
    const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.8);
    const headMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 1.0, 1.0);
    group.add(head);

    // 다리 4개
    const legGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x654321 });

    const legs = [
      [-0.3, 0.4, 0.6],
      [0.3, 0.4, 0.6],
      [-0.3, 0.4, -0.6],
      [0.3, 0.4, -0.6],
    ];

    legs.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, legMat.clone());
      leg.position.set(pos[0], pos[1], pos[2]);
      group.add(leg);
    });

    return group;
  }

  update(delta: number, voxelWorld: VoxelWorld): void {
    // 방향 변경 타이머
    this.changeDirectionTimer += delta;
    if (this.changeDirectionTimer > 3.0) {
      this.direction = new THREE.Vector2(
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();
      this.changeDirectionTimer = 0;
    }

    // 이동
    const speed = 0.5;
    this.velocity.x = this.direction.x * speed * delta;
    this.velocity.z = this.direction.y * speed * delta;
    this.velocity.y -= 9.8 * delta; // 중력

    // 충돌 체크
    const newX = this.position.x + this.velocity.x;
    const newZ = this.position.z + this.velocity.z;
    const newY = this.position.y + this.velocity.y;

    // 간단한 충돌 처리
    const blockAt = voxelWorld.getBlock(
      Math.floor(newX),
      Math.floor(newY),
      Math.floor(newZ)
    );

    if (blockAt === BlockType.AIR) {
      this.position.add(this.velocity);
    } else {
      // 방향 바꾸기
      this.direction.multiplyScalar(-1);
    }

    // 지면 체크
    const groundBlock = voxelWorld.getBlock(
      Math.floor(this.position.x),
      Math.floor(this.position.y - 1),
      Math.floor(this.position.z)
    );

    if (groundBlock !== BlockType.AIR) {
      this.position.y = Math.floor(this.position.y) + 1;
      this.velocity.y = 0;
    }

    // 모델 업데이트
    this.model.position.copy(this.position);
    this.model.rotation.y = Math.atan2(this.direction.x, this.direction.y);

    // 걷기 애니메이션
    this.walkTimer += delta * 10;
    const legSwing = Math.sin(this.walkTimer) * 0.2;
    // 다리 애니메이션 적용...
  }

  protected onDeath(): void {
    super.onDeath();
    // 가죽, 고기 드롭
  }
}
```

#### 적대 몹 (좀비)
```typescript
// src/entities/hostile/Zombie.ts
export class Zombie extends Entity {
  private target: THREE.Vector3 | null = null;
  private attackCooldown: number = 0;

  constructor(scene: THREE.Scene, startPos: THREE.Vector3) {
    super(scene, startPos, 20);
  }

  createModel(): THREE.Group {
    // Player와 유사하지만 녹색 피부
    const group = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const mat = new THREE.MeshLambertMaterial({ color: 0x2ecc71 });
    const body = new THREE.Mesh(bodyGeo, mat);
    body.position.y = 1.4;
    group.add(body);

    // ... 나머지 부분들
    return group;
  }

  update(delta: number, voxelWorld: VoxelWorld): void {
    // 플레이어 찾기
    if (this.target) {
      const direction = this.target.clone().sub(this.position).normalize();
      const distance = this.position.distanceTo(this.target);

      if (distance > 1.0) {
        // 플레이어에게 이동
        this.velocity.x = direction.x * 1.5 * delta;
        this.velocity.z = direction.z * 1.5 * delta;
      } else {
        // 공격
        this.attackCooldown -= delta;
        if (this.attackCooldown <= 0) {
          this.attack();
          this.attackCooldown = 1.0;
        }
      }
    }

    // 중력
    this.velocity.y -= 9.8 * delta;
    this.position.add(this.velocity);

    // 모델 업데이트
    this.model.position.copy(this.position);
  }

  setTarget(target: THREE.Vector3): void {
    this.target = target.clone();
  }

  private attack(): void {
    // 플레이어에게 데미지
    console.log('Zombie attacks!');
  }
}
```

### 3.3 아이템 드롭 시스템 (3일)

```typescript
// src/entities/DroppedItem.ts
export class DroppedItem {
  private model: THREE.Mesh;
  private position: THREE.Vector3;
  private rotation: number = 0;
  private bobTimer: number = 0;
  private lifetime: number = 300; // 5분

  constructor(
    private scene: THREE.Scene,
    itemType: ItemType,
    position: THREE.Vector3
  ) {
    this.position = position.clone();
    this.model = this.createItemModel(itemType);
    this.scene.add(this.model);
  }

  private createItemModel(itemType: ItemType): THREE.Mesh {
    // 작은 블록으로 표현
    const geo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const mat = new THREE.MeshLambertMaterial({
      color: this.getItemColor(itemType),
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.position);
    return mesh;
  }

  update(delta: number): boolean {
    // 위아래로 떠다니는 효과
    this.bobTimer += delta * 2;
    this.model.position.y = this.position.y + Math.sin(this.bobTimer) * 0.1;

    // 회전
    this.rotation += delta;
    this.model.rotation.y = this.rotation;

    // 수명 감소
    this.lifetime -= delta;
    return this.lifetime > 0;
  }

  checkPickup(playerPos: THREE.Vector3): boolean {
    return this.position.distanceTo(playerPos) < 1.5;
  }

  dispose(): void {
    this.scene.remove(this.model);
    this.model.geometry.dispose();
    (this.model.material as THREE.Material).dispose();
  }

  private getItemColor(itemType: ItemType): number {
    // 아이템 타입에 따른 색상
    return 0xffff00;
  }
}
```

### 3.4 저장/로드 시스템 (4일)

```typescript
// src/save/SaveManager.ts
export interface GameSave {
  version: string;
  timestamp: number;
  player: {
    position: { x: number; y: number; z: number };
    health: number;
    hunger: number;
    inventory: InventoryItem[];
  };
  world: {
    seed: number;
    modifiedChunks: Map<string, ChunkData>;
  };
  entities: EntityData[];
}

export class SaveManager {
  private static SAVE_KEY = 'cubeworld_save';

  static saveGame(
    player: Player,
    world: VoxelWorld,
    entities: Entity[]
  ): void {
    const save: GameSave = {
      version: '1.0.0',
      timestamp: Date.now(),
      player: {
        position: player.getPosition(),
        health: player.getHealth(),
        hunger: player.getHunger(),
        inventory: player.getInventory().slots.filter(s => s !== null) as InventoryItem[],
      },
      world: {
        seed: world.getSeed(),
        modifiedChunks: world.getModifiedChunks(),
      },
      entities: entities.map(e => e.serialize()),
    };

    const compressed = this.compressSave(save);
    localStorage.setItem(this.SAVE_KEY, compressed);
    console.log('Game saved successfully');
  }

  static loadGame(): GameSave | null {
    const saved = localStorage.getItem(this.SAVE_KEY);
    if (!saved) return null;

    try {
      const decompressed = this.decompressSave(saved);
      return JSON.parse(decompressed);
    } catch (e) {
      console.error('Failed to load save:', e);
      return null;
    }
  }

  private static compressSave(save: GameSave): string {
    // 간단한 압축 (실제로는 LZ-String 같은 라이브러리 사용)
    return JSON.stringify(save);
  }

  private static decompressSave(compressed: string): string {
    return compressed;
  }
}
```

### 3.5 퀘스트 시스템 (3일)

```typescript
// src/quests/QuestTypes.ts
export enum QuestType {
  COLLECT = 'collect',
  BUILD = 'build',
  EXPLORE = 'explore',
  DEFEAT = 'defeat',
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  completed: boolean;
}

export interface QuestObjective {
  description: string;
  type: string;
  target: string | number;
  current: number;
  required: number;
  completed: boolean;
}

export interface QuestReward {
  type: 'item' | 'experience';
  itemType?: ItemType;
  amount: number;
}

// 예시 퀘스트들
export const STARTER_QUESTS: Quest[] = [
  {
    id: 'first_wood',
    title: 'Getting Wood',
    description: 'Collect 10 wood blocks to start building',
    type: QuestType.COLLECT,
    objectives: [
      {
        description: 'Collect 10 wood',
        type: 'collect',
        target: ItemType.WOOD_BLOCK,
        current: 0,
        required: 10,
        completed: false,
      },
    ],
    rewards: [
      { type: 'item', itemType: ItemType.WOODEN_AXE, amount: 1 },
    ],
    completed: false,
  },

  {
    id: 'build_house',
    title: 'A Place to Call Home',
    description: 'Build your first shelter',
    type: QuestType.BUILD,
    objectives: [
      {
        description: 'Place 50 building blocks',
        type: 'place_blocks',
        target: 50,
        current: 0,
        required: 50,
        completed: false,
      },
    ],
    rewards: [
      { type: 'experience', amount: 100 },
    ],
    completed: false,
  },
];
```

---

## ✨ Phase 4: 폴리싱 및 최종화 (2주)

### 목표
게임을 완성도 있게 다듬기

### 4.1 사운드 시스템 (3일)

```typescript
// src/audio/AudioManager.ts
export class AudioManager {
  private audioContext: AudioContext;
  private sounds: Map<string, AudioBuffer>;
  private music: HTMLAudioElement | null = null;
  private volume: number = 0.7;

  constructor() {
    this.audioContext = new AudioContext();
    this.sounds = new Map();
    this.loadSounds();
  }

  async loadSounds(): Promise<void> {
    const soundFiles = {
      blockPlace: '/assets/audio/block_place.mp3',
      blockBreak: '/assets/audio/block_break.mp3',
      walk: '/assets/audio/walk.mp3',
      jump: '/assets/audio/jump.mp3',
      damage: '/assets/audio/damage.mp3',
      pickup: '/assets/audio/pickup.mp3',
    };

    for (const [name, url] of Object.entries(soundFiles)) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.sounds.set(name, audioBuffer);
      } catch (e) {
        console.warn(`Failed to load sound: ${name}`);
      }
    }
  }

  playSound(name: string, volume: number = 1.0): void {
    const buffer = this.sounds.get(name);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = volume * this.volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);
  }

  playMusic(url: string, loop: boolean = true): void {
    if (this.music) {
      this.music.pause();
    }

    this.music = new Audio(url);
    this.music.loop = loop;
    this.music.volume = this.volume * 0.3;
    this.music.play();
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.music) {
      this.music.volume = this.volume * 0.3;
    }
  }
}
```

### 4.2 UI/UX 개선 (4일)

- [ ] 인벤토리 UI 구현
- [ ] 핫바 (빠른 슬롯)
- [ ] 체력/허기 바
- [ ] 미니맵
- [ ] 퀘스트 트래커
- [ ] 설정 메뉴
- [ ] 일시정지 메뉴
- [ ] 로딩 스크린

### 4.3 성능 최적화 (3일)

```typescript
// src/optimization/PerformanceMonitor.ts
export class PerformanceMonitor {
  private frameTime: number[] = [];
  private maxSamples: number = 60;

  update(delta: number): void {
    this.frameTime.push(delta * 1000);
    if (this.frameTime.length > this.maxSamples) {
      this.frameTime.shift();
    }
  }

  getAverageFPS(): number {
    if (this.frameTime.length === 0) return 60;
    const avg = this.frameTime.reduce((a, b) => a + b) / this.frameTime.length;
    return Math.round(1000 / avg);
  }

  getStats(): PerformanceStats {
    return {
      fps: this.getAverageFPS(),
      frameTime: this.frameTime[this.frameTime.length - 1] || 0,
      memory: (performance as any).memory?.usedJSHeapSize / 1048576 || 0,
    };
  }
}

// 최적화 기법들
// 1. LOD (Level of Detail) - 거리에 따른 디테일 조절
// 2. Frustum Culling - 카메라 밖 청크 제거
// 3. Occlusion Culling - 가려진 청크 제거
// 4. 청크 로딩 우선순위
```

### 4.4 튜토리얼 시스템 (2일)

```typescript
// src/tutorial/TutorialManager.ts
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  highlight?: string; // CSS selector
  action?: string;
  nextTrigger: 'click' | 'complete' | 'manual';
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to CubeWorld!',
    description: 'Let\'s learn the basics of building.',
    nextTrigger: 'click',
  },
  {
    id: 'select_block',
    title: 'Select a Block',
    description: 'Click on a block type to select it.',
    highlight: '#block-selector',
    action: 'selectBlock',
    nextTrigger: 'complete',
  },
  {
    id: 'place_block',
    title: 'Place a Block',
    description: 'Click on the ground to place your selected block.',
    action: 'placeBlock',
    nextTrigger: 'complete',
  },
  // ...
];
```

### 4.5 빌드 및 배포 (2일)

- [ ] 프로덕션 빌드 최적화
- [ ] 번들 크기 최소화
- [ ] PWA 설정 (오프라인 플레이)
- [ ] GitHub Pages 배포
- [ ] 메타 태그 및 OG 이미지
- [ ] 애널리틱스 설정

---

## 📊 Phase별 성공 지표

### Phase 1 완료 기준
- ✅ 모든 테스트 통과
- ✅ ESLint 0 warnings
- ✅ 설정 시스템 작동
- ✅ 에러 처리 구현

### Phase 2 완료 기준
- ✅ 40+ 블록 타입
- ✅ 텍스처 시스템 작동
- ✅ 5개 이상 구조물
- ✅ 인벤토리 36 슬롯

### Phase 3 완료 기준
- ✅ 플레이어 이동/점프
- ✅ 3종 이상 NPC
- ✅ 저장/로드 작동
- ✅ 5개 퀘스트

### Phase 4 완료 기준
- ✅ 사운드 효과
- ✅ UI 완성
- ✅ 60 FPS 유지
- ✅ 튜토리얼 완료

---

## 🎉 최종 목표

11주 후, CubeWorld는 다음과 같은 완성된 게임이 됩니다:

✨ **40+ 블록 타입**  
✨ **텍스처 시스템**  
✨ **플레이어 캐릭터**  
✨ **NPC/몹 시스템**  
✨ **인벤토리 관리**  
✨ **퀘스트 시스템**  
✨ **구조물 생성**  
✨ **저장/로드**  
✨ **사운드/음악**  
✨ **완성된 UI/UX**  

상업적 출시 가능한 수준의 복셀 게임! 🚀

