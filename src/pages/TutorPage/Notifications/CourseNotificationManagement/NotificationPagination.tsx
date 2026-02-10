import type React from "react";
import * as S from "./styles";

interface NotificationPaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const NotificationPagination: React.FC<NotificationPaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
}) => {
	if (totalPages <= 1) return null;

	return (
		<S.Pagination>
			<S.PaginationButton
				type="button"
				onClick={() => onPageChange(Math.max(0, currentPage - 1))}
				disabled={currentPage === 0}
			>
				이전
			</S.PaginationButton>
			<S.PaginationInfo>
				{currentPage + 1} / {totalPages}
			</S.PaginationInfo>
			<S.PaginationButton
				type="button"
				onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
				disabled={currentPage >= totalPages - 1}
			>
				다음
			</S.PaginationButton>
		</S.Pagination>
	);
};

export default NotificationPagination;
