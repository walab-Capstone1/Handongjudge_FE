# Handongjudge FE — 파일 구조 정리 및 브랜치 비교

> **현재 브랜치:** `refactor/src/issue-88/fourthmodified`  
> **비교 대상 브랜치:** `feat/src/issue-65/indexPage`  
> 교수님께 리팩토링 내용 전달용 정리 문서입니다.

---

## 1. 현재 브랜치 전체 파일 구조 (refactor/src/issue-88/fourthmodified)

- **언어:** TypeScript(TS/TSX) 중심, 스타일은 `styles.ts`(styled-components) + 일부 CSS
- **파일 수:** src 기준 약 **371개** (ts/tsx/css)
- **구조 원칙:** 도메인별 폴더, 페이지당 `index.tsx` + `hooks/` + `components/` + `styles.ts` + `types.ts` 분리

### 1.1 루트 및 공통 디렉터리

```
src/
├── App.tsx
├── index.tsx
├── index.css
├── components/          # 공통 UI/레이아웃 컴포넌트
├── hooks/               # 전역 훅
├── layouts/             # 레이아웃 (Admin, Auth, Main, Tutor)
├── pages/               # 페이지 단위 (도메인별 하위 폴더)
├── recoil/
├── services/            # APIService 등
├── styles/              # 전역 스타일 (globals.css, theme, variables)
├── types/
└── utils/
```

### 1.2 components/ 구조

| 디렉터리 | 역할 | 예시 파일 |
|----------|------|-----------|
| **Course/** | 코스 관련 공통 UI | CourseCard, CourseHeader, CourseSidebar |
| **Editor/** | 에디터 | TipTapEditor |
| **Layout/** | 레이아웃 조각 | Breadcrumb, Footer, Header, Navbar |
| **Navigation/** | 네비게이션/페이지네이션 | Pagination, SectionNavigation |
| **Quiz/** | 퀴즈 UI | QuizTimer |
| **Route/** | 라우트 가드 | AdminRoute, SuperAdminRoute |
| **Tutor/** | 튜터 전용 | TutorHeader, TutorNotificationPanel |
| **UI/** | 공통 UI | Alert, EmptyState, LoadingSpinner, SubmissionHistory |

- 각 컴포넌트는 `index.tsx` + `styles.ts`(및 필요 시 `types.ts`) 패턴.

### 1.3 layouts/

- **AdminLayout**, **AuthLayout**, **MainLayout**, **TutorLayout**
- 각각 `index.tsx`, `styles.ts`, `types.ts` 보유.

### 1.4 pages/ — 도메인별 구조

#### Auth (로그인·회원가입·인덱스)

```
pages/Auth/
├── AuthCallback/        # OAuth 콜백
├── EnrollPage/          # 수강 신청
├── IndexPage/           # 메인(랜딩) — Silk/ 서브 컴포넌트 포함
├── LoginPage/
├── SignUpPageSocial/
└── SignupEmailPage/
```

- 각 페이지: `index.tsx`, `components/`, `hooks/`, `styles.ts`, `types.ts` (및 필요 시 `utils/`).

#### AssignmentPage (과제 풀이)

```
pages/AssignmentPage/
└── ProblemSolvePage/    # 문제 풀이 페이지
    ├── components/
    ├── hooks/
    ├── utils/
    ├── index.tsx, styles.ts, types.ts
```

#### Course (수강·코스 관련)

```
pages/Course/
├── Assignments/         # CourseAssignmentsPage
├── ClassPage/           # 섹션(주차)별 클래스
├── CodingQuiz/          # 코딩 퀴즈
│   ├── CodingQuizPage/
│   └── CodingQuizSolvePage/
├── Community/           # 커뮤니티·질문
│   ├── CourseCommunityPage/
│   ├── QuestionCreatePage/
│   ├── QuestionDetailPage/
│   └── QuestionEditPage/
├── Dashboard/           # CourseDashboardPage
├── Notices/             # 공지 (CourseNoticesPage, CourseNoticeDetailPage)
└── Notifications/       # CourseNotificationsPage
```

- 공통 패턴: 페이지 폴더 안에 `index.tsx`, `components/`, `hooks/`, `styles.ts`, `types.ts`, 필요 시 `utils/`.

#### SuperAdminPage (슈퍼관리자)

```
pages/SuperAdminPage/
├── SuperAdminCourseManagement/
├── SuperAdminDashboard/
├── SuperAdminProblemManagement/
├── SuperAdminSubmissionManagement/
├── SuperAdminUserManagement/
├── SystemGuideManagement/
└── SystemNoticeManagement/
```

- 각 기능별로 `index.tsx`, `components/`, `hooks/`, `types.ts` 등 분리.

#### TutorPage (튜터·관리자 기능)

```
pages/TutorPage/
├── Assignments/         # 과제 생성/수정/관리, 학생별 진행현황
│   ├── AssignmentCreatePage/
│   ├── AssignmentEditPage/
│   ├── AssignmentManagement/   # 모달·뷰·문제 모달 등 다수 서브폴더
│   └── AssignmentStudentProgress/
├── CodingTests/        # CodingTestDetail, CodingTestManagement
├── Dashboard/          # 섹션 대시보드 (모달·필터·헤더 등)
├── Grades/             # GradeManagement
├── Notices/             # NoticeCreate/Edit/Management
├── Notifications/      # CourseNotificationManagement
├── Problems/            # 문제·문제집 CRUD
│   ├── ProblemCreate/
│   ├── ProblemEdit/
│   ├── ProblemManagement/
│   ├── ProblemSetEdit/
│   └── ProblemSetManagement/
├── Settings/           # SettingsPage
└── Users/              # UserManagement
```

- 복잡한 페이지(예: AssignmentManagement)는 `AssignmentModals/`, `AssignmentViews/`, `ProblemModals/` 등으로 세분화.

### 1.5 기타 src 하위

- **hooks/** — useAuth, useAssignments, useAssignmentData, useAssignmentProblems, useSubmissionStats
- **services/** — APIService.ts
- **recoil/** — atoms.ts
- **styles/** — globals.css, theme.ts, variables.css
- **types/** — index.ts
- **utils/** — assignmentUtils, dateUtils, IndexedDBManager, markdownToHtml, problemUtils, tokenManager, urlUtils 등

---

## 2. 비교 대상 브랜치 구조 (feat/src/issue-65/indexPage)

- **언어:** JavaScript(JS) + CSS
- **파일 수:** src 기준 **89개**
- **구조:** 페이지/기능당 **단일 파일**(.js + .css) 위주, 도메인 폴더 계층이 거의 없음.

### 2.1 루트 및 공통

```
src/
├── App.js
├── index.js
├── index.css
├── components/          # 단일 파일 컴포넌트 (.js + .css)
├── hooks/               # useAssignmentData.js, useAuth.js
├── layouts/             # AdminLayout, AuthLayout, MainLayout (.js / .css)
├── pages/               # 대부분 단일 .js + .css (도메인 폴더 없음)
├── recoil/atoms.js
├── services/APIService.js
└── utils/               # IndexedDBManager, dateUtils, problemUtils, tokenManager, urlUtils
```

### 2.2 components/ (issue-65)

- **단일 파일:** AdminRoute.js, AssignmentHeader.js, Button.js, CodeEditor.js(+.css), CourseCard.js(+.css), DraggablePanel.js(+.css), ErrorMessage.js, ExecutionResult.js(+.css), Header.js, LoadingSpinner.js, Navbar.js(+.css), ProblemDescription.js(+.css), ProblemItem.js(+.css), ProblemsList.js, SectionNavigation.js(+.css), Silk.js, WeekCard.js(+.css) 등
- **폴더/타입 분리 없음**, 스타일도 페이지·컴포넌트별 CSS 파일.

### 2.3 pages/ (issue-65)

- **AdminPage:** AdminDashboard, AssignmentManagement, AssignmentStudentProgress, CourseManagement, NoticeManagement, UserManagement (각 .js + .css)
- **AssignmentPage:** AssignmentCard, AssignmentDetailPage, AssignmentListPage, ProblemCard, ProblemSolvePage (각 .js + .css)
- **기타 페이지:** EnrollPage, IndexPage, MainPage, MyPage(MyAssignmentsPage, MyInfoPage), NoticePage/NoticeList, NoticeDetailPage, Onboarding, QuestionPage, SectionDetailPage, SignUpPageSocial, SignupEmailPage, SignupPage, login/AuthCallback
- **공통점:** 페이지당 1~2개 파일(.js, .css), `index.tsx`·`hooks`·`components`·`types` 분리 없음.

---

## 3. 어떻게 바뀌었는지 (요약)

| 구분 | feat/src/issue-65/indexPage | refactor/src/issue-88/fourthmodified (현재) |
|------|------------------------------|---------------------------------------------|
| **언어** | JS + CSS | TS/TSX + styles.ts(styled-components) + 일부 CSS |
| **파일 수** | 약 89개 | 약 371개 (페이지·역할별 분리로 증가) |
| **페이지 구조** | 페이지당 1개 .js + 1개 .css | 페이지 폴더 + `index.tsx` + `hooks/` + `components/` + `styles.ts` + `types.ts` |
| **도메인 폴더** | 거의 없음 (pages 하위가 평탄) | Auth, Course, AssignmentPage, SuperAdminPage, TutorPage 등 도메인별 계층 |
| **컴포넌트** | 단일 .js/.css 파일 다수 | components를 Course/Layout/UI/Route 등 용도별 폴더로 그룹화, 컴포넌트당 index + styles (+ types) |
| **레이아웃** | JS + CSS | layouts/ 유지하되 TS/TSX + styles.ts + types.ts |
| **공통 리소스** | hooks, utils, services만 | hooks, utils, services, styles, types, recoil 유지하고 확장 |
| **네이밍** | 페이지명 그대로 (예: IndexPage.js) | 도메인/기능 폴더 (예: Auth/IndexPage/, Course/Dashboard/CourseDashboardPage/) |

### 3.1 구조 변경 요약 (교수님께 말씀드리실 때)

1. **도메인 중심으로 재구성**
   - 예: 로그인·회원가입·인덱스 → `Auth/` 아래에 IndexPage, LoginPage, SignupEmailPage 등으로 묶음.
   - 수강·코스 관련 → `Course/` 아래 Assignments, ClassPage, CodingQuiz, Community, Dashboard, Notices, Notifications 등으로 묶음.
   - 튜터 기능 → `TutorPage/` 아래 Assignments, CodingTests, Dashboard, Grades, Notices, Problems, Settings, Users 등으로 묶음.

2. **페이지 단위로 역할 분리**
   - 각 페이지를 **폴더**로 만들고, 그 안에
     - **index.tsx** (진입점),
     - **hooks/** (데이터/상태 로직),
     - **components/** (해당 페이지 전용 UI),
     - **styles.ts** (styled-components),
     - **types.ts** (타입 정의),
     - 필요 시 **utils/** 까지 두는 방식으로 통일했습니다.

3. **TypeScript 전환**
   - 기존 .js/.css를 TS/TSX와 `styles.ts`(또는 일부 CSS)로 옮기고, 타입을 `types.ts` 등에 정의해 유지보수와 리팩터링을 쉽게 했습니다.

4. **공통 컴포넌트 정리**
   - 컴포넌트를 Layout, Course, UI, Route, Navigation, Quiz, Tutor 등 **역할별 폴더**로 나누고, 각 컴포넌트는 `index.tsx` + `styles.ts` 패턴으로 통일했습니다.

5. **파일 수 증가 이유**
   - 한 페이지를 하나의 .js가 아니라 `index` + `hooks` + 여러 `components` + `styles` + `types`로 쪼갰기 때문에 파일 수가 늘었고, 그만큼 **기능별·역할별로 찾기 쉽고 수정 범위를 줄일 수 있게** 되었습니다.

---

## 4. 대응 관계 (예시)

| issue-65 (예전) | 현재 (fourthmodified) |
|------------------|------------------------|
| `pages/IndexPage.js` | `pages/Auth/IndexPage/index.tsx` + hooks, components, styles, types |
| `pages/LoginPage` (없음, login 쪽) | `pages/Auth/LoginPage/` 폴더 전체 |
| `pages/AdminPage/*.js` | `pages/SuperAdminPage/` 하위 + `pages/TutorPage/` 일부 (역할 재분리) |
| `pages/AssignmentPage/ProblemSolvePage.js` | `pages/AssignmentPage/ProblemSolvePage/` 폴더 (index, hooks, components, utils 등) |
| `components/Header.js` | `components/Layout/Header/index.tsx` + styles.ts |
| `components/LoadingSpinner.js` | `components/UI/LoadingSpinner/index.tsx` + styles.ts |

---

이 문서는 `refactor/src/issue-88/fourthmodified` 기준 현재 구조와 `feat/src/issue-65/indexPage` 브랜치와의 차이를 정리한 것입니다.  
추가로 특정 경로나 페이지만 따로 정리해 드리고 싶으시면 말씀해 주세요.
