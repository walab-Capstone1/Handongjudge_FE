import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RecoilRoot } from "recoil";
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
import AdminDashboard from "./pages/AdminPage/AdminDashboard";
import CourseManagement from "./pages/AdminPage/CourseManagement";
import AssignmentManagement from "./pages/AdminPage/AssignmentManagement";
import UserManagement from "./pages/AdminPage/UserManagement";
import NoticeManagement from "./pages/AdminPage/NoticeManagement";
import NoticeList from "./pages/NoticePage/NoticeList";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
      <RecoilRoot>
        <Router>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/signup" element={<SignUpPageSocial />} />
            <Route path="/main" element={<MainPage />} /> 
            <Route path="/questions" element={<QuestionPage />} />
            <Route path="/notices" element={<NoticeList />} />
            <Route path="/mypage/info" element={<MyInfoPage />} />
            <Route path="/mypage/assignments" element={<MyAssignmentsPage />} />
            <Route path="/sections/:sectionId/assignments" element={<AssignmentListPage />} />
            <Route path="/sections/:sectionId/assignments/:assignmentId/detail" element={<AssignmentDetailPage />} />
            <Route path="/sections/:sectionId/assignments/:assignmentId/detail/problems/:problemId" element={<ProblemSolvePage />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/courses" element={<AdminRoute><CourseManagement /></AdminRoute>} />
            <Route path="/admin/assignments" element={<AdminRoute><AssignmentManagement /></AdminRoute>} />
            <Route path="/admin/notices" element={<AdminRoute><NoticeManagement /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
          </Routes>
        </Router>
      </RecoilRoot>
  );
}

export default App;