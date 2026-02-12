import type React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import * as S from "./styles";

interface HeaderProps {
	onUserNameClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onUserNameClick }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { logout, user, isAuthenticated } = useAuth();

	const userName = user?.name || user?.username || user?.email || "";

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/index");
		} catch (error) {
			console.error("로그아웃 실패:", error);
			navigate("/index");
		}
	};

	const handleLogin = () => {
		navigate("/login");
	};

	// 로그인·/courses에서는 /index, 나머지는 /courses
	const handleLogoClick = () => {
		navigate(
			location.pathname === "/login" || location.pathname === "/courses"
				? "/index"
				: "/courses",
		);
	};

	return (
		<S.HeaderContainer>
			<S.HeaderWrapper>
				<S.Logo onClick={handleLogoClick}>
					<S.LogoIcon>
						<img src="/logo.svg" alt="H-CodeLab Logo" />
					</S.LogoIcon>
					<S.LogoText>H-CodeLab</S.LogoText>
				</S.Logo>
				<S.HeaderLinks>
					{isAuthenticated ? (
						<>
							{userName && (
								<S.HeaderLink onClick={onUserNameClick || (() => {})}>
									{userName}
								</S.HeaderLink>
							)}
							<S.HeaderLink onClick={handleLogout}>로그아웃</S.HeaderLink>
						</>
					) : (
						<S.HeaderLink onClick={handleLogin}>로그인</S.HeaderLink>
					)}
				</S.HeaderLinks>
			</S.HeaderWrapper>
		</S.HeaderContainer>
	);
};

export default Header;
