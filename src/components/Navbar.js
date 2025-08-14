import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  
  // role이 ADMIN인 사용자에게만 관리자 링크 표시
  const isProfessor = user?.role === 'ADMIN';

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/main" className="logo-link">HandongJudge</Link>
        <Link to="/main" className="nav-link">Lecture</Link>
        <Link to="/assignments" className="nav-link">Class</Link>
        <Link to="/notices" className="nav-link">Notice</Link>
        <Link to="/mypage/info" className="nav-link">My Page</Link>
        {isProfessor && (
          <Link to="/admin" className="nav-link admin-link">관리 페이지</Link>
        )}
      </div>

      <div className="nav-right">
        <Link to="/settings" className="settings-button">Settings</Link>
      </div>
    </nav>
  );
};

export default Navbar; 