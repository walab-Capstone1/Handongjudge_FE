import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  // role이 ADMIN인 사용자에게만 관리자 링크 표시
  const isProfessor = user?.role === 'ADMIN';

  const handleLogout = async () => {
    try {
      await logout(); // useAuth의 logout 함수가 이미 APIService.logout()을 호출함
      navigate('/'); // 온보딩 페이지로 이동
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // useAuth의 logout 함수가 에러 처리도 담당하므로 여기서는 단순히 페이지 이동만
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="nav-left">
          <Link to="/main" className="logo-link">HandongJudge</Link>
          <Link to="/main" className="nav-link">강의</Link>
          {/* 마이페이지 비활성화 (기능은 유지) */}
          {/* <Link to="/mypage/info" className="nav-link">마이페이지</Link> */}
          {isProfessor && (
            <Link to="/admin" className="nav-link admin-link">관리 페이지</Link>
          )}
        </div>

        <div className="nav-right">
          {isAuthenticated && (
            <>
              <span className="user-info">{user?.name || user?.email}</span>
              <button onClick={handleLogout} className="logout-button">
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 