# 🗺️ 월드 지속성 및 AI 생성 시스템 개선 계획

> Creator of Worlds - 맵 저장 및 AI 기반 생성 시스템 개발 로드맵

## 📋 목차
- [현재 시스템 분석](#현재-시스템-분석)
- [개선 목표](#개선-목표)
- [기술 스택](#기술-스택)
- [구현 단계](#구현-단계)
- [아이들을 위한 추가 기능](#아이들을-위한-추가-기능)

---

## 🔍 현재 시스템 분석

### 맵 생성 구조

#### 1. 초기화 흐름
```
페이지 로드
  ↓
main.ts → init()
  ↓
VoxelGameEngine 생성
  ↓
VoxelWorld 생성
  ↓
generateWorld() 자동 호출
  ↓
49개 청크 생성 (7x7 그리드)
```

#### 2. 지형 생성 메커니즘

**파일**: `src/core/VoxelWorld.ts`

**핵심 메서드**:
- `generateWorld()` (38-47줄): 청크 그리드 생성
- `generateChunk()` (49-110줄): 개별 청크 블록 배치
- `getTerrainHeight()` (112-143줄): 노이즈 기반 높이 계산

**노이즈 레이어**:
```typescript
// 3단계 노이즈 조합
1. Continental Noise (대륙 형태) - 진폭: 20
2. Erosion Noise (침식) - 진폭: 10
3. Ridged Noise (산맥) - 진폭: 15

최종 높이 = 해수면(32) + continental + erosion + peaks
```

**시드 시스템**:
```typescript
// VoxelWorld.ts:23
this.noiseGenerator = new NoiseGenerator(Math.random());
```
- 매번 새로운 랜덤 시드 생성
- 페이지 새로고침 시 완전히 새로운 맵 생성

#### 3. 블록 배치 로직

**수직 레이어 구조**:
```
Y=0:        Bedrock (기반암)
Y=1~height: Stone (돌) → Dirt (흙) → Grass/Sand (표면)
Y=32:       Sea Level (해수면)
Y>32+15:    Snow (눈)
```

**특징 생성**:
- 나무: 2% 확률로 랜덤 배치 (높이 4-6블록)
- 물: 해수면 아래 자동 채움

### ⚠️ 현재 문제점

| 문제 | 원인 | 영향 |
|------|------|------|
| **맵 손실** | 저장 시스템 없음 | 페이지 새로고침 시 모든 건축물 소실 |
| **진행상황 보존 불가** | 로컬/원격 저장소 없음 | 사용자 작업 내용 보존 불가능 |
| **사용자 식별 불가** | 인증 시스템 없음 | 개인별 맵 관리 불가능 |
| **맵 다양성 제한** | 랜덤 시드만 사용 | 의도적 맵 디자인 불가능 |

---

## 🎯 개선 목표

### 1단계: 기본 지속성 (Phase 1)
- ✅ 맵 데이터 직렬화/역직렬화
- ✅ 로컬 스토리지 저장
- ✅ 자동 저장 기능

### 2단계: 사용자 인증 (Phase 2)
- 🔐 Supabase 인증 연동
- 👤 Google/Facebook/Apple 소셜 로그인
- 🔑 세션 관리

### 3단계: 클라우드 저장소 (Phase 3)
- ☁️ Supabase 데이터베이스 연동
- 💾 맵 저장/불러오기
- 📊 사용자별 맵 관리

### 4단계: AI 맵 생성 (Phase 4)
- 🤖 Claude AI API 연동
- 🎨 자연어 기반 맵 생성
- 🏗️ 테마별 구조물 생성

---

## 🛠️ 기술 스택

### 프론트엔드
- **TypeScript**: 기존 코드베이스
- **Three.js**: 3D 렌더링
- **Vite**: 빌드 도구

### 백엔드/인프라
- **Supabase**:
  - Authentication: 소셜 로그인
  - Database (PostgreSQL): 맵 데이터 저장
  - Storage: 대용량 맵 파일 (선택적)

### AI 서비스
- **Claude AI API**:
  - Model: Claude 3.5 Sonnet
  - 용도: 맵 생성 프롬프트 처리

---

## 📅 구현 단계

## Phase 1: 로컬 저장 시스템 (1-2주)

### 목표
페이지 새로고침 후에도 맵 유지

### 작업 내역

#### 1.1 맵 직렬화 시스템
**파일**: `src/services/WorldSerializer.ts` (신규)

```typescript
interface SerializedWorld {
  version: string;
  seed: number;
  timestamp: number;
  chunks: Map<string, SerializedChunk>;
  metadata: {
    playerPosition?: Vector3;
    playTime: number;
  };
}

class WorldSerializer {
  // 청크 데이터를 압축된 형식으로 변환
  serialize(world: VoxelWorld): string

  // 저장된 데이터를 월드로 복원
  deserialize(data: string): SerializedWorld
}
```

**구현 세부사항**:
- Uint8Array 블록 데이터를 Base64로 인코딩
- LZ-string 라이브러리로 압축 (선택적)
- 메타데이터 포함 (생성시간, 플레이타임 등)

#### 1.2 로컬 스토리지 관리자
**파일**: `src/services/LocalStorageManager.ts` (신규)

```typescript
class LocalStorageManager {
  private static WORLD_KEY = 'cubeworld_save';

  saveWorld(world: VoxelWorld): boolean
  loadWorld(): SerializedWorld | null
  hasWorld(): boolean
  clearWorld(): void

  // 자동 저장 (5분마다)
  enableAutoSave(world: VoxelWorld, interval: number): void
}
```

#### 1.3 VoxelWorld 수정
**파일**: `src/core/VoxelWorld.ts` (수정)

**추가 메서드**:
```typescript
class VoxelWorld {
  // 시드를 파라미터로 받도록 수정
  constructor(scene: THREE.Scene, seed?: number)

  // 직렬화된 데이터에서 월드 로드
  loadFromData(data: SerializedWorld): void

  // 현재 시드 반환
  getSeed(): number
}
```

**수정 위치**:
- Line 23: `this.seed = seed ?? Math.random();`
- Line 26: 저장된 데이터 확인 후 로드

#### 1.4 UI 추가
**파일**: `src/ui/VoxelUIManager.ts` (수정)

**새로운 버튼**:
- 💾 저장하기
- 📂 불러오기
- 🗑️ 저장 데이터 삭제

### 검증 방법
1. 블록 배치 후 저장
2. 페이지 새로고침
3. 맵이 동일하게 복원되는지 확인

---

## Phase 2: Supabase 인증 연동 (2-3주)

### 목표
사용자별 맵 관리를 위한 로그인 시스템

### 작업 내역

#### 2.1 Supabase 프로젝트 설정

**설정 단계**:
1. Supabase 프로젝트 생성
2. 소셜 OAuth 설정:
   - Google OAuth
   - Facebook Login
   - Apple Sign In
3. 환경 변수 설정

**파일**: `.env` (신규)
```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 2.2 Supabase 클라이언트
**파일**: `src/services/SupabaseClient.ts` (신규)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default supabase;
```

#### 2.3 인증 서비스
**파일**: `src/services/AuthService.ts` (신규)

```typescript
class AuthService {
  // 소셜 로그인
  signInWithGoogle(): Promise<User>
  signInWithFacebook(): Promise<User>
  signInWithApple(): Promise<User>

  // 로그아웃
  signOut(): Promise<void>

  // 현재 사용자
  getCurrentUser(): User | null

  // 세션 변경 리스너
  onAuthStateChange(callback: (user: User | null) => void): void
}
```

#### 2.4 UI 컴포넌트
**파일**: `src/ui/LoginModal.ts` (신규)

**로그인 모달**:
```html
<div id="login-modal">
  <h2>🌍 Creator of Worlds</h2>
  <p>로그인하여 나만의 세계를 저장하세요!</p>

  <button id="google-login">
    <img src="google-icon.svg"> Google로 시작
  </button>

  <button id="facebook-login">
    <img src="facebook-icon.svg"> Facebook로 시작
  </button>

  <button id="apple-login">
    <img src="apple-icon.svg"> Apple로 시작
  </button>

  <button id="guest-play">게스트로 플레이</button>
</div>
```

#### 2.5 사용자 프로필
**파일**: `src/ui/UserProfile.ts` (신규)

**표시 정보**:
- 사용자 이름/아바타
- 저장된 맵 개수
- 총 플레이 타임
- 로그아웃 버튼

### 검증 방법
1. 각 소셜 로그인 테스트
2. 세션 유지 확인
3. 로그아웃 후 게스트 모드 확인

---

## Phase 3: 클라우드 맵 저장소 (2-3주)

### 목표
사용자별 맵을 클라우드에 저장하고 멀티 디바이스 지원

### 작업 내역

#### 3.1 데이터베이스 스키마

**Supabase SQL**:

```sql
-- 사용자 월드 테이블
CREATE TABLE worlds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  seed BIGINT NOT NULL,
  thumbnail_url TEXT,
  play_time INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_public BOOLEAN DEFAULT FALSE
);

-- 청크 데이터 테이블
CREATE TABLE world_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  chunk_x INTEGER NOT NULL,
  chunk_z INTEGER NOT NULL,
  block_data TEXT NOT NULL, -- Base64 인코딩된 블록 데이터
  UNIQUE(world_id, chunk_x, chunk_z)
);

-- 월드 메타데이터 테이블
CREATE TABLE world_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  player_position_x FLOAT,
  player_position_y FLOAT,
  player_position_z FLOAT,
  camera_rotation_x FLOAT,
  camera_rotation_y FLOAT,
  last_saved TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_worlds_user_id ON worlds(user_id);
CREATE INDEX idx_chunks_world_id ON world_chunks(world_id);
CREATE INDEX idx_chunks_position ON world_chunks(chunk_x, chunk_z);

-- Row Level Security (RLS)
ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_metadata ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 월드만 CRUD 가능
CREATE POLICY "Users can CRUD own worlds"
  ON worlds
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own chunks"
  ON world_chunks
  FOR ALL
  USING (world_id IN (
    SELECT id FROM worlds WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can CRUD own metadata"
  ON world_metadata
  FOR ALL
  USING (world_id IN (
    SELECT id FROM worlds WHERE user_id = auth.uid()
  ));

-- 공개 월드는 모두가 읽기 가능
CREATE POLICY "Public worlds are viewable"
  ON worlds
  FOR SELECT
  USING (is_public = TRUE);
```

#### 3.2 클라우드 저장 서비스
**파일**: `src/services/CloudStorageService.ts` (신규)

```typescript
interface WorldInfo {
  id: string;
  name: string;
  description: string;
  seed: number;
  thumbnailUrl?: string;
  playTime: number;
  createdAt: Date;
  updatedAt: Date;
}

class CloudStorageService {
  // 월드 생성
  async createWorld(name: string, world: VoxelWorld): Promise<string>

  // 월드 저장
  async saveWorld(worldId: string, world: VoxelWorld): Promise<void>

  // 월드 불러오기
  async loadWorld(worldId: string): Promise<SerializedWorld>

  // 사용자의 월드 목록
  async listUserWorlds(): Promise<WorldInfo[]>

  // 월드 삭제
  async deleteWorld(worldId: string): Promise<void>

  // 월드 이름 변경
  async renameWorld(worldId: string, newName: string): Promise<void>

  // 썸네일 생성 및 업로드
  async generateThumbnail(world: VoxelWorld): Promise<string>
}
```

**구현 상세**:
- 청크 단위로 저장 (변경된 청크만 업데이트)
- 자동 저장 큐 (5분마다 또는 수동)
- 충돌 해결 (last-write-wins)

#### 3.3 월드 선택 UI
**파일**: `src/ui/WorldSelector.ts` (신규)

**기능**:
```html
<div id="world-selector">
  <h2>내 세계들</h2>

  <button id="create-new-world">+ 새 세계 만들기</button>

  <div id="world-list">
    <!-- 각 월드 카드 -->
    <div class="world-card">
      <img src="thumbnail.jpg" alt="월드 썸네일">
      <h3>나의 성</h3>
      <p>플레이 타임: 2시간 34분</p>
      <p>마지막 플레이: 2시간 전</p>
      <div class="actions">
        <button>🎮 플레이</button>
        <button>✏️ 이름 변경</button>
        <button>🗑️ 삭제</button>
      </div>
    </div>
  </div>
</div>
```

#### 3.4 동기화 로직
**파일**: `src/services/SyncManager.ts` (신규)

```typescript
class SyncManager {
  private syncInterval: number = 300000; // 5분
  private dirtyChunks: Set<string> = new Set();

  // 변경된 청크 추적
  markChunkDirty(chunkX: number, chunkZ: number): void

  // 자동 동기화
  startAutoSync(worldId: string, world: VoxelWorld): void

  // 수동 동기화
  async syncNow(): Promise<void>

  // 충돌 해결
  async resolveConflict(local: Chunk, remote: Chunk): Promise<Chunk>
}
```

### 검증 방법
1. 월드 생성 및 저장
2. 다른 디바이스/브라우저에서 로그인
3. 동일한 맵이 로드되는지 확인
4. 두 디바이스에서 동시 수정 후 충돌 처리 확인

---

## Phase 4: Claude AI 맵 생성 (3-4주)

### 목표
자연어 프롬프트로 맵 생성 및 구조물 배치

### 작업 내역

#### 4.1 Claude AI 서비스
**파일**: `src/services/ClaudeAIService.ts` (신규)

```typescript
interface MapGenerationRequest {
  prompt: string;
  style?: 'fantasy' | 'modern' | 'medieval' | 'nature';
  size?: 'small' | 'medium' | 'large';
  theme?: string[];
}

interface MapGenerationResponse {
  seed: number;
  terrainConfig: TerrainConfig;
  structures: Structure[];
  description: string;
}

class ClaudeAIService {
  private apiKey: string;

  // 프롬프트를 맵 생성 설정으로 변환
  async generateMapConfig(request: MapGenerationRequest): Promise<MapGenerationResponse>

  // 구조물 설계
  async designStructure(description: string): Promise<Structure>

  // 맵 개선 제안
  async suggestImprovements(world: VoxelWorld): Promise<string[]>
}
```

**예시 프롬프트**:
```
사용자: "마법의 숲과 큰 성이 있는 판타지 왕국을 만들어줘"

Claude AI 응답:
{
  "seed": 123456789,
  "terrainConfig": {
    "biomes": [
      { "type": "magical_forest", "coverage": 0.6 },
      { "type": "plains", "coverage": 0.3 }
    ],
    "heightVariation": "moderate",
    "waterFeatures": ["river", "pond"]
  },
  "structures": [
    {
      "type": "castle",
      "position": { "x": 0, "z": 0 },
      "size": "large",
      "style": "medieval_fantasy"
    },
    {
      "type": "forest",
      "density": "high",
      "treeTypes": ["magical_oak", "willow"]
    }
  ],
  "description": "높은 탑과 해자가 있는 웅장한 성을 중심으로,
                  빛나는 나무들이 가득한 마법의 숲이 펼쳐집니다."
}
```

#### 4.2 AI 기반 지형 생성기
**파일**: `src/world/AITerrainGenerator.ts` (신규)

```typescript
class AITerrainGenerator {
  // AI 설정을 노이즈 파라미터로 변환
  applyTerrainConfig(config: TerrainConfig): NoiseParameters

  // 바이옴 생성
  generateBiomes(biomes: BiomeConfig[]): BiomeMap

  // 특징 배치 (나무, 바위, 물 등)
  placeFeatures(features: Feature[]): void
}
```

#### 4.3 구조물 생성 시스템
**파일**: `src/world/AIStructureBuilder.ts` (신규)

```typescript
interface Structure {
  type: string;
  position: Vector3;
  blocks: BlockPlacement[];
  metadata: StructureMetadata;
}

class AIStructureBuilder {
  // 기존 StructureGenerator와 통합
  buildFromAI(structure: Structure): void

  // 구조물 템플릿 라이브러리
  private templates: Map<string, StructureTemplate>

  // 프로시저럴 구조물 생성
  generateProcedural(type: string, params: any): Structure
}
```

**지원 구조물 타입**:
- 성 (Castle)
- 마을 (Village)
- 탑 (Tower)
- 던전 (Dungeon)
- 다리 (Bridge)
- 사원 (Temple)
- 등대 (Lighthouse)

#### 4.4 AI 생성 UI
**파일**: `src/ui/AIGeneratorPanel.ts` (신규)

```html
<div id="ai-generator">
  <h2>🤖 AI 월드 생성기</h2>

  <textarea id="ai-prompt" placeholder="어떤 세계를 만들고 싶나요?
예: 눈 덮인 산과 따뜻한 마을이 있는 겨울 왕국"></textarea>

  <div id="style-options">
    <button data-style="fantasy">판타지</button>
    <button data-style="modern">현대</button>
    <button data-style="medieval">중세</button>
    <button data-style="nature">자연</button>
  </div>

  <div id="size-options">
    <label>
      <input type="radio" name="size" value="small"> 작음 (5x5 청크)
    </label>
    <label>
      <input type="radio" name="size" value="medium" checked> 중간 (7x7 청크)
    </label>
    <label>
      <input type="radio" name="size" value="large"> 큼 (10x10 청크)
    </label>
  </div>

  <button id="generate-ai-world">✨ 생성하기</button>

  <div id="generation-preview">
    <!-- AI가 생성할 내용 미리보기 -->
  </div>
</div>
```

#### 4.5 환경 변수
**파일**: `.env` (업데이트)

```bash
VITE_CLAUDE_API_KEY=your-claude-api-key
VITE_CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

### API 호출 예시

```typescript
// 사용자 입력
const prompt = "용암이 흐르는 화산과 용의 둥지가 있는 위험한 땅";

// Claude API 호출
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.VITE_CLAUDE_API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `당신은 Minecraft 스타일 복셀 게임의 맵 생성 전문가입니다.
                다음 설명에 맞는 맵 생성 설정을 JSON 형식으로 제공하세요:

                "${prompt}"

                응답 형식:
                {
                  "seed": <숫자>,
                  "terrainConfig": { ... },
                  "structures": [ ... ],
                  "description": "..."
                }`
    }]
  })
});

const aiConfig = await response.json();
```

### 검증 방법
1. 다양한 프롬프트 테스트
2. 생성된 맵이 프롬프트와 일치하는지 확인
3. 구조물이 올바르게 배치되는지 확인
4. 성능 (API 응답 시간) 측정

---

## 🎨 아이들을 위한 추가 기능

### Phase 5: 교육 및 재미 기능 (각 1-2주)

#### 5.1 크리에이티브 템플릿 시스템

**목표**: 쉽게 멋진 건축물을 만들 수 있게 도움

**기능**:
- 🏰 **원클릭 건축물**: 미리 만들어진 성, 집, 탑 배치
- 🎨 **색상 팔레트**: 다양한 색상 블록 세트
- ✨ **마법 브러시**: 여러 블록을 한 번에 배치

**파일**: `src/features/TemplateSystem.ts`

```typescript
interface BuildingTemplate {
  name: string;
  category: 'house' | 'castle' | 'decoration';
  thumbnail: string;
  blocks: BlockPlacement[];
  kidFriendly: boolean;
}

class TemplateSystem {
  // 템플릿 카탈로그
  templates: BuildingTemplate[] = [
    { name: '무지개 성', category: 'castle', ... },
    { name: '트리하우스', category: 'house', ... },
    { name: '꽃밭', category: 'decoration', ... }
  ];

  placeTemplate(template: BuildingTemplate, position: Vector3): void
}
```

**UI**:
```html
<div id="template-palette">
  <h3>🏗️ 건축물 도장</h3>
  <div class="template-grid">
    <button class="template-btn" data-template="rainbow-castle">
      🏰 무지개 성
    </button>
    <button class="template-btn" data-template="treehouse">
      🌳 트리하우스
    </button>
    <!-- ... -->
  </div>
</div>
```

---

#### 5.2 친구와 함께하는 멀티플레이 (중급)

**목표**: 친구들과 함께 같은 세계에서 놀기

**기술**:
- WebRTC 또는 WebSocket 기반 실시간 동기화
- Supabase Realtime 활용

**파일**: `src/multiplayer/MultiplayerService.ts`

```typescript
class MultiplayerService {
  // 방 만들기
  async createRoom(worldId: string): Promise<string>

  // 방 참가
  async joinRoom(roomCode: string): Promise<void>

  // 블록 변경 브로드캐스트
  broadcastBlockChange(block: BlockChange): void

  // 플레이어 위치 동기화
  syncPlayerPosition(playerId: string, position: Vector3): void
}
```

**기능**:
- 👥 최대 4명까지 동시 플레이
- 💬 간단한 채팅 시스템
- 🎨 각 플레이어 다른 색상 커서

---

#### 5.3 모험 모드 및 미니게임

**목표**: 건축 외에 재미있는 활동 제공

**미니게임 아이디어**:

##### A. 보물찾기 🗺️
```typescript
class TreasureHunt {
  // 맵에 보물 상자 숨기기
  hideTreasures(count: number): void

  // 힌트 시스템 (뜨거워요/차가워요)
  getHint(playerPosition: Vector3): string

  // 보물 발견 시 보상
  onTreasureFound(): Reward
}
```

**보상**:
- 특별한 블록 (금, 다이아몬드, 레인보우 블록)
- 새로운 도구 (거대 브러시, 지우개)
- 장식품 (동상, 깃발, 꽃)

##### B. 건축 챌린지 🏆
```typescript
class BuildingChallenge {
  challenges: Challenge[] = [
    {
      title: "5분 안에 가장 높은 탑 만들기",
      timeLimit: 300,
      goal: "highest_tower"
    },
    {
      title: "무지개색 집 만들기",
      criteria: "use_7_colors"
    }
  ];

  startChallenge(challenge: Challenge): void
  evaluateResult(): Score
}
```

##### C. 동물 친구들 🐾
```typescript
interface Pet {
  type: 'dog' | 'cat' | 'bird' | 'dragon';
  name: string;
  position: Vector3;
  animation: string;
}

class PetSystem {
  // 애완동물 배치
  spawnPet(type: string, position: Vector3): Pet

  // 따라다니기
  followPlayer(pet: Pet, player: Vector3): void

  // 상호작용
  petInteraction(pet: Pet): void // 쓰다듬기, 먹이주기
}
```

---

#### 5.4 스토리 모드 📖

**목표**: 게임을 하며 배우는 재미

**스토리 구조**:
```typescript
interface Story {
  chapters: Chapter[];
  currentChapter: number;
}

interface Chapter {
  title: string;
  narrative: string; // "옛날 옛적에..."
  tasks: Task[];
  reward: Reward;
}

interface Task {
  description: string; // "마을 사람들을 위해 집 3채를 지어주세요"
  type: 'build' | 'collect' | 'explore';
  goal: number;
  completed: boolean;
}
```

**챕터 예시**:
1. **시작**: "새로운 땅에 도착한 당신"
   - 첫 집 짓기
   - 나무 10그루 심기

2. **마을 만들기**: "사람들이 모여들기 시작했어요"
   - 집 5채 짓기
   - 길 만들기
   - 우물 만들기

3. **위험한 모험**: "어두운 동굴에서 보물을 찾아라"
   - 동굴 탐험하기
   - 보물 상자 찾기

---

#### 5.5 창작물 공유 갤러리 🎨

**목표**: 아이들의 창작물을 자랑하고 영감 얻기

**데이터베이스**:
```sql
CREATE TABLE shared_creations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(100),
  description TEXT,
  screenshot_url TEXT,
  world_data TEXT, -- 작은 영역만 공유
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE
);

CREATE TABLE creation_likes (
  user_id UUID REFERENCES auth.users(id),
  creation_id UUID REFERENCES shared_creations(id),
  PRIMARY KEY (user_id, creation_id)
);

CREATE TABLE creation_comments (
  id UUID PRIMARY KEY,
  creation_id UUID REFERENCES shared_creations(id),
  user_id UUID REFERENCES auth.users(id),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**기능**:
```typescript
class GalleryService {
  // 창작물 공유
  async shareCreation(
    title: string,
    screenshot: Blob,
    worldData: SerializedWorld
  ): Promise<void>

  // 갤러리 보기
  async getBrowseCreations(
    sort: 'recent' | 'popular' | 'featured'
  ): Promise<Creation[]>

  // 좋아요
  async likeCreation(creationId: string): Promise<void>

  // 다운로드 (다른 사람 창작물 가져오기)
  async downloadCreation(creationId: string): Promise<SerializedWorld>
}
```

**UI 갤러리**:
```html
<div id="gallery">
  <h2>🎨 창작물 갤러리</h2>

  <div class="filter-bar">
    <button data-filter="recent">최신</button>
    <button data-filter="popular">인기</button>
    <button data-filter="featured">추천</button>
  </div>

  <div class="creation-grid">
    <div class="creation-card">
      <img src="screenshot.jpg">
      <h3>나의 무지개 성</h3>
      <p>by 어린이123</p>
      <div class="actions">
        <button>❤️ 좋아요 (42)</button>
        <button>📥 다운로드</button>
      </div>
    </div>
  </div>
</div>
```

---

#### 5.6 부모 대시보드 👨‍👩‍👧‍👦

**목표**: 부모가 자녀의 활동을 모니터링하고 제한 설정

**기능**:
```typescript
interface ParentalControls {
  playTimeLimit: number; // 분 단위
  allowMultiplayer: boolean;
  allowSharing: boolean;
  contentFilter: 'all' | 'kid_friendly_only';
}

class ParentalDashboard {
  // 플레이 시간 통계
  getPlayTimeStats(): PlayTimeStats

  // 창작물 보기
  getChildCreations(): Creation[]

  // 제한 설정
  setControls(controls: ParentalControls): void

  // 알림 설정
  enableNotifications(types: NotificationType[]): void
}
```

**통계 데이터**:
- 📊 일일/주간 플레이 시간
- 🏗️ 만든 건축물 개수
- 🎯 완료한 챌린지
- 👥 함께 논 친구들

---

#### 5.7 음성 가이드 및 도움말 🔊

**목표**: 글을 못 읽는 어린 아이들도 즐기기

**기능**:
```typescript
class VoiceAssistant {
  // 텍스트 읽어주기 (Web Speech API)
  speak(text: string, language: 'ko' | 'en'): void

  // 튜토리얼 음성 가이드
  playTutorial(step: number): void

  // 도움말
  helpMe(topic: string): void
}
```

**음성 가이드 예시**:
- "왼쪽 버튼을 눌러서 블록을 놓을 수 있어요"
- "와! 멋진 집이네요!"
- "이 버튼을 누르면 친구를 초대할 수 있어요"

---

#### 5.8 성취 시스템 🏆

**목표**: 진행상황을 시각화하고 동기부여

**뱃지/트로피**:
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
}

const achievements: Achievement[] = [
  {
    id: 'first_block',
    name: '첫 블록',
    description: '첫 블록을 놓았어요!',
    icon: '🧱',
    rarity: 'common'
  },
  {
    id: 'builder',
    name: '건축가',
    description: '블록 1000개를 놓았어요',
    icon: '🏗️',
    rarity: 'rare'
  },
  {
    id: 'architect',
    name: '건축 마스터',
    description: '10개의 건축물을 완성했어요',
    icon: '🏆',
    rarity: 'epic'
  },
  {
    id: 'friend',
    name: '친구 만들기',
    description: '친구와 함께 놀았어요',
    icon: '👥',
    rarity: 'common'
  },
  {
    id: 'treasure_hunter',
    name: '보물 사냥꾼',
    description: '모든 보물을 찾았어요!',
    icon: '💎',
    rarity: 'legendary'
  }
];
```

---

## 📊 전체 개발 타임라인

```
Week 1-2:   Phase 1 - 로컬 저장 시스템
Week 3-5:   Phase 2 - Supabase 인증
Week 6-8:   Phase 3 - 클라우드 저장소
Week 9-12:  Phase 4 - Claude AI 맵 생성
Week 13-14: Phase 5.1 - 템플릿 시스템
Week 15-16: Phase 5.2 - 멀티플레이
Week 17-18: Phase 5.3 - 미니게임
Week 19-20: Phase 5.4 - 스토리 모드
Week 21:    Phase 5.5 - 갤러리
Week 22:    Phase 5.6 - 부모 대시보드
Week 23:    Phase 5.7 - 음성 가이드
Week 24:    Phase 5.8 - 성취 시스템
Week 25-26: 테스트 및 버그 수정
Week 27-28: 최적화 및 배포 준비
```

**총 개발 기간: 약 6-7개월**

---

## 🧪 테스트 전략

### 단위 테스트
```typescript
// src/__tests__/WorldSerializer.test.ts
describe('WorldSerializer', () => {
  test('should serialize and deserialize world correctly', () => {
    const world = createTestWorld();
    const serialized = serializer.serialize(world);
    const deserialized = serializer.deserialize(serialized);
    expect(deserialized).toEqual(world);
  });
});
```

### 통합 테스트
- Supabase 인증 플로우
- 맵 저장 및 불러오기
- AI 맵 생성

### 사용자 테스트
- 아이들 (6-12세) 대상 베타 테스트
- 사용성 피드백 수집
- 성능 모니터링

---

## 🚀 배포 전략

### 호스팅
- **Frontend**: Vercel 또는 Netlify
- **Backend**: Supabase (관리형)
- **CDN**: Cloudflare

### CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        run: vercel --prod
```

---

## 💰 비용 예측 (월간)

### Supabase
- **Free Tier**:
  - 50MB 데이터베이스
  - 500MB 저장소
  - 50,000명 MAU

- **Pro ($25/월)**:
  - 8GB 데이터베이스
  - 100GB 저장소
  - 100,000명 MAU

### Claude AI API
- **약 $0.003 per 1K input tokens**
- **약 $0.015 per 1K output tokens**
- 맵 생성당 약 $0.05-0.10 예상
- 월 1000명 사용 시: **$50-100**

### 총 예상 비용
- 베타: **$0** (Free Tier 사용)
- 프로덕션: **$75-125/월**

---

## 📚 참고 자료

### 개발 문서
- [Three.js Documentation](https://threejs.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Claude API Documentation](https://docs.anthropic.com/)

### 유사 프로젝트
- [Minetest](https://www.minetest.net/) - 오픈소스 복셀 게임
- [Voxel.js](http://voxeljs.com/) - 브라우저 복셀 엔진

### 학습 자료
- [Procedural Generation Wiki](http://pcg.wikidot.com/)
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)

---

## ✅ 다음 단계

1. ✅ **Phase 1 시작**: 로컬 저장 시스템 구현
2. 📝 Supabase 프로젝트 생성 및 설정
3. 🔑 Claude API 키 발급
4. 🎨 UI/UX 디자인 목업 제작
5. 👥 베타 테스터 모집

---

**작성일**: 2025-01-10
**문서 버전**: 1.0
**상태**: 초안 완료 ✅
