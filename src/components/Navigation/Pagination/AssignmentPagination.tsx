import type React from "react";
import * as S from "./styles";
import type { AssignmentPaginationProps } from "./types";

const AssignmentPagination: React.FC<AssignmentPaginationProps> = ({
	totalItems,
	currentPage,
	itemsPerPage,
	onPageChange,
	onItemsPerPageChange,
	showItemsPerPage = true,
}) => {
	const safeTotal = Number.isFinite(Number(totalItems))
		? Number(totalItems)
		: 0;
	const safePage = Math.max(
		1,
		Number.isFinite(Number(currentPage)) ? Number(currentPage) : 1,
	);
	const safePerPage = Math.max(
		1,
		Number.isFinite(Number(itemsPerPage)) ? Number(itemsPerPage) : 10,
	);
	const totalPages = Math.ceil(safeTotal / safePerPage) || 1;
	const startItem = (safePage - 1) * safePerPage + 1;
	const endItem = Math.min(safePage * safePerPage, safeTotal);

	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			if (safePage <= 3) {
				for (let i = 1; i <= 4; i++) {
					pages.push(i);
				}
				pages.push("...");
				pages.push(totalPages);
			} else if (safePage >= totalPages - 2) {
				pages.push(1);
				pages.push("...");
				for (let i = totalPages - 3; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				pages.push(1);
				pages.push("...");
				for (let i = safePage - 1; i <= safePage + 1; i++) {
					pages.push(i);
				}
				pages.push("...");
				pages.push(totalPages);
			}
		}

		return pages;
	};

	if (totalPages <= 1) {
		return null;
	}

	return (
		<S.Container>
			{showItemsPerPage && (
				<S.ItemsPerPage>
					<S.ItemsPerPageLabel>페이지당 항목 수:</S.ItemsPerPageLabel>
					<S.ItemsPerPageSelect
						value={safePerPage}
						onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
					>
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={20}>20</option>
						<option value={50}>50</option>
					</S.ItemsPerPageSelect>
				</S.ItemsPerPage>
			)}

			<S.PageInfo>
				총 {safeTotal}개 중 {startItem}-{endItem}개 표시
			</S.PageInfo>

			<S.Pages>
				<S.PageButton
					onClick={() => onPageChange(safePage - 1)}
					disabled={safePage === 1}
				>
					이전
				</S.PageButton>

				{getPageNumbers().map((page) =>
					typeof page === "number" ? (
						<S.PageButton
							key={`page-${page}`}
							onClick={() => onPageChange(page)}
							$active={safePage === page}
						>
							{page}
						</S.PageButton>
					) : (
						<S.PageEllipsis key={`ellipsis-${String(page)}`}>
							{page}
						</S.PageEllipsis>
					),
				)}

				<S.PageButton
					onClick={() => onPageChange(safePage + 1)}
					disabled={safePage === totalPages}
				>
					다음
				</S.PageButton>
			</S.Pages>
		</S.Container>
	);
};

export default AssignmentPagination;
