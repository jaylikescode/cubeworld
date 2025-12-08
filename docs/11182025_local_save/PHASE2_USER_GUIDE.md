# Phase 2 사용자 가이드: Supabase 인증 시스템 설정

> **대상**: 개발자 (프로젝트 관리자)
> **소요 시간**: 약 30분 ~ 1시간
> **난이도**: 초급

---

## 📋 목차

1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [OAuth 프로바이더 설정](#2-oauth-프로바이더-설정)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [개발 시작](#4-개발-시작)

---

## 1. Supabase 프로젝트 생성

### 1.1 Supabase 계정 만들기

1. **Supabase 웹사이트 방문**
   - URL: https://supabase.com
   - 우측 상단 "Start your project" 클릭

2. **계정 가입**
   - GitHub 계정으로 가입 추천 (빠르고 편리)
   - 또는 이메일로 가입

### 1.2 새 프로젝트 생성

1. **Dashboard 접속**
   - 로그인 후 Dashboard로 이동
   - "New Project" 버튼 클릭

2. **프로젝트 정보 입력**
   ```
   Project Name: cubeworld
   Database Password: [강력한 비밀번호 생성 - 메모해두기!]
   Region: Northeast Asia (Seoul) - 한국 사용자용
   Pricing Plan: Free (시작용)
   ```

3. **생성 완료 대기**
   - 약 2-3분 소요
   - 프로젝트 초기화 완료될 때까지 대기

### 1.3 API Keys 확인

1. **Settings > API 메뉴 이동**
   - 좌측 사이드바에서 "Settings" 클릭
   - "API" 탭 선택

2. **다음 정보 복사 (메모장에 저장)**
   ```
   Project URL: https://[project-id].supabase.co
   anon public key: eyJ... (긴 문자열)
   ```

   ⚠️ **중요**: 이 정보는 나중에 `.env.local` 파일에 사용됩니다!

---

## 2. OAuth 프로바이더 설정

### 2.1 Google OAuth 설정

#### Google Cloud Console 설정

1. **Google Cloud Console 접속**
   - URL: https://console.cloud.google.com
   - Google 계정으로 로그인

2. **새 프로젝트 생성**
   - 프로젝트 선택 드롭다운 클릭
   - "새 프로젝트" 클릭
   - 프로젝트 이름: `cubeworld`
   - "만들기" 클릭

3. **OAuth 동의 화면 구성**
   - 좌측 메뉴에서 "API 및 서비스" > "OAuth 동의 화면" 선택
   - User Type: **외부** 선택
   - "만들기" 클릭

   **앱 정보 입력:**
   ```
   앱 이름: Creator of Worlds
   사용자 지원 이메일: [본인 이메일]
   앱 로고: (선택사항)
   앱 도메인: http://localhost:5173 (개발용)
   개발자 연락처 정보: [본인 이메일]
   ```

   - "저장 후 계속" 클릭
   - 범위 단계: "저장 후 계속" (기본값 사용)
   - 테스트 사용자: (선택사항) 본인 이메일 추가
   - "저장 후 계속" 클릭

4. **OAuth 클라이언트 ID 만들기**
   - 좌측 메뉴에서 "사용자 인증 정보" 선택
   - 상단의 "+ 사용자 인증 정보 만들기" 클릭
   - "OAuth 클라이언트 ID" 선택

   **클라이언트 ID 구성:**
   ```
   애플리케이션 유형: 웹 애플리케이션
   이름: Cubeworld Web Client

   승인된 자바스크립트 원본:
   - http://localhost:5173
   - http://localhost:5174

   승인된 리디렉션 URI:
   - https://[your-project-id].supabase.co/auth/v1/callback
   ```

   ⚠️ **중요**: `[your-project-id]`를 Step 1.3에서 복사한 Project URL의 ID로 변경!

   - "만들기" 클릭

5. **클라이언트 정보 복사**
   ```
   클라이언트 ID: [긴 문자열].apps.googleusercontent.com
   클라이언트 보안 비밀번호: [문자열]
   ```

   ⚠️ 이 정보를 메모장에 저장!

#### Supabase에 Google OAuth 연결

1. **Supabase Dashboard > Authentication > Providers**
   - "Google" 찾기
   - "Enabled" 토글 ON

2. **Google OAuth 정보 입력**
   ```
   Client ID: [위에서 복사한 클라이언트 ID]
   Client Secret: [위에서 복사한 클라이언트 보안 비밀번호]
   ```

3. **"Save" 클릭**

---

### 2.2 Facebook OAuth 설정 (선택사항)

#### Facebook for Developers 설정

1. **Facebook for Developers 접속**
   - URL: https://developers.facebook.com
   - Facebook 계정으로 로그인

2. **앱 만들기**
   - "내 앱" > "앱 만들기" 클릭
   - 사용 사례: "소비자" 선택
   - 앱 이름: `Creator of Worlds`
   - 앱 연락처 이메일: [본인 이메일]
   - "앱 만들기" 클릭

3. **Facebook 로그인 설정**
   - "제품 추가" 섹션에서 "Facebook 로그인" 찾기
   - "설정" 클릭
   - 플랫폼: "웹" 선택
   - 사이트 URL: `http://localhost:5173`
   - "저장" 클릭

4. **OAuth 리디렉션 URI 설정**
   - 좌측 메뉴에서 "Facebook 로그인" > "설정" 선택
   - "유효한 OAuth 리디렉션 URI"에 추가:
     ```
     https://[your-project-id].supabase.co/auth/v1/callback
     ```

5. **앱 ID 및 시크릿 복사**
   - 좌측 메뉴에서 "설정" > "기본 설정" 선택
   ```
   앱 ID: [숫자]
   앱 시크릿: [문자열] (보기 버튼 클릭)
   ```

#### Supabase에 Facebook OAuth 연결

1. **Supabase Dashboard > Authentication > Providers**
   - "Facebook" 찾기
   - "Enabled" 토글 ON

2. **Facebook OAuth 정보 입력**
   ```
   Client ID: [앱 ID]
   Client Secret: [앱 시크릿]
   ```

3. **"Save" 클릭**

---

### 2.3 Apple OAuth 설정 (선택사항, 고급)

⚠️ **참고**: Apple OAuth는 설정이 복잡하므로 나중에 진행 가능

Apple Developer Program 가입 필요 (연간 $99)

**설정 가이드**: https://supabase.com/docs/guides/auth/social-login/auth-apple

---

## 3. 환경 변수 설정

### 3.1 `.env.local` 파일 생성

1. **프로젝트 루트에 파일 생성**
   ```bash
   # 터미널에서 실행 (프로젝트 루트 디렉토리에서)
   touch .env.local
   ```

2. **파일 내용 작성**

   `.env.local` 파일을 열고 다음 내용 입력:

   ```bash
   # Supabase Configuration
   VITE_SUPABASE_URL=https://[your-project-id].supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ... (Step 1.3에서 복사한 anon key)

   # OAuth Redirect URL
   VITE_REDIRECT_URL=http://localhost:5173
   ```

   ⚠️ **중요**:
   - `[your-project-id]`를 실제 프로젝트 ID로 변경
   - `anon key` 전체를 복사 (매우 긴 문자열)

3. **파일 저장**

### 3.2 `.gitignore` 확인

1. **`.gitignore` 파일 열기**

2. **다음 라인이 있는지 확인** (없으면 추가)
   ```
   # Environment variables
   .env.local
   .env*.local
   ```

3. **저장**

⚠️ **보안 중요**: `.env.local` 파일은 절대 Git에 커밋하지 마세요!

### 3.3 `.env.example` 파일 생성 (선택사항)

다른 개발자를 위한 템플릿 파일:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_REDIRECT_URL=http://localhost:5173
```

---

## 4. 개발 시작

### 4.1 패키지 설치

```bash
# Supabase SDK 설치
npm install @supabase/supabase-js
```

### 4.2 개발 서버 실행

```bash
npm run dev
```

### 4.3 환경 변수 확인

브라우저 개발자 도구 콘솔에서 확인:

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
// 출력: https://[your-project-id].supabase.co
```

값이 `undefined`가 아니면 성공! ✅

---

## ✅ 설정 완료 체크리스트

### Supabase
- [ ] Supabase 프로젝트 생성
- [ ] Project URL 확인
- [ ] anon key 복사

### OAuth (최소 1개 필수)
- [ ] Google OAuth 설정 (추천)
- [ ] Facebook OAuth 설정 (선택)
- [ ] Apple OAuth 설정 (선택)

### 환경 변수
- [ ] `.env.local` 파일 생성
- [ ] `VITE_SUPABASE_URL` 설정
- [ ] `VITE_SUPABASE_ANON_KEY` 설정
- [ ] `.gitignore`에 `.env.local` 추가

### 개발 환경
- [ ] `@supabase/supabase-js` 설치
- [ ] 개발 서버 실행 확인
- [ ] 환경 변수 로드 확인

---

## 🆘 문제 해결 (Troubleshooting)

### 문제: "Missing Supabase environment variables" 에러

**원인**: `.env.local` 파일이 없거나 형식이 잘못됨

**해결**:
1. `.env.local` 파일이 프로젝트 **루트**에 있는지 확인
2. 파일 이름이 정확한지 확인 (`.env.local`, 점 포함)
3. 개발 서버 재시작: `Ctrl+C` 후 `npm run dev`

### 문제: Google 로그인 시 "redirect_uri_mismatch" 에러

**원인**: Google Cloud Console의 리디렉션 URI가 잘못 설정됨

**해결**:
1. Google Cloud Console > 사용자 인증 정보 확인
2. 리디렉션 URI 확인:
   ```
   https://[your-project-id].supabase.co/auth/v1/callback
   ```
3. `[your-project-id]`가 실제 프로젝트 ID와 일치하는지 확인

### 문제: 환경 변수가 `undefined`

**원인**: Vite가 환경 변수를 인식하지 못함

**해결**:
1. 환경 변수 이름이 `VITE_`로 시작하는지 확인
2. 개발 서버 완전히 재시작
3. 브라우저 캐시 삭제 (Ctrl+Shift+R)

---

## 📞 추가 도움

### Supabase 공식 문서
- 인증 가이드: https://supabase.com/docs/guides/auth
- OAuth 설정: https://supabase.com/docs/guides/auth/social-login

### 커뮤니티
- Supabase Discord: https://discord.supabase.com
- Supabase GitHub Discussions: https://github.com/supabase/supabase/discussions

---

## 🎉 완료!

모든 설정이 완료되었습니다. 이제 개발팀이 Phase 2 개발을 시작할 수 있습니다.

**다음 단계**: 개발팀에게 다음 정보 전달
- `.env.local` 파일 내용 (안전한 방법으로)
- Supabase Project URL
- 설정 완료 확인

---

**작성일**: 2025-01-18
**작성자**: Development Team
**문서 버전**: 1.0
