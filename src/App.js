import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Onboarding from "./pages/Onboarding";
import AuthCallback from "./pages/login/AuthCallback";
import SignUpPageSocial from "./pages/SignUpPageSocial";
import SignupEmailPage from "./pages/SignupEmailPage";
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
import ProblemManagement from "./pages/AdminPage/ProblemManagement";
import ProblemCreate from "./pages/AdminPage/ProblemCreate";
import ProblemEdit from "./pages/AdminPage/ProblemEdit";
import AdminRoute from "./components/AdminRoute";
import EnrollPage from "./pages/EnrollPage";
import IndexPage from "./pages/IndexPage";
import ClassPage from "./pages/ClassPage";
import CourseDashboardPage from "./pages/CourseDashboardPage";
import CourseAssignmentsPage from "./pages/CourseAssignmentsPage";
import CourseNoticesPage from "./pages/CourseNoticesPage";
import CourseNoticeDetailPage from "./pages/CourseNoticeDetailPage";
import CourseNotificationsPage from "./pages/CourseNotificationsPage";
import CourseCommunityPage from "./pages/CourseCommunityPage";
import QuestionCreatePage from "./pages/QuestionCreatePage";
import QuestionDetailPage from "./pages/QuestionDetailPage";
import QuestionEditPage from "./pages/QuestionEditPage";

function App() {
  return (
      <RecoilRoot>
        <Router>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/index" element={<IndexPage />} />
            <Route path="/courses" element={<ClassPage />} />
            <Route path="/sections/:sectionId/dashboard" element={<CourseDashboardPage />} />
            <Route path="/sections/:sectionId/course-assignments" element={<CourseAssignmentsPage />} />
            <Route path="/sections/:sectionId/course-notices" element={<CourseNoticesPage />} />
            <Route path="/sections/:sectionId/course-notices/:noticeId" element={<CourseNoticeDetailPage />} />
            <Route path="/sections/:sectionId/community" element={<CourseCommunityPage />} />
            <Route path="/sections/:sectionId/community/new" element={<QuestionCreatePage />} />
            <Route path="/sections/:sectionId/community/:questionId" element={<QuestionDetailPage />} />
            <Route path="/sections/:sectionId/community/:questionId/edit" element={<QuestionEditPage />} />
            <Route path="/sections/:sectionId/alarm" element={<CourseNotificationsPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/signup" element={<SignUpPageSocial />} />
            <Route path="/signup/email" element={<SignupEmailPage />} />
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
            <Route path="/admin/assignments/section/:sectionId/progress" element={<AdminRoute><AssignmentStudentProgress /></AdminRoute>} />
            <Route path="/admin/assignments/section/:sectionId/progress/:assignmentId" element={<AdminRoute><AssignmentStudentProgress /></AdminRoute>} />
            <Route path="/admin/notices" element={<AdminRoute><NoticeManagement /></AdminRoute>} />
            <Route path="/admin/notices/section/:sectionId" element={<AdminRoute><NoticeManagement /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="/admin/users/section/:sectionId" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="/admin/problems" element={<AdminRoute><ProblemManagement /></AdminRoute>} />
            <Route path="/admin/problems/create" element={<AdminRoute><ProblemCreate /></AdminRoute>} />
            <Route path="/admin/problems/:problemId/edit" element={<AdminRoute><ProblemEdit /></AdminRoute>} />
          </Routes>
        </Router>
      </RecoilRoot>
  );
}

export default App;