import type React from "react";
import * as S from "./styles";
import type { Notification } from "./types";
import {
	getNotificationTypeLabel,
	getNotificationTypeIcon,
	getNotificationTypeColor,
	formatNotificationDate,
} from "./utils";

interface NotificationItemProps {
	notification: Notification;
	onClick: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
	notification,
	onClick,
}) => {
	const color = getNotificationTypeColor(notification.type);

	return (
		<S.Item
			type="button"
			className={!notification.isRead ? "unread" : ""}
			onClick={() => onClick(notification)}
		>
			<S.ItemIcon
				style={{
					backgroundColor: `${color}20`,
					color,
				}}
			>
				{getNotificationTypeIcon(notification.type)}
			</S.ItemIcon>
			<S.ItemContent>
				<S.ItemHeader>
					<S.ItemType style={{ color }}>
						{getNotificationTypeLabel(notification.type)}
					</S.ItemType>
					<S.ItemDate>
						{formatNotificationDate(notification.createdAt)}
					</S.ItemDate>
				</S.ItemHeader>
				<S.ItemMessage>{notification.message}</S.ItemMessage>
				{notification.sectionName && (
					<S.ItemSection>{notification.sectionName}</S.ItemSection>
				)}
			</S.ItemContent>
			{!notification.isRead && <S.ItemUnreadBadge />}
		</S.Item>
	);
};

export default NotificationItem;
