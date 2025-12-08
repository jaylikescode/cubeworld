# Phase 2: Supabase 인증 시스템 - 개발 계획

> **개발 방법론**: TDD (Test-Driven Development)
> **원칙**: Clean & Simple, Stable, Step-by-step
> **예상 기간**: 2-3주

---

## 📋 목표 (Goals)

### 비즈니스 목표
1. **사용자 인증**: 소셜 로그인으로 쉬운 가입/로그인
2. **사용자별 데이터**: 개인화된 월드 관리 준비
3. **보안**: Row Level Security (RLS)로 안전한 데이터 접근

### 기술 목표
1. **Supabase 통합**: 인증 및 데이터베이스 연동
2. **소셜 로그인**: Google, Facebook, Apple 지원
3. **세션 관리**: 자동 로그인 유지
4. **게스트 모드**: 로그인 없이도 사용 가능

---

## 🏗️ 아키텍처 설계

### 시스템 다이어그램
```
┌─────────────────────────────────────────────────────────┐
│                    VoxelUIManager                        │
│  (UI 레이어)                                              │
│  - LoginModal                                            │
│  - UserProfile                                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ uses
                 ▼
┌─────────────────────────────────────────────────────────┐
│                   AuthService                            │
│  (인증 레이어 - 비즈니스 로직)                              │
│                                                           │
│  Methods:                                                │
│  - signInWithGoogle(): Promise<User>                     │
│  - signInWithFacebook(): Promise<User>                   │
│  - signInWithApple(): Promise<User>                      │
│  - signOut(): Promise<void>                              │
│  - getCurrentUser(): User | null                         │
│  - onAuthStateChange(callback): void                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ uses
                 ▼
┌─────────────────────────────────────────────────────────┐
│                 SupabaseClient                           │
│  (데이터 레이어 - Supabase SDK)                           │
│                                                           │
│  - createClient(url, key)                                │
│  - auth.signInWithOAuth()                                │
│  - auth.signOut()                                        │
│  - auth.getSession()                                     │
│  - auth.onAuthStateChange()                              │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 데이터 모델

### TypeScript Interfaces

```typescript
/**
 * 사용자 정보
 */
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider: 'google' | 'facebook' | 'apple';
  createdAt: Date;
  lastLoginAt: Date;
}

/**
 * 인증 세션
 */
interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * 로그인 상태
 */
type AuthState =
  | { status: 'authenticated'; user: User }
  | { status: 'guest'; user: null }
  | { status: 'loading'; user: null };
```

---

## 🧪 TDD 개발 계획

### Phase 2.1: 환경 설정 (1일)

#### 작업 항목
1. ✅ Supabase 프로젝트 생성
2. ✅ OAuth 프로바이더 설정 (Google, Facebook, Apple)
3. ✅ 환경 변수 파일 생성
4. ✅ Supabase SDK 설치

#### 환경 변수
**파일**: `.env.local` (신규, gitignore에 추가)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OAuth Redirect URLs (개발/프로덕션)
VITE_REDIRECT_URL=http://localhost:5173
```

**파일**: `.env.example` (신규)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_REDIRECT_URL=http://localhost:5173
```

#### 패키지 설치
```bash
npm install @supabase/supabase-js
```

---

### Phase 2.2: 타입 정의 (0.5일)

#### 파일: `src/types/AuthTypes.ts` (신규)

```typescript
/**
 * 인증 관련 타입 정의
 */

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider: 'google' | 'facebook' | 'apple';
  createdAt: Date;
  lastLoginAt: Date;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export type AuthProvider = 'google' | 'facebook' | 'apple';

export type AuthState =
  | { status: 'authenticated'; user: User }
  | { status: 'guest'; user: null }
  | { status: 'loading'; user: null };

export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'SIGNIN_FAILED' | 'SIGNOUT_FAILED' | 'SESSION_EXPIRED' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
```

---

### Phase 2.3: SupabaseClient (0.5일)

#### 파일: `src/services/SupabaseClient.ts` (신규)

```typescript
import { createClient, SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';

/**
 * Supabase 클라이언트 싱글톤
 */
class SupabaseClientWrapper {
  private static instance: SupabaseClientType | null = null;

  static getInstance(): SupabaseClientType {
    if (!this.instance) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
      }

      this.instance = createClient(supabaseUrl, supabaseKey);
    }

    return this.instance;
  }
}

export const supabase = SupabaseClientWrapper.getInstance();
```

---

### Phase 2.4: AuthService (2일)

#### Step 2.4.1: 테스트 작성
**파일**: `tests/unit/services/AuthService.test.ts` (신규)

```typescript
describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('signInWithGoogle', () => {
    it('should sign in with Google OAuth', async () => {
      // Given: User clicks Google login
      // When: signInWithGoogle()
      // Then: Returns User object
    });

    it('should handle sign-in errors gracefully', async () => {
      // Given: OAuth fails
      // When: signInWithGoogle()
      // Then: Throws AuthError
    });
  });

  describe('signInWithFacebook', () => {
    it('should sign in with Facebook OAuth', async () => {
      // Test implementation
    });
  });

  describe('signInWithApple', () => {
    it('should sign in with Apple OAuth', async () => {
      // Test implementation
    });
  });

  describe('signOut', () => {
    it('should sign out current user', async () => {
      // Given: Authenticated user
      // When: signOut()
      // Then: User is null
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user if authenticated', () => {
      // Test implementation
    });

    it('should return null if not authenticated', () => {
      // Test implementation
    });
  });

  describe('onAuthStateChange', () => {
    it('should call callback when auth state changes', () => {
      // Test implementation
    });
  });
});
```

#### Step 2.4.2: 구현
**파일**: `src/services/AuthService.ts` (신규)

```typescript
import { supabase } from './SupabaseClient';
import type { User, AuthProvider, AuthState } from '../types/AuthTypes';
import { AuthError } from '../types/AuthTypes';

export class AuthService {
  private currentUser: User | null = null;
  private authStateCallbacks: ((state: AuthState) => void)[] = [];

  constructor() {
    this.initializeAuth();
  }

  /**
   * 초기화 - 세션 복원
   */
  private async initializeAuth(): Promise<void> {
    // Implementation
  }

  /**
   * Google 로그인
   */
  async signInWithGoogle(): Promise<User> {
    return this.signInWithProvider('google');
  }

  /**
   * Facebook 로그인
   */
  async signInWithFacebook(): Promise<User> {
    return this.signInWithProvider('facebook');
  }

  /**
   * Apple 로그인
   */
  async signInWithApple(): Promise<User> {
    return this.signInWithProvider('apple');
  }

  /**
   * OAuth 프로바이더로 로그인
   */
  private async signInWithProvider(provider: AuthProvider): Promise<User> {
    // Implementation
  }

  /**
   * 로그아웃
   */
  async signOut(): Promise<void> {
    // Implementation
  }

  /**
   * 현재 사용자 가져오기
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * 인증 상태 변경 리스너
   */
  onAuthStateChange(callback: (state: AuthState) => void): void {
    this.authStateCallbacks.push(callback);
  }

  /**
   * 인증 상태 변경 알림
   */
  private notifyAuthStateChange(): void {
    // Implementation
  }
}
```

---

### Phase 2.5: LoginModal UI (2일)

#### Step 2.5.1: HTML/CSS 추가
**파일**: `index.html` (수정)

```html
<!-- Login Modal -->
<div id="login-modal" class="modal hidden">
  <div class="modal-content">
    <h2>🌍 Creator of Worlds</h2>
    <p>로그인하여 나만의 세계를 저장하세요!</p>

    <div class="login-buttons">
      <button id="google-login" class="social-login-btn google">
        <span class="icon">G</span>
        <span>Google로 시작</span>
      </button>

      <button id="facebook-login" class="social-login-btn facebook">
        <span class="icon">f</span>
        <span>Facebook으로 시작</span>
      </button>

      <button id="apple-login" class="social-login-btn apple">
        <span class="icon"></span>
        <span>Apple로 시작</span>
      </button>
    </div>

    <button id="guest-continue" class="guest-btn">
      게스트로 계속하기
    </button>
  </div>
</div>
```

#### Step 2.5.2: 테스트 작성
**파일**: `tests/unit/ui/LoginModal.test.ts` (신규)

#### Step 2.5.3: 구현
**파일**: `src/ui/LoginModal.ts` (신규)

```typescript
import { AuthService } from '../services/AuthService';

export class LoginModal {
  private modal: HTMLElement;
  private authService: AuthService;
  private onLoginCallback?: (user: User) => void;
  private onGuestCallback?: () => void;

  constructor(authService: AuthService) {
    // Implementation
  }

  /**
   * 모달 열기
   */
  open(): void {
    // Implementation
  }

  /**
   * 모달 닫기
   */
  close(): void {
    // Implementation
  }

  /**
   * 로그인 성공 콜백 등록
   */
  onLogin(callback: (user: User) => void): void {
    this.onLoginCallback = callback;
  }

  /**
   * 게스트 계속 콜백 등록
   */
  onGuestContinue(callback: () => void): void {
    this.onGuestCallback = callback;
  }
}
```

---

### Phase 2.6: UserProfile UI (1일)

#### 파일: `src/ui/UserProfile.ts` (신규)

```typescript
export class UserProfile {
  private container: HTMLElement;
  private user: User | null = null;

  constructor() {
    // Implementation
  }

  /**
   * 사용자 정보 업데이트
   */
  updateUser(user: User | null): void {
    // Implementation
  }

  /**
   * 프로필 표시
   */
  show(): void {
    // Implementation
  }

  /**
   * 프로필 숨기기
   */
  hide(): void {
    // Implementation
  }
}
```

---

### Phase 2.7: 통합 테스트 (1일)

#### 파일: `tests/integration/Auth.integration.test.ts` (신규)

```typescript
describe('Authentication Integration', () => {
  it('should complete full login flow', async () => {
    // Given: User on login modal
    // When: Click Google login
    // Then: User is authenticated and profile shown
  });

  it('should persist session across page refresh', async () => {
    // Given: Authenticated user
    // When: Page refresh
    // Then: User remains authenticated
  });

  it('should handle logout correctly', async () => {
    // Given: Authenticated user
    // When: Click logout
    // Then: User is signed out and login modal shown
  });
});
```

---

## ✅ 완료 기준 (Definition of Done)

### 기능 요구사항
- [ ] Google 소셜 로그인 동작
- [ ] Facebook 소셜 로그인 동작
- [ ] Apple 소셜 로그인 동작
- [ ] 로그아웃 동작
- [ ] 세션 유지 (페이지 새로고침 후에도)
- [ ] 게스트 모드 지원
- [ ] 사용자 프로필 표시

### 기술 요구사항
- [ ] 단위 테스트 작성 (AuthService, LoginModal, UserProfile)
- [ ] 통합 테스트 작성
- [ ] 기존 테스트 모두 통과 (0 regression)
- [ ] TypeScript 타입 에러 0개
- [ ] ESLint 경고 0개
- [ ] Build 성공

### 보안 요구사항
- [ ] 환경 변수로 API 키 관리
- [ ] .env.local은 .gitignore에 추가
- [ ] OAuth redirect URL 검증

### 문서화 요구사항
- [ ] Phase 2 진행 상황 문서
- [ ] Supabase 설정 가이드
- [ ] 환경 변수 설정 가이드
- [ ] Git commit 메시지

---

## 📅 일정

### Week 1: 기반 구축
- **Day 1**: Supabase 설정, 환경 변수, 타입 정의
- **Day 2-3**: AuthService 테스트/구현
- **Day 4-5**: LoginModal UI 테스트/구현

### Week 2: UI 완성 및 통합
- **Day 1**: UserProfile UI
- **Day 2**: 통합 테스트
- **Day 3**: 버그 수정 및 UX 개선
- **Day 4**: 문서화
- **Day 5**: 코드 리뷰 및 Phase 2 완료

**총 개발 기간**: 2주

---

## 🔒 리스크 관리

### 식별된 리스크

| 리스크 | 확률 | 영향 | 대응 방안 |
|--------|------|------|-----------|
| OAuth 설정 오류 | 중 | 높 | Supabase 문서 참조, 단계별 검증 |
| 세션 관리 복잡도 | 중 | 중 | Supabase SDK 기본 기능 활용 |
| 브라우저 호환성 | 낮 | 중 | 모던 브라우저 타겟, polyfill 고려 |
| 보안 취약점 | 낮 | 높 | Row Level Security, 환경 변수 관리 |

---

## 🎯 성공 지표

### 기술 지표
- **테스트 커버리지**: > 80%
- **빌드 성공률**: 100%
- **타입 안전성**: 100%

### 사용자 지표 (추후 측정)
- **로그인 성공률**: > 95%
- **세션 유지율**: > 90%
- **소셜 로그인 선호도**: Google > Facebook > Apple

---

## 📝 참고 자료

### Supabase 문서
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [OAuth Providers](https://supabase.com/docs/guides/auth/social-login)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### 내부 문서
- [WORLD_PERSISTENCE_PLAN.md](./WORLD_PERSISTENCE_PLAN.md)
- [PRD_WORLD_PERSISTENCE.md](./PRD_WORLD_PERSISTENCE.md)
- [PHASE1_PROGRESS.md](./PHASE1_PROGRESS.md)

---

**작성자**: Development Team (with Claude Code)
**상태**: 🟡 계획 단계
**다음 단계**: Supabase 프로젝트 생성 및 OAuth 설정
