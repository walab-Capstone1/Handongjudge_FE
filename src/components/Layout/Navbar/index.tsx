import type React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import APIService from "../../../services/APIService";
import * as S from "./styles";

const Navbar: React.FC = () => {
	const { user, isAuthenticated, logout } = useAuth();
	const navigate = useNavigate();
	const [hasManagingSections, setHasManagingSections] = useState(false);
	const [checking, setChecking] = useState(true);

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
				console.error("관리 중인 수업 확인 실패:", error);
				setHasManagingSections(false);
			} finally {
				setChecking(false);
			}
		};

		checkManagingSections();
	}, [isAuthenticated]);

	const isSuperAdmin = user?.role === "SUPER_ADMIN";

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/index");
		} catch (error) {
			console.error("로그아웃 실패:", error);
			navigate("/index");
		}
	};

	return (
		<S.NavbarContainer>
			<S.NavbarWrapper>
				<S.NavLeft>
					<S.LogoLink to="/index">
						<S.LogoImage
							src={`${process.env.PUBLIC_URL || ""}/logo.svg`}
							alt="H-CodeLab"
						/>
						<span>H-CodeLab</span>
					</S.LogoLink>
					<S.NavLink to="/index">강의</S.NavLink>
					{!checking && hasManagingSections && (
						<S.AdminLink to="/tutor">관리 페이지</S.AdminLink>
					)}
					{isSuperAdmin && (
						<S.NavLink to="/super-admin" className="super-admin-link">
							시스템 관리
						</S.NavLink>
					)}
				</S.NavLeft>

				<S.NavRight>
					{isAuthenticated && (
						<>
							<S.UserInfo>{user?.name || user?.email}</S.UserInfo>
							<S.LogoutButton onClick={handleLogout}>로그아웃</S.LogoutButton>
						</>
					)}
				</S.NavRight>
			</S.NavbarWrapper>
		</S.NavbarContainer>
	);
};

export default Navbar;
