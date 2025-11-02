import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Onboarding from "./pages/Onboarding";
import AuthCallback from "./pages/login/AuthCallback";
import SignUpPageSocial from "./pages/SignUpPageSocial";
import MainPage from "./pages/MainPage";
import QuestionPage from "./pages/QuestionPage";
import SectionDetailPage from "./pages/SectionDetailPage";
import NoticeDetailPage from "./pages/NoticeDetailPage";
import MyInfoPage from "./pages/MyPage/MyInfoPage";
import MyAssignmentsPage from "./pages/MyPage/MyAssignmentsPage";
import AssignmentListPage from "./pages/AssignmentPage/AssignmentListPage";
import AssignmentDetailPage from "./pages/AssignmentPage/AssignmentDetailPage";
import ProblemSolvePage from "./pages/AssignmentPage/ProblemSolvePage";
import AdminDashboard from "./pages/AdminPage/AdminDashboard";
import CourseManagement from "./pages/AdminPage/CourseManagement";
import AssignmentManagement from "./pages/AdminPage/AssignmentManagement";
import AssignmentStudentProgress from "./pages/AdminPage/AssignmentStudentProgress";
import UserManagement from "./pages/AdminPage/UserManagement";
import NoticeManagement from "./pages/AdminPage/NoticeManagement";
import AdminRoute from "./components/AdminRoute";
import EnrollPage from "./pages/EnrollPage";

function App() {
  return (
      <RecoilRoot>
        <Router basename="/handongjudge">
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/signup" element={<SignUpPageSocial />} />
            <Route path="/enroll/:enrollmentCode" element={<EnrollPage />} />
            <Route path="/main" element={<MainPage />} /> 
            <Route path="/questions" element={<QuestionPage />} />
            <Route path="/sections/:sectionId" element={<SectionDetailPage />} />
            <Route path="/sections/:sectionId/notices/:noticeId" element={<NoticeDetailPage />} />
            <Route path="/mypage/info" element={<MyInfoPage />} />
            <Route path="/mypage/assignments" element={<MyAssignmentsPage />} />
            <Route path="/sections/:sectionId/assignments" element={<AssignmentListPage />} />
            <Route path="/sections/:sectionId/assignments/:assignmentId/detail" element={<AssignmentDetailPage />} />
            <Route path="/sections/:sectionId/assignments/:assignmentId/detail/problems/:problemId" element={<ProblemSolvePage />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/courses" element={<AdminRoute><CourseManagement /></AdminRoute>} />
            <Route path="/admin/assignments" element={<AdminRoute><AssignmentManagement /></AdminRoute>} />
            <Route path="/admin/assignments/section/:sectionId" element={<AdminRoute><AssignmentManagement /></AdminRoute>} />
            <Route path="/admin/sections/:sectionId/assignments/:assignmentId/progress" element={<AdminRoute><AssignmentStudentProgress /></AdminRoute>} />
            <Route path="/admin/notices" element={<AdminRoute><NoticeManagement /></AdminRoute>} />
            <Route path="/admin/notices/section/:sectionId" element={<AdminRoute><NoticeManagement /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="/admin/users/section/:sectionId" element={<AdminRoute><UserManagement /></AdminRoute>} />
          </Routes>
        </Router>
      </RecoilRoot>
  );
}

export default App;