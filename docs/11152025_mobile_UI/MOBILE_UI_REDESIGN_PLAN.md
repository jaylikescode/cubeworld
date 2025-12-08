# 모바일 UI 재설계 계획 (Mobile UI Redesign Plan)

## 📱 문제 분석 (Problem Analysis)

### 현재 문제점
스크린샷에서 확인된 이슈:

1. **화면 가시성 문제** ⚠️
   - 좌측 툴바가 화면의 70% 이상을 차지
   - 3D 복셀 맵이 거의 보이지 않음
   - 게임 플레이가 불가능한 수준

2. **UI 레이아웃 문제**
   - 데스크톱용 세로 툴바를 그대로 사용
   - 모바일 화면 비율에 최적화되지 않음
   - 스크롤이 필요한 긴 세로 레이아웃

3. **터치 인터랙션 문제**
   - 툴바를 조작하면 맵을 볼 수 없음
   - 맵을 보려면 툴바를 스크롤해야 함
   - 동시에 두 가지를 볼 수 없음

### 목표 (Goals)
- ✅ 모바일에서 3D 맵이 **최소 70% 화면** 차지
- ✅ 툴바는 **접을 수 있고 필요할 때만** 표시
- ✅ **하단 네비게이션**으로 빠른 도구 전환
- ✅ 데스크톱 버전은 **변경 없음** (기존 동작 유지)
- ✅ 모든 기능이 **한 손으로 접근** 가능

---

## 🎨 모바일 UI 디자인 (Mobile UI Design)

### 핵심 원칙 (Core Principles)

1. **Map First (맵 우선)**
   - 3D 맵이 항상 주인공
   - 최소 70% 화면 점유
   - 전체 화면 모드 지원

2. **Collapsible UI (접을 수 있는 UI)**
   - 기본 상태: 하단 네비게이션만 표시
   - 필요시: 서랍(drawer)이 슬라이드 인
   - 반투명 오버레이로 맵 계속 보임

3. **Bottom Navigation (하단 네비게이션)**
   - 주요 도구 5개: Place, Break, Paint, Fill, Menu
   - 항상 고정 위치 (safe area 고려)
   - 한 번의 탭으로 도구 전환

4. **Contextual Panels (상황별 패널)**
   - 블록 선택: 하단 시트 (bottom sheet)
   - 설정/옵션: 우측 서랍 (drawer)
   - 정보: 상단 컴팩트 바

---

## 📐 모바일 레이아웃 설계 (Mobile Layout Design)

### 레이아웃 A: 기본 상태 (Default State)
```
┌─────────────────────────┐
│ FPS: 60  Blocks: 1234  │ ← 상단 정보바 (투명, 30px)
├─────────────────────────┤
│                         │
│                         │
│                         │
│     3D VOXEL MAP        │ ← 전체 화면 (90%)
│     (Main Canvas)       │
│                         │
│                         │
│                         │
├─────────────────────────┤
│ [🏗️] [⛏️] [🎨] [🪣] [☰] │ ← 하단 네비게이션 (60px)
└─────────────────────────┘
```

### 레이아웃 B: 블록 선택 시 (Block Selection)
```
┌─────────────────────────┐
│     3D VOXEL MAP        │
│     (Dimmed 50%)        │ ← 맵 계속 표시 (50% 투명)
├─────────────────────────┤
│ ▔▔▔                     │ ← 드래그 핸들
│ 🟩 Grass  🟫 Dirt       │
│ ⬜ Stone  🪵 Wood       │ ← 블록 그리드
│ 🧱 Brick  💎 Diamond    │   (bottom sheet)
│                         │
│ [🏗️] [⛏️] [🎨] [🪣] [☰] │ ← 하단 네비게이션
└─────────────────────────┘
```

### 레이아웃 C: 메뉴 열림 (Menu Open)
```
┌─────────────────────────┐
│     3D MAP     │ MENU   │
│                │ ━━━━━  │
│                │ 🌿 Nat │
│                │ 🏗️ Bui │ ← 우측 서랍
│                │ 💎 Min │   (80% width)
│                │ 🎨 Dec │
│                │ 💧 Liq │
├────────────────┴────────┤
│ [🏗️] [⛏️] [🎨] [🪣] [☰] │
└─────────────────────────┘
```

---

## 🔧 구현 계획 (Implementation Plan)

### Phase 1: 모바일 감지 및 레이아웃 분리 (1일차)
**우선순위: 긴급**

#### 1.1 모바일 감지 강화
- [ ] `VoxelGameEngine`에 디바이스 타입 전달
- [ ] `VoxelUIManager`에서 모바일/데스크톱 분기
- [ ] URL 파라미터로 강제 모드 전환 (?mode=mobile)

**테스트:**
```typescript
describe('Device Mode Detection', () => {
  it('should detect mobile mode on touch devices');
  it('should use desktop mode on non-touch devices');
  it('should allow manual mode override via URL');
});
```

#### 1.2 조건부 UI 렌더링
- [ ] `renderDesktopUI()` 메서드 분리
- [ ] `renderMobileUI()` 메서드 생성
- [ ] 조건부 렌더링 로직 추가

**코드 구조:**
```typescript
class VoxelUIManager {
  private deviceDetector: DeviceDetector;

  initializeUI() {
    if (this.isMobileMode()) {
      this.renderMobileUI();
    } else {
      this.renderDesktopUI();
    }
  }

  private isMobileMode(): boolean {
    // URL override check
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('mode')) {
      return urlParams.get('mode') === 'mobile';
    }
    // Device detection
    return this.deviceDetector.isMobile() || this.deviceDetector.isTablet();
  }
}
```

**Phase 1 완료 상태**: ✅ COMPLETED

**완료 사항**:
- ✅ DeviceDetector를 VoxelUIManager에 통합
- ✅ isMobileMode() 메서드 구현 (URL 파라미터 우선, 장치 감지 fallback)
- ✅ renderDesktopUI()와 renderMobileUI()로 UI 렌더링 분리
- ✅ 모바일 모드에서 데스크톱 툴바 숨김 처리
- ✅ 15개 테스트 작성 및 통과
- ✅ 기존 343개 테스트 모두 통과 확인 (리그레션 없음)

**구현된 파일**:
- `src/ui/VoxelUIManager.ts` - 모바일 감지 및 조건부 렌더링 추가
- `tests/unit/VoxelUIManager.mobile.test.ts` - 15개 테스트 (모두 통과)

**테스트 결과**:
```
✓ 기존 테스트: 328 passed
✓ 새 모바일 테스트: 15 passed
✓ 총 테스트: 343 passed, 5 skipped (348 total)
✓ 데스크톱 기능: 100% 유지 (리그레션 없음)
```

**다음 단계**: Phase 2 - 하단 네비게이션 구현

---

### Phase 2: 하단 네비게이션 구현 (1일차)
**우선순위: 긴급**

#### 2.1 MobileBottomNav 컴포넌트
- [ ] `src/ui/MobileBottomNav.ts` 생성
- [ ] 5개 도구 버튼 렌더링
- [ ] 활성 상태 관리
- [ ] Safe area inset 적용

**파일:** `src/ui/MobileBottomNav.ts`
```typescript
export class MobileBottomNav {
  private container: HTMLElement;
  private activeButton: string = 'place';
  private onToolChange?: (tool: string) => void;

  constructor() {
    this.container = this.createBottomNav();
  }

  private createBottomNav(): HTMLElement {
    const nav = document.createElement('div');
    nav.className = 'mobile-bottom-nav';
    nav.innerHTML = `
      <button data-tool="place" class="mobile-nav-btn active">
        <span class="icon">🏗️</span>
        <span class="label">Place</span>
      </button>
      <button data-tool="break" class="mobile-nav-btn">
        <span class="icon">⛏️</span>
        <span class="label">Break</span>
      </button>
      <button data-tool="paint" class="mobile-nav-btn">
        <span class="icon">🎨</span>
        <span class="label">Paint</span>
      </button>
      <button data-tool="fill" class="mobile-nav-btn">
        <span class="icon">🪣</span>
        <span class="label">Fill</span>
      </button>
      <button data-tool="menu" class="mobile-nav-btn">
        <span class="icon">☰</span>
        <span class="label">Menu</span>
      </button>
    `;

    this.attachEventListeners(nav);
    return nav;
  }

  public setActiveTool(tool: string): void {
    // Update active state
  }

  public onToolChangeCallback(callback: (tool: string) => void): void {
    this.onToolChange = callback;
  }
}
```

**CSS:** `src/styles/mobile-ui.css`
```css
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: none; /* Hidden by default */
  z-index: 2000;
}

@media (max-width: 1023px) {
  .mobile-bottom-nav {
    display: flex;
  }
}

.mobile-nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 56px;
}

.mobile-nav-btn.active {
  color: #4ecdc4;
  background: rgba(78, 205, 196, 0.1);
}

.mobile-nav-btn .icon {
  font-size: 24px;
  margin-bottom: 2px;
}

.mobile-nav-btn .label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}
```

**테스트:** `tests/unit/MobileBottomNav.test.ts`
```typescript
describe('MobileBottomNav', () => {
  it('should render 5 navigation buttons');
  it('should highlight active tool');
  it('should emit tool change events');
  it('should apply safe area insets');
});
```

#### 2.2 통합
- [ ] `VoxelUIManager.renderMobileUI()`에서 인스턴스 생성
- [ ] 도구 변경 이벤트 연결
- [ ] 기존 툴바 숨김 처리

---

### Phase 3: 블록 선택 Bottom Sheet (2일차)
**우선순위: 높음**

#### 3.1 MobileBlockSheet 컴포넌트
- [ ] `src/ui/MobileBlockSheet.ts` 생성
- [ ] 드래그 핸들 구현
- [ ] 블록 그리드 렌더링
- [ ] 스와이프로 열기/닫기

**주요 기능:**
```typescript
export class MobileBlockSheet {
  private isOpen: boolean = false;
  private dragStartY: number = 0;

  public open(): void {
    this.isOpen = true;
    this.container.classList.add('open');
  }

  public close(): void {
    this.isOpen = false;
    this.container.classList.remove('open');
  }

  public toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  private handleDrag(e: TouchEvent): void {
    // Swipe to open/close
  }

  public renderBlocks(blocks: BlockType[]): void {
    // Render block grid
  }
}
```

**테스트:**
```typescript
describe('MobileBlockSheet', () => {
  it('should open on swipe up');
  it('should close on swipe down');
  it('should render block grid');
  it('should emit block selection events');
  it('should maintain open state');
});
```

---

### Phase 4: 메뉴 Drawer (2일차)
**우선순위: 중간**

#### 4.1 MobileDrawer 컴포넌트
- [ ] `src/ui/MobileDrawer.ts` 생성
- [ ] 좌측/우측 슬라이드 지원
- [ ] 카테고리 및 설정 렌더링
- [ ] 오버레이 배경

**테스트:**
```typescript
describe('MobileDrawer', () => {
  it('should slide in from right');
  it('should close on overlay click');
  it('should render category tabs');
  it('should render settings');
});
```

---

### Phase 5: 컴팩트 정보바 (2일차)
**우선순위: 낮음**

#### 5.1 MobileInfoBar 컴포넌트
- [ ] 상단 고정 위치
- [ ] FPS, 블록 수만 표시
- [ ] 반투명 배경
- [ ] 탭하면 상세 정보 표시

---

### Phase 6: 통합 및 테스트 (3일차)
**우선순위: 높음**

#### 6.1 통합 작업
- [ ] 모든 모바일 컴포넌트 연결
- [ ] 상태 관리 통합
- [ ] 이벤트 흐름 검증

#### 6.2 반응형 동작 확인
- [ ] 모바일 ↔ 데스크톱 전환 테스트
- [ ] 화면 회전 테스트
- [ ] 다양한 화면 크기 테스트

#### 6.3 기존 기능 보호
- [ ] 데스크톱 모드 변경 없음 확인
- [ ] 모든 단위 테스트 통과 (328 tests)
- [ ] 통합 테스트 작성

---

## 📁 파일 구조 (File Structure)

### 신규 파일
```
/src/
  /ui/
    MobileBottomNav.ts       # 하단 네비게이션
    MobileBlockSheet.ts      # 블록 선택 시트
    MobileDrawer.ts          # 메뉴 서랍
    MobileInfoBar.ts         # 상단 정보바
    MobileUIManager.ts       # 모바일 UI 관리자
  /styles/
    mobile-ui.css            # 모바일 전용 스타일

/tests/unit/
  MobileBottomNav.test.ts
  MobileBlockSheet.test.ts
  MobileDrawer.test.ts
  MobileInfoBar.test.ts
  MobileUIManager.test.ts
```

### 수정 파일
```
src/ui/VoxelUIManager.ts     # 모바일/데스크톱 분기 추가
index.html                    # 모바일 UI 컨테이너 추가
```

---

## 🎯 성공 지표 (Success Metrics)

### 기능 지표
- ✅ 모바일에서 3D 맵이 **최소 70%** 보임
- ✅ 하단 네비게이션으로 **1초 이내** 도구 전환
- ✅ 블록 선택이 **2초 이내** 완료
- ✅ 모든 기능이 **한 손**으로 접근 가능

### 기술 지표
- ✅ 데스크톱 기능 **100% 유지**
- ✅ 모든 테스트 통과 (현재 328 + 새 테스트)
- ✅ TypeScript 컴파일 오류 **0개**
- ✅ 번들 크기 증가 **< 50KB**

### 사용성 지표
- ✅ 첫 로드 후 **3초 이내** 플레이 가능
- ✅ 터치 응답 지연 **< 100ms**
- ✅ 애니메이션 **60fps** 유지

---

## 🚀 개발 스케줄 (Development Schedule)

### Day 1 (긴급)
- [ ] Phase 1: 모바일 감지 및 레이아웃 분리 (2시간)
- [ ] Phase 2: 하단 네비게이션 구현 (3시간)
- [ ] 테스트 및 커밋

### Day 2
- [ ] Phase 3: 블록 선택 Bottom Sheet (3시간)
- [ ] Phase 4: 메뉴 Drawer (2시간)
- [ ] Phase 5: 컴팩트 정보바 (1시간)

### Day 3
- [ ] Phase 6: 통합 및 테스트 (4시간)
- [ ] 실제 디바이스 테스트
- [ ] 최종 커밋 및 배포

---

## 📝 다음 단계 (Next Steps)

1. **이 계획서 검토 및 승인**
2. **Phase 1 시작**: 모바일 감지 및 분기 로직
3. **Phase 2 구현**: 하단 네비게이션 (가장 중요!)
4. **단계별 커밋**: 각 Phase 완료 후 커밋
5. **실제 디바이스 테스트**: iPhone에서 확인

---

**작성일**: 2025-01-15
**예상 소요 시간**: 3일
**접근 방식**: TDD (Test-Driven Development)
**호환성 목표**: iOS 15+, Android 10+, Desktop (변경 없음)
