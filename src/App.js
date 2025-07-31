import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { useAuth } from "./hooks/useAuth";
import LoadingSpinner from "./components/LoadingSpinner";
import Onboarding from "./pages/Onboarding";
import AuthCallback from "./pages/login/AuthCallback";
import SignUpPageSocial from "./pages/SignUpPageSocial";
import MainPage from "./pages/MainPage";
import QuestionPage from "./pages/QuestionPage";
import NoticePage from "./pages/NoticePage";
import MyInfoPage from "./pages/MyPage/MyInfoPage";
import MyAssignmentsPage from "./pages/MyPage/MyAssignmentsPage";
import AssignmentListPage from "./pages/AssignmentPage/AssignmentListPage";
import AssignmentDetailPage from "./pages/AssignmentPage/AssignmentDetailPage";
import ProblemSolvePage from "./pages/AssignmentPage/ProblemSolvePage";

// 인증 초기화 컴포넌트
function AuthInitializer({ children }) {
  const { loading, restoreAuth } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 앱 시작 시 토큰 복원 (한 번만 실행)
    const initializeAuth = async () => {
      try {
        console.log('인증 초기화 시작');
        await restoreAuth();
        console.log('인증 초기화 완료');
      } catch (error) {
        console.error('인증 초기화 실패:', error);
      } finally {
        console.log('초기화 상태 설정 완료');
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 초기화 중이거나 로딩 중일 때 스피너 표시
  if (!isInitialized || loading) {
    return <LoadingSpinner message="초기화 중..." />;
  }

  return children;
}

// 라우트 컴포넌트
function AppRoutes() {
  return (
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/signup" element={<SignUpPageSocial />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/questions" element={<QuestionPage />} />
        <Route path="/notices" element={<NoticePage />} />
        <Route path="/mypage/info" element={<MyInfoPage />} />
        <Route path="/mypage/assignments" element={<MyAssignmentsPage />} />
        <Route path="/assignments" element={<AssignmentListPage />} />
        <Route path="/assignments/:week/detail" element={<AssignmentDetailPage />} />
        <Route path="/assignments/:week/problem/:problemId" element={<ProblemSolvePage />} />
      </Routes>
  );
}

function App() {
  return (
      <RecoilRoot>
        <Router>
          <AuthInitializer>
            <AppRoutes />
          </AuthInitializer>
        </Router>
      </RecoilRoot>
  );
}

export default App;