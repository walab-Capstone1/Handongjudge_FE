import type React from "react";
import { formatDate, getDeadlineStatus } from "../../utils/dateUtils";
import * as S from "./styles";

interface AssignmentInfo {
	title?: string;
	description?: string;
	startDate?: string;
	endDate?: string;
}

interface AssignmentHeaderProps {
	assignmentInfo: AssignmentInfo | null;
	assignmentId: string;
}

/**
 * 과제 헤더 컴포넌트
 * @param {Object} assignmentInfo - 과제 정보
 * @param {string} assignmentId - 과제 ID
 * @returns {JSX.Element} 과제 헤더 JSX
 */
const AssignmentHeader: React.FC<AssignmentHeaderProps> = ({
	assignmentInfo,
	assignmentId,
}) => {
	const deadlineStatus = assignmentInfo
		? getDeadlineStatus(assignmentInfo.endDate || "")
		: null;

	return (
		<S.Header>
			<S.Info>
				<S.TitleSection>
					<S.Title>
						{assignmentInfo?.title || "과제 정보를 불러오는 중..."}
					</S.Title>
				</S.TitleSection>

				<S.Description>
					{assignmentInfo?.description || "과제 문제들을 풀어보세요."}
				</S.Description>
			</S.Info>

			{assignmentInfo && (
				<S.Dates>
					{deadlineStatus && (
						<S.DeadlineStatus $status={deadlineStatus.status}>
							{deadlineStatus.text}
						</S.DeadlineStatus>
					)}
					<S.DateItem>
						<S.DateLabel>시작일:</S.DateLabel>
						<S.DateValue>
							{formatDate(assignmentInfo.startDate || "")}
						</S.DateValue>
					</S.DateItem>
					<S.DateItem>
						<S.DateLabel>마감일:</S.DateLabel>
						<S.DateValue $status={deadlineStatus?.status}>
							{formatDate(assignmentInfo.endDate || "")}
						</S.DateValue>
					</S.DateItem>
				</S.Dates>
			)}
		</S.Header>
	);
};

export default AssignmentHeader;
