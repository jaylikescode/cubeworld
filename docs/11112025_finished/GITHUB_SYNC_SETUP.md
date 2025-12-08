# GitHub 자동 동기화 설정 가이드

## 📋 개요

이 가이드는 `jaylikescode/cubeworld` (원본) → `fromsnowman2014/cubeworld` (Vercel 배포용) 자동 동기화를 설정하는 방법을 설명합니다.

### 동작 방식

1. `jaylikescode/cubeworld`의 `main` 브랜치에 push
2. GitHub Actions가 자동으로 실행
3. `fromsnowman2014/cubeworld`에 자동으로 동기화
4. Vercel이 자동으로 재배포

⏱️ **소요 시간**: 약 5분

---

## 🔑 Step 1: Personal Access Token (PAT) 생성

GitHub Personal Access Token을 생성해야 합니다.

### 1.1 GitHub 설정 페이지 접속

1. GitHub 로그인
2. 우측 상단 프로필 클릭
3. **Settings** 클릭
4. 좌측 메뉴 맨 아래 **Developer settings** 클릭
5. **Personal access tokens** → **Tokens (classic)** 클릭

또는 직접 접속: https://github.com/settings/tokens

### 1.2 새 토큰 생성

1. **Generate new token** → **Generate new token (classic)** 클릭
2. 토큰 설정:
   - **Note**: `cubeworld-sync` (또는 원하는 이름)
   - **Expiration**: `No expiration` (만료 없음) 또는 원하는 기간
   - **Select scopes** (권한 선택):
     - ✅ `repo` (전체 체크) - 리포지토리 전체 접근 권한
       - ✅ repo:status
       - ✅ repo_deployment
       - ✅ public_repo
       - ✅ repo:invite
       - ✅ security_events

3. 맨 아래 **Generate token** 클릭

### 1.3 토큰 복사 및 저장

⚠️ **중요**: 토큰은 **단 한 번만** 표시됩니다!

1. 생성된 토큰 복사 (예: `ghp_xxxxxxxxxxxxxxxxxxxx`)
2. 안전한 곳에 임시 저장 (메모장 등)

---

## 🔒 Step 2: jaylikescode/cubeworld에 Secret 추가

### 2.1 리포지토리 설정 페이지 접속

1. https://github.com/jaylikescode/cubeworld 접속
2. **Settings** 탭 클릭
3. 좌측 메뉴에서 **Secrets and variables** → **Actions** 클릭

### 2.2 Secret 추가

1. **New repository secret** 클릭
2. Secret 설정:
   - **Name**: `UPSTREAM_PAT` (정확히 이대로 입력!)
   - **Secret**: 복사한 Personal Access Token 붙여넣기
3. **Add secret** 클릭

✅ 완료! Secret이 추가되었습니다.

---

## 🧪 Step 3: 동작 테스트

### 3.1 자동 테스트 (권장)

workflow 파일이 이미 커밋되어 있다면, 다음 push부터 자동으로 동기화됩니다.

### 3.2 수동 테스트

테스트용 커밋을 만들어 봅시다:

```bash
# 테스트 파일 생성
echo "# GitHub Sync Test" > test-sync.md

# 커밋 및 push
git add test-sync.md
git commit -m "test: verify GitHub Actions sync"
git push origin main
```

### 3.3 실행 확인

1. https://github.com/jaylikescode/cubeworld/actions 접속
2. **Sync to Upstream (fromsnowman2014)** workflow 확인
3. 진행 상황 모니터링
4. ✅ 초록색 체크마크가 뜨면 성공!

### 3.4 결과 확인

1. https://github.com/fromsnowman2014/cubeworld 접속
2. 최신 커밋이 동기화되었는지 확인
3. Vercel 대시보드에서 자동 배포 확인

---

## 🎯 사용 방법

### 일상적인 개발 워크플로우

```bash
# 1. 코드 수정
# 2. 테스트 실행
npm test

# 3. jaylikescode/cubeworld에만 push
git add .
git commit -m "feat: add new feature"
git push origin main

# 4. 끝! 자동으로 동기화됨
# - GitHub Actions가 자동 실행
# - fromsnowman2014/cubeworld에 자동 push
# - Vercel이 자동 배포
```

### 이전 방식 (수동)과 비교

**이전:**
```bash
git push origin main      # jaylikescode
git push upstream main    # fromsnowman2014
```

**이후:**
```bash
git push origin main      # jaylikescode만
# upstream은 자동으로 동기화! 🎉
```

---

## ⚙️ 고급 설정

### Workflow 파일 위치

`.github/workflows/sync-to-upstream.yml`

### 동기화 타이밍 변경

기본적으로 `main` 브랜치에 push할 때만 동기화됩니다.

다른 브랜치도 추가하려면:

```yaml
on:
  push:
    branches:
      - main
      - develop  # develop 브랜치도 추가
```

### 수동 실행 활성화

workflow를 수동으로 실행하고 싶다면:

```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:  # 이 줄 추가
```

그러면 GitHub Actions 페이지에서 "Run workflow" 버튼이 생깁니다.

---

## 🔍 문제 해결

### ❌ Workflow가 실행되지 않는 경우

**원인 1**: Secret이 제대로 설정되지 않음
- **해결**: Step 2 다시 확인

**원인 2**: Workflow 파일이 커밋되지 않음
- **해결**: `.github/workflows/sync-to-upstream.yml` 파일 존재 확인

**원인 3**: GitHub Actions가 비활성화됨
- **해결**: Settings → Actions → General → "Allow all actions" 확인

### ❌ "Authentication failed" 에러

**원인**: PAT 권한 부족 또는 만료
- **해결**:
  1. PAT 재생성 (Step 1)
  2. `repo` 전체 권한 확인
  3. Secret 업데이트 (Step 2)

### ❌ "Push failed" 에러

**원인**: 강제 push 문제 또는 브랜치 보호
- **해결**:
  1. fromsnowman2014/cubeworld Settings 확인
  2. Branch protection rules에서 "Allow force pushes" 활성화
  3. 또는 workflow에서 `--force-with-lease` 제거

### ⚠️ Workflow는 성공했지만 동기화 안 됨

**원인**: 네트워크 타임아웃 또는 일시적 오류
- **해결**:
  1. GitHub Actions 페이지에서 "Re-run jobs" 클릭
  2. 또는 더미 커밋으로 재시도:
     ```bash
     git commit --allow-empty -m "chore: trigger sync"
     git push origin main
     ```

---

## 📊 모니터링

### Actions 페이지에서 확인

- **URL**: https://github.com/jaylikescode/cubeworld/actions
- **확인 사항**:
  - ✅ 초록색: 성공
  - ❌ 빨간색: 실패 (로그 확인 필요)
  - 🟡 노란색: 진행 중

### 이메일 알림

GitHub Actions 실패 시 자동으로 이메일 발송됩니다.

---

## 🎉 완료!

이제 `jaylikescode/cubeworld`에만 push하면 자동으로 `fromsnowman2014/cubeworld`에 동기화되고, Vercel이 자동 배포합니다!

**장점:**
- ✅ 수동 작업 제거
- ✅ 실수 방지
- ✅ 완전 자동화
- ✅ 개발 속도 향상

**질문이나 문제가 있으면:**
- GitHub Actions 로그 확인
- 이 문서의 "문제 해결" 섹션 참고
- GitHub Issues에 질문 등록

---

## 📚 참고 자료

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Personal Access Tokens 가이드](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Secrets 관리](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**작성일**: 2025-11-16
**버전**: 1.0
**작성자**: Claude Code
