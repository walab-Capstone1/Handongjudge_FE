import type React from "react";
import * as S from "../styles";

interface DashboardHeaderProps {
	totalCount: number;
	displayCount: number;
	/** ADMIN인 수업이 하나라도 있을 때만 true (튜터 전용이면 복사 버튼 숨김) */
	canCopySection: boolean;
	onCopy: () => void;
	onCreate: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
	totalCount,
	displayCount,
	canCopySection,
	onCopy,
	onCreate,
}) => (
	<S.TitleHeader>
		<S.TitleLeft>
			<S.Title>수업 관리</S.Title>
			<S.TitleStats>
				<S.StatBadge>총 {totalCount}개 분반</S.StatBadge>
				<S.StatBadge>표시 {displayCount}개</S.StatBadge>
			</S.TitleStats>
		</S.TitleLeft>
		<S.TitleRight>
			{canCopySection && (
				<S.CopyButton onClick={onCopy}>기존 수업 복사</S.CopyButton>
			)}
			<S.CreateButton onClick={onCreate}>+ 새 수업 만들기</S.CreateButton>
		</S.TitleRight>
	</S.TitleHeader>
);

export default DashboardHeader;
