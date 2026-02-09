# 페이지 리팩터 가이드 (hooks + components + 얇은 index)

모든 페이지를 **Dashboard / NoticeManagementPage**와 같은 구조로 통일합니다.

## 목표 구조

```
pages/XxxPage/
├── index.tsx          # 진입점. useXxx() 한 번 호출 + 컴포넌트 조립만 (얇게)
├── types.ts           # 해당 페이지용 타입 (이미 있으면 유지)
├── styles.ts          # styled-components (있으면 유지, 없으면 필요 시 추가)
├── hooks/
│   └── useXxx.ts      # 모든 state, useEffect, useCallback, useMemo, 핸들러
├── components/
│   ├── XxxHeader.tsx
│   ├── XxxFilters.tsx
│   ├── XxxTable.tsx
│   └── ...            # 모달, 카드, 폼 등 UI 단위
└── utils/             # (선택) 순수 유틸만
```

## 규칙

1. **index.tsx**
   - `import { useXxx } from "./hooks/useXxx";` + 컴포넌트 import
   - 훅 한 번 호출 후, `loading`이면 로딩 UI, 아니면 Layout > Container 안에 **컴포넌트만** 배치
   - 비즈니스 로직·state·effect는 index에 두지 않음

2. **hooks/useXxx.ts**
   - 해당 페이지에서 쓰는 모든 `useState`, `useEffect`, `useCallback`, `useMemo` 이동
   - API 호출, 필터/정렬 계산, 모달 open/close, 저장/삭제 등 핸들러 전부 포함
   - 반환: `{ ...state, ...computed, ...handlers }`

3. **components/**
   - props로만 데이터·핸들러 받음 (직접 API/전역 상태 호출 지양)
   - 스타일은 `../styles` (`* as S`) 또는 페이지용 CSS (Tutor 규칙: 페이지 컨테이너로 스코프)

4. **types.ts**
   - 페이지/도메인 전용 타입만. 이미 있으면 그대로 두고 훅/컴포넌트에서 import

## 적용 대상 (우선순위: 줄 수 기준)

### ✅ 완료된 페이지
| 페이지 | 비고 |
|--------|------|
| TutorPage/Dashboard | hooks + components + 얇은 index |
| TutorPage/Notices/NoticeManagementPage | hooks + NoticeHeader, NoticeTable + 얇은 index |
| TutorPage/Users/UserManagement | hooks/useUserManagement + 기존 헤더/필터/테이블/모달 유지, 얇은 index |
| TutorPage/Settings/SettingsPage | hooks + SettingsContent + 얇은 index |
| TutorPage/Notifications/CourseNotificationManagement | hooks + 기존 Header/Filters/List/Pagination, 얇은 index |
| TutorPage/Notices/NoticeCreatePage | hooks + NoticeCreateForm + 얇은 index |
| TutorPage/Notices/NoticeEditPage | hooks + NoticeEditForm + 얇은 index |
| TutorPage/Assignments/AssignmentCreatePage | hooks + AssignmentCreateForm + 얇은 index |
| TutorPage/Assignments/AssignmentStudentProgress | hooks + ProgressListView/ProgressDetailView + 얇은 index |
| TutorPage/Assignments/AssignmentEditPage | hooks + AssignmentEditForm + 얇은 index |
| TutorPage/Problems/ProblemSetManagement | hooks + ProblemSetManagementView + 얇은 index |
| TutorPage/Problems/ProblemSetEdit | hooks + ProblemSetEditView + 얇은 index |
| TutorPage/CodingTests/CodingTestDetail | hooks + CodingTestDetailView + 얇은 index |
| AssignmentPage/ProblemSolvePage | hooks + utils + ProblemSolveView + 얇은 index |
| Course/CodingQuiz/CodingQuizSolvePage | hooks + CodingQuizSolveView + 얇은 index |

### 🔲 남은 페이지 (동일 패턴 적용)
| 순위 | 페이지 | 줄 수 |
|------|--------|-------|
| 1 | TutorPage/Grades/GradeManagement | 2140 |
| 2 | TutorPage/CodingTests/CodingTestManagement | 1670 |
| 3 | TutorPage/Problems/ProblemEdit | 1548 |
| 4 | TutorPage/Problems/ProblemManagement | 1198 |
| 5 | TutorPage/Assignments/AssignmentManagement | 1070 |
| 6 | TutorPage/Problems/ProblemCreate | 1018 |
| 7 | AssignmentManagement/ProblemModals/ProblemListModal | 716 |
| 8 | Course/Dashboard/CourseDashboardPage | 745 |
| ... | 그 외 (ClassPage, CourseCommunity, Auth 페이지 등) | 200~500 |

## 페이지별 작업 체크리스트

- [ ] `types.ts` 정리 (없으면 추가, 있으면 훅/컴포넌트에서만 사용)
- [ ] `hooks/useXxx.ts` 생성 후 state/effect/핸들러 전부 이동
- [ ] `components/` 분리 (Header, Filters, Table/List, Modals 등)
- [ ] `index.tsx`를 훅 1회 호출 + 컴포넌트 조립만 남기기
- [ ] import 경로 및 CSS 스코프(Tutor 페이지) 확인

## 참고 예시

- **진입점만 보기**: `src/pages/TutorPage/Dashboard/index.tsx`
- **훅 패턴**: `src/pages/TutorPage/Dashboard/hooks/useDashboard.ts`
- **컴포넌트 조립**: `src/pages/TutorPage/Notices/NoticeManagementPage/index.tsx`

## 다음에 할 일

1. **한 번에 한 페이지씩** 적용: 위 표에서 줄 수 많은 순서대로 진행 (GradeManagement → CodingTestManagement → …).
2. 각 페이지에서:
   - `hooks/useXxx.ts` 생성 후 기존 `index.tsx`에서 state/effect/핸들러 잘라서 이동.
   - UI를 `components/`로 분리 (헤더, 필터, 테이블/리스트, 모달 등).
   - `index.tsx`는 훅 1회 호출 + 위 컴포넌트만 렌더하도록 수정.
3. Tutor 페이지는 `.cursorrules`의 CSS 스코프 규칙 유지 (페이지 컨테이너 클래스로 스코프).
