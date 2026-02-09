import type React from "react";
import * as S from "./styles";

interface NotificationHeaderProps {
	totalElements: number;
	unreadCount: number;
	onMarkAllAsRead: () => void;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({
	totalElements,
	unreadCount,
	onMarkAllAsRead,
}) => (
	<S.TitleHeader>
		<S.TitleLeft>
			<S.Title>알림 관리</S.Title>
			<S.TitleStats>
				<S.StatBadge>총 {totalElements}개 알림</S.StatBadge>
				{unreadCount > 0 && (
					<S.StatBadge $unread>읽지 않음 {unreadCount}개</S.StatBadge>
				)}
			</S.TitleStats>
		</S.TitleLeft>
		<S.TitleRight>
			<S.MarkAllButton type="button" onClick={onMarkAllAsRead}>
				모두 읽음 처리
			</S.MarkAllButton>
		</S.TitleRight>
	</S.TitleHeader>
);

export default NotificationHeader;
