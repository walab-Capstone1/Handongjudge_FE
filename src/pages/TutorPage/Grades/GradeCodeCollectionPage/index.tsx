import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import TutorLayout from "../../../../layouts/TutorLayout";
import SectionNavigation from "../../../../components/Navigation/SectionNavigation";
import APIService from "../../../../services/APIService";
import type { AssignmentItem, ProblemGrade, QuizItem } from "../GradeManagement/types";

type Mode = "assignment" | "quiz";

type SubmissionCodeRow = {
	key: string;
	mode: Mode;
	itemId: number;
	itemTitle: string;
	userId: number;
	studentName: string;
	studentId: string;
	problemId: number;
	problemTitle: string;
	result: string;
	submittedAt?: string;
	dueAt?: string;
	isOnTime?: boolean;
	lateText: string;
	lateMs: number;
	code?: string;
	codeLoading?: boolean;
	codeError?: string;
};

type SortKey = "studentName" | "studentId" | "submittedAt" | "isOnTime";
type SortDir = "asc" | "desc";

function formatLateText(
	submittedAt?: string,
	dueAt?: string,
	isOnTime?: boolean,
): string {
	if (!submittedAt || !dueAt) return "-";
	if (isOnTime === true) return "정시";
	const submitted = new Date(submittedAt).getTime();
	const due = new Date(dueAt).getTime();
	if (!Number.isFinite(submitted) || !Number.isFinite(due)) return "-";
	const diff = submitted - due;
	if (diff <= 0) return "정시";
	const totalMinutes = Math.floor(diff / (1000 * 60));
	const days = Math.floor(totalMinutes / (60 * 24));
	const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
	const minutes = totalMinutes % 60;
	if (days > 0) return `${days}일 ${hours}시간 지각`;
	if (hours > 0) return `${hours}시간 ${minutes}분 지각`;
	return `${minutes}분 지각`;
}

function getLateMs(submittedAt?: string, dueAt?: string): number {
	if (!submittedAt || !dueAt) return 0;
	const submitted = new Date(submittedAt).getTime();
	const due = new Date(dueAt).getTime();
	if (!Number.isFinite(submitted) || !Number.isFinite(due)) return 0;
	return Math.max(0, submitted - due);
}

function toResultLabel(pg: ProblemGrade): string {
	if (!pg.submitted) return "미제출";
	const score = Number(pg.score ?? 0);
	const points = Number(pg.points ?? 0);
	if (points <= 0) return pg.isOnTime === false ? "제출·지각" : "제출";
	if (score >= points - 1e-9) {
		return pg.isOnTime === false ? "정답·지각" : "정답";
	}
	return pg.isOnTime === false ? "오답·지각" : "오답";
}

const tableStyle: React.CSSProperties = {
	width: "100%",
	borderCollapse: "collapse",
	background: "#fff",
	border: "1px solid #e2e8f0",
};

const thtdStyle: React.CSSProperties = {
	borderBottom: "1px solid #e2e8f0",
	padding: "10px 12px",
	textAlign: "left",
	fontSize: "13px",
	verticalAlign: "top",
};

const codeStyle: React.CSSProperties = {
	maxHeight: "180px",
	overflow: "auto",
	background: "#0f172a",
	color: "#e2e8f0",
	borderRadius: "8px",
	padding: "10px",
	fontSize: "12px",
	lineHeight: 1.4,
	whiteSpace: "pre-wrap",
	wordBreak: "break-word",
};

const buttonStyle: React.CSSProperties = {
	padding: "8px 12px",
	borderRadius: "8px",
	border: "1px solid #cbd5e1",
	background: "#fff",
	cursor: "pointer",
	fontWeight: 600,
};

const containerStyle: React.CSSProperties = {
	padding: "16px 20px",
	display: "flex",
	flexDirection: "column",
	gap: "12px",
};

const topBarStyle: React.CSSProperties = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	gap: "12px",
};

const controlsStyle: React.CSSProperties = {
	display: "flex",
	gap: "8px",
	alignItems: "center",
};

const inputStyle: React.CSSProperties = {
	padding: "8px 10px",
	borderRadius: "8px",
	border: "1px solid #cbd5e1",
	minWidth: "240px",
};

const sortButtonStyle: React.CSSProperties = {
	background: "none",
	border: "none",
	padding: 0,
	font: "inherit",
	fontWeight: 600,
	cursor: "pointer",
};

const GradeCodeCollectionPage: React.FC = () => {
	const navigate = useNavigate();
	const { sectionId } = useParams<{ sectionId: string }>();
	const [searchParams] = useSearchParams();
	const mode = searchParams.get("mode") as Mode | null;
	const itemId = Number(searchParams.get("itemId"));
	const [loading, setLoading] = useState(true);
	const [rows, setRows] = useState<SubmissionCodeRow[]>([]);
	const [title, setTitle] = useState("");
	const [query, setQuery] = useState("");
	const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
	const [sortKey, setSortKey] = useState<SortKey>("submittedAt");
	const [sortDir, setSortDir] = useState<SortDir>("desc");
	const [currentSectionName, setCurrentSectionName] = useState("");

	const fetchRows = useCallback(async () => {
		if (!sectionId || !mode || !Number.isFinite(itemId)) return;
		setLoading(true);
		try {
			const dashboardResponse = await APIService.getInstructorDashboard();
			const sectionsData = dashboardResponse?.data ?? dashboardResponse ?? [];
			const currentSection = (Array.isArray(sectionsData) ? sectionsData : []).find(
				(s: { sectionId: number }) => s.sectionId === Number(sectionId),
			);
			const courseTitle =
				(currentSection as { courseTitle?: string; sectionInfo?: { courseTitle?: string } })?.courseTitle ??
				(currentSection as { sectionInfo?: { courseTitle?: string } })?.sectionInfo?.courseTitle ??
				"";
			const sectionNumber =
				(currentSection as { sectionNumber?: string; sectionInfo?: { sectionNumber?: string } })?.sectionNumber ??
				(currentSection as { sectionInfo?: { sectionNumber?: string } })?.sectionInfo?.sectionNumber ??
				"";
			setCurrentSectionName(
				sectionNumber ? `${courseTitle} - ${sectionNumber}분반` : courseTitle,
			);

			if (mode === "assignment") {
				const assignmentsResponse = await APIService.getAssignmentsBySection(sectionId);
				const assignmentsData = assignmentsResponse?.data ?? assignmentsResponse ?? [];
				const assignment = (Array.isArray(assignmentsData) ? assignmentsData : []).find(
					(a: AssignmentItem) => a.id === itemId,
				);
				const dueAt =
					assignment?.dueDate ??
					(assignment as { endDate?: string } | undefined)?.endDate ??
					(assignment as { deadline?: string } | undefined)?.deadline;
				setTitle(assignment?.title ?? "과제");

				const gradesResponse = await APIService.getAssignmentGrades(sectionId, itemId);
				const gradesData = gradesResponse?.data ?? gradesResponse ?? [];
				const allRows: SubmissionCodeRow[] = [];
				for (const student of Array.isArray(gradesData)
					? gradesData
					: []) {
					for (const pg of student.problemGrades ?? []) {
						if (!pg.submitted) continue;
						allRows.push({
							key: `assignment-${itemId}-${student.userId}-${pg.problemId}`,
							mode,
							itemId,
							itemTitle: assignment?.title ?? "과제",
							userId: student.userId,
							studentName: student.studentName ?? "",
							studentId: student.studentId ?? "",
							problemId: pg.problemId,
							problemTitle: pg.problemTitle ?? `문제 ${pg.problemId}`,
							result: toResultLabel(pg),
							submittedAt: pg.submittedAt,
							dueAt,
							isOnTime: pg.isOnTime,
							lateText: formatLateText(pg.submittedAt, dueAt, pg.isOnTime),
							lateMs: getLateMs(pg.submittedAt, dueAt),
						});
					}
				}
				setRows(allRows);
				setSelectedProblemId(allRows[0]?.problemId ?? null);
				return;
			}

			const quizzesResponse = await APIService.getQuizzesBySection(sectionId);
			const quizzesData = quizzesResponse?.data ?? quizzesResponse ?? [];
			const quiz = (Array.isArray(quizzesData) ? quizzesData : []).find(
				(q: QuizItem) => q.id === itemId,
			);
			const dueAt = quiz?.endTime;
			setTitle(quiz?.title ?? "퀴즈");

			const gradesResponse = await APIService.getQuizGrades(sectionId, itemId);
			const gradesData = gradesResponse?.data ?? gradesResponse ?? [];
			const allRows: SubmissionCodeRow[] = [];
			for (const student of Array.isArray(gradesData)
				? gradesData
				: []) {
				for (const pg of student.problemGrades ?? []) {
					if (!pg.submitted) continue;
					allRows.push({
						key: `quiz-${itemId}-${student.userId}-${pg.problemId}`,
						mode,
						itemId,
						itemTitle: quiz?.title ?? "퀴즈",
						userId: student.userId,
						studentName: student.studentName ?? "",
						studentId: student.studentId ?? "",
						problemId: pg.problemId,
						problemTitle: pg.problemTitle ?? `문제 ${pg.problemId}`,
						result: toResultLabel(pg),
						submittedAt: pg.submittedAt,
						dueAt,
						isOnTime: pg.isOnTime,
						lateText: formatLateText(pg.submittedAt, dueAt, pg.isOnTime),
						lateMs: getLateMs(pg.submittedAt, dueAt),
					});
				}
			}
			setRows(allRows);
			setSelectedProblemId(allRows[0]?.problemId ?? null);
		} catch (e) {
			console.error("제출 코드 목록 조회 실패:", e);
			setRows([]);
			setSelectedProblemId(null);
		} finally {
			setLoading(false);
		}
	}, [sectionId, mode, itemId]);

	useEffect(() => {
		fetchRows();
	}, [fetchRows]);

	useEffect(() => {
		const loadAllCodesImmediately = async () => {
			const targets = rows.filter((r) => !r.code && !r.codeLoading);
			for (const row of targets) {
				// eslint-disable-next-line no-await-in-loop
				await loadCode(row);
			}
		};
		if (!loading && rows.length > 0) {
			loadAllCodesImmediately();
		}
	}, [loading, rows]); // eslint-disable-line react-hooks/exhaustive-deps

	const loadCode = useCallback(
		async (target: SubmissionCodeRow) => {
			if (!sectionId) return;
			setRows((prev) =>
				prev.map((r) =>
					r.key === target.key ? { ...r, codeLoading: true, codeError: undefined } : r,
				),
			);
			try {
				let response: { code?: string; codeString?: string } | null = null;
				if (target.mode === "assignment") {
					response = await APIService.getStudentAcceptedCode(
						sectionId,
						target.itemId,
						target.userId,
						target.problemId,
					);
				} else {
					response = await APIService.getStudentQuizAcceptedCode(
						sectionId,
						target.itemId,
						target.userId,
						target.problemId,
					);
				}
				const code = response?.code ?? response?.codeString ?? "";
				setRows((prev) =>
					prev.map((r) =>
						r.key === target.key ? { ...r, code, codeLoading: false } : r,
					),
				);
			} catch (err) {
				const message = err instanceof Error ? err.message : "코드 조회 실패";
				setRows((prev) =>
					prev.map((r) =>
						r.key === target.key
							? { ...r, codeLoading: false, codeError: message }
							: r,
					),
				);
			}
		},
		[sectionId],
	);

	const problemOptions = useMemo(() => {
		const map = new Map<number, string>();
		for (const r of rows) {
			if (!map.has(r.problemId)) map.set(r.problemId, r.problemTitle);
		}
		return Array.from(map.entries()).map(([problemId, problemTitle]) => ({
			problemId,
			problemTitle,
		}));
	}, [rows]);

	const filteredRows = useMemo(() => {
		const q = query.trim().toLowerCase();
		const searched = !q
			? rows
			: rows.filter(
			(r) =>
				r.studentName.toLowerCase().includes(q) ||
				r.studentId.toLowerCase().includes(q) ||
				r.problemTitle.toLowerCase().includes(q),
		);
		const byProblem =
			selectedProblemId == null
				? searched
				: searched.filter((r) => r.problemId === selectedProblemId);
		const sorted = [...byProblem].sort((a, b) => {
			let cmp = 0;
			if (sortKey === "studentName") {
				cmp = a.studentName.localeCompare(b.studentName, "ko");
			} else if (sortKey === "studentId") {
				cmp = a.studentId.localeCompare(b.studentId, "ko");
			} else if (sortKey === "submittedAt") {
				const av = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
				const bv = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
				cmp = av - bv;
			} else if (sortKey === "isOnTime") {
				const av = a.isOnTime ? 0 : 1;
				const bv = b.isOnTime ? 0 : 1;
				cmp = av - bv;
				if (cmp === 0) cmp = a.lateMs - b.lateMs;
			}
			return sortDir === "asc" ? cmp : -cmp;
		});
		return sorted;
	}, [rows, query, selectedProblemId, sortKey, sortDir]);

	const toggleSort = (key: SortKey) => {
		if (sortKey === key) {
			setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
			return;
		}
		setSortKey(key);
		setSortDir(key === "submittedAt" ? "desc" : "asc");
	};

	if (!sectionId || (mode !== "assignment" && mode !== "quiz") || !Number.isFinite(itemId)) {
		return (
			<TutorLayout selectedSection={null}>
				<div style={containerStyle}>
					<p>잘못된 접근입니다.</p>
					<button type="button" style={buttonStyle} onClick={() => navigate(-1)}>
						뒤로 가기
					</button>
				</div>
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={null}>
			{sectionId && currentSectionName ? (
				<SectionNavigation
					sectionId={sectionId}
					sectionName={currentSectionName}
					title="제출 코드 모아보기"
					showSearch={false}
				/>
			) : null}
			<div style={containerStyle}>
				<div style={topBarStyle}>
					<div>
						<h2 style={{ margin: 0 }}>{title} 제출 코드 모아보기</h2>
						<p style={{ margin: "4px 0 0", color: "#64748b" }}>
							제출된 코드만 표시됩니다. (총 {filteredRows.length}건)
						</p>
					</div>
					<div style={controlsStyle}>
						<input
							style={inputStyle}
							placeholder="이름/학번/문제명 검색"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
						/>
						<button type="button" style={buttonStyle} onClick={() => navigate(-1)}>
							성적 화면으로
						</button>
						<select
							style={{ ...inputStyle, minWidth: "180px" }}
							value={selectedProblemId ?? ""}
							onChange={(e) =>
								setSelectedProblemId(
									e.target.value ? Number(e.target.value) : null,
								)
							}
						>
							{problemOptions.map((p) => (
								<option key={p.problemId} value={p.problemId}>
									{p.problemTitle}
								</option>
							))}
						</select>
					</div>
				</div>

				{loading ? (
					<p>데이터를 불러오는 중...</p>
				) : filteredRows.length === 0 ? (
					<p>제출된 코드가 없습니다.</p>
				) : (
					<div style={{ overflowX: "auto" }}>
						<table style={tableStyle}>
							<thead>
								<tr style={{ background: "#f8fafc" }}>
									<th style={thtdStyle}>
										<button
											type="button"
											style={sortButtonStyle}
											onClick={() => toggleSort("studentName")}
										>
											학생명
										</button>
									</th>
									<th style={thtdStyle}>
										<button
											type="button"
											style={sortButtonStyle}
											onClick={() => toggleSort("studentId")}
										>
											학번
										</button>
									</th>
									<th style={thtdStyle}>문제</th>
									<th style={thtdStyle}>결과</th>
									<th style={thtdStyle}>
										<button
											type="button"
											style={sortButtonStyle}
											onClick={() => toggleSort("submittedAt")}
										>
											제출 시각
										</button>
									</th>
									<th style={thtdStyle}>마감 시각</th>
									<th style={thtdStyle}>
										<button
											type="button"
											style={sortButtonStyle}
											onClick={() => toggleSort("isOnTime")}
										>
											지각 여부
										</button>
									</th>
									<th style={thtdStyle}>코드</th>
								</tr>
							</thead>
							<tbody>
								{filteredRows.map((row) => (
									<tr key={row.key}>
										<td style={thtdStyle}>{row.studentName}</td>
										<td style={thtdStyle}>{row.studentId}</td>
										<td style={thtdStyle}>{row.problemTitle}</td>
										<td style={thtdStyle}>{row.result}</td>
										<td style={thtdStyle}>
											{row.submittedAt
												? new Date(row.submittedAt).toLocaleString("ko-KR")
												: "-"}
										</td>
										<td style={thtdStyle}>
											{row.dueAt ? new Date(row.dueAt).toLocaleString("ko-KR") : "-"}
										</td>
										<td style={thtdStyle}>{row.lateText}</td>
										<td style={thtdStyle}>
											{row.code ? (
												<pre style={codeStyle}>{row.code}</pre>
											) : (
												<>
													{row.codeLoading ? "코드 불러오는 중..." : "-"}
													{row.codeError ? (
														<div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
															{row.codeError}
														</div>
													) : null}
												</>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</TutorLayout>
	);
};

export default GradeCodeCollectionPage;
