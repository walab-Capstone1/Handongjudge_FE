import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaComments } from "react-icons/fa";
import APIService from "../../../services/APIService";
import * as S from "./styles";

interface Section {
	sectionId: number;
	courseTitle: string;
}

interface Notification {
	id: number;
	type: string;
	sectionId?: number;
	noticeId?: number;
	noticeTitle?: string;
	assignmentId?: number;
	assignmentTitle?: string;
	questionId?: number;
	message?: string;
	courseTitle?: string;
	createdAt: string;
	isRead: boolean;
	displayTitle?: string;
	displayLink?: string | null;
	sectionTitle?: string;
}

interface Position {
	right: number | null;
	bottom: number | null;
}

/**
 * TutorNotificationPanel - 튜터 페이지 전용 알림 패널 컴포넌트
 *
 * 모든 튜터 페이지에서 사용할 수 있는 알림 패널입니다.
 * 드래그 가능하며, 사용자가 설정한 위치를 기억합니다.
 * 읽지 않은 알림이 있을 때 시각적 피드백을 제공합니다.
 */
const TutorNotificationPanel: React.FC = () => {
	const navigate = useNavigate();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loadingNotifications, setLoadingNotifications] =
		useState<boolean>(false);
	const [showNotificationPanel, setShowNotificationPanel] =
		useState<boolean>(false);
	const [unreadCount, setUnreadCount] = useState<number>(0);
	const [sections, setSections] = useState<Section[]>([]);

	// 드래그 관련 상태
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [position, setPosition] = useState<Position>({
		right: null,
		bottom: null,
	});
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
	const [hasDragged, setHasDragged] = useState<boolean>(false);
	const iconRef = useRef<HTMLButtonElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// localStorage에서 위치 불러오기
	useEffect(() => {
		const savedPosition = localStorage.getItem("tutor_notification_position");
		if (savedPosition) {
			try {
				const pos = JSON.parse(savedPosition);
				if (pos.right !== null && pos.bottom !== null) {
					setPosition(pos);
				}
			} catch (error) {
				console.error("위치 정보 불러오기 실패:", error);
			}
		}
	}, []);

	// 위치를 localStorage에 저장
	useEffect(() => {
		if (position.right !== null && position.bottom !== null) {
			localStorage.setItem(
				"tutor_notification_position",
				JSON.stringify(position),
			);
		}
	}, [position]);

	// 화면 크기 변경 시 위치 재조정
	useEffect(() => {
		const handleResize = () => {
			if (position.right !== null && position.bottom !== null) {
				const iconSize = 56;
				const minMargin = 16;
				const maxRight = window.innerWidth - iconSize - minMargin;
				const maxBottom = window.innerHeight - iconSize - minMargin;

				if (position.right > maxRight || position.bottom > maxBottom) {
					const adjusted = constrainPosition(
						window.innerWidth - position.right - iconSize,
						window.innerHeight - position.bottom - iconSize,
					);
					setPosition(adjusted);
				}
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [position]);

	// 수업 목록 가져오기
	useEffect(() => {
		const fetchSections = async () => {
			try {
				const dashboardResponse = await APIService.getInstructorDashboard();
				const dashboardData = dashboardResponse?.data || [];
				setSections(dashboardData);
			} catch (error) {
				console.error("수업 목록 조회 실패:", error);
			}
		};
		fetchSections();
	}, []);

	// 경계 체크 및 자동 조정 함수
	const constrainPosition = (x: number, y: number): Position => {
		const iconSize = 56;
		const minMargin = 16;
		const maxX = window.innerWidth - iconSize - minMargin;
		const maxY = window.innerHeight - iconSize - minMargin;

		const constrainedX = Math.max(minMargin, Math.min(x, maxX));
		const constrainedY = Math.max(minMargin, Math.min(y, maxY));

		return {
			right: window.innerWidth - constrainedX - iconSize,
			bottom: window.innerHeight - constrainedY - iconSize,
		};
	};

	// 드래그 시작
	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.button !== 0) return;
		if ((e.target as HTMLElement).closest(".tutor-alarm-badge")) return;

		setDragStartPos({ x: e.clientX, y: e.clientY });
		setHasDragged(false);

		if (iconRef.current) {
			const rect = iconRef.current.getBoundingClientRect();
			setDragOffset({
				x: e.clientX - (rect.left + rect.width / 2),
				y: e.clientY - (rect.top + rect.height / 2),
			});
		}
	};

	// 드래그 중
	useEffect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			const deltaX = Math.abs(e.clientX - dragStartPos.x);
			const deltaY = Math.abs(e.clientY - dragStartPos.y);
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			if (distance > 5) {
				if (!hasDragged) {
					setHasDragged(true);
					e.preventDefault();
				}

				const newX = e.clientX - dragOffset.x;
				const newY = e.clientY - dragOffset.y;

				const constrained = constrainPosition(newX, newY);
				setPosition(constrained);
			}
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			setHasDragged(false);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, dragOffset, dragStartPos, hasDragged]);

	// 아이콘 클릭
	const handleIconClick = () => {
		if (!hasDragged) {
			setShowNotificationPanel(!showNotificationPanel);
		}
	};

	// 알림 조회
	const fetchNotifications = async () => {
		try {
			setLoadingNotifications(true);
			const notificationsResponse = await APIService.getCommunityNotifications(
				null,
				0,
				20,
			);
			const notificationsList = notificationsResponse.data?.content || [];

			const processedNotifications = notificationsList.map((notif: any) => {
				let title = "";
				let link: string | null = null;
				let sectionTitle = "";

				switch (notif.type) {
					case "NOTICE_CREATED":
						title = notif.noticeTitle || "공지사항";
						link =
							notif.sectionId && notif.noticeId
								? `/sections/${notif.sectionId}/course-notices/${notif.noticeId}`
								: null;
						break;
					case "ASSIGNMENT_CREATED":
						title = notif.assignmentTitle || "새 과제";
						link =
							notif.sectionId && notif.assignmentId
								? `/sections/${notif.sectionId}/course-assignments?assignmentId=${notif.assignmentId}`
								: null;
						break;
					case "QUESTION_COMMENT":
						title = notif.message || "커뮤니티에 새 댓글이 달렸습니다";
						link =
							notif.sectionId && notif.questionId
								? `/sections/${notif.sectionId}/community/${notif.questionId}`
								: null;
						break;
					case "COMMENT_ACCEPTED":
						title = notif.message || "댓글이 채택되었습니다";
						link =
							notif.sectionId && notif.questionId
								? `/sections/${notif.sectionId}/community/${notif.questionId}`
								: null;
						break;
					default:
						title = notif.message || "알림";
						link = notif.sectionId
							? `/sections/${notif.sectionId}/community`
							: null;
				}

				if (notif.courseTitle) {
					sectionTitle = notif.courseTitle;
				} else {
					const section = sections.find((s) => s.sectionId === notif.sectionId);
					if (section) {
						sectionTitle = section.courseTitle;
					}
				}

				return {
					...notif,
					displayTitle: title,
					displayLink: link,
					sectionTitle: sectionTitle || "알 수 없는 수업",
					createdAt: notif.createdAt,
				};
			});

			setNotifications(processedNotifications);
			const unread = processedNotifications.filter((n) => !n.isRead).length;
			setUnreadCount(unread);
		} catch (error) {
			console.error("알림 조회 실패:", error);
			setNotifications([]);
			setUnreadCount(0);
		} finally {
			setLoadingNotifications(false);
		}
	};

	useEffect(() => {
		fetchNotifications();
	}, []);

	useEffect(() => {
		if (sections.length > 0) {
			fetchNotifications();
		}
	}, [sections]);

	// 알림 아이템 클릭
	const handleNotificationClick = (
		notif: Notification,
		e: React.MouseEvent,
	) => {
		e.stopPropagation();
		let targetPath: string | null = null;

		switch (notif.type) {
			case "NOTICE_CREATED":
				if (notif.sectionId && notif.noticeId) {
					targetPath = `/sections/${notif.sectionId}/course-notices/${notif.noticeId}`;
				} else if (notif.sectionId) {
					targetPath = `/sections/${notif.sectionId}/course-notices`;
				}
				break;
			case "ASSIGNMENT_CREATED":
				if (notif.sectionId && notif.assignmentId) {
					targetPath = `/sections/${notif.sectionId}/course-assignments?assignmentId=${notif.assignmentId}`;
				} else if (notif.sectionId) {
					targetPath = `/sections/${notif.sectionId}/course-assignments`;
				}
				break;
			case "QUESTION_COMMENT":
			case "COMMENT_ACCEPTED":
			case "COMMENT_REPLY":
				if (notif.sectionId && notif.questionId) {
					targetPath = `/sections/${notif.sectionId}/community/${notif.questionId}`;
				} else if (notif.sectionId) {
					targetPath = `/sections/${notif.sectionId}/community`;
				}
				break;
			default:
				if (notif.displayLink) {
					targetPath = notif.displayLink;
				} else if (notif.sectionId) {
					targetPath = `/sections/${notif.sectionId}/community`;
				}
		}

		if (targetPath) {
			navigate(targetPath);
			setShowNotificationPanel(false);
		}
	};

	const getDefaultPosition = () => {
		if (typeof window === "undefined") return { right: 32, bottom: 32 };
		return {
			right: window.innerWidth - 56 - 32,
			bottom: 32,
		};
	};

	const defaultPos = getDefaultPosition();
	const currentRight =
		position.right !== null ? position.right : defaultPos.right;
	const currentBottom =
		position.bottom !== null ? position.bottom : defaultPos.bottom;

	const getPanelPosition = () => {
		if (typeof window === "undefined") return { right: 32, bottom: 100 };

		const panelHeight = 400;
		const panelWidth = 420;
		let panelRight = currentRight;
		let panelBottom = currentBottom + 56 + 16;

		if (panelBottom + panelHeight > window.innerHeight) {
			panelBottom = currentBottom - panelHeight - 16;
			if (panelBottom < 0) {
				panelBottom = 16;
			}
		}

		if (panelRight + panelWidth > window.innerWidth) {
			panelRight = window.innerWidth - panelWidth - 16;
		}

		if (panelRight < 0) {
			panelRight = 16;
		}

		return { right: panelRight, bottom: panelBottom };
	};

	const panelPosition = getPanelPosition();

	return (
		<S.Container
			ref={containerRef}
			style={{
				right: `${currentRight}px`,
				bottom: `${currentBottom}px`,
				cursor: isDragging ? "grabbing" : "default",
			}}
		>
			<S.IconButton
				ref={iconRef}
				$hasUnread={unreadCount > 0}
				$dragging={isDragging && hasDragged}
				onMouseDown={(e) => {
					setIsDragging(true);
					handleMouseDown(e);
				}}
				onClick={handleIconClick}
				title="수업 알림 (드래그하여 이동)"
				style={{
					cursor: isDragging && hasDragged ? "grabbing" : "grab",
				}}
			>
				<FaBell />
				{unreadCount > 0 && (
					<S.Badge>{unreadCount > 99 ? "99+" : unreadCount}</S.Badge>
				)}
			</S.IconButton>

			{showNotificationPanel && (
				<>
					<S.Overlay onClick={() => setShowNotificationPanel(false)} />
					<S.Panel
						style={{
							right: `${panelPosition.right}px`,
							bottom: `${panelPosition.bottom}px`,
						}}
					>
						<S.PanelHeader>
							<S.PanelTitle>
								<FaBell />
								교수 수업 알림
							</S.PanelTitle>
							<S.CloseButton onClick={() => setShowNotificationPanel(false)}>
								×
							</S.CloseButton>
						</S.PanelHeader>
						<S.PanelBody>
							{loadingNotifications ? (
								<S.Loading>
									<S.LoadingSpinner />
									<p>알림을 불러오는 중...</p>
								</S.Loading>
							) : notifications.length > 0 ? (
								<S.List>
									{notifications.map((notif, index) => (
										<S.Item
											key={notif.id || index}
											$unread={!notif.isRead}
											onClick={(e) => handleNotificationClick(notif, e)}
										>
											<S.ItemIcon>
												{notif.type === "QUESTION_COMMENT" ||
												notif.type === "COMMENT_ACCEPTED" ? (
													<FaComments />
												) : (
													<FaBell />
												)}
											</S.ItemIcon>
											<S.ItemContent>
												<S.ItemTitle>{notif.displayTitle}</S.ItemTitle>
												<S.ItemMeta>
													<S.ItemSection>{notif.sectionTitle}</S.ItemSection>
													<S.ItemTime>
														{new Date(notif.createdAt).toLocaleString("ko-KR", {
															year: "numeric",
															month: "2-digit",
															day: "2-digit",
															hour: "2-digit",
															minute: "2-digit",
														})}
													</S.ItemTime>
												</S.ItemMeta>
											</S.ItemContent>
										</S.Item>
									))}
								</S.List>
							) : (
								<S.Empty>
									<p>알림이 없습니다.</p>
								</S.Empty>
							)}
						</S.PanelBody>
					</S.Panel>
				</>
			)}
		</S.Container>
	);
};

export default TutorNotificationPanel;
