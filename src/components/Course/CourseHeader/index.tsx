import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { authState } from "../../../recoil/atoms";
import APIService from "../../../services/APIService";
import * as S from "./styles";

interface EnrolledCourse {
	sectionId: number;
	courseTitle: string;
	sectionNumber?: string;
}

interface CourseHeaderProps {
	courseName?: string;
	onToggleSidebar?: () => void;
	isSidebarCollapsed?: boolean;
	sectionId?: number | string | null;
}

const OPEN_COURSE_LIST_EVENT = "openCourseList";

export function dispatchOpenCourseList(): void {
	document.dispatchEvent(new CustomEvent(OPEN_COURSE_LIST_EVENT));
}

const CourseHeader: React.FC<CourseHeaderProps> = ({
	courseName = "",
	onToggleSidebar,
	isSidebarCollapsed = false,
	sectionId: sectionIdProp = null,
}) => {
	const auth = useRecoilValue(authState);
	const navigate = useNavigate();
	const location = useLocation();
	const { sectionId: sectionIdFromParams } = useParams<{ sectionId: string }>();
	const sectionId = sectionIdProp || sectionIdFromParams;
	const [userRole, setUserRole] = useState<string | null>(null);
	const [showCourseList, setShowCourseList] = useState(false);
	const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
	const [loadingCourses, setLoadingCourses] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchUserRole = async () => {
			if (sectionId && auth.user) {
				try {
					const response = await APIService.getMyRoleInSection(
						Number(sectionId),
					);
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

	useEffect(() => {
		const handler = () => setShowCourseList(true);
		document.addEventListener(OPEN_COURSE_LIST_EVENT, handler);
		return () => document.removeEventListener(OPEN_COURSE_LIST_EVENT, handler);
	}, []);

	useEffect(() => {
		if (showCourseList && enrolledCourses.length === 0) {
			let cancelled = false;
			const fetch = async () => {
				setLoadingCourses(true);
				try {
					const response = await APIService.getUserEnrolledSections();
					const data = response?.data ?? response;
					if (!cancelled && Array.isArray(data)) setEnrolledCourses(data);
				} catch (e) {
					if (!cancelled) console.error("강의 목록 조회 실패:", e);
				} finally {
					if (!cancelled) setLoadingCourses(false);
				}
			};
			fetch();
			return () => { cancelled = true; };
		}
	}, [showCourseList, enrolledCourses.length]);

	useEffect(() => {
		if (!showCourseList) return;
		const onOutside = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setShowCourseList(false);
			}
		};
		document.addEventListener("mousedown", onOutside);
		return () => document.removeEventListener("mousedown", onOutside);
	}, [showCourseList]);

	useEffect(() => {
		if (!showCourseList) return;
		const onEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") setShowCourseList(false);
		};
		document.addEventListener("keydown", onEsc);
		return () => document.removeEventListener("keydown", onEsc);
	}, [showCourseList]);

	const handleCourseSelect = (selectedSectionId: number) => {
		const path = location.pathname.replace(
			/\/sections\/\d+/,
			`/sections/${selectedSectionId}`,
		);
		navigate(path);
		setShowCourseList(false);
	};

	const openCourseList = () => setShowCourseList((v) => !v);

	return (
		<S.Container $collapsed={isSidebarCollapsed}>
			<S.Top ref={dropdownRef}>
				<S.CourseNameButton
					type="button"
					onClick={openCourseList}
					title="클릭하면 다른 수업으로 변경할 수 있습니다"
				>
					<span>{courseName}</span>
					<S.CourseNameHint className="course-change-hint">
						(클릭 시 수업 변경)
					</S.CourseNameHint>
				</S.CourseNameButton>
				{showCourseList && (
					<S.CourseListDropdown>
						<S.CourseListDropdownTitle>수업 선택</S.CourseListDropdownTitle>
						<S.CourseListDropdownContent>
							{loadingCourses ? (
								<div style={{ padding: 16, textAlign: "center", color: "#666" }}>
									로딩 중...
								</div>
							) : (
								enrolledCourses.map((course) => (
									<S.CourseListDropdownItem
										key={course.sectionId}
										type="button"
										$active={Number(sectionId) === course.sectionId}
										onClick={() => handleCourseSelect(course.sectionId)}
									>
										{course.courseTitle}
										{course.sectionNumber != null && course.sectionNumber !== ""
											? ` ${course.sectionNumber}분반`
											: ""}
									</S.CourseListDropdownItem>
								))
							)}
						</S.CourseListDropdownContent>
						<S.CourseListDropdownFooter>
							<S.CourseListDropdownLink
								type="button"
								onClick={() => {
									navigate("/courses");
									setShowCourseList(false);
								}}
							>
								전체 강의실 보기
							</S.CourseListDropdownLink>
						</S.CourseListDropdownFooter>
					</S.CourseListDropdown>
				)}
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
