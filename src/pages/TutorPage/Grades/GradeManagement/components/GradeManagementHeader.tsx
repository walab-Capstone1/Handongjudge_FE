import React from "react";
import {
	FaFileExport,
	FaChartBar,
	FaEdit,
	FaWeight,
	FaCode,
} from "react-icons/fa";
import * as S from "../styles";
import type { AssignmentItem, QuizItem, ViewMode } from "../types";

export interface GradeManagementHeaderProps {
	searchTerm: string;
	setSearchTerm: (v: string) => void;
	sectionId: string | undefined;
	assignments: AssignmentItem[];
	quizzes: QuizItem[];
	viewMode: ViewMode;
	setViewMode: (v: ViewMode) => void;
	selectedAssignment: AssignmentItem | null;
	setSelectedAssignment: (a: AssignmentItem | null) => void;
	selectedQuiz: QuizItem | null;
	setSelectedQuiz: (q: QuizItem | null) => void;
	/** 과제별/코딩테스트별 보기: 문제 열만 필터 (과제·코테 선택 드롭다운 옆) */
	showProblemColumnFilter?: boolean;
	problemFilterOptions?: { problemId: number; problemTitle?: string }[];
	problemFilterValue?: number | "all";
	onProblemFilterChange?: (v: number | "all") => void;
	onShowPointsModal: () => void;
	onShowBulkModal: () => void;
	onShowStatsModal: () => void;
	onExportCSV: () => void;
	onDownloadCodeZip: () => void;
	isDownloadingCodeZip?: boolean;
}

export default function GradeManagementHeader({
	searchTerm,
	setSearchTerm,
	sectionId,
	assignments,
	quizzes,
	viewMode,
	setViewMode,
	selectedAssignment,
	setSelectedAssignment,
	selectedQuiz,
	setSelectedQuiz,
	showProblemColumnFilter = false,
	problemFilterOptions = [],
	problemFilterValue = "all",
	onProblemFilterChange,
	onShowPointsModal,
	onShowBulkModal,
	onShowStatsModal,
	onExportCSV,
	onDownloadCodeZip,
	isDownloadingCodeZip = false,
}: GradeManagementHeaderProps) {
	const showActionButtons =
		(viewMode === "assignment" && assignments.length > 0) ||
		(viewMode === "quiz" && quizzes.length > 0) ||
		(viewMode === "course" && (assignments.length > 0 || quizzes.length > 0));

	const canSelectProblemFilter =
		(viewMode === "assignment" && selectedAssignment != null) ||
		(viewMode === "quiz" && selectedQuiz != null);
	const disabledProblemFilterLabel =
		viewMode === "assignment"
			? "개별 과제를 선택하고 문제를 골라주세요"
			: "개별 코딩테스트를 선택하고 문제를 골라주세요";

	return (
		<S.PageHeader>
			<S.HeaderLeft>
				<S.SearchBox>
					<S.SearchInput
						type="text"
						placeholder="이름, 학번으로 검색..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</S.SearchBox>
				{sectionId &&
					(assignments.length > 0 || quizzes.length > 0) &&
					(viewMode === "assignment" || viewMode === "quiz") && (
						<S.FilterGroup>
							<S.FilterLabel htmlFor="grade-item-select">
								{viewMode === "assignment" ? "과제 선택" : "코딩테스트 선택"}
							</S.FilterLabel>
							<S.AssignmentSelect
								id="grade-item-select"
								value={
									viewMode === "assignment"
										? (selectedAssignment?.id ?? "")
										: (selectedQuiz?.id ?? "")
								}
								onChange={(e) => {
									const val = e.target.value;
									if (viewMode === "assignment") {
										const a = assignments.find(
											(a) => a.id === Number.parseInt(val, 10),
										);
										setSelectedAssignment(a ?? null);
										setSelectedQuiz(null);
									} else {
										const q = quizzes.find(
											(q) => q.id === Number.parseInt(val, 10),
										);
										setSelectedQuiz(q ?? null);
										setSelectedAssignment(null);
									}
								}}
							>
								<option value="">
									전체 {viewMode === "assignment" ? "과제" : "코딩테스트"}
								</option>
								{viewMode === "assignment"
									? assignments.map((a) => (
											<option key={a.id} value={a.id}>
												{a.title}
											</option>
										))
									: quizzes.map((q) => (
											<option key={q.id} value={q.id}>
												{q.title}
											</option>
										))}
							</S.AssignmentSelect>
						</S.FilterGroup>
					)}
				{showProblemColumnFilter && onProblemFilterChange && (
					<S.FilterGroup>
						<S.FilterLabel htmlFor="grade-problem-column-filter">
							문제 표시
						</S.FilterLabel>
						<S.AssignmentSelect
							id="grade-problem-column-filter"
							disabled={!canSelectProblemFilter}
							value={
								problemFilterValue === "all"
									? "all"
									: String(problemFilterValue)
							}
							onChange={(e) => {
								const v = e.target.value;
								onProblemFilterChange(
									v === "all" ? "all" : Number.parseInt(v, 10),
								);
							}}
						>
							<option value="all">
								{canSelectProblemFilter
									? "전체 문제"
									: disabledProblemFilterLabel}
							</option>
							{problemFilterOptions.map((p) => (
								<option key={p.problemId} value={p.problemId}>
									{p.problemTitle?.trim()
										? p.problemTitle
										: `문제 #${p.problemId}`}
								</option>
							))}
						</S.AssignmentSelect>
					</S.FilterGroup>
				)}
			</S.HeaderLeft>
			<S.HeaderRight>
				<S.ViewModeTabs>
					<S.TabButton
						type="button"
						$active={viewMode === "assignment"}
						onClick={() => {
							setViewMode("assignment");
							setSelectedQuiz(null);
						}}
					>
						과제별 보기
					</S.TabButton>
					<S.TabButton
						type="button"
						$active={viewMode === "quiz"}
						onClick={() => {
							setViewMode("quiz");
							setSelectedAssignment(null);
						}}
					>
						코딩테스트별 보기
					</S.TabButton>
					<S.TabButton
						type="button"
						$active={viewMode === "course"}
						onClick={() => {
							setViewMode("course");
							setSelectedAssignment(null);
							setSelectedQuiz(null);
						}}
					>
						수업 전체 보기
					</S.TabButton>
				</S.ViewModeTabs>
				{showActionButtons && (
					<>
						{/* <S.SecondaryButton type="button" onClick={onShowPointsModal}>
							<FaWeight /> 배점 설정
						</S.SecondaryButton>
						<S.SecondaryButton type="button" onClick={onShowBulkModal}>
							<FaEdit /> 일괄 입력
						</S.SecondaryButton> */}
						{viewMode !== "course" && (
							<S.SecondaryButton type="button" onClick={onShowStatsModal}>
								<FaChartBar /> 통계
							</S.SecondaryButton>
						)}
						{viewMode !== "course" && (
							<S.SecondaryButton
								type="button"
								onClick={onDownloadCodeZip}
								disabled={isDownloadingCodeZip}
							>
								<FaCode />{" "}
								{isDownloadingCodeZip ? "ZIP 생성 중..." : "제출 코드 ZIP"}
							</S.SecondaryButton>
						)}
						<S.PrimaryButton type="button" onClick={onExportCSV}>
							<FaFileExport /> 내보내기
						</S.PrimaryButton>
					</>
				)}
			</S.HeaderRight>
		</S.PageHeader>
	);
}
