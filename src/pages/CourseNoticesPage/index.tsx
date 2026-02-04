import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, sidebarCollapsedState } from "../../recoil/atoms";
import CourseSidebar from "../../components/CourseSidebar";
import CourseHeader from "../../components/CourseHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import APIService from "../../services/APIService";
import * as S from "./styles";
import type { Notice, SectionInfo } from "./types";

const CourseNoticesPage: React.FC = () => {
	const { sectionId } = useParams<{ sectionId: string }>();
	const navigate = useNavigate();
	const auth = useRecoilValue(authState);

	const [activeMenu, setActiveMenu] = useState("공지사항");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [notices, setNotices] = useState<Notice[]>([]);
	const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

	useEffect(() => {
		if (sectionId && auth.user) {
			fetchNoticesData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sectionId, auth.user]);

	const fetchNoticesData = async () => {
		if (!sectionId) return;

		try {
			setLoading(true);
			setError(null);

			const sectionResponse = await APIService.getSectionInfo(sectionId);
			const sectionData = sectionResponse.data || sectionResponse;
			setSectionInfo(sectionData);

			const noticesResponse = await APIService.getSectionNotices(sectionId);
			const noticesList = noticesResponse.data || noticesResponse;

			const sortedNotices = [...noticesList].sort((a: Notice, b: Notice) => {
				return (
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			});

			setNotices(sortedNotices);
		} catch (err: any) {
			console.error("공지사항 데이터 조회 실패:", err);
			setError(err.message || "데이터를 불러오는데 실패했습니다.");
		} finally {
			setLoading(false);
		}
	};

	const handleSortToggle = () => {
		const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
		setSortOrder(newSortOrder);

		const sortedNotices = [...notices].sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime();
			const dateB = new Date(b.createdAt).getTime();

			if (newSortOrder === "desc") {
				return dateB - dateA;
			} else {
				return dateA - dateB;
			}
		});

		setNotices(sortedNotices);
	};

	const formatDate = (dateString: string): string => {
		if (!dateString) return "";
		const date = new Date(dateString);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}.${month}.${day}`;
	};

	const handleMenuClick = (menuId: string) => {
		switch (menuId) {
			case "dashboard":
				navigate(`/sections/${sectionId}/dashboard`);
				break;
			case "assignment":
				navigate(`/sections/${sectionId}/course-assignments`);
				break;
			case "notice":
				break;
			case "notification":
				break;
			default:
				break;
		}
	};

	const handleNoticeClick = async (notice: Notice) => {
		if (notice.isNew) {
			try {
				await APIService.markNoticeAsRead(notice.id);

				setNotices(
					notices.map((n) => (n.id === notice.id ? { ...n, isNew: false } : n)),
				);
			} catch (err) {
				console.error("공지사항 읽음 처리 실패:", err);
			}
		}

		navigate(`/sections/${sectionId}/course-notices/${notice.id}`);
	};

	const newNoticesCount = notices.filter((n) => n.isNew).length;
	const totalNoticesCount = notices.length;

	const handleToggleSidebar = () => {
		setIsSidebarCollapsed((prev) => !prev);
	};

	if (loading) {
		return (
			<S.Container $isCollapsed={isSidebarCollapsed}>
				<CourseSidebar
					sectionId={sectionId}
					activeMenu={activeMenu}
					onMenuClick={handleMenuClick}
					isCollapsed={isSidebarCollapsed}
				/>
				<S.Content $isCollapsed={isSidebarCollapsed}>
					<LoadingSpinner />
				</S.Content>
			</S.Container>
		);
	}

	if (error) {
		return (
			<S.Container $isCollapsed={isSidebarCollapsed}>
				<CourseSidebar
					sectionId={sectionId}
					activeMenu={activeMenu}
					onMenuClick={handleMenuClick}
					isCollapsed={isSidebarCollapsed}
				/>
				<S.Content $isCollapsed={isSidebarCollapsed}>
					<S.ErrorMessage>
						<p>{error}</p>
						<button onClick={fetchNoticesData}>다시 시도</button>
					</S.ErrorMessage>
				</S.Content>
			</S.Container>
		);
	}

	return (
		<S.Container $isCollapsed={isSidebarCollapsed}>
			<CourseSidebar
				sectionId={sectionId}
				activeMenu={activeMenu}
				onMenuClick={handleMenuClick}
				isCollapsed={isSidebarCollapsed}
			/>

			<S.Content $isCollapsed={isSidebarCollapsed}>
				<CourseHeader
					courseName={
						sectionInfo?.courseTitle
							? sectionInfo.courseTitle
							: sectionInfo?.courseName || "강의"
					}
					onToggleSidebar={handleToggleSidebar}
					isSidebarCollapsed={isSidebarCollapsed}
				/>

				<S.NoticesBody>
					<S.NoticesHeader>
						<S.NoticesTitle>공지사항</S.NoticesTitle>
						<S.NoticesSummary>
							<S.NewCount>새 공지 {newNoticesCount}</S.NewCount>
							<S.TotalCount>공지사항 {totalNoticesCount}</S.TotalCount>
						</S.NoticesSummary>
						<S.SortButton onClick={handleSortToggle}>
							<S.SortText>최신순</S.SortText>
							<S.SortArrow>{sortOrder === "desc" ? "▼" : "▲"}</S.SortArrow>
						</S.SortButton>
					</S.NoticesHeader>

					<S.NoticesList>
						{notices.length > 0 ? (
							notices.map((notice) => (
								<S.NoticeItem
									key={notice.id}
									$unread={notice.isNew}
									onClick={() => handleNoticeClick(notice)}
								>
									<S.NoticeLeft>
										<S.NoticeTitle>{notice.title}</S.NoticeTitle>
										{notice.isNew && <S.NoticeNewBadge>NEW</S.NoticeNewBadge>}
									</S.NoticeLeft>
									<S.NoticeRight>
										<S.NoticeAuthor>
											{notice.instructorName || "작성자"}
										</S.NoticeAuthor>
										<S.NoticeDate>{formatDate(notice.createdAt)}</S.NoticeDate>
									</S.NoticeRight>
								</S.NoticeItem>
							))
						) : (
							<S.NoNotices>
								<p>등록된 공지사항이 없습니다.</p>
							</S.NoNotices>
						)}
					</S.NoticesList>
				</S.NoticesBody>
			</S.Content>
		</S.Container>
	);
};

export default CourseNoticesPage;
