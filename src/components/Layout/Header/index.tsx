import type React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import * as S from "./styles";

interface HeaderProps {
	onUserNameClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onUserNameClick }) => {
	const navigate = useNavigate();
	const { logout, user, isAuthenticated } = useAuth();

	const userName = user?.name || user?.username || user?.email || "";

	const handleLogout = async () => {
		try {
			await logout();
			window.location.href = "/index";
		} catch (error) {
			console.error("로그아웃 실패:", error);
			window.location.href = "/index";
		}
	};

	const handleLogin = () => {
		navigate("/login");
	};

	const handleLogoClick = () => {
		navigate("/index");
	};

	return (
		<S.HeaderContainer>
			<S.HeaderWrapper>
				<S.Logo onClick={handleLogoClick}>
					<S.LogoIcon>
						<img src="/logo.svg" alt="CodeSturdy Logo" />
					</S.LogoIcon>
					<S.LogoText>CodeSturdy</S.LogoText>
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
