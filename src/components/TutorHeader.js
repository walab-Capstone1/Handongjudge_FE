import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./TutorHeader.css";

const TutorHeader = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      navigate('/');
    }
  };

  return (
    <header className="tutor-header">
      <div className="tutor-header-container">
        <div className="tutor-header-left">
          <Link to="/tutor" className="tutor-header-logo-link">
            <img src={`${process.env.PUBLIC_URL || ''}/logo.svg`} alt="CodeSturdy" className="tutor-header-logo-image" />
            <span>CodeSturdy</span>
          </Link>
        </div>

        <div className="tutor-header-right">
          {isAuthenticated && (
            <>
              <span className="tutor-header-user-info">{user?.name || user?.email}</span>
              <button onClick={handleLogout} className="tutor-header-logout-button">
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TutorHeader;

