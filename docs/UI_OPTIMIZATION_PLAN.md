# UI 최적화 및 개선 계획 (UI Optimization & Improvement Plan)

## 📋 현재 상태 분석 (Current State Analysis)

### 문제점 (Problems)

1. **블록 선택 비효율성** (Block Selection Inefficiency)
   - 70개 블록 타입이 있지만 UI에는 9개만 표시
   - 모든 블록을 버튼으로 표시하면 스크롤이 너무 길어짐
   - 블록 카테고리별 구분이 없어 찾기 어려움

2. **버튼 배치 문제** (Button Layout Issues)
   - 모든 버튼이 수직으로 나열되어 화면 공간 낭비
   - 툴바가 왼쪽에 고정되어 게임 화면 가림
   - 모바일/작은 화면에서 사용 불가능

3. **시각적 피드백 부족** (Lack of Visual Feedback)
   - 현재 선택된 블록의 색상만 표시
   - 블록 타입별 아이콘/이미지 없음
   - 툴 사용 시 즉각적인 피드백 부족

4. **접근성 문제** (Accessibility Issues)
   - 키보드 단축키 없음 (숫자 키로 블록 선택 등)
   - 툴 전환이 마우스 클릭만 가능
   - 툴팁/설명 없음

## 🎯 개선 목표 (Improvement Goals)

### 1단계: 블록 선택 시스템 개선 (Phase 1: Block Selection System)

#### 1.1 카테고리 기반 탭 시스템 (Category-based Tab System)
```
[Natural] [Building] [Mineral] [Decoration] [Liquid]
   ↓ (선택 시 해당 카테고리 블록들만 표시)
┌─────────────────────────────────────┐
│ 🟩 Grass  🟫 Dirt   ⬜ Stone       │
│ 🟨 Sand   🪵 Wood   🍃 Leaves      │
└─────────────────────────────────────┘
```

**장점:**
- 70개 블록을 5개 카테고리로 분류 (Natural, Building, Mineral, Decoration, Liquid)
- 각 카테고리 클릭 시 해당 블록만 표시
- 스크롤 없이 모든 블록 접근 가능
- 블록 찾기 쉬움

**구현 계획:**
1. BlockCategory enum 활용 (이미 VoxelTypes.ts에 정의됨)
2. 카테고리별 탭 버튼 추가
3. 선택된 카테고리의 블록만 렌더링
4. 기본 카테고리: Natural (가장 자주 사용)

#### 1.2 블록 검색 기능 (Block Search)
```
┌─────────────────────────────────────┐
│ 🔍 Search blocks...                 │
└─────────────────────────────────────┘
```

**장점:**
- 블록 이름으로 빠른 검색
- "stone", "wood", "ore" 등 키워드 입력
- 실시간 필터링

#### 1.3 즐겨찾기 시스템 (Favorites System)
```
[⭐ Favorites] [All Blocks]
   ↓ (최근 사용 또는 즐겨찾기 블록)
┌─────────────────────────────────────┐
│ 🟩 Grass  🪨 Cobblestone  💎 Diamond│
└─────────────────────────────────────┘
```

**장점:**
- 자주 사용하는 블록 빠른 접근
- 우클릭으로 즐겨찾기 추가/제거
- LocalStorage에 저장하여 유지

### 2단계: 툴바 레이아웃 개선 (Phase 2: Toolbar Layout Improvement)

#### 2.1 컴팩트 모드 (Compact Mode)
```
현재 (수직):           개선 (수평 + 축소 가능):
┌───────────┐         ┌────────────────────────────┐
│ ➕ Place  │         │ ➕ ⛏️ 🎨 🪣 │ 🟩 🟫 ⬜ ▾  │
│ ⛏️ Break  │         └────────────────────────────┘
│ 🎨 Paint  │                   ▲
│ 🪣 Fill   │               툴  │  블록 선택기
└───────────┘
```

**장점:**
- 게임 화면 최대화
- 툴바 최소화 옵션 (◀ 버튼으로 숨기기)
- 호버 시 확장

#### 2.2 플로팅 툴바 (Floating Toolbar)
```
화면 상단 중앙에 반투명 툴바:
┌──────────────────────────────────┐
│  ➕ ⛏️ 🎨 🪣 │ 🟩 Grass ▾ │ ⚙️  │
└──────────────────────────────────┘
```

**장점:**
- 드래그로 위치 이동 가능
- 투명도 조절 가능
- 게임 플레이 방해 최소화

#### 2.3 그리드 레이아웃 (Grid Layout)
```
툴 (2x2):           블록 (3x4 그리드):
┌────┬────┐         ┌────┬────┬────┐
│ ➕ │ ⛏️ │         │ 🟩 │ 🟫 │ ⬜ │
├────┼────┤         ├────┼────┼────┤
│ 🎨 │ 🪣 │         │ 🟨 │ 💧 │ 🪵 │
└────┴────┘         └────┴────┴────┘
```

**장점:**
- 공간 효율적
- 블록 한눈에 파악
- 클릭 영역 넓음

### 3단계: 키보드 단축키 (Phase 3: Keyboard Shortcuts)

#### 3.1 숫자 키로 툴 전환
```
1: Place Block (➕)
2: Break Block (⛏️)
3: Paint Block (🎨)
4: Fill Area (🪣)
```

#### 3.2 숫자 키로 블록 선택
```
Q/W/E/R/T/Y/U/I/O/P: 블록 1~10
Shift + 1~9: 다른 블록 선택
```

#### 3.3 카테고리 전환
```
Tab: 다음 카테고리
Shift + Tab: 이전 카테고리
F: 즐겨찾기 보기
```

### 4단계: 시각적 개선 (Phase 4: Visual Enhancements)

#### 4.1 블록 프리뷰
```
┌─────────────────┐
│   3D Preview    │  ← 선택된 블록의 3D 미리보기
│    🟩          │
│   /│\          │
└─────────────────┘
```

#### 4.2 툴팁
```
Hover 시:
┌──────────────────────┐
│ Break Block (⛏️)     │
│ Shortcut: 2          │
│ Left click to break  │
└──────────────────────┘
```

#### 4.3 애니메이션
- 버튼 호버: 확대 효과 (scale: 1.05)
- 선택 시: 부드러운 색상 전환
- 툴 사용 시: 파티클 효과

### 5단계: 모바일 최적화 (Phase 5: Mobile Optimization)

#### 5.1 터치 친화적 UI
- 버튼 크기 증가 (최소 44x44px)
- 스와이프로 카테고리 전환
- 핀치 줌 지원

#### 5.2 반응형 레이아웃
```
Desktop (1920x1080):      Mobile (375x812):
┌─────────────────────┐   ┌──────────┐
│    ┌──────────┐    │   │ ☰ 🎮 ⚙️  │
│    │  Tools   │    │   ├──────────┤
│    │  Blocks  │    │   │          │
│    └──────────┘    │   │  Game    │
│      Game Area     │   │  Area    │
└─────────────────────┘   └──────────┘
                          ▲ 햄버거 메뉴로 툴바 열기
```

## 🛠️ 구현 계획 (Implementation Plan)

### 단계별 구현 순서 (Step-by-step Implementation)

#### Step 1: 카테고리 시스템 추가 (Add Category System)
**파일:**
- `src/ui/BlockCategoryManager.ts` (신규)
- `tests/unit/BlockCategoryManager.test.ts` (신규)

**기능:**
1. BlockCategory별 블록 필터링
2. 카테고리 전환 이벤트
3. 선택된 카테고리 상태 관리

**테스트:**
- [ ] 각 카테고리별 블록 리스트 정확히 반환
- [ ] 카테고리 전환 시 상태 업데이트
- [ ] 잘못된 카테고리 입력 시 기본 카테고리 반환

#### Step 2: 개선된 UI 컴포넌트 (Improved UI Components)
**파일:**
- `src/ui/VoxelUIManager.ts` (수정)
- `index.html` (수정)
- `tests/unit/VoxelUIManager.test.ts` (신규)

**기능:**
1. 카테고리 탭 UI
2. 블록 그리드 레이아웃
3. 검색 입력 필드
4. 컴팩트/확장 모드 토글

**테스트:**
- [ ] 카테고리 탭 클릭 시 올바른 블록 표시
- [ ] 검색어 입력 시 필터링 정확성
- [ ] 컴팩트 모드 토글 동작
- [ ] 선택된 블록/툴 하이라이트

#### Step 3: 키보드 단축키 시스템 (Keyboard Shortcut System)
**파일:**
- `src/input/KeyboardManager.ts` (신규)
- `tests/unit/KeyboardManager.test.ts` (신규)

**기능:**
1. 키 이벤트 리스너
2. 단축키 매핑 (1-4: 툴, Q-P: 블록)
3. 단축키 설정 UI
4. 충돌 감지 (입력 필드에서는 단축키 비활성화)

**테스트:**
- [ ] 숫자 키로 툴 전환
- [ ] 문자 키로 블록 선택
- [ ] 입력 필드 포커스 시 단축키 비활성화
- [ ] 잘못된 키 입력 무시

#### Step 4: 즐겨찾기 시스템 (Favorites System)
**파일:**
- `src/storage/FavoritesManager.ts` (신규)
- `tests/unit/FavoritesManager.test.ts` (신규)

**기능:**
1. LocalStorage에 즐겨찾기 저장/로드
2. 즐겨찾기 추가/제거
3. 최근 사용 블록 자동 추가
4. 즐겨찾기 UI 표시

**테스트:**
- [ ] 즐겨찾기 추가/제거
- [ ] LocalStorage 저장/로드
- [ ] 최대 즐겨찾기 수 제한 (10개)
- [ ] 중복 즐겨찾기 방지

#### Step 5: 시각적 개선 (Visual Enhancements)
**파일:**
- `index.html` (CSS 개선)
- `src/ui/TooltipManager.ts` (신규)
- `tests/unit/TooltipManager.test.ts` (신규)

**기능:**
1. 호버 툴팁 표시
2. 부드러운 애니메이션
3. 블록 미리보기 (선택 사항)

**테스트:**
- [ ] 툴팁 표시/숨김
- [ ] 툴팁 내용 정확성
- [ ] 애니메이션 타이밍

#### Step 6: 통합 테스트 (Integration Tests)
**파일:**
- `tests/integration/UIIntegration.test.ts` (신규)

**테스트:**
- [ ] UI에서 툴 선택 → 게임 엔진 상태 업데이트
- [ ] 카테고리 변경 → 블록 리스트 변경
- [ ] 키보드 단축키 → UI 및 게임 상태 변경
- [ ] 즐겨찾기 → 블록 선택

## 📊 성공 지표 (Success Metrics)

1. **사용성 (Usability)**
   - 블록 선택 시간: 현재 ~5초 → 목표 ~2초
   - 툴 전환 클릭 수: 현재 1번 → 목표 1번 (유지) 또는 키보드 0번

2. **성능 (Performance)**
   - UI 렌더링 시간: < 16ms (60 FPS 유지)
   - 메모리 사용: < 10MB 추가

3. **접근성 (Accessibility)**
   - 키보드로 모든 기능 접근 가능
   - 모바일에서 사용 가능
   - 툴팁으로 모든 기능 설명

4. **코드 품질 (Code Quality)**
   - 테스트 커버리지: 80% 이상
   - TypeScript 타입 안전성: 100%
   - 빌드 경고: 0개

## 🚀 구현 우선순위 (Implementation Priority)

### 높음 (High) - 즉시 구현
1. ✅ Step 1: 카테고리 시스템
2. ✅ Step 2: 개선된 UI 레이아웃

### 중간 (Medium) - 이번 세션
3. ⏳ Step 3: 키보드 단축키
4. ⏳ Step 4: 즐겨찾기 시스템

### 낮음 (Low) - 선택 사항
5. ⏸️ Step 5: 시각적 개선
6. ⏸️ Step 6: 모바일 최적화

## 📝 다음 단계 (Next Steps)

1. **Step 1 구현**: `BlockCategoryManager.ts` 생성 및 테스트 작성
2. **Step 2 구현**: UI 레이아웃 개선 및 테스트
3. **기존 기능 검증**: 모든 기존 테스트 통과 확인
4. **사용자 피드백**: 개선된 UI 스크린샷 공유

---

**작성일**: 2025-01-11
**버전**: 1.0
**작성자**: Claude (AI Assistant)
