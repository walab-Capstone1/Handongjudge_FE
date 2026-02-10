import type React from "react";
import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { useParams } from "react-router-dom";
import { authState } from "../../../recoil/atoms";
import { FaGripLinesVertical, FaChevronRight, FaBars } from "react-icons/fa";
import APIService from "../../../services/APIService";
import * as S from "./styles";

interface CourseHeaderProps {
	courseName?: string;
	onToggleSidebar?: () => void;
	isSidebarCollapsed?: boolean;
	sectionId?: number | string | null;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({
	courseName = "",
	onToggleSidebar,
	isSidebarCollapsed = false,
	sectionId: sectionIdProp = null,
}) => {
	const auth = useRecoilValue(authState);
	const { sectionId: sectionIdFromParams } = useParams<{ sectionId: string }>();
	const sectionId = sectionIdProp || sectionIdFromParams;
	const [userRole, setUserRole] = useState<string | null>(null);

	useEffect(() => {
		const fetchUserRole = async () => {
			if (sectionId && auth.user) {
				try {
					const response = await APIService.getMyRoleInSection(
						Number(sectionId),
					);
					// API가 문자열 직접 반환 / { data: "STUDENT" } / { data: { role: "STUDENT" } } 등 대응
					let raw: unknown = response;
					if (typeof response === "object" && response !== null) {
						raw =
							(response as { data?: unknown })?.data ??
							(response as { role?: unknown })?.role ??
							response;
						if (typeof raw === "object" && raw !== null && "role" in raw) {
							raw = (raw as { role: unknown }).role;
						}
					}
					const role =
						typeof raw === "string"
							? raw.toUpperCase()
							: String(raw ?? "").toUpperCase();

					let roleText = "";
					if (role === "ADMIN" || role === "INSTRUCTOR") {
						roleText = "교수";
					} else if (role === "TUTOR") {
						roleText = "튜터";
					} else if (role === "STUDENT") {
						roleText = "학생";
					}

					setUserRole(roleText || null);
				} catch (error) {
					console.error("역할 조회 실패:", error);
					setUserRole(null);
				}
			} else {
				setUserRole(null);
			}
		};

		fetchUserRole();
	}, [sectionId, auth.user]);

	return (
		<S.Container $collapsed={isSidebarCollapsed}>
			<S.Top>
				<S.ToggleButton
					type="button"
					onClick={onToggleSidebar}
					aria-label={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
				>
					{isSidebarCollapsed ? (
						<span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
							<FaGripLinesVertical style={{ fontSize: "0.9rem" }} />
							<FaChevronRight style={{ fontSize: "0.65rem" }} />
						</span>
					) : (
						<FaBars />
					)}
				</S.ToggleButton>
				<S.CourseName>{courseName}</S.CourseName>
			</S.Top>
			<S.UserSection>
				<S.UserInfo>
					{auth.user?.name || "사용자"}
					{userRole && <S.UserRole> {userRole}</S.UserRole>}
				</S.UserInfo>
			</S.UserSection>
		</S.Container>
	);
};

export default CourseHeader;
