import type React from "react";
import { Link, useNavigate } from "react-router-dom";
import APIService from "../../services/APIService";
import * as S from "./styles";

interface Status {
	type: string;
	text: string;
	color: string;
	notificationId?: number;
	noticeId?: number;
	assignmentId?: number;
	questionId?: number;
}

interface Course {
	id?: number;
	sectionId?: number;
	title: string;
	color?: string;
	batch?: string;
	status?: Status[];
	instructor: string;
	active?: boolean;
}

interface CourseCardProps {
	course: Course;
	onStatusUpdate?: () => void;
	showEnrollButton?: boolean;
	onEnroll?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
	course,
	onStatusUpdate,
	showEnrollButton = false,
	onEnroll,
}) => {
	const navigate = useNavigate();

	const getLinkPath = () => {
		if (course.sectionId) {
			return `/sections/${course.sectionId}/dashboard`;
		}
		return "/assignments";
	};

	const handleStatusClick = async (e: React.MouseEvent, status: Status) => {
		e.preventDefault();
		e.stopPropagation();

		if (status.notificationId) {
			try {
				await APIService.markCommunityNotificationAsRead(status.notificationId);
			} catch (error) {
				console.error("알림 읽음 처리 실패:", error);
			}
		}

		if (status.type === "announcement") {
			if (status.noticeId) {
				navigate(
					`/sections/${course.sectionId}/course-notices/${status.noticeId}`,
				);
			} else {
				navigate(`/sections/${course.sectionId}/course-notices`);
			}

			if (onStatusUpdate) {
				setTimeout(() => {
					onStatusUpdate();
				}, 500);
			}
		} else if (status.type === "assignment") {
			if (status.assignmentId) {
				navigate(
					`/sections/${course.sectionId}/course-assignments?assignmentId=${status.assignmentId}`,
				);
			} else {
				navigate(`/sections/${course.sectionId}/course-assignments`);
			}

			if (onStatusUpdate) {
				setTimeout(() => {
					onStatusUpdate();
				}, 500);
			}
		} else if (status.type === "notification") {
			if (status.questionId) {
				navigate(
					`/sections/${course.sectionId}/community/${status.questionId}`,
				);
			} else {
				navigate(`/sections/${course.sectionId}/alarm`);
			}

			if (onStatusUpdate) {
				setTimeout(() => {
					onStatusUpdate();
				}, 500);
			}
		}
	};

	const isDisabled = course.active === false;

	const handleCardClick = (e: React.MouseEvent) => {
		if (isDisabled) {
			e.preventDefault();
			e.stopPropagation();
			alert(
				"이 수업은 현재 비활성화되어 있어 접근할 수 없습니다.\n교수님께 문의하시기 바랍니다.",
			);
		}
	};

	const cardContent = (
		<S.Card $disabled={isDisabled}>
			{isDisabled && (
				<S.DisabledOverlay>
					<S.DisabledMessage>
						<p>비활성화된 수업</p>
					</S.DisabledMessage>
				</S.DisabledOverlay>
			)}
			<S.CardHeader $color={course.color} $opacity={isDisabled}>
				<S.CardTitle>
					<h3>{course.title}</h3>
				</S.CardTitle>
				{course.batch && <S.BatchBadge>{course.batch}</S.BatchBadge>}
			</S.CardHeader>

			<S.CardContent>
				<S.StatusTags>
					{(course.status || []).map((status, index) => (
						<S.StatusTag
							key={index}
							$color={status.color}
							onClick={(e) => {
								if (isDisabled) {
									e.preventDefault();
									e.stopPropagation();
									return;
								}
								handleStatusClick(e, status);
							}}
							style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
						>
							{status.text}
						</S.StatusTag>
					))}
				</S.StatusTags>

				<S.InstructorRow>
					<S.Instructor>{course.instructor} 교수님</S.Instructor>
					{showEnrollButton && (
						<S.EnrollButton
							className="enroll-button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (onEnroll) {
									onEnroll();
								}
							}}
						>
							참가하기
						</S.EnrollButton>
					)}
				</S.InstructorRow>
			</S.CardContent>
		</S.Card>
	);

	if (showEnrollButton) {
		return (
			<S.CardLink
				className="course-card-link"
				onClick={(e) => {
					if (!(e.target as HTMLElement).closest(".enroll-button")) {
						if (onEnroll) {
							onEnroll();
						}
					}
				}}
				style={{ cursor: "pointer" }}
			>
				{cardContent}
			</S.CardLink>
		);
	}

	if (isDisabled) {
		return (
			<S.CardLink onClick={handleCardClick} style={{ cursor: "not-allowed" }}>
				{cardContent}
			</S.CardLink>
		);
	}

	return (
		<Link
			to={getLinkPath()}
			style={{ textDecoration: "none", color: "inherit" }}
		>
			<S.CardLink onClick={handleCardClick}>{cardContent}</S.CardLink>
		</Link>
	);
};

export default CourseCard;
