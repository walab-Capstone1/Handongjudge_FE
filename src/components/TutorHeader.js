import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import APIService from "../services/APIService";
import "./TutorHeader.css";

const TutorHeader = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  
  // URL에서 sectionId 추출
  const sectionId = params.sectionId || location.pathname.match(/\/section\/(\d+)/)?.[1];
  
  useEffect(() => {
    const fetchUserRole = async () => {
      if (sectionId && isAuthenticated) {
        try {
          const response = await APIService.getMyRoleInSection(sectionId);
          const role = response?.data || response;
          
          // 역할을 한글로 변환
          let roleText = '';
          if (role === 'ADMIN' || role === 'INSTRUCTOR') {
            roleText = '강의자';
          } else if (role === 'TUTOR') {
            roleText = '튜터';
          } else if (role === 'STUDENT') {
            roleText = '학생';
          }
          
          setUserRole(roleText);
        } catch (error) {
          console.error('역할 조회 실패:', error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    };
    
    fetchUserRole();
  }, [sectionId, isAuthenticated]);

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
              <span className="tutor-header-user-info">
                {user?.name || user?.email}
                {userRole && <span className="tutor-header-user-role"> · {userRole}</span>}
              </span>
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

