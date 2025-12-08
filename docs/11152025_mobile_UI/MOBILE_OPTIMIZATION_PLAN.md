# 모바일/태블릿 UI 최적화 계획 (Mobile/Tablet UI Optimization Plan)

## 📱 현재 상태 분석 (Current State Analysis)

### 문제점 (Issues)

1. **데스크톱 전용 설계**
   - 고정된 픽셀 위치 (absolute positioning)
   - 마우스 이벤트만 지원 (mouse-only events)
   - 작은 터치 타겟 (< 44px minimum requirement)
   - 키보드 컨트롤 표시 (모바일에서 무의미)

2. **레이아웃 충돌**
   - 3개 패널이 모바일에서 겹침
   - 640px 이하에서 UI 붕괴
   - 고정 너비 (300-400px toolbar)

3. **성능 이슈**
   - 모바일 GPU에 최적화 안 됨
   - 그림자/파티클 설정이 데스크톱용
   - 배터리 소모 고려 없음

## 🎯 목표 (Goals)

1. ✅ 데스크톱 경험 유지하면서 모바일 지원 추가
2. ✅ 터치 제스처 완전 지원 (tap, drag, pinch, pan)
3. ✅ 모든 디바이스에서 30+ FPS 유지
4. ✅ 접근성 기준 충족 (WCAG AA)

## 📐 반응형 브레이크포인트 (Responsive Breakpoints)

```css
/* Mobile Portrait */
@media (max-width: 479px) {
  - 단일 컬럼 레이아웃
  - 하단 네비게이션 바
  - 서랍식 메뉴
}

/* Mobile Landscape / Phablet Portrait */
@media (min-width: 480px) and (max-width: 767px) {
  - 2컬럼 레이아웃
  - 하단 툴바
}

/* Tablet Portrait */
@media (min-width: 768px) and (max-width: 1023px) {
  - 사이드바 + 하단 바 하이브리드
  - 더 많은 UI 요소 표시
}

/* Tablet Landscape / Small Desktop */
@media (min-width: 1024px) and (max-width: 1279px) {
  - 전환 레이아웃
  - 데스크톱보다 작은 패딩
}

/* Desktop */
@media (min-width: 1280px) {
  - 현재 데스크톱 레이아웃 (기본)
}

/* Touch Device */
@media (hover: none) and (pointer: coarse) {
  - 터치 전용 조정
  - 큰 타겟 사이즈
  - 호버 상태 제거
}
```

## 🖱️ 터치 제스처 매핑 (Touch Gesture Mapping)

| 제스처 | 데스크톱 동작 | 모바일 동작 |
|--------|--------------|------------|
| **한 손가락 드래그** | 우클릭 드래그 | 카메라 회전 |
| **두 손가락 핀치** | 마우스 휠 | 줌 인/아웃 |
| **두 손가락 드래그** | 중클릭 드래그 | 카메라 이동 |
| **탭** | 좌클릭 | 블록 배치/제거 |
| **길게 누르기** | - | 도구 메뉴 열기 |

## 📏 터치 타겟 크기 (Touch Target Sizes)

| 요소 | 현재 크기 | 목표 크기 | 우선순위 |
|------|----------|----------|---------|
| Compact Toggle | 30×30px | **48×48px** | 높음 |
| Category Tabs | ~31px | **48px** | 높음 |
| Tool Buttons | ~38px | **48px** | 높음 |
| Block Buttons | 60px | **60px** | OK ✓ |
| Search Input | ~34px | **48px** | 중간 |
| Bottom Nav Icons | - | **56×56px** | 높음 |

## 🎨 모바일 UI 레이아웃 (Mobile UI Layout)

### 모바일 세로 모드 (< 768px Portrait):

```
┌─────────────────────────┐
│ FPS: 60  Blocks: 1234   │ ← 상단 상태바 (축소됨)
├─────────────────────────┤
│                         │
│                         │
│    3D Canvas (전체)     │
│                         │
│                         │
├─────────────────────────┤
│ [🏗️] [⛏️] [🎨] [🌍] [☰] │ ← 하단 네비게이션
└─────────────────────────┘
```

### 서랍 메뉴 (Drawer):

```
┌────────────┬────────────┐
│ ☰ Menu     │            │
│            │            │
│ 🌿 Natural │            │
│ 🏗️ Building│   Canvas   │
│ 💎 Mineral │            │
│ 🎨 Decor   │            │
│            │            │
│ [🔍 검색]   │            │
└────────────┴────────────┘
  (슬라이드)      (메인)
```

### 태블릿 레이아웃 (768px+):

```
┌────────┬─────────────────┬────────┐
│ Tools  │                 │ Info   │
│ 🏗️ Place│                 │ FPS    │
│ ⛏️ Break │                 │ Blocks │
│ 🎨 Paint │     Canvas      │ Pos    │
│ 🪣 Fill  │                 │        │
│──────── │                 │────────│
│ Blocks  │                 │ Mini   │
│ [Grid]  │                 │ Map    │
└────────┴─────────────────┴────────┘
  사이드바        메인         사이드바
```

## 🚀 구현 단계 (Implementation Phases)

### Phase 1: 기초 작업 (Foundation) - 1주차
**우선순위: 높음**

#### 1.1 디바이스 감지 시스템
- [ ] `DeviceDetector.ts` 생성
- [ ] 모바일/태블릿/데스크톱 감지
- [ ] 터치 지원 감지
- [ ] 성능 레벨 감지 (low/mid/high)

**테스트:**
```typescript
describe('DeviceDetector', () => {
  it('should detect mobile devices');
  it('should detect tablet devices');
  it('should detect touch support');
  it('should detect performance level');
});
```

#### 1.2 터치 매니저 기본 구조
- [ ] `TouchManager.ts` 생성
- [ ] 터치 이벤트 정규화
- [ ] 기본 제스처 인식 (tap, drag)

**테스트:**
```typescript
describe('TouchManager', () => {
  it('should normalize touch events');
  it('should detect tap gesture');
  it('should detect drag gesture');
});
```

#### 1.3 반응형 CSS 프레임워크
- [ ] `responsive.css` 생성
- [ ] 브레이크포인트 정의
- [ ] CSS 변수로 터치 타겟 크기 정의

### Phase 2: 터치 컨트롤 (Touch Controls) - 2주차
**우선순위: 높음**

#### 2.1 카메라 터치 컨트롤
- [ ] 한 손가락 드래그 → 회전
- [ ] 두 손가락 핀치 → 줌
- [ ] 두 손가락 드래그 → 이동
- [ ] 관성/모멘텀 추가

**테스트:**
```typescript
describe('CameraController - Touch', () => {
  it('should rotate camera on single finger drag');
  it('should zoom on pinch gesture');
  it('should pan on two finger drag');
  it('should apply momentum after release');
});
```

#### 2.2 블록 배치 터치
- [ ] 탭으로 블록 배치/제거
- [ ] 시각적 탭 피드백
- [ ] 길게 누르기 대체 액션

**테스트:**
```typescript
describe('VoxelToolSystem - Touch', () => {
  it('should place block on tap');
  it('should show tap feedback animation');
  it('should detect long press');
});
```

#### 2.3 하단 네비게이션 바
- [ ] `MobileNavigation.ts` 생성
- [ ] 5개 아이콘 버튼
- [ ] 선택 상태 표시

**테스트:**
```typescript
describe('MobileNavigation', () => {
  it('should render bottom navigation bar');
  it('should switch tools on button tap');
  it('should highlight active tool');
});
```

### Phase 3: 반응형 레이아웃 (Responsive Layout) - 3주차
**우선순위: 중간**

#### 3.1 모바일 레이아웃
- [ ] 하단 네비게이션 (< 768px)
- [ ] 슬라이드 서랍 메뉴
- [ ] 축소된 상단 상태바

**테스트:**
```typescript
describe('Mobile Layout', () => {
  it('should show bottom nav on mobile');
  it('should open drawer on menu tap');
  it('should hide desktop panels on mobile');
});
```

#### 3.2 태블릿 레이아웃
- [ ] 하이브리드 사이드바 (768px - 1024px)
- [ ] 적응형 그리드 크기

**테스트:**
```typescript
describe('Tablet Layout', () => {
  it('should show sidebar on tablet');
  it('should resize block grid for tablet');
});
```

#### 3.3 화면 방향 처리
- [ ] 세로 모드 최적화
- [ ] 가로 모드 최적화
- [ ] 부드러운 전환 애니메이션

**테스트:**
```typescript
describe('Orientation Handling', () => {
  it('should adapt to portrait orientation');
  it('should adapt to landscape orientation');
  it('should handle orientation change smoothly');
});
```

### Phase 4: 성능 최적화 (Performance) - 4주차
**우선순위: 중간**

#### 4.1 모바일 렌더링 최적화
- [ ] 그림자 품질 감소
- [ ] 파티클 수 감소
- [ ] 적응형 픽셀 비율
- [ ] 안개 거리 조정

**테스트:**
```typescript
describe('Performance Optimization', () => {
  it('should reduce shadow quality on mobile');
  it('should limit particle count on mobile');
  it('should adjust pixel ratio based on device');
});
```

#### 4.2 배터리 최적화
- [ ] 비활성 상태 감지
- [ ] 프레임 레이트 조절
- [ ] 수동 이벤트 리스너

**테스트:**
```typescript
describe('Battery Optimization', () => {
  it('should reduce frame rate when inactive');
  it('should pause rendering when hidden');
});
```

#### 4.3 점진적 향상
- [ ] 디바이스 성능 감지
- [ ] 적절한 품질 설정 적용
- [ ] 우아한 성능 저하

### Phase 5: 테스트 & 마무리 (Testing & Polish) - 5주차
**우선순위: 높음**

#### 5.1 디바이스 테스트
- [ ] 실제 디바이스 테스트
- [ ] 브라우저 호환성
- [ ] 성능 프로파일링

#### 5.2 UX 개선
- [ ] 햅틱 피드백 (지원 시)
- [ ] 로딩 상태
- [ ] 에러 처리

#### 5.3 접근성
- [ ] 스크린 리더 지원
- [ ] 포커스 관리
- [ ] ARIA 라벨

## 📊 성공 지표 (Success Metrics)

### 성능 목표:
- ✅ **모바일 저사양**: 30+ FPS
- ✅ **모바일 중급**: 45+ FPS
- ✅ **모바일 고급**: 60 FPS
- ✅ **태블릿**: 60 FPS
- ✅ **로딩 시간**: < 5초 (3G)
- ✅ **배터리 소모**: < 20%/시간

### 사용성 목표:
- ✅ 모든 터치 타겟 >= 48×48px
- ✅ 텍스트 줌 없이 읽기 가능 (최소 16px)
- ✅ 색상 대비 WCAG AA 이상
- ✅ 모든 기능 터치로 접근 가능

### 호환성 목표:
- ✅ iOS 15+ (Safari, Chrome)
- ✅ Android 10+ (Chrome, Samsung Internet)
- ✅ iPad OS 15+

## 🧪 테스트 매트릭스 (Testing Matrix)

| 디바이스 | 화면 크기 | 해상도 | 우선순위 |
|---------|----------|--------|---------|
| iPhone SE | 375×667 | @2x | **높음** |
| iPhone 14 Pro | 393×852 | @3x | **높음** |
| iPad Mini | 744×1133 | @2x | **높음** |
| Galaxy S21 | 360×800 | @3x | **높음** |
| iPad Pro 11" | 834×1194 | @2x | 중간 |

## 📁 파일 구조 (File Structure)

### 신규 파일:
```
/src/
  /styles/
    responsive.css          # 반응형 CSS
    touch.css              # 터치 전용 스타일
  /input/
    TouchManager.ts        # 터치 이벤트 처리
    GestureRecognizer.ts   # 제스처 인식
  /ui/
    MobileNavigation.ts    # 하단 네비게이션
    DrawerMenu.ts          # 서랍 메뉴
    TouchFeedback.ts       # 터치 피드백
  /utils/
    DeviceDetector.ts      # 디바이스 감지
    PerformanceManager.ts  # 성능 관리

/tests/unit/
  DeviceDetector.test.ts
  TouchManager.test.ts
  GestureRecognizer.test.ts
  MobileNavigation.test.ts
  PerformanceManager.test.ts
```

### 수정 파일:
```
index.html                      # 모바일 메타 태그, 하단 네비게이션
src/core/CameraController.ts   # 터치 컨트롤 추가
src/core/VoxelGameEngine.ts    # 터치 이벤트, 모바일 최적화
src/ui/VoxelUIManager.ts       # 반응형 UI 로직
```

## 🎯 빠른 성과 (Quick Wins)

즉시 구현 가능한 개선사항:

1. ✅ **터치 타겟 크기 증가**
   ```css
   @media (hover: none) {
     .category-tab { padding: 14px 12px; }
     .tool-button { padding: 16px; }
   }
   ```

2. ✅ **기본 터치 이벤트**
   ```typescript
   canvas.addEventListener('touchstart', handleTouchStart);
   canvas.addEventListener('touchend', handleTouchEnd);
   ```

3. ✅ **하단 네비게이션 바**
   - HTML 구조 추가
   - 모바일에서만 표시

4. ✅ **모바일 성능 설정**
   ```typescript
   if (isMobile) {
     renderer.shadowMap.enabled = false;
     renderer.setPixelRatio(1.5);
   }
   ```

5. ✅ **Safe Area 지원**
   ```css
   padding-bottom: env(safe-area-inset-bottom);
   ```

## 📝 다음 단계 (Next Steps)

1. **Phase 1 시작**: DeviceDetector 구현 (TDD)
2. **Phase 2**: TouchManager 구현 (TDD)
3. **Phase 3**: 반응형 레이아웃 구현
4. **Phase 4**: 성능 최적화
5. **Phase 5**: 실제 디바이스 테스트

---

**작성일**: 2025-01-11
**예상 소요 시간**: 5주
**접근 방식**: TDD (Test-Driven Development)
**호환성 목표**: iOS 15+, Android 10+
