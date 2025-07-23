import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MainPage from "./pages/MainPage";
import QuestionPage from "./pages/QuestionPage";
import NoticePage from "./pages/NoticePage";
import MyInfoPage from "./pages/MyPage/MyInfoPage";
import MyAssignmentsPage from "./pages/MyPage/MyAssignmentsPage";
import AssignmentListPage from "./pages/AssignmentPage/AssignmentListPage";
import AssignmentDetailPage from "./pages/AssignmentPage/AssignmentDetailPage";
import ProblemSolvePage from "./pages/AssignmentPage/ProblemSolvePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/questions" element={<QuestionPage />} />
        <Route path="/notices" element={<NoticePage />} />
        <Route path="/mypage/info" element={<MyInfoPage />} />
        <Route path="/mypage/assignments" element={<MyAssignmentsPage />} />
        <Route path="/assignments/:week" element={<AssignmentListPage />} />
        <Route path="/assignments/:week/detail" element={<AssignmentDetailPage />} />
        <Route path="/assignments/:week/problem/:problemId" element={<ProblemSolvePage />} />
      </Routes>
    </Router>
  );
}

export default App;
