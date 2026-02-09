# 성적 관리(Grades) 전체 로직 정리

> 백엔드(Handongjudge_BE)와 프론트엔드(Handongjudge_FE)의 성적·배점 관련 구조와 UI 흐름을 정리한 문서입니다.

---

## 1. 개요

- **화면**: 튜터가 분반(section)별로 **과제(assignment)** 와 **퀴즈(코딩 테스트, quiz)** 의 성적을 조회·입력·수정하고, 문제별 **배점(points)** 을 설정하는 페이지.
- **경로**: `Handongjudge_FE` → `/tutor/grades/section/:sectionId` (성적 관리)
- **백엔드**: 과제 성적은 `grade` 패키지, 퀴즈 성적은 `quiz` 패키지에서 처리. 배점은 각각 AssignmentProblem / QuizProblem 의 `points` 필드로 저장.

---

## 2. 백엔드(BE) 구조

### 2.1 과제(Assignment) 성적·배점

| 구분 | 경로/엔티티 | 설명 |
|------|-------------|------|
| **컨트롤러** | `GradeController` | `@RequestMapping("/api/sections/{sectionId}/assignments/{assignmentId}/grades")` |
| **엔티티** | `Grade` | assignment_id + problem_id + user_id 유일. `points`(배점), `score`(입력 점수), `comment`, `gradedBy`, `gradedAt` |
| **배점 저장소** | `AssignmentProblem` | 과제-문제 연결. `points` 필드로 문제별 배점 저장 (기본 1점) |

**API 목록 (과제)**

| Method | URL | 용도 |
|--------|-----|------|
| GET | `.../grades` | 과제별 전체 학생 성적 조회 → `List<StudentGradeSummaryDTO>` |
| GET | `.../grades/students/{userId}` | 학생별 과제 성적 조회 |
| POST | `.../grades` | 단일 문제 성적 저장 (GradeRequestDTO: userId, problemId, score, comment) |
| POST | `.../grades/bulk` | 일괄 성적 저장 (BulkGradeRequestDTO) |
| PUT | `.../grades/problems/{problemId}/points` | 단일 문제 배점 설정 (body: `{ "points": number }`) |
| PUT | `.../grades/points/bulk` | 과제 내 모든 문제 배점 일괄 설정 (body: `Map<problemId, points>`) |

**응답 DTO**  
- `StudentGradeSummaryDTO`: userId, studentName, studentId, **problemGrades**(List), totalScore, totalPoints, gradeRatio  
- `ProblemGradeDTO`: problemId, problemTitle, **points**, **score**, submitted, submittedAt, isOnTime, result  

과제 성적 조회 시 `GradeService`에서 `Grade` 테이블 + `AssignmentProblem.points` + 제출(Submission) 정보를 합쳐서 위 DTO로 반환.

---

### 2.2 퀴즈(Quiz) 성적·배점

| 구분 | 경로/엔티티 | 설명 |
|------|-------------|------|
| **컨트롤러** | `QuizController` | `@RequestMapping("/api/sections/{sectionId}/quizzes")` 아래에 grades/points API |
| **엔티티** | `QuizGrade` | 퀴즈용 수동 입력 성적 (quiz, problem, student, points, score, comment, gradedBy 등) |
| **배점 저장소** | `QuizProblem` | 퀴즈-문제 연결. `points` 필드로 문제별 배점 (기본 1점) |

**API 목록 (퀴즈)**

| Method | URL | 용도 |
|--------|-----|------|
| GET | `.../quizzes/{quizId}/grades` | 퀴즈별 전체 학생 성적 조회 → `List<StudentGradeSummaryDTO>` (과제와 동일 DTO) |
| POST | `.../quizzes/{quizId}/grades` | 단일 퀴즈 성적 저장 (QuizGradeRequestDTO) |
| POST | `.../quizzes/{quizId}/grades/bulk` | 퀴즈 일괄 성적 저장 |
| PUT | `.../quizzes/{quizId}/grades/problems/{problemId}/points` | 퀴즈 문제 단일 배점 설정 |
| PUT | `.../quizzes/{quizId}/grades/points/bulk` | 퀴즈 문제 배점 일괄 설정 (body: `Map<problemId, points>`, **problemId = Problem.id**) |
| GET | `.../quizzes/{quizId}/students/{userId}/problems/{problemId}/accepted-code` | 퀴즈 제출 코드 조회 (StudentAcceptedCodeResponse) |

퀴즈 성적 조회 시 `QuizService.getQuizGrades`에서 `QuizProblem.points`, `QuizGrade`, 제출(Submission) 정보를 합쳐 `StudentGradeSummaryDTO` 형태로 반환.

---

### 2.3 기타 관련 API (프론트에서 사용)

- **과제 목록**: `GET /api/sections/{sectionId}/assignments` → AssignmentController
- **과제 문제 목록(배점 포함)**: `GET /api/sections/{sectionId}/assignments/{assignmentId}/problems` → AssignmentController
- **퀴즈 목록**: `GET /api/sections/{sectionId}/quizzes` → QuizController
- **퀴즈 문제 목록(배점 포함)**: `GET /api/sections/{sectionId}/quizzes/{quizId}/problems` → QuizController → `List<QuizProblemDto>` (id, problemId, title, problemOrder, points)
- **과제 제출 코드**: `GET /api/sections/.../assignments/{assignmentId}/students/{userId}/problems/{problemId}/accepted-code` → AssignmentController

---

## 3. 프론트엔드(FE) 구조

### 3.1 진입점·라우팅

- **페이지**: `Handongjudge_FE/src/pages/TutorPage/Grades/` 아래에서 성적 관리 화면으로 라우팅.
- **성적 관리 뷰**: `GradeManagement/index.tsx`  
  - `useGradeManagement()` 훅으로 상태·API·핸들러 모두 취득 후 `GradeManagementView`에 props로 전달.

### 3.2 훅: `useGradeManagement.ts`

**역할**  
- 분반(sectionId) 기준 과제/퀴즈 목록 조회, 성적 조회, 배점 저장, 일괄 입력, 수업 전체 성적 조회 등 **전부 이 훅에서 처리**.

**주요 상태**

| 상태 | 타입 | 용도 |
|------|------|------|
| assignments, quizzes | AssignmentItem[], QuizItem[] | 현재 분반의 과제/퀴즈 목록 (API로 로드) |
| viewMode | "assignment" \| "quiz" \| "course" | 과제별 보기 / 퀴즈별 보기 / 수업 전체 보기 |
| selectedAssignment, selectedQuiz | Item \| null | 선택된 과제/퀴즈 (과제별·퀴즈별 보기에서 사용) |
| grades | StudentGradeRow[] | 선택된 과제 또는 퀴즈의 **전체 학생 성적** (getAssignmentGrades / getQuizGrades 결과) |
| courseGrades | CourseGradesData \| null | **수업 전체 보기**용: items(과제+퀴즈) + students(학생별 assignments/quizzes 점수) |
| editingGrade, gradeInputs, comments | ... | 셀 편집 시 편집 중인 셀, 입력값, 코멘트 |
| showPointsModal, allAssignmentProblems, allQuizProblems, pointsInputs | ... | 배점 설정 모달 표시 여부, 과제/퀴즈별 문제 목록, 문제별 배점 입력값 |
| showBulkModal, bulkInputs | ... | 일괄 입력 모달·입력값 |
| showCodeModal, selectedCode | ... | 제출 코드 모달·표시할 코드 |

**주요 데이터 로드 흐름**

1. **초기 로드** (`fetchData`)  
   - `getAssignmentsBySection(sectionId)` → setAssignments  
   - `getQuizzesBySection(sectionId)` → setQuizzes  

2. **과제별 성적** (`fetchGrades`)  
   - `selectedAssignment` 있을 때만  
   - `getAssignmentGrades(sectionId, selectedAssignment.id)` → setGrades  

3. **퀴즈별 성적** (`fetchQuizGrades`)  
   - `selectedQuiz` 있을 때만  
   - `getQuizGrades(sectionId, selectedQuiz.id)` → setGrades  

4. **수업 전체 성적** (`fetchCourseGrades`)  
   - assignments + quizzes가 있을 때  
   - 과제별로 `getAssignmentGrades` 호출, 퀴즈별로 `getQuizGrades` 호출 후  
   - 결과를 **items**(과제/퀴즈별 문제·총점·마감) + **students**(학생별 assignments/quizzes 점수) 구조로 가공 → setCourseGrades  

**배점 설정 모달용 문제 로드**

- 모달 열릴 때(`showPointsModal` true) useEffect에서:
  - **수업 전체 / 과제별 / 퀴즈별** 보기 모두 고려해,
  - `viewMode === "course"` 또는 `"quiz"`일 때: 퀴즈마다 `getQuizProblems` 호출 → allQuizProblems 설정 (quizId 기준·동일 제목 중복 제거, 문제는 problemId 기준 중복 제거).
  - 과제는 allAssignmentProblems에 동일 방식으로 로드.
  - 단일 과제/퀴즈 선택 시에는 assignmentProblems만 로드 (getAssignmentProblems / getQuizProblems 한 번씩).

**저장·액션 핸들러 (요약)**

- `handleSavePoints`: 배점 저장. allAssignmentProblems/allQuizProblems 있으면 과제·퀴즈 각각 bulk API 호출. 퀴즈는 **problemId = Problem.id**로 보냄.
- `handleSaveGradeForAssignment`, `handleSaveGradeForQuiz`, `handleSaveGradeForQuizCourse`: 단일 문제 성적 저장 (과제/퀴즈/수업 전체 보기 퀴즈 셀).
- `handleViewCodeForAssignment`, `handleViewCodeForQuiz`: 제출 코드 조회 후 모달에 표시.
- `handleBulkSave`: 일괄 성적 저장 (과제 또는 퀴즈 bulk API).
- CSV 내보내기, 통계 등은 동일 훅 내에서 courseGrades/grades 기반으로 계산.

### 3.3 API 연동: `APIService.ts`

성적·배점 관련 메서드만 정리.

- **과제**: getAssignmentsBySection, getAssignmentProblems, getAssignmentGrades, saveGrade, saveBulkGrades, setProblemPoints, setBulkProblemPoints, getStudentAcceptedCode  
- **퀴즈**: getQuizzesBySection, getQuizProblems, getQuizGrades, saveQuizGrade, setBulkQuizProblemPoints, getStudentQuizAcceptedCode  
- URL은 위 백엔드 API와 1:1 대응 (예: `/sections/${sectionId}/assignments/${assignmentId}/grades` 등).

### 3.4 타입: `types.ts`

- **AssignmentItem, QuizItem**: 목록/선택용.
- **ProblemGrade, StudentGradeRow**: API의 problemGrades·학생별 성적 행.
- **ViewMode**: "assignment" | "quiz" | "course".
- **CourseGradeItem, CourseStudentEntry, CourseGradesData**: 수업 전체 보기용 items + students.
- **EditingGrade**: 편집 중인 셀 (userId, problemId, assignmentId?, quizId?).
- **AllAssignmentProblemsEntry, AllQuizProblemsEntry**: 배점 모달용 과제/퀴즈별 문제 목록.

---

## 4. UI 구성 (어디서 무엇이 보이는지)

### 4.1 상단: `GradeManagementHeader`

- 검색(이름, 학번), **보기 모드** 탭(과제별 보기 / 퀴즈별 보기 / 수업 전체 보기).
- 과제별·퀴즈별일 때만 **과제/퀴즈 선택** 드롭다운.
- **배점 설정**, **일괄 입력**, **통계**, **내보내기** 버튼 (보기 모드·데이터 유무에 따라 활성화).

### 4.2 테이블 (viewMode·선택에 따라 1개만 렌더)

| 조건 | 사용 컴포넌트 | 데이터 소스 | 비고 |
|------|----------------|-------------|------|
| viewMode === "course" | GradeManagementCourseTable | courseGrades, filteredCourseStudents | 과제+퀴즈 모두 표시. 편집·코드 보기 핸들러 전달 |
| viewMode === "assignment" && !selectedAssignment | GradeManagementCourseTable | assignmentOnlyGrades (courseGrades에서 type===assignment만) | 과제만. 편집·코드 보기 |
| viewMode === "quiz" && !selectedQuiz | GradeManagementCourseTable | quizOnlyGrades (courseGrades에서 type===quiz만) | 퀴즈만. 편집·코드 보기 |
| viewMode === "quiz" && selectedQuiz && grades.length > 0 | GradeManagementQuizTable | grades, selectedQuiz | 단일 퀴즈 테이블. 편집·코드 보기 |
| viewMode === "assignment" && selectedAssignment && grades.length > 0 | GradeManagementAssignmentTable | grades, selectedAssignment | 단일 과제 테이블. 편집·코드 보기 |

- **CourseTable**: 행=학생, 열=과제/퀴즈별 문제+총점. 셀에 점수(획득/배점), 연필(편집), 코드 아이콘(제출 코드), 제출 기한 등 표시.
- **AssignmentTable / QuizTable**: 행=학생, 열=해당 과제/퀴즈의 문제+총점. 동일하게 편집·코드 보기 지원.

점수 표시: `score == null`이면 "0/배점"으로 표시 (과제/퀴즈/수업 전체 공통).

### 4.3 모달들

- **GradePointsModal** (배점 설정)  
  - allAssignmentProblems / allQuizProblems / assignmentProblems 로 **과제·퀴즈 문제 목록** 표시.  
  - pointsInputs로 문제별 배점 입력. 저장 시 handleSavePoints 호출 → 과제/퀴즈 각각 bulk 배점 API.

- **GradeBulkInputModal** (일괄 입력)  
  - 선택된 과제 또는 퀴즈에 대해 문제별 점수 일괄 입력 → bulk 성적 API.

- **GradeCodeModal**  
  - 제출 코드(과제/퀴즈 accepted-code API 응답) 표시.

- **GradeStatsModal**  
  - 통계(제출률 등) 표시.

---

## 5. 데이터 흐름 요약

1. **분반 선택** → fetchData로 assignments, quizzes 로드.
2. **보기 모드·과제/퀴즈 선택**  
   - 과제별/퀴즈별 + 선택 있음: fetchGrades 또는 fetchQuizGrades → grades 설정.  
   - 수업 전체 또는 전체 과제/전체 퀴즈: fetchCourseGrades → courseGrades 설정 (과제/퀴즈 API 여러 번 호출 후 items+students로 가공).
3. **테이블**  
   - courseGrades 또는 grades + viewMode/선택에 따라 위 표대로 한 테이블만 렌더.  
   - 셀 편집 시 editingGrade, gradeInputs 갱신 후 저장 버튼으로 단일 성적 API 호출.
4. **배점 설정**  
   - 모달 열기 → 퀴즈/과제 문제 목록 로드(allQuizProblems, allAssignmentProblems 또는 assignmentProblems) → pointsInputs 수정 후 저장 → bulk 배점 API (퀴즈는 problemId = Problem.id로 전달).
5. **제출 코드**  
   - 과제/퀴즈 각각 accepted-code API 호출 후 GradeCodeModal에 표시.

---

## 6. 파일 위치 정리

**백엔드**

- 과제 성적·배점: `grade/controller/GradeController.java`, `grade/service/GradeService.java`, `grade/entity/Grade.java`, `assignment/entity/AssignmentProblem.java`
- 퀴즈 성적·배점: `quiz/controller/QuizController.java`, `quiz/service/QuizService.java`, `quiz/entity/QuizGrade.java`, `quiz/entity/QuizProblem.java`
- 과제 목록/문제: `assignment/controller/AssignmentController.java`, `assignment/service/AssignmentService.java`
- 퀴즈 목록/문제: `quiz/controller/QuizController.java`, `quiz/service/QuizService.java`

**프론트엔드**

- 진입: `Grades/GradeManagement/index.tsx`
- 훅·상태·API 호출: `GradeManagement/hooks/useGradeManagement.ts`
- 타입: `GradeManagement/types.ts`
- API 메서드: `services/APIService.ts`
- 뷰·테이블·모달: `GradeManagement/components/`
  - `GradeManagementView.tsx` (전체 레이아웃·테이블 분기)
  - `GradeManagementHeader.tsx`
  - `GradeManagementCourseTable.tsx`, `GradeManagementAssignmentTable.tsx`, `GradeManagementQuizTable.tsx`
  - `GradePointsModal.tsx`, `GradeBulkInputModal.tsx`, `GradeCodeModal.tsx`, `GradeStatsModal.tsx`
  - `styles.ts`

이 문서는 성적 부분이 **어디서 구성되고, 어떤 API와 상태로 동작하며, UI적으로 어떻게 보이게 했는지**를 한 번에 참고할 수 있도록 정리한 것입니다.
