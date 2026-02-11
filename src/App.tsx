import type React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RecoilRoot } from "recoil";
import AdminRoute from "./components/Route/AdminRoute";
import SuperAdminRoute from "./components/Route/SuperAdminRoute";
import TutorAccessGate from "./components/Route/TutorAccessGate";
// Auth (공통 / 로그인)
import IndexPage from "./pages/Auth/IndexPage";
import LoginPage from "./pages/Auth/LoginPage";
import AuthCallback from "./pages/Auth/AuthCallback";
import SignUpPageSocial from "./pages/Auth/SignUpPageSocial";
import SignupEmailPage from "./pages/Auth/SignupEmailPage";
import EnrollPage from "./pages/Auth/EnrollPage";
// Course (수강 / 강의)
import ClassPage from "./pages/Course/ClassPage";
import CourseDashboardPage from "./pages/Course/Dashboard/CourseDashboardPage";
import CourseAssignmentsPage from "./pages/Course/Assignments/CourseAssignmentsPage";
import CourseNoticesPage from "./pages/Course/Notices/CourseNoticesPage";
import CourseNoticeDetailPage from "./pages/Course/Notices/CourseNoticeDetailPage";
import CourseNotificationsPage from "./pages/Course/Notifications/CourseNotificationsPage";
import CourseCommunityPage from "./pages/Course/Community/CourseCommunityPage";
import QuestionCreatePage from "./pages/Course/Community/QuestionCreatePage";
import QuestionDetailPage from "./pages/Course/Community/QuestionDetailPage";
import QuestionEditPage from "./pages/Course/Community/QuestionEditPage";
import CodingQuizPage from "./pages/Course/CodingQuiz/CodingQuizPage";
import CodingQuizSolvePage from "./pages/Course/CodingQuiz/CodingQuizSolvePage";

// 과제

import ProblemSolvePage from "./pages/AssignmentPage/ProblemSolvePage";

// Tutor (수업관리자)
import CourseManagement from "./pages/TutorPage/Dashboard";
import AssignmentManagement from "./pages/TutorPage/Assignments/AssignmentManagement";
import AssignmentCreatePage from "./pages/TutorPage/Assignments/AssignmentCreatePage";
import AssignmentEditPage from "./pages/TutorPage/Assignments/AssignmentEditPage";
import AssignmentStudentProgress from "./pages/TutorPage/Assignments/AssignmentStudentProgress";
import UserManagement from "./pages/TutorPage/Users/UserManagement";
import GradeManagement from "./pages/TutorPage/Grades/GradeManagement";
import NoticeManagementPage from "./pages/TutorPage/Notices/NoticeManagementPage";
import NoticeCreatePage from "./pages/TutorPage/Notices/NoticeCreatePage";
import NoticeEditPage from "./pages/TutorPage/Notices/NoticeEditPage";
import CourseNotificationManagement from "./pages/TutorPage/Notifications/CourseNotificationManagement";
import ProblemManagement from "./pages/TutorPage/Problems/ProblemManagement";
import ProblemSetManagement from "./pages/TutorPage/Problems/ProblemSetManagement";
import ProblemSetEdit from "./pages/TutorPage/Problems/ProblemSetEdit";
import ProblemCreate from "./pages/TutorPage/Problems/ProblemCreate";
import ProblemEdit from "./pages/TutorPage/Problems/ProblemEdit";
import SettingsPage from "./pages/TutorPage/Settings/SettingsPage";
import CodingTestManagement from "./pages/TutorPage/CodingTests/CodingTestManagement";
// SuperAdmin (시스템 관리자)
import SuperAdminDashboard from "./pages/SuperAdminPage/SuperAdminDashboard";
import SystemNoticeManagement from "./pages/SuperAdminPage/SystemNoticeManagement";
import SystemGuideManagement from "./pages/SuperAdminPage/SystemGuideManagement";
import SuperAdminCourseManagement from "./pages/SuperAdminPage/SuperAdminCourseManagement";
import SuperAdminProblemManagement from "./pages/SuperAdminPage/SuperAdminProblemManagement";
import SuperAdminUserManagement from "./pages/SuperAdminPage/SuperAdminUserManagement";
import SuperAdminSubmissionManagement from "./pages/SuperAdminPage/SuperAdminSubmissionManagement";

const App: React.FC = () => {
	return (
		<RecoilRoot>
			<Router>
				<Routes>
					<Route path="/" element={<IndexPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/index" element={<IndexPage />} />
					<Route path="/courses" element={<ClassPage />} />
					<Route path="/dashboard" element={<CourseDashboardPage />} />
					<Route
						path="/sections/:sectionId/dashboard"
						element={<CourseDashboardPage />}
					/>
					<Route
						path="/sections/:sectionId/course-assignments"
						element={<CourseAssignmentsPage />}
					/>
					<Route
						path="/sections/:sectionId/course-notices"
						element={<CourseNoticesPage />}
					/>
					<Route
						path="/sections/:sectionId/course-notices/:noticeId"
						element={<CourseNoticeDetailPage />}
					/>
					<Route
						path="/sections/:sectionId/community"
						element={<CourseCommunityPage />}
					/>
					<Route
						path="/sections/:sectionId/community/new"
						element={<QuestionCreatePage />}
					/>
					<Route
						path="/sections/:sectionId/community/:questionId"
						element={<QuestionDetailPage />}
					/>
					<Route
						path="/sections/:sectionId/community/:questionId/edit"
						element={<QuestionEditPage />}
					/>
					<Route
						path="/sections/:sectionId/coding-quiz"
						element={<CodingQuizPage />}
					/>
					<Route
						path="/sections/:sectionId/coding-quiz/:quizId"
						element={<CodingQuizSolvePage />}
					/>
					<Route
						path="/sections/:sectionId/alarm"
						element={<CourseNotificationsPage />}
					/>
					<Route path="/auth/callback" element={<AuthCallback />} />
					<Route path="/signup" element={<SignUpPageSocial />} />
					<Route path="/signup/email" element={<SignupEmailPage />} />
					<Route path="/enroll/:enrollmentCode" element={<EnrollPage />} />
					<Route
						path="/sections/:sectionId/assignments/:assignmentId/detail/problems/:problemId"
						element={<ProblemSolvePage />}
					/>
					{/* 수업관리자 (tutor) 라우트 - 학생은 접근 불가, alert 후 /courses로 */}
					<Route
						path="/tutor"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<CourseManagement />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/assignments"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<AssignmentManagement />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/assignments/section/:sectionId"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<AssignmentManagement />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/assignments/section/:sectionId/create"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<AssignmentCreatePage />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/assignments/section/:sectionId/:assignmentId/edit"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<AssignmentEditPage />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/assignments/section/:sectionId/progress"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<AssignmentStudentProgress />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/assignments/section/:sectionId/progress/:assignmentId"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<AssignmentStudentProgress />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/notices"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<NoticeManagementPage />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/notices/section/:sectionId"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<NoticeManagementPage />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/notices/create"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<NoticeCreatePage />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/notices/section/:sectionId/create"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<NoticeCreatePage />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/notices/:noticeId/edit"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<NoticeEditPage />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/notices/section/:sectionId/:noticeId/edit"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<NoticeEditPage />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/notifications"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<CourseNotificationManagement />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/notifications/section/:sectionId"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<CourseNotificationManagement />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/users/section/:sectionId"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<UserManagement />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/grades/section/:sectionId"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<GradeManagement />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/coding-tests/section/:sectionId"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<CodingTestManagement />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/coding-tests/section/:sectionId/:quizId"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<CodingTestManagement />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/problems"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<ProblemManagement />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/problems/create"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<ProblemCreate />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/problems/:problemId/edit"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<ProblemEdit />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/problems/sets"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<ProblemSetManagement />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/problems/sets/:problemSetId/edit"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<ProblemSetEdit />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					<Route
						path="/tutor/settings"
						element={
							<AdminRoute>
								<TutorAccessGate>
									<SettingsPage />
								</TutorAccessGate>
							</AdminRoute>
						}
					/>
					{/* 시스템 관리자 (super-admin) 라우트 */}
					<Route
						path="/super-admin"
						element={
							<SuperAdminRoute>
								<SuperAdminDashboard />
							</SuperAdminRoute>
						}
					/>
					<Route
						path="/super-admin/system-notices"
						element={
							<SuperAdminRoute>
								<SystemNoticeManagement />
							</SuperAdminRoute>
						}
					/>
					<Route
						path="/super-admin/system-guides"
						element={
							<SuperAdminRoute>
								<SystemGuideManagement />
							</SuperAdminRoute>
						}
					/>
					<Route
						path="/super-admin/courses"
						element={
							<SuperAdminRoute>
								<SuperAdminCourseManagement />
							</SuperAdminRoute>
						}
					/>
					<Route
						path="/super-admin/problems"
						element={
							<SuperAdminRoute>
								<SuperAdminProblemManagement />
							</SuperAdminRoute>
						}
					/>
					<Route
						path="/super-admin/users"
						element={
							<SuperAdminRoute>
								<SuperAdminUserManagement />
							</SuperAdminRoute>
						}
					/>
					<Route
						path="/super-admin/submissions"
						element={
							<SuperAdminRoute>
								<SuperAdminSubmissionManagement />
							</SuperAdminRoute>
						}
					/>
				</Routes>
			</Router>
		</RecoilRoot>
	);
};

export default App;
