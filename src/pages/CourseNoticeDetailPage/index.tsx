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

const CourseNoticeDetailPage: React.FC = () => {
	const { sectionId, noticeId } = useParams<{
		sectionId: string;
		noticeId: string;
	}>();
	const navigate = useNavigate();
	const auth = useRecoilValue(authState);

	const [activeMenu, setActiveMenu] = useState("공지사항");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [notice, setNotice] = useState<Notice | null>(null);
	const [allNotices, setAllNotices] = useState<Notice[]>([]);

	useEffect(() => {
		if (sectionId && noticeId && auth.user) {
			fetchNoticeDetail();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sectionId, noticeId, auth.user]);

	const fetchNoticeDetail = async () => {
		if (!sectionId || !noticeId) return;

		try {
			setLoading(true);
			setError(null);

			const sectionResponse = await APIService.getSectionInfo(sectionId);
			const sectionData = sectionResponse.data || sectionResponse;
			setSectionInfo(sectionData);

			const noticesResponse = await APIService.getSectionNotices(sectionId);
			const noticesList = noticesResponse.data || noticesResponse;
			setAllNotices(noticesList);

			const currentNotice = noticesList.find(
				(n: Notice) => n.id === Number.parseInt(noticeId),
			);

			if (!currentNotice) {
				setError("공지사항을 찾을 수 없습니다.");
				return;
			}

			setNotice(currentNotice);

			if (currentNotice.isNew) {
				try {
					await APIService.markNoticeAsRead(currentNotice.id);
				} catch (readErr) {
					console.error("공지사항 읽음 처리 실패:", readErr);
				}
			}
		} catch (err: any) {
			console.error("공지사항 상세 조회 실패:", err);
			setError(err.message || "공지사항을 불러오는데 실패했습니다.");
		} finally {
			setLoading(false);
		}
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
				navigate(`/sections/${sectionId}/course-notices`);
				break;
			case "notification":
				break;
			default:
				break;
		}
	};

	const goToList = () => {
		navigate(`/sections/${sectionId}/course-notices`);
	};

	const goToPrevNotice = () => {
		if (!noticeId) return;
		const currentIndex = allNotices.findIndex(
			(n) => n.id === Number.parseInt(noticeId),
		);
		if (currentIndex > 0) {
			const prevNotice = allNotices[currentIndex - 1];
			navigate(`/sections/${sectionId}/course-notices/${prevNotice.id}`);
		}
	};

	const goToNextNotice = () => {
		if (!noticeId) return;
		const currentIndex = allNotices.findIndex(
			(n) => n.id === Number.parseInt(noticeId),
		);
		if (currentIndex < allNotices.length - 1) {
			const nextNotice = allNotices[currentIndex + 1];
			navigate(`/sections/${sectionId}/course-notices/${nextNotice.id}`);
		}
	};

	const hasPrevNotice = (): boolean => {
		if (!noticeId) return false;
		const currentIndex = allNotices.findIndex(
			(n) => n.id === Number.parseInt(noticeId),
		);
		return currentIndex > 0;
	};

	const hasNextNotice = (): boolean => {
		if (!noticeId) return false;
		const currentIndex = allNotices.findIndex(
			(n) => n.id === Number.parseInt(noticeId),
		);
		return currentIndex < allNotices.length - 1;
	};

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
						<button onClick={goToList}>목록으로</button>
					</S.ErrorMessage>
				</S.Content>
			</S.Container>
		);
	}

	if (!notice) {
		return null;
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
							? `[${sectionInfo.courseTitle}] ${sectionInfo.sectionNumber || ""}분반`
							: sectionInfo?.courseName || "강의"
					}
					onToggleSidebar={handleToggleSidebar}
					isSidebarCollapsed={isSidebarCollapsed}
				/>

				<S.NoticeDetailBody>
					<S.NoticeDetailCard>
						<S.NoticeDetailHeader>
							<S.NoticeDetailTitle>{notice.title}</S.NoticeDetailTitle>
							<S.NoticeDetailMeta>
								<S.NoticeDetailAuthor>
									작성자: {notice.instructorName || "작성자"}
								</S.NoticeDetailAuthor>
								<S.NoticeDetailDate>
									날짜: {formatDate(notice.createdAt)}
								</S.NoticeDetailDate>
							</S.NoticeDetailMeta>
						</S.NoticeDetailHeader>

						<S.NoticeDetailContent>
							<S.NoticeContentText>
								{notice.content || "공지사항 내용이 없습니다."}
							</S.NoticeContentText>
						</S.NoticeDetailContent>

						<S.NoticeDetailFooter>
							<S.NavButton onClick={goToPrevNotice} disabled={!hasPrevNotice()}>
								← 이전 글
							</S.NavButton>

							<S.NavButton $variant="list" onClick={goToList}>
								목록으로
							</S.NavButton>

							<S.NavButton onClick={goToNextNotice} disabled={!hasNextNotice()}>
								다음 글 →
							</S.NavButton>
						</S.NoticeDetailFooter>
					</S.NoticeDetailCard>
				</S.NoticeDetailBody>
			</S.Content>
		</S.Container>
	);
};

export default CourseNoticeDetailPage;
