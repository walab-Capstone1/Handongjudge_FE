import type React from "react";
import * as S from "./styles";
import NotificationItem from "./NotificationItem";
import type { Notification } from "./types";

interface NotificationListProps {
	notifications: Notification[];
	onNotificationClick: (notification: Notification) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
	notifications,
	onNotificationClick,
}) => (
	<S.List>
		{notifications.length === 0 ? (
			<S.Empty>
				<p>알림이 없습니다.</p>
			</S.Empty>
		) : (
			notifications.map((notification) => (
				<NotificationItem
					key={notification.id}
					notification={notification}
					onClick={onNotificationClick}
				/>
			))
		)}
	</S.List>
);

export default NotificationList;
