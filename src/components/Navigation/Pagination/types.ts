export interface AssignmentPaginationProps {
	totalItems: number;
	currentPage: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
	onItemsPerPageChange: (itemsPerPage: number) => void;
	/** true면 "페이지당 항목 수" 선택 숨김 */
	showItemsPerPage?: boolean;
}
