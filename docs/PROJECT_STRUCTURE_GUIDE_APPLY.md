# Handongjudge_FE × 프로젝트 구조 가이드 반영 가능 여부

> 2025-mileage-front 프로젝트 구조 가이드를 Handongjudge_FE에 최대한 반영할 수 있는지 정리한 문서입니다.

---

## 1. 이미 맞춰져 있는 부분

| 가이드 항목 | 현재 Handongjudge_FE | 비고 |
|-------------|----------------------|------|
| **도메인 중심 pages** | `pages/Auth/`, `pages/Course/`, `pages/TutorPage/`, `pages/SuperAdminPage/` 등 도메인별 폴더 | ✅ 가이드와 유사 |
| **페이지별 index.tsx** | 각 페이지 폴더에 `index.tsx` 진입점 | ✅ |
| **페이지 전용 components** | 예: `AssignmentManagement/ProblemModals/`, `CourseCommunityPage/QuestionCard.tsx` | ✅ 페이지 내 `components` 느낌 |
| **공통 components 그룹화** | `components/Route/`, `Layout/`, `Course/`, `Editor/`, `UI/`, `Navigation/`, `Quiz/` | ✅ 쓰임별 그룹화 완료 |
| **전역 hooks** | `hooks/useAuth.ts`, `useAssignments.ts` 등 | ✅ |
| **전역 styles** | `styles/theme.ts`, `variables.css`, `globals.css` | ✅ |
| **전역 types** | `types/index.ts` | ✅ |
| **전역 utils** | `utils/assignmentUtils.ts`, `problemUtils.ts` 등 | ✅ |
| **layouts 분리** | `layouts/TutorLayout`, `AdminLayout`, `MainLayout`, `AuthLayout` | ✅ |

---

## 2. 가이드 반영 시 이득이 큰 부분 (우선 적용 권장)

### 2.1 API 계층 분리 (`/apis`)

**가이드:** `apis/axios.ts`, `http.ts`, `config.ts`, `endPoint.ts` 분리  
**현재:** `services/APIService.ts` 한 파일에 fetch + 모든 메서드 혼재

**적용 방향:**

- `src/apis/` 폴더 생성
- `config.ts`: `BASE_URL`, 환경변수
- `axios.ts` 또는 `fetchClient.ts`: 인스턴스(또는 fetch 래퍼) + 인터셉터(401 리다이렉트, 토큰 갱신)
- `endPoint.ts`: URL 상수 (`ENDPOINT.AUTH_REGISTER`, `ENDPOINT.PROBLEMS` 등)
- `APIService.ts`는 `apis/`를 사용하는 비즈니스 메서드만 두거나, 도메인별로 `pages/*/apis/`로 나누기

**효과:** URL/에러 처리 중앙화, 테스트·유지보수 용이

---

### 2.2 상수 중앙화 (`/constants`)

**가이드:** `routePath.ts`, `queryKeys.ts`, `errorMessage.ts`, `toastMessage.ts` 등  
**현재:** 경로/메시지가 컴포넌트·페이지에 흩어져 있음

**적용 방향:**

- `src/constants/` 생성
- `routePath.ts`: `/tutor/assignments`, `/sections/:sectionId/dashboard` 등 상수화 (동적 경로는 함수로)
- `errorMessage.ts`, `toastMessage.ts`: 공통 메시지 정의 후 import 해서 사용

**효과:** 경로/메시지 변경 시 한 곳만 수정, 오타 감소

---

### 2.3 라우팅 분리 (`router.tsx`)

**가이드:** `createBrowserRouter` + 레이아웃/가드 분리  
**현재:** `App.tsx` 안에 `<Routes>` 전부

**적용 방향:**

- `src/router.tsx` (또는 `router/index.tsx`) 생성
- 라우트 배열을 router 설정으로 이동
- `App.tsx`는 `<RouterProvider router={router} />` 정도만 유지
- 필요 시 Lazy Loading 적용

**효과:** 라우트 구조 한눈에 파악, 코드 스플리팅 적용 쉬움

---

### 2.4 도메인별 apis/hooks/constants/types

**가이드:** `pages/mileage/apis/`, `pages/mileage/hooks/` 등  
**현재:** Course·Tutor 등에 `utils/`는 있으나, `apis/`, `hooks/`, `constants/`는 전역에만 있음

**적용 방향:**

- **TutorPage:** `pages/TutorPage/apis/`, `pages/TutorPage/hooks/`, `constants/`, `types/` 추가
  - 예: `useAssignments` → `pages/TutorPage/hooks/useAssignments.ts`로 이동하거나, 전역 훅은 유지하고 Tutor 전용 훅만 도메인 하위에
- **Course:** `pages/Course/apis/`, `hooks/` 등 동일하게 필요 시 추가
- API 호출 함수만 도메인별로 나누어도 가이드에 가까워짐

**효과:** 도메인 단위로 응집도 향상, 가이드의 “도메인 중심 설계”와 일치

---

## 3. 선택적으로 반영 가능한 부분

### 3.1 스타일: palette / theme

**가이드:** `styles/palette.ts` + MUI `theme`  
**현재:** `styles/theme.ts`, `variables.css`, styled-components 등 혼용

**적용:**  
- 색상/간격 등만 `palette.ts`·`variables.css`로 정리해도 됨  
- MUI 도입은 선택(대규모 변경이므로 필수 아님)

### 3.2 상태 관리: Recoil 유지

**가이드:** Zustand + persist  
**현재:** Recoil (`recoil/atoms.ts`)

**적용:**  
- Recoil 유지해도 구조 가이드와 충돌하지 않음  
- “전역 상태는 한 곳에서 관리”만 맞추면 됨

### 3.3 서비스 계층 (Amplitude / Sentry)

**가이드:** `service/amplitude/`, `service/sentry/`  
**현재:** 없음

**적용:**  
- 분석/에러 추적 도입 시 `src/service/` 아래에 두고, 가이드처럼 초기화·훅 분리하면 됨

### 3.4 에러 바운더리

**가이드:** `GlobalErrorBoundary`, `ErrorResetBoundary`, Fallback 컴포넌트  
**현재:** 전역 ErrorBoundary 없음

**적용:**  
- `components/Error/` 또는 `components/UI/ErrorBoundary/` 추가 후 App 상단에 한 번만 감싸도 가이드와 유사

### 3.5 Storybook

**가이드:** 컴포넌트별 `.stories.tsx`  
**현재:** 미사용

**적용:**  
- 새 컴포넌트부터 스토리 추가하는 식으로 점진 도입 가능

---

## 4. 현재 구조와 가이드 매핑 요약

```
가이드                    Handongjudge_FE (현재)
─────────────────────────────────────────────────────────────
apis/                     → services/APIService.ts (분리 권장)
constants/                 → 없음 (신규 생성 권장)
components/                → components/ (Route, Layout, Course 등 그룹화 완료)
pages/{domain}/            → pages/Auth, Course, TutorPage, SuperAdminPage ✅
  PageName/index.tsx       → 각 페이지 폴더/index.tsx ✅
  components/              → 페이지 내 컴포넌트/모달 등 ✅
  apis,hooks,constants     → 부분적(utils만 있는 도메인 많음) → 보강 권장
styles/                    → styles/ ✅
hooks/                     → hooks/ ✅
types/                     → types/ ✅
utils/                     → utils/ ✅
stores/ (Zustand)          → recoil/ (유지해도 무방)
router.tsx                 → App.tsx 내부 (분리 권장)
service/ (amplitude 등)    → 없음 (선택)
data/ (정적 JSON)          → 없음 (필요 시 추가)
```

---

## 5. 적용 우선순위 제안

1. **Phase 1 (빠르게)**  
   - `constants/` 추가: `routePath.ts`, `errorMessage.ts`(필요 시 `toastMessage.ts`)  
   - `apis/config.ts`, `apis/endPoint.ts` 추가 후 기존 `APIService`에서 사용

2. **Phase 2 (중기)**  
   - `router.tsx` 분리 + Lazy Loading  
   - API 계층 본격 분리: `apis/axios.ts`(또는 fetch 래퍼) + 인터셉터, `http` 래퍼

3. **Phase 3 (도메인 정리)**  
   - TutorPage/Course 등에 `apis/`, `hooks/`, `constants/` 도메인 폴더 추가  
   - 기존 전역 훅/API 중 도메인 전용은 해당 폴더로 이동

4. **선택**  
   - ErrorBoundary, Storybook, 분석/에러 서비스는 필요 시 가이드 구조대로 추가

---

## 6. 결론

- **이미 반영된 것:** 도메인별 페이지 구조, 컴포넌트 그룹화, 전역 hooks/styles/types/utils, layouts 분리  
- **최대한 반영 가능하고 이득 큰 것:** API 계층 분리(`/apis`), 상수 중앙화(`/constants`), 라우팅 분리(`router.tsx`), 도메인별 apis/hooks/constants  
- **선택:** palette/theme 정리, ErrorBoundary, Storybook, Amplitude/Sentry, Zustand 전환

가이드의 “도메인 중심 설계”, “관심사 분리”, “상수/API 중앙화” 원칙만 맞춰도 현재 구조와 잘 맞고, 위 Phase 1~2만 적용해도 구조가 많이 정리됩니다.
