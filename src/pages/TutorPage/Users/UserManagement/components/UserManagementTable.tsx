import type React from "react";
import AssignmentPagination from "../../../../../components/Navigation/Pagination/AssignmentPagination";
import * as S from "../styles";
import type { Student, SortField, SortDirection } from "../types";

interface UserManagementTableProps {
	sectionId: string | undefined;
	paginatedStudents: Student[];
	studentsLength: number;
	userRoles: Record<number, string>;
	currentUserRole: string | null;
	sortField: SortField;
	sortDirection: SortDirection;
	currentPage: number;
	itemsPerPage: number;
	totalItems: number;
	totalPages: number;
	onSort: (field: SortField) => void;
	onPageChange: (page: number) => void;
	onItemsPerPageChange: (n: number) => void;
	onStudentDetail: (student: Student) => void;
	onAddTutor: (userId: number) => void;
	onRemoveTutor: (userId: number) => void;
	getSortIcon: (field: SortField) => React.ReactNode;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
	sectionId,
	paginatedStudents,
	studentsLength,
	userRoles,
	currentUserRole,
	sortField,
	sortDirection,
	currentPage,
	itemsPerPage,
	totalItems,
	totalPages,
	onSort,
	onPageChange,
	onItemsPerPageChange,
	onStudentDetail,
	onAddTutor,
	onRemoveTutor,
	getSortIcon,
}) => {
	return (
		<S.Container>
			<S.TableContainer>
				<S.Table>
					<thead>
						<tr>
							<S.Th className="sortable" onClick={() => onSort("name")}>
								<S.ThContent>
									이름
									{getSortIcon("name")}
								</S.ThContent>
							</S.Th>
							<S.Th className="sortable" onClick={() => onSort("email")}>
								<S.ThContent>
									이메일
									{getSortIcon("email")}
								</S.ThContent>
							</S.Th>
							{!sectionId && <S.Th>과목</S.Th>}
							{!sectionId && <S.Th>분반</S.Th>}
							{sectionId && <S.Th>역할</S.Th>}
							<S.Th className="sortable" onClick={() => onSort("progress")}>
								<S.ThContent>
									전체 과제 진도율
									{getSortIcon("progress")}
								</S.ThContent>
							</S.Th>
							<S.Th style={{ textAlign: "right" }}>작업</S.Th>
						</tr>
					</thead>
					<tbody>
						{paginatedStudents.map((student) => {
							const userRole = sectionId
								? userRoles[student.userId] || "STUDENT"
								: null;
							const isAdmin = currentUserRole === "ADMIN";
							const isTutor = userRole === "TUTOR";
							const isStudent = userRole === "STUDENT" || !userRole;

							return (
								<tr key={student.userId}>
									<S.NameCell>{student.name}</S.NameCell>
									<S.EmailCell>{student.email}</S.EmailCell>
									{!sectionId && (
										<S.CourseCell>{student.courseTitle}</S.CourseCell>
									)}
									{!sectionId && (
										<S.SectionCell>
											<S.Badge>{student.sectionNumber}분반</S.Badge>
										</S.SectionCell>
									)}
									{sectionId && (
										<S.Td>
											<S.Badge
												style={{
													backgroundColor:
														userRole === "ADMIN"
															? "#e17055"
															: userRole === "TUTOR"
																? "#667eea"
																: "transparent",
													color:
														userRole === "ADMIN"
															? "white"
															: userRole === "TUTOR"
																? "white"
																: "#2d3436",
												}}
											>
												{userRole === "ADMIN"
													? "관리자"
													: userRole === "TUTOR"
														? "튜터"
														: "수강생"}
											</S.Badge>
										</S.Td>
									)}
									<S.ProgressCell>
										<S.ProgressInfo>
											<S.ProgressBarContainer>
												<S.ProgressBarFill
													style={{
														width: `${student.assignmentCompletionRate || 0}%`,
													}}
												/>
											</S.ProgressBarContainer>
											<S.ProgressText>
												{student.assignmentCompletionRate
													? `${student.assignmentCompletionRate.toFixed(1)}%`
													: "0%"}
											</S.ProgressText>
										</S.ProgressInfo>
									</S.ProgressCell>
									<S.ActionsCellTd>
										<S.ActionsCell>
											<S.ActionButton
												onClick={() => onStudentDetail(student)}
												title="상세 보기"
											>
												상세 보기
											</S.ActionButton>
											{sectionId && isAdmin && (
												<>
													{isStudent && (
														<S.ActionButton
															onClick={() => onAddTutor(student.userId)}
															title="튜터로 추가"
														>
															튜터 추가
														</S.ActionButton>
													)}
													{isTutor && (
														<S.ActionButton
															className="delete"
															onClick={() => onRemoveTutor(student.userId)}
															title="튜터 권한 제거"
														>
															튜터 제거
														</S.ActionButton>
													)}
												</>
											)}
										</S.ActionsCell>
									</S.ActionsCellTd>
								</tr>
							);
						})}
						{paginatedStudents.length === 0 && (
							<tr>
								<S.Td colSpan={sectionId ? 5 : 6}>
									<S.NoData>
										<S.NoDataIcon aria-hidden />
										<S.NoDataMessage>
											{studentsLength === 0 ? (
												<>
													<strong>담당하고 있는 학생이 없습니다</strong>
													<p>
														현재 어떤 분반도 담당하고 있지 않거나, 담당 분반에
														등록된 학생이 없습니다.
													</p>
												</>
											) : (
												<>
													<strong>검색 조건에 맞는 학생이 없습니다</strong>
													<p>다른 검색어나 필터 조건을 사용해보세요.</p>
												</>
											)}
										</S.NoDataMessage>
									</S.NoData>
								</S.Td>
							</tr>
						)}
					</tbody>
				</S.Table>
			</S.TableContainer>

			{totalPages > 1 && (
				<AssignmentPagination
					currentPage={currentPage}
					itemsPerPage={itemsPerPage}
					totalItems={totalItems}
					onPageChange={onPageChange}
					onItemsPerPageChange={onItemsPerPageChange}
					showItemsPerPage={false}
				/>
			)}
		</S.Container>
	);
};

export default UserManagementTable;
