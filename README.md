# Handongjudge FE README 템플릿


## 1) 프로젝트 정보 



# H-codeLab  <img src="./public/logo.svg" alt="H-codeLab logo" width="27" style="vertical-align: middle; margin-right: 8px;" />

### 프로젝트 소개
  React, Spring Boot, DOMjudge 기반으로 개발한 웹 프로그래밍 실습 서비스이다. 학생은 별도 설치 없이 브라우저에서 코드를 작성하고 즉시 채점 결과를 확인할 수 있으며, 교수자는 과제 관리와 자동채점 기반 수업 운영이 가능하다. 실제 C 프로그래밍 수업에 적용하여 학습 효율과 문제 해결 집중도 향상을 확인하였다.  

### 개발 기간
- 2025.09 ~ 진행 중

### 배포 주소
- 서비스 주소: [`https://hcl.walab.info`](https://hcl.walab.info)

### 팀 소개
| [**우병희**](https://github.com/dnqudgml12) | [**곽서원**](https://github.com/seowon1112) | [**윤동혁**](https://github.com/Diggydogg) |
|---|---|---|
| Frontend, Backend | Frontend, Backend | Infra, Backend |
---

## 2) 시작 가이드


### 설치 및 실행
```bash
git clone https://github.com/walab-Capstone1/Handongjudge_FE.git
cd Handongjudge_FE
npm install
npm start
```

### 빌드
```bash
npm start
```

[Backend Repository](https://github.com/walab-Capstone1/Handongjudge_BE.git)

---

## 3) 기술 스택

### Environment
![Visual Studio Code](https://img.shields.io/badge/VS%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

### Language / Framework
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![React Router](https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)

### State / Styling
![Recoil](https://img.shields.io/badge/Recoil-3578E5?style=for-the-badge&logo=recoil&logoColor=white)
![Chakra UI](https://img.shields.io/badge/Chakra%20UI-319795?style=for-the-badge&logo=chakraui&logoColor=white)
![styled-components](https://img.shields.io/badge/styled--components-DB7093?style=for-the-badge&logo=styledcomponents&logoColor=white)
![Emotion](https://img.shields.io/badge/Emotion-C76494?style=for-the-badge&logo=emotion&logoColor=white)

### Editor / Content
![CodeMirror](https://img.shields.io/badge/CodeMirror-D30707?style=for-the-badge&logo=codemirror&logoColor=white)
![Tiptap](https://img.shields.io/badge/Tiptap-000000?style=for-the-badge&logo=tiptap&logoColor=white)
![react-markdown](https://img.shields.io/badge/react--markdown-000000?style=for-the-badge&logo=markdown&logoColor=white)
![remark](https://img.shields.io/badge/remark-111111?style=for-the-badge&logo=remark&logoColor=white)
![rehype](https://img.shields.io/badge/rehype-555555?style=for-the-badge&logo=unified&logoColor=white)
![highlight.js](https://img.shields.io/badge/highlight.js-FFB13B?style=for-the-badge&logo=highlightdotjs&logoColor=000000)

### Interaction / UI
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![React Three Fiber](https://img.shields.io/badge/@react--three/fiber-000000?style=for-the-badge&logo=react&logoColor=61DAFB)
![React Three Drei](https://img.shields.io/badge/@react--three/drei-000000?style=for-the-badge&logo=react&logoColor=61DAFB)

### Test / Deploy
![Testing Library](https://img.shields.io/badge/Testing%20Library-E33332?style=for-the-badge&logo=testinglibrary&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)


---


## 4) 화면 구성

## 학생용

### 메인 화면
![메인화면](./docs/hcodelab-main.png)

**서비스 소개와 시스템 공지/가이드를 한눈에 확인하고 강의실로 바로 이동할 수 있는 시작 페이지입니다.**

### 로그인 / 회원가입
![로그인](./docs/hcodelab-login.png)
**이메일/비밀번호 또는 소셜 로그인으로 인증을 진행하는 사용자 로그인 화면입니다.**

****
![회원가입](./docs/hcodelab-signup.png)
**신규 사용자가 기본 정보를 입력해 계정을 생성하는 회원가입 화면입니다.**

****
### 수업 / 과제 / 문제
![수업 목록](./docs/hcodelab-courses.png)
**내가 수강 중인 강의 목록과 강의별 진입 경로를 확인하는 페이지입니다.**

****
![과제 목록](./docs/hcodelab-assignments.png)
**선택한 수업의 과제 목록, 마감 기한, 진행 상태를 확인하는 페이지입니다.**

****
![과제 상세](./docs/hcodelab-assignment-detail.png)
**과제의 문제 구성과 제출 현황, 세부 안내를 확인하는 상세 페이지입니다.**

****
![문제 풀이](./docs/hcodelab-problem-solve.png)
**에디터에서 코드를 작성하고 제출/채점 결과를 확인하는 실습 화면입니다.**

****
![공지](./docs/hcodelab-notice.png)
**수업 공지사항과 중요 안내를 확인하는 공지 페이지입니다.**

****
![테스트](./docs/hcodelab-test.png)
**코딩 테스트 목록과 응시 상태를 확인하고 테스트를 시작하는 화면입니다.**

## 교수자용

### 수업관리
![수업 관리](./docs/hcodelab-course-manage.png)
**담당 수업 목록을 조회하고 수업별 운영 설정으로 이동하는 관리 화면입니다.**

****
![새 수업 생성](./docs/hcodelab-course-create.png)
**학기/분반/기본 정보를 입력해 새로운 수업을 개설하는 페이지입니다.**

### 문제관리
****
![문제 관리](./docs/hcodelab-problem-manage.png)
**등록된 문제를 조회·검색·수정·삭제하는 문제 관리 페이지입니다.**

****
![문제 가져오기](./docs/hcodelab-import.png)
**외부 또는 기존 문제 데이터를 가져와 수업 문제로 등록하는 화면입니다.**

****
![새 문제 생성](./docs/hcodelab-problem-create.png)
**문제 설명, 입출력, 테스트케이스를 작성해 새 문제를 생성하는 페이지입니다.**

### 과제 관리
****
![과제 할당](./docs/hcodelab-assignment-assign.png)
**선택한 문제를 과제로 묶어 수업에 배포하고 마감/옵션을 설정하는 화면입니다.**


****
![과제에 문제 추가](./docs/hcodelab-problem-add.png)
**기존 과제에 문제를 추가하거나 구성 순서를 조정하는 과제 편집 페이지입니다.**

****
![과제 채점](./docs/hcodelab-grading.png)
**학생 과제 제출 현황을 반영하고 관리하는 화면입니다.**

### 학생 관리
****
![학생 관리](./docs/hcodelab-student-manage.png)
**수강생 목록, 등록 상태, 참여 정보를 확인·관리하는 페이지입니다.**

### 코딩테스트
****
![시험 관리](./docs/hcodelab-exam-manage.png)
**코딩 테스트 생성, 배포, 문제 구성, 진행 상태를 관리하는 화면입니다.**



****
### 성적 관리
![성적 관리](./docs/hcodelab-score-manage.png)
**과제/코딩테스트 성적 조회, 점수 입력, 배점 설정, 통계를 관리하는 성적 페이지입니다.**

---

## 5) 아키텍처 및 디렉토리 구조

```text
📁 Handongjudge_FE
├── 📁 public
├── 📁 src
│   ├── 📄 App.tsx
│   ├── 📁 pages
│   │   ├── 📁 Auth
│   │   ├── 📁 Course
│   │   ├── 📁 AssignmentPage
│   │   ├── 📁 TutorPage
│   │   └── 📁 SuperAdminPage
│   ├── 📁  components
│   ├── 📁  layouts
│   ├── 📁  hooks
│   ├── ⚛️ recoil
│   ├── 🌐 services
│   ├── 🎨 styles
│   ├── 🏷️ types
│   └── 🛠️ utils
├── 🐳 Dockerfile-frontend
├── ⚙️ .github/workflows/deploy-frontend.yml
└── 📦 package.json
```



---

