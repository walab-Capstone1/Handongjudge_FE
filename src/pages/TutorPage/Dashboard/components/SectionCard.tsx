import type React from "react";
import { useNavigate } from "react-router-dom";
import * as S from "../styles";
import { formatDate, getSemesterLabel } from "../hooks/useDashboard";
import type { DashboardSection } from "../types";

interface SectionCardProps {
	section: DashboardSection;
	onToggleActive: (sectionId: number, currentActive: boolean) => void;
	onDelete: (sectionId: number, sectionTitle: string) => void;
	openDropdownId: number | null;
	onDropdownToggle: (sectionId: number) => void;
}

const SectionCard: React.FC<SectionCardProps> = ({
	section,
	onToggleActive,
	onDelete,
	openDropdownId,
	onDropdownToggle,
}) => {
	const navigate = useNavigate();
	const isActive = section.active !== false;

	return (
		<S.CourseCard key={section.sectionId}>
			<S.CardHeader>
				<S.CardTitle>{section.courseTitle}</S.CardTitle>
				<S.StatusBadge $active={isActive}>
					{isActive ? "활성" : "비활성"}
				</S.StatusBadge>
			</S.CardHeader>
			<S.StatsCompact>
				<S.StatItem>
					<S.StatLabel>학생</S.StatLabel>
					<S.StatValue>{section.studentCount || 0}명</S.StatValue>
				</S.StatItem>
				<S.StatItem>
					<S.StatLabel>공지</S.StatLabel>
					<S.StatValue>{section.noticeCount || 0}개</S.StatValue>
				</S.StatItem>
				<S.StatItem>
					<S.StatLabel>학기</S.StatLabel>
					<S.StatValue>
						{section.year || new Date().getFullYear()}년{" "}
						{getSemesterLabel(section.semester)}
					</S.StatValue>
				</S.StatItem>
				{section.createdAt && (
					<S.StatItem>
						<S.StatLabel>생성일</S.StatLabel>
						<S.StatValue>{formatDate(section.createdAt)}</S.StatValue>
					</S.StatItem>
				)}
			</S.StatsCompact>
			<S.ActionsCompact>
				<S.ToggleButton
					$active={isActive}
					onClick={() => onToggleActive(section.sectionId, isActive)}
					title={isActive ? "비활성화하기" : "활성화하기"}
				>
					{isActive ? "활성" : "비활성"}
				</S.ToggleButton>
				<S.ActionButtonsCompact>
					<S.ActionButton
						onClick={() =>
							navigate(`/tutor/notices/section/${section.sectionId}`)
						}
						title="공지사항"
					>
						공지
					</S.ActionButton>
					<S.ActionButton
						onClick={() =>
							navigate(`/tutor/users/section/${section.sectionId}`)
						}
						title="학생 관리"
					>
						학생
					</S.ActionButton>
					<S.ActionButton
						onClick={() =>
							navigate(`/tutor/grades/section/${section.sectionId}`)
						}
						title="성적 관리"
					>
						성적
					</S.ActionButton>
					<S.ActionButton
						$primary
						onClick={() =>
							navigate(`/tutor/assignments/section/${section.sectionId}`)
						}
						title="과제 관리"
					>
						과제
					</S.ActionButton>
					<S.DropdownContainer className="dropdown-container">
						<S.DropdownToggle
							onClick={(e) => {
								e.stopPropagation();
								onDropdownToggle(
									openDropdownId === section.sectionId ? 0 : section.sectionId,
								);
							}}
							title="더보기"
						>
							⋯
						</S.DropdownToggle>
						{openDropdownId === section.sectionId && (
							<S.DropdownMenu>
								<S.DropdownItem
									$delete
									onClick={(e) => {
										e.stopPropagation();
										onDropdownToggle(0);
										onDelete(section.sectionId, section.courseTitle);
									}}
								>
									삭제
								</S.DropdownItem>
							</S.DropdownMenu>
						)}
					</S.DropdownContainer>
				</S.ActionButtonsCompact>
			</S.ActionsCompact>
		</S.CourseCard>
	);
};

export default SectionCard;
