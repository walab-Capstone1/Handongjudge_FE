import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import APIService from "../services/APIService";
import {
  Navbar as NavbarContainer,
  NavbarContainer as NavbarWrapper,
  NavLeft,
  LogoLink,
  LogoImage,
  NavLink,
  AdminLink,
  NavRight,
  UserInfo,
  LogoutButton
} from "./styleddiv";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [hasManagingSections, setHasManagingSections] = useState(false);
  const [checking, setChecking] = useState(true);
  
  // 관리 중인 수업이 있는지 확인
  useEffect(() => {
    const checkManagingSections = async () => {
      if (!isAuthenticated) {
        setChecking(false);
        return;
      }
      
      try {
        const response = await APIService.getManagingSections();
        setHasManagingSections((response?.data || []).length > 0);
      } catch (error) {
        console.error('관리 중인 수업 확인 실패:', error);
        setHasManagingSections(false);
      } finally {
        setChecking(false);
      }
    };
    
    checkManagingSections();
  }, [isAuthenticated]);
  
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const handleLogout = async () => {
    try {
      await logout(); // useAuth의 logout 함수가 이미 APIService.logout()을 호출함
      navigate('/index'); // 인덱스 페이지로 이동
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // useAuth의 logout 함수가 에러 처리도 담당하므로 여기서는 단순히 페이지 이동만
      navigate('/index');
    }
  };

  return (
    <NavbarContainer>
      <NavbarWrapper>
        <NavLeft>
          <LogoLink to="/main">
            <LogoImage src={`${process.env.PUBLIC_URL || ''}/logo.svg`} alt="CodeSturdy" />
            <span>CodeSturdy</span>
          </LogoLink>
          <NavLink to="/main">강의</NavLink>
          {/* 마이페이지 비활성화 (기능은 유지) */}
          {/* <NavLink to="/mypage/info">마이페이지</NavLink> */}
          {!checking && hasManagingSections && (
            <AdminLink to="/tutor">관리 페이지</AdminLink>
          )}
          {isSuperAdmin && (
            <NavLink to="/super-admin" className="super-admin-link">시스템 관리</NavLink>
          )}
        </NavLeft>

        <NavRight>
          {isAuthenticated && (
            <>
              <UserInfo>{user?.name || user?.email}</UserInfo>
              <LogoutButton onClick={handleLogout}>
                로그아웃
              </LogoutButton>
            </>
          )}
        </NavRight>
      </NavbarWrapper>
    </NavbarContainer>
  );
};

export default Navbar; 