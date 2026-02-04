import type React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import APIService from "../../services/APIService";
import * as S from "./styles";

const TutorHeader: React.FC = () => {
	const { user, isAuthenticated, logout } = useAuth();
	const navigate = useNavigate();
	const params = useParams<{ sectionId: string }>();
	const location = useLocation();
	const [userRole, setUserRole] = useState<string | null>(null);

	// URL에서 sectionId 추출
	const sectionId =
		params.sectionId || location.pathname.match(/\/section\/(\d+)/)?.[1];

	useEffect(() => {
		const fetchUserRole = async () => {
			if (sectionId && isAuthenticated) {
				try {
					const response = await APIService.getMyRoleInSection(
						Number(sectionId),
					);
					const role = response?.data || response;

					// 역할을 한글로 변환
					let roleText = "";
					if (role === "ADMIN" || role === "INSTRUCTOR") {
						roleText = "강의자";
					} else if (role === "TUTOR") {
						roleText = "튜터";
					} else if (role === "STUDENT") {
						roleText = "학생";
					}

					setUserRole(roleText);
				} catch (error) {
					console.error("역할 조회 실패:", error);
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
			navigate("/");
		} catch (error) {
			console.error("로그아웃 실패:", error);
			navigate("/");
		}
	};

	return (
		<S.Header>
			<S.Container>
				<S.Left>
					<S.LogoLink to="/tutor">
						<S.LogoImage
							src={`${process.env.PUBLIC_URL || ""}/logo.svg`}
							alt="CodeSturdy"
						/>
						<span>CodeSturdy</span>
					</S.LogoLink>
				</S.Left>

				<S.Right>
					{isAuthenticated && (
						<>
							<S.UserInfo>
								{user?.name || user?.email}
								{userRole && <S.UserRole> · {userRole}</S.UserRole>}
							</S.UserInfo>
							<S.LogoutButton onClick={handleLogout}>로그아웃</S.LogoutButton>
						</>
					)}
				</S.Right>
			</S.Container>
		</S.Header>
	);
};

export default TutorHeader;
