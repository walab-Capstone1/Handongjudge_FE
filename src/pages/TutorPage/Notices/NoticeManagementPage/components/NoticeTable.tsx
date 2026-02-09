import type { FC } from "react";
import * as S from "../styles";
import { getSectionNameWithoutSection } from "../utils/sectionUtils";
import type { Notice } from "../types";

interface NoticeTableProps {
	notices: Notice[];
	totalCount: number;
	openMoreMenu: string | number | null;
	onMoreMenuToggle: (id: string | number | null) => void;
	onEdit: (notice: Notice) => void;
	onToggleActive: (noticeId: string | number, currentActive: boolean) => void;
	onDelete: (noticeId: string | number) => void;
}

const NoticeTable: FC<NoticeTableProps> = ({
	notices,
	totalCount,
	openMoreMenu,
	onMoreMenuToggle,
	onEdit,
	onToggleActive,
	onDelete,
}) => (
	<S.TableContainer>
		<S.Table>
			<S.Thead>
				<tr>
					<S.Th width="40%" align="left">
						제목
					</S.Th>
					<S.Th width="20%" align="left">
						수업
					</S.Th>
					<S.Th width="20%" align="right">
						작성일
					</S.Th>
					<S.Th width="20%" align="right">
						관리
					</S.Th>
				</tr>
			</S.Thead>
			<S.Tbody>
				{notices.length === 0 ? (
					<tr>
						<S.EmptyMessage colSpan={4}>
							{totalCount === 0
								? "작성된 공지사항이 없습니다."
								: "검색 조건에 맞는 공지사항이 없습니다."}
						</S.EmptyMessage>
					</tr>
				) : (
					notices.map((notice) => (
						<S.Tr key={String(notice.id)} disabled={notice.active === false}>
							<S.Td width="40%" align="left">
								<div>
									<S.NoticeTitle>
										{notice.title}
										{notice.isNew && <S.NewBadge>NEW</S.NewBadge>}
									</S.NoticeTitle>
									{notice.content && (
										<S.NoticeDescription>{notice.content}</S.NoticeDescription>
									)}
								</div>
							</S.Td>
							<S.Td width="20%" align="left">
								{getSectionNameWithoutSection(notice.sectionName)}
							</S.Td>
							<S.Td width="20%" align="right">
								{new Date(notice.createdAt).toLocaleDateString("ko-KR", {
									year: "numeric",
									month: "short",
									day: "numeric",
								})}
							</S.Td>
							<S.Td width="20%" align="right">
								<S.ActionsInline>
									<S.PrimaryActions>
										<S.TableButton
											variant="edit"
											onClick={() => onEdit(notice)}
											title="수정"
										>
											수정
										</S.TableButton>
									</S.PrimaryActions>
									<S.SecondaryActions>
										<S.SecondaryActionsLayer>
											<S.TableButton
												variant="secondary"
												onClick={(e) => {
													e.stopPropagation();
													onToggleActive(notice.id, notice.active);
												}}
												title={notice.active ? "비활성화" : "활성화"}
											>
												{notice.active ? "비활성화" : "활성화"}
											</S.TableButton>
											<S.MoreMenu>
												<S.TableButton
													variant="secondary"
													onClick={(e) => {
														e.stopPropagation();
														onMoreMenuToggle(
															openMoreMenu === notice.id ? null : notice.id,
														);
													}}
													title="더보기"
												>
													⋯
												</S.TableButton>
												{openMoreMenu === notice.id && (
													<S.MoreDropdown>
														<S.MoreDropdownButton
															variant="delete"
															onClick={(e) => {
																e.stopPropagation();
																onDelete(notice.id);
																onMoreMenuToggle(null);
															}}
														>
															삭제
														</S.MoreDropdownButton>
													</S.MoreDropdown>
												)}
											</S.MoreMenu>
										</S.SecondaryActionsLayer>
									</S.SecondaryActions>
								</S.ActionsInline>
							</S.Td>
						</S.Tr>
					))
				)}
			</S.Tbody>
		</S.Table>
	</S.TableContainer>
);

export default NoticeTable;
